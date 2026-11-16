/**
 * SSR smoke tests for the v2.2.0 batch
 * (TaskDetailPanel, DeliveryTrackingPanel, MapPropertyCard).
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

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n49.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — TaskDetailPanel header, fields, actions and activity', async () => {
  const { default: TaskDetailPanel } = await load('TaskDetailPanel.tsx');
  const html = renderToStaticMarkup(
    h(TaskDetailPanel, {
      type: 'Task',
      title: 'Ship checkout redesign',
      statusLabel: 'IN REVIEW',
      fields: [
        { label: 'Assignees', value: 'A', icon: 'person' },
        { label: 'Tags', value: 'checkout', icon: 'tag', tag: true },
      ],
      description: 'Wrap up the checkout flow redesign.',
      actions: [{ id: 'subtask', icon: 'subtask', label: 'Add subtask' }],
      activity: [{ id: 'a1', actor: 'Mango', text: 'changed status', time: '2h ago' }],
    })
  );
  assert.ok(html.includes('data-task-panel'), 'root hook');
  assert.ok(html.includes('data-task-main'), 'main column');
  assert.ok(html.includes('data-task-type'), 'type pill');
  assert.ok(html.includes('Task'), 'type text');
  assert.ok(html.includes('data-task-ai'), 'ask ai');
  assert.ok(html.includes('data-task-share'), 'share');
  assert.ok(html.includes('Ship checkout redesign'), 'title text');
  assert.ok(html.includes('data-task-ai-bar'), 'ai bar hook');
  assert.ok(html.includes('create a summary'), 'default ai action');
  assert.ok(html.includes('data-task-fields'), 'fields grid');
  assert.ok(html.includes('data-task-field="Status"'), 'status field');
  assert.ok(html.includes('data-task-status'), 'status pill');
  assert.ok(html.includes('IN REVIEW'), 'status label');
  assert.ok(html.includes('data-task-field="Assignees"'), 'assignee field');
  assert.ok(html.includes('data-task-field-value="checkout"'), 'tag value');
  assert.ok(html.includes('bg-violet-100'), 'tag tone');
  assert.ok(html.includes('data-task-description'), 'description hook');
  assert.ok(html.includes('Wrap up the checkout flow redesign.'), 'description text');
  assert.ok(html.includes('data-task-actions'), 'actions hook');
  assert.ok(html.includes('data-task-action="subtask"'), 'action hook');
  assert.ok(html.includes('Add subtask'), 'action label');
  assert.ok(html.includes('data-task-activity'), 'activity hook');
  assert.ok(html.includes('data-task-activity-title'), 'activity title');
  assert.ok(html.includes('data-task-activity-item="a1"'), 'activity item');
  assert.ok(html.includes('data-task-comment-input'), 'comment input');
  assert.ok(html.includes('data-task-comment-send'), 'comment send');

  const defaults = renderToStaticMarkup(h(TaskDetailPanel, {}));
  assert.ok(defaults.includes('Complete Dashboard Feature Screens'), 'default title');
  assert.ok(defaults.includes('IN DEVELOPMENT'), 'default status');
  assert.ok(defaults.includes('data-task-field="Sprint points"'), 'default field');
  assert.ok(defaults.includes('dashboard'), 'default tag');
});

test('React SSR — DeliveryTrackingPanel map, stepper, courier and order', async () => {
  const { default: DeliveryTrackingPanel } = await load('DeliveryTrackingPanel.tsx');
  const html = renderToStaticMarkup(
    h(DeliveryTrackingPanel, {
      title: 'Heading to Alex Kim',
      eta: '9:05 - 9:12 AM',
      steps: [
        { id: 'store', icon: 'store', label: 'Store', state: 'done' },
        { id: 'delivered', icon: 'home', label: 'Delivered', state: 'pending' },
      ],
      courierName: 'CHRIS P',
      items: [{ id: 'i1', name: 'Burger', quantity: '1×', price: '$9.99' }],
    })
  );
  assert.ok(html.includes('data-delivery-panel'), 'root hook');
  assert.ok(html.includes('data-delivery-map'), 'map hook');
  assert.ok(html.includes('data-delivery-pin'), 'courier pin');
  assert.ok(html.includes('data-delivery-pin-destination'), 'destination pin');
  assert.ok(html.includes('data-delivery-back'), 'back button');
  assert.ok(html.includes('data-delivery-help'), 'help button');
  assert.ok(html.includes('data-delivery-zoom'), 'zoom controls');
  assert.ok(html.includes('data-delivery-info'), 'info column');
  assert.ok(html.includes('Heading to Alex Kim'), 'title text');
  assert.ok(html.includes('data-delivery-eta'), 'eta hook');
  assert.ok(html.includes('9:05 - 9:12 AM'), 'eta text');
  assert.ok(html.includes('data-delivery-step="store"'), 'step hook');
  assert.ok(html.includes('data-delivery-step-state="done"'), 'done state');
  assert.ok(html.includes('data-delivery-step-state="pending"'), 'pending state');
  assert.ok(html.includes('data-delivery-status'), 'status hook');
  assert.ok(html.includes('data-delivery-courier'), 'courier hook');
  assert.ok(html.includes('CHRIS P'), 'courier name');
  assert.ok(html.includes('data-delivery-call'), 'call button');
  assert.ok(html.includes('data-delivery-message'), 'message button');
  assert.ok(html.includes('data-delivery-details-toggle'), 'details toggle');
  assert.ok(html.includes('data-delivery-item="i1"'), 'item hook');
  assert.ok(html.includes('$9.99'), 'item price');
  assert.ok(html.includes('data-delivery-gift'), 'gift block');
  assert.ok(html.includes('data-delivery-copy-link'), 'copy link');
  assert.ok(html.includes('data-delivery-text-link'), 'text link');

  const defaults = renderToStaticMarkup(h(DeliveryTrackingPanel, {}));
  assert.ok(defaults.includes('Heading to Sam Lee'), 'default title');
  assert.ok(defaults.includes('8:35 - 8:41 AM'), 'default eta');
  assert.ok(defaults.includes('JOSHUA L'), 'default courier');
});

test('React SSR — MapPropertyCard pins and preview card', async () => {
  const { default: MapPropertyCard } = await load('MapPropertyCard.tsx');
  const html = renderToStaticMarkup(
    h(MapPropertyCard, {
      pins: [
        { id: 'q1', price: '$99', x: 30, y: 40 },
        { id: 'q2', price: '$120', x: 60, y: 55 },
      ],
      activePinId: 'q2',
      card: {
        title: 'Loft in Ubud',
        rating: '4.88',
        reviews: 12,
        subtitle: 'Jungle view loft',
        price: '$120 for 2 nights',
        dates: 'Jul 1 – 3',
      },
    })
  );
  assert.ok(html.includes('data-mappin-card'), 'root hook');
  assert.ok(html.includes('data-mappin-pin="q1"'), 'first pin');
  assert.ok(html.includes('data-mappin-pin="q2"'), 'second pin');
  assert.ok(html.includes('data-mappin-price="$99"'), 'pin price');
  assert.ok(html.includes('data-mappin-preview'), 'preview card');
  assert.ok(html.includes('data-mappin-image'), 'image block');
  assert.ok(html.includes('data-mappin-like'), 'like button');
  assert.ok(html.includes('data-mappin-close'), 'close button');
  assert.ok(html.includes('data-mappin-dots'), 'image dots');
  assert.ok(html.includes('data-mappin-next'), 'next button');
  assert.ok(html.includes('Loft in Ubud'), 'card title');
  assert.ok(html.includes('data-mappin-rating'), 'rating hook');
  assert.ok(html.includes('4.88 (12)'), 'rating text');
  assert.ok(html.includes('Jungle view loft'), 'subtitle');
  assert.ok(html.includes('data-mappin-price'), 'price hook');
  assert.ok(html.includes('$120 for 2 nights'), 'price text');
  assert.ok(html.includes('Jul 1 – 3'), 'dates text');
  assert.ok(html.includes('data-mappin-zoom'), 'zoom controls');

  const defaults = renderToStaticMarkup(h(MapPropertyCard, {}));
  assert.ok(defaults.includes('data-mappin-pin="p2"'), 'default pins');
  assert.ok(defaults.includes('Home in Kecamatan Denpasar'), 'default card title');
});
