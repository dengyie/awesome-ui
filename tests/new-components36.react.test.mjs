/**
 * SSR smoke tests for the v1.36.0 batch
 * (TraceSpanWaterfall, EvalScoreTable, TokenCostBreakdown).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n36.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — TraceSpanWaterfall rows, offsets and legend', async () => {
  const { default: TraceSpanWaterfall } = await load('TraceSpanWaterfall.tsx');
  const html = renderToStaticMarkup(
    h(TraceSpanWaterfall, {
      spans: [
        { id: 's1', name: 'planner', startMs: 0, durationMs: 1200, depth: 0, kind: 'llm', costUsd: 0.002 },
        { id: 's2', name: 'web_search', startMs: 1200, durationMs: 300, depth: 1, kind: 'tool' },
        { id: 's3', name: 'retrieve_docs', startMs: 1500, durationMs: 500, depth: 1, kind: 'retrieval' },
      ],
    })
  );
  assert.ok(html.includes('data-trace-waterfall'), 'host hook');
  assert.ok(html.includes('data-trace-rows'), 'rows container');
  assert.ok(html.includes('data-trace-row="s1"'), 'row hook');
  assert.ok(html.includes('data-trace-name'), 'name hook');
  assert.ok(html.includes('planner'), 'span name');
  assert.ok(html.includes('data-trace-bar'), 'bar hook');
  assert.ok(html.includes('1.2s'), 'formatted duration');
  assert.ok(html.includes('$0.002'), 'cost label');
  assert.ok(html.includes('3 spans'), 'span count');
  assert.ok(html.includes('LLM'), 'legend llm');
  assert.ok(html.includes('Tool'), 'legend tool');
  assert.ok(html.includes('Retrieval'), 'legend retrieval');
  assert.ok(html.includes('bg-amber-500'), 'retrieval color');

  const empty = renderToStaticMarkup(h(TraceSpanWaterfall, { spans: [] }));
  assert.ok(empty.includes('0 spans'), 'empty span count');
});

test('React SSR — EvalScoreTable runs, criteria and add button', async () => {
  const { default: EvalScoreTable } = await load('EvalScoreTable.tsx');
  const html = renderToStaticMarkup(
    h(EvalScoreTable, {
      runs: [
        { id: 'r1', name: 'Trip Planning.csv', score: 100, grader: 'String check grader' },
        { id: 'r2', name: 'Summary set', score: 42, grader: 'LLM grader', tone: 'warn' },
        { id: 'r3', name: 'Refusal set', score: 8, grader: 'Exact match', tone: 'fail' },
      ],
      criteria: [{ id: 'c1', title: 'String check grader', description: 'Check for exact or partial matches.' }],
      onAddCriteria: () => {},
    })
  );
  assert.ok(html.includes('data-eval-score-table'), 'host hook');
  assert.ok(html.includes('data-eval-runs'), 'runs table');
  assert.ok(html.includes('data-eval-run="r1"'), 'run hook');
  assert.ok(html.includes('Trip Planning.csv'), 'run name');
  assert.ok(html.includes('data-eval-score'), 'score chip');
  assert.ok(html.includes('100%'), 'score value');
  assert.ok(html.includes('bg-emerald-500'), 'pass bar');
  assert.ok(html.includes('bg-amber-500'), 'warn bar');
  assert.ok(html.includes('bg-red-500'), 'fail bar');
  assert.ok(html.includes('String check grader'), 'grader text');
  assert.ok(html.includes('data-eval-criterion="c1"'), 'criteria card');
  assert.ok(html.includes('data-eval-add-criteria'), 'add criteria button');
  assert.ok(html.includes('Add criteria'), 'add label');
  assert.ok(html.includes('3 runs'), 'run count');

  const noAdd = renderToStaticMarkup(h(EvalScoreTable, { runs: [] }));
  assert.ok(!noAdd.includes('data-eval-add-criteria'), 'no add button without handler');
  assert.ok(!noAdd.includes('data-eval-criteria'), 'no criteria grid when empty');
});

test('React SSR — TokenCostBreakdown segments, legend and usage rows', async () => {
  const { default: TokenCostBreakdown } = await load('TokenCostBreakdown.tsx');
  const html = renderToStaticMarkup(
    h(TokenCostBreakdown, {
      segments: [
        { id: 'agent', label: 'Custom Agent', amountUsd: 32.05 },
        { id: 'opt', label: 'SuperOptimizer', amountUsd: 1.94 },
        { id: 'other', label: 'Other', amountUsd: 0.51 },
      ],
      usageRows: [
        { id: 'in', label: 'Input Tokens', tokens: 37654, percent: 13 },
        { id: 'out', label: 'Output Tokens', tokens: 224849, percent: 77.5 },
      ],
      spendUsed: 34.49,
      spendTotal: 55,
    })
  );
  assert.ok(html.includes('data-token-cost'), 'host hook');
  assert.ok(html.includes('data-token-cost-bar'), 'stacked bar');
  assert.ok(html.includes('data-token-cost-segment="agent"'), 'segment hook');
  assert.ok(html.includes('data-token-cost-legend'), 'legend');
  assert.ok(html.includes('Custom Agent'), 'segment label');
  assert.ok(html.includes('$32.05'), 'segment amount');
  assert.ok(html.includes('93%'), 'segment percent');
  assert.ok(html.includes('$34.49 of $55.00'), 'header spend line');
  assert.ok(html.includes('data-token-usage'), 'usage section');
  assert.ok(html.includes('data-token-usage-row="in"'), 'usage row hook');
  assert.ok(html.includes('37,654 (13%)'), 'token count formatted');
  assert.ok(html.includes('Token usage'), 'usage heading');

  const noUsage = renderToStaticMarkup(h(TokenCostBreakdown, { segments: [{ id: 'a', label: 'A', amountUsd: 1 }] }));
  assert.ok(!noUsage.includes('data-token-usage'), 'no usage section without rows');
  assert.ok(!noUsage.includes('of $'), 'no spend-total header without totals');
});
