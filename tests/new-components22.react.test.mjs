/**
 * SSR smoke tests for the v1.22.0 batch
 * (SegmentBreakdownBars, TargetGauge, HealthDonutStats, ForecastTrendChart, GroupedBarCompare).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n22.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — SegmentBreakdownBars bars, deltas and total footer', async () => {
  const { SegmentBreakdownBars } = await load('SegmentBreakdownBars.tsx');
  const html = renderToStaticMarkup(
    h(SegmentBreakdownBars, {
      headline: '23.19',
      caption: 'Conversion rate of all sessions',
      items: [
        { label: 'Men 16-24', value: 26.64, delta: 3.45, tone: 'indigo' },
        { label: 'Women 25-40', value: 21.69, delta: -1.49, tone: 'emerald' },
        { label: 'Men 25-40', value: 18.02, tone: 'amber' },
      ],
    })
  );
  assert.ok(html.includes('23.19'), 'headline');
  assert.ok(html.includes('Conversion rate of all sessions'), 'caption');
  assert.ok(html.includes('Men 16-24'), 'segment label');
  assert.ok(html.includes('width:100%'), 'max bar full width');
  assert.ok(html.includes('bg-indigo-500'), 'indigo tone');
  assert.ok(html.includes('bg-emerald-500'), 'emerald tone');
  assert.ok(html.includes('+3.45pp'), 'positive delta');
  assert.ok(html.includes('-1.49pp'), 'negative delta');
  assert.ok(html.includes('text-emerald-600'), 'positive tone');
  assert.ok(html.includes('text-rose-600'), 'negative tone');
  assert.ok(html.includes('across 3 segments'), 'footer');
  assert.ok(html.includes('role="table"'), 'table role');
});

test('React SSR — TargetGauge zones, needle angle and remaining', async () => {
  const { TargetGauge } = await load('TargetGauge.tsx');
  const html = renderToStaticMarkup(
    h(TargetGauge, {
      value: 600,
      target: 700,
      label: 'Quarterly revenue',
      valuePrefix: '$',
      valueSuffix: 'k',
      remainingLabel: 'Left before quota',
    })
  );
  assert.ok(html.includes('Quarterly revenue'), 'label');
  assert.ok(html.includes('$600k'), 'value chip');
  assert.ok(html.includes('$700k'), 'target label');
  assert.ok(html.includes('bg-emerald-500'), 'emerald zone');
  assert.ok(html.includes('bg-amber-400'), 'amber zone');
  assert.ok(html.includes('bg-rose-500'), 'rose zone');
  assert.ok(html.includes('data-gauge-needle'), 'needle rendered');
  assert.ok(html.includes('rotate('), 'needle rotated');
  assert.ok(html.includes('Remaining: $100k'), 'remaining line');
  assert.ok(html.includes('data-gauge-percent'), 'percent helper');
});

test('React SSR — HealthDonutStats conic gradients, legends and actions', async () => {
  const { HealthDonutStats } = await load('HealthDonutStats.tsx');
  const html = renderToStaticMarkup(
    h(HealthDonutStats, {
      cards: [
        {
          title: 'Job change freshness',
          caption: '18 credits spent from Feb 01',
          slices: [
            { label: 'Up to date', value: 74, tone: 'indigo' },
            { label: 'Need enrichment', value: 9, tone: 'amber' },
            { label: 'Unknown', value: 17, tone: 'zinc' },
          ],
          action: { label: 'View contacts' },
        },
        {
          title: 'Email coverage',
          slices: [
            { label: 'Business email', value: 62, tone: 'emerald' },
            { label: 'Missing', value: 38, tone: 'rose' },
          ],
        },
      ],
    })
  );
  assert.ok(html.includes('Job change freshness'), 'card title');
  assert.ok(html.includes('18 credits spent from Feb 01'), 'caption');
  assert.ok(html.includes('conic-gradient'), 'donut gradient');
  assert.ok(html.includes('Up to date'), 'legend label');
  assert.ok(html.includes('74%'), 'legend share');
  assert.ok(html.includes('View contacts'), 'action label');
  assert.ok(html.includes('data-donut-center'), 'center percent');
  assert.ok((html.match(/data-donut-card=/g) || []).length === 2, 'two cards');
});

test('React SSR — ForecastTrendChart actual vs forecast columns', async () => {
  const { ForecastTrendChart } = await load('ForecastTrendChart.tsx');
  const html = renderToStaticMarkup(
    h(ForecastTrendChart, {
      headline: '48.2k',
      unit: 'views',
      deltaLabel: '+108% vs prior period',
      deltaTone: 'emerald',
      note: 'Current uniques are trending upwards.',
      points: [
        { label: 'Mon', value: 30 },
        { label: 'Tue', value: 42 },
        { label: 'Wed', value: 38 },
        { label: 'Thu', value: 51, forecast: true },
        { label: 'Fri', value: 60, forecast: true },
      ],
    })
  );
  assert.ok(html.includes('48.2k'), 'headline');
  assert.ok(html.includes('views'), 'unit');
  assert.ok(html.includes('+108% vs prior period'), 'delta label');
  assert.ok(html.includes('trending-up') || html.includes('d="m3 17 6-6 4 4 8-8"'), 'up icon');
  assert.ok(html.includes('Current uniques are trending upwards.'), 'note');
  assert.ok(html.includes('bg-sky-500'), 'actual bar tone');
  assert.ok(html.includes('border-dashed'), 'forecast dashed');
  assert.ok(html.includes('(forecast)'), 'forecast title');
  assert.ok(html.includes('Actual'), 'legend actual');
  assert.ok(html.includes('Forecast'), 'legend forecast');
  assert.ok((html.match(/data-point-index=/g) || []).length === 5, 'five columns');
});

test('React SSR — GroupedBarCompare pairs, value labels and legend', async () => {
  const { GroupedBarCompare } = await load('GroupedBarCompare.tsx');
  const html = renderToStaticMarkup(
    h(GroupedBarCompare, {
      title: 'Estimated vs actual time',
      rows: [
        { name: 'Alex', estimated: 3.75, actual: 1.6 },
        { name: 'Sam', estimated: 2.5, actual: 2.9 },
        { name: 'Riley', estimated: 1.25, actual: 1.1, unit: 'h' },
      ],
    })
  );
  assert.ok(html.includes('Estimated vs actual time'), 'title');
  assert.ok(html.includes('3.75h'), 'estimated value label');
  assert.ok(html.includes('1.6h'), 'actual value label');
  assert.ok(html.includes('bg-violet-400'), 'estimated tone');
  assert.ok(html.includes('bg-lime-400'), 'actual tone');
  assert.ok(html.includes('Alex'), 'row name');
  assert.ok(html.includes('Estimated'), 'legend estimated');
  assert.ok(html.includes('Actual'), 'legend actual');
  assert.ok((html.match(/data-bar-row=/g) || []).length === 3, 'three rows');
});
