/**
 * SSR smoke tests for the v1.28.0 batch
 * (TimeSlotPicker, OrderTracker, OrderSummaryPanel, PaymentMethodCard, OrderCard).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const transpile = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  return ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    })
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"')
    .replace(/import\s*{\s*([^}]*)\s*}\s*from\s*["']\.\/UiIcon\.mjs["'];/g, (match) =>
      match.replace(/type\s+/g, '')
    );
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n28.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — TimeSlotPicker day strip, period groups and selection', async () => {
  const { default: TimeSlotPicker } = await load('TimeSlotPicker.tsx');
  const html = renderToStaticMarkup(
    h(TimeSlotPicker, {
      days: [
        {
          id: 'tue',
          weekday: 'Tue',
          label: 'Aug 12',
          slots: [
            { id: 's1', label: '9:00 AM', period: 'morning', available: 3 },
            { id: 's2', label: '2:00 PM', period: 'afternoon', available: 0 },
          ],
        },
        { id: 'wed', weekday: 'Wed', label: 'Aug 13', disabled: true, slots: [] },
      ],
      value: { dayId: 'tue', slotId: 's1' },
      timezone: 'GMT+8',
      onSelect: () => {},
    })
  );
  assert.ok(html.includes('data-slot-day="tue"'), 'day chip');
  assert.ok(html.includes('data-slot-day="wed"'), 'disabled day chip');
  assert.ok(html.includes('Aug 13'), 'day label');
  assert.ok(html.includes('Morning') && html.includes('Afternoon'), 'period headings');
  assert.ok(html.includes('data-time-slot="s1"'), 'slot button');
  assert.ok(html.includes('3 available'), 'availability count');
  assert.ok(html.includes('Fully booked'), 'zero availability');
  assert.ok(html.includes('border-indigo-600'), 'selected slot tone');
  assert.ok(html.includes('GMT+8'), 'timezone chip');
  assert.ok(html.includes('Date'), 'days label');
  assert.ok(html.includes('Select a time'), 'slots label');
});

test('React SSR — OrderTracker dots and bar variants with canceled state', async () => {
  const { default: OrderTracker } = await load('OrderTracker.tsx');
  const stages = [
    { id: 'placed', label: 'Placed', timestamp: 'May 12' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'shipped', label: 'On the way' },
    { id: 'delivered', label: 'Delivered' },
  ];
  const dots = renderToStaticMarkup(
    h(OrderTracker, { stages, current: 2, eta: 'Arrives by Sat, May 24', trackingNumber: '1Z999AA10123456784', trackingUrl: 'https://t.example', onTrack: () => {} })
  );
  assert.ok(dots.includes('data-tracker-stage="placed"'), 'stage hook');
  assert.ok(dots.includes('Arrives by Sat, May 24'), 'eta line');
  assert.ok(dots.includes('1Z999AA10123456784'), 'tracking number');
  assert.ok(dots.includes('bg-emerald-600'), 'reached dots green');
  assert.ok(dots.includes('ring-2'), 'current dot ring');
  assert.ok(dots.includes('Track shipment'), 'track link');
  assert.ok(dots.includes('May 12'), 'stage timestamp');

  const bar = renderToStaticMarkup(h(OrderTracker, { stages, current: 3, variant: 'bar' }));
  assert.ok(bar.includes('data-tracker-fill'), 'bar fill');
  assert.ok(bar.includes('width:100%'), 'full progress');

  const canceled = renderToStaticMarkup(h(OrderTracker, { stages, current: 'canceled', canceledReason: 'Canceled on May 15' }));
  assert.ok(canceled.includes('Canceled'), 'canceled label');
  assert.ok(canceled.includes('Canceled on May 15'), 'canceled reason');
  assert.ok(!canceled.includes('bg-emerald-600'), 'no green when canceled');
});

test('React SSR — OrderSummaryPanel rows, promo and CTA', async () => {
  const { default: OrderSummaryPanel } = await load('OrderSummaryPanel.tsx');
  const html = renderToStaticMarkup(
    h(OrderSummaryPanel, {
      rows: [
        { id: 'r1', label: 'Item(s) total', value: '$23.12', kind: 'item', strikeValue: '$25.68' },
        { id: 'r2', label: 'Shop discount', value: '−$2.56', kind: 'discount' },
        { id: 'r3', label: 'Pickup', value: 'Free', kind: 'fee' },
        { id: 'r4', label: 'Sales tax', value: '$2.08', kind: 'tax', note: '9%' },
        { id: 'r5', label: 'Order total', value: '$22.64', kind: 'total' },
      ],
      ctaLabel: 'Place your order',
      ctaAmount: '$22.64',
      appliedPromos: ['WELCOME10'],
      trustFooter: 'SSL encrypted payment',
      onCta: () => {},
      onApplyPromo: () => {},
    })
  );
  assert.ok(html.includes('data-summary-row="r1"'), 'row hook');
  assert.ok(html.includes('−$2.56'), 'discount value');
  assert.ok(html.includes('text-emerald-600'), 'discount tone');
  assert.ok(html.includes('line-through'), 'strike value support');
  assert.ok(html.includes('(9%)'), 'row note');
  assert.ok(html.includes('border-t'), 'total top border');
  assert.ok(html.includes('WELCOME10 applied'), 'applied promo');
  assert.ok(html.includes('data-promo-input'), 'promo input');
  assert.ok(html.includes('data-promo-apply'), 'promo apply');
  assert.ok(html.includes('Place your order · $22.64'), 'cta with amount');
  assert.ok(html.includes('SSL encrypted payment'), 'trust footer');
});

test('React SSR — PaymentMethodCard brand tile and actions', async () => {
  const { default: PaymentMethodCard } = await load('PaymentMethodCard.tsx');
  const html = renderToStaticMarkup(
    h(PaymentMethodCard, {
      brand: 'visa',
      last4: '6008',
      exp: '10 / 2028',
      amount: '$6.53',
      holder: '128 Mulberry St, New York, NY 10013',
      onChange: () => {},
      onAddNew: () => {},
    })
  );
  assert.ok(html.includes('data-payment-brand'), 'brand tile');
  assert.ok(html.includes('VISA'), 'visa label');
  assert.ok(html.includes('bg-blue-700'), 'visa tone');
  assert.ok(html.includes('Ending in 6008'), 'masked number');
  assert.ok(html.includes('Exp. 10 / 2028'), 'expiry');
  assert.ok(html.includes('$6.53'), 'row amount');
  assert.ok(html.includes('128 Mulberry St'), 'billing holder');
  assert.ok(html.includes('data-payment-change'), 'change action');
  assert.ok(html.includes('data-payment-add'), 'add new action');

  const mc = renderToStaticMarkup(h(PaymentMethodCard, { brand: 'mastercard', last4: '2412', showAddNew: false }));
  assert.ok(mc.includes('MC'), 'mc label');
  assert.ok(mc.includes('Ending in 2412'), 'mc number');
  assert.ok(!mc.includes('data-payment-add'), 'no add-new when hidden');
});

test('React SSR — OrderCard header, fulfillment, items and status badge', async () => {
  const { default: OrderCard } = await load('OrderCard.tsx');
  const html = renderToStaticMarkup(
    h(OrderCard, {
      orderNumber: '200013316005821',
      placedAt: 'May 12',
      status: 'shipped',
      fulfillment: { type: 'delivery', eta: 'Sat, May 24', store: 'Supercenter #2100' },
      items: [
        { id: 'i1', title: 'Equate Vitamin C 1000mg', price: '$8.99', qty: 1, image: 'https://example.com/p.jpg' },
      ],
      total: '$24.98',
      onOpen: () => {},
      onAction: () => {},
    })
  );
  assert.ok(html.includes('data-order-card'), 'host hook');
  assert.ok(html.includes('Order# 200013316005821'), 'order number');
  assert.ok(html.includes('Placed May 12'), 'placed date');
  assert.ok(html.includes('View details'), 'open button');
  assert.ok(html.includes('Arrives'), 'fulfillment label');
  assert.ok(html.includes('by Sat, May 24'), 'fulfillment eta');
  assert.ok(html.includes('Supercenter #2100'), 'store line');
  assert.ok(html.includes('On its way'), 'status label');
  assert.ok(html.includes('bg-indigo-50'), 'shipped badge tone');
  assert.ok(html.includes('data-order-item="i1"'), 'item row');
  assert.ok(html.includes('Qty: 1'), 'item qty');
  assert.ok(html.includes('Buy it again'), 'action link');
  assert.ok(html.includes('Total $24.98'), 'total');

  const canceled = renderToStaticMarkup(
    h(OrderCard, { orderNumber: 'X2', status: 'canceled', fulfillment: { type: 'pickup', eta: 'May 15' }, statusNote: 'We apologize for the inconvenience.' })
  );
  assert.ok(canceled.includes('Canceled on May 15'), 'canceled headline');
  assert.ok(canceled.includes('We apologize'), 'status note');
  assert.ok(canceled.includes('Canceled'), 'canceled badge');
});
