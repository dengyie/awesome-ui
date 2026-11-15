/**
 * SSR smoke tests for the v1.46.0 batch
 * (MonitorRunList, EvalTurnBuilder, AgentSessionTimeline).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n46.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — MonitorRunList toolbar, histogram and run rows', async () => {
  const { default: MonitorRunList } = await load('MonitorRunList.tsx');
  const html = renderToStaticMarkup(
    h(MonitorRunList, {
      runs: [
        { id: 'r1', name: 'Product Performance Metrics', startedAt: 'Oct 14, 1:00 AM', latencyMs: 7000, ok: true },
        { id: 'r2', name: 'Slow draft', startedAt: 'Oct 13, 9:00 PM', latencyMs: 4287, ok: false },
      ],
      histogram: [
        { label: '13:00', value: 40 },
        { label: '14:00', value: 80 },
      ],
      ranges: ['24 hrs', '7 days'],
      activeRange: '7 days',
    })
  );
  assert.ok(html.includes('data-monitor-run-list'), 'list hook');
  assert.ok(html.includes('data-monitor-filter'), 'filter hook');
  assert.ok(html.includes('Filter'), 'filter label');
  assert.ok(html.includes('data-monitor-range="24 hrs"'), 'range pill');
  assert.ok(html.includes('aria-pressed="true"'), 'active range pressed');
  assert.ok(html.includes('data-monitor-histogram'), 'histogram hook');
  assert.ok(html.includes('data-monitor-bar="14:00"'), 'bar hook');
  assert.ok(html.includes('data-monitor-run="r1"'), 'run row');
  assert.ok(html.includes('Product Performance Metrics'), 'run name');
  assert.ok(html.includes('data-monitor-run-time'), 'time hook');
  assert.ok(html.includes('Oct 14, 1:00 AM'), 'time text');
  assert.ok(html.includes('data-monitor-run-latency'), 'latency hook');
  assert.ok(html.includes('7 s'), 'latency formatted seconds');

  const defaults = renderToStaticMarkup(h(MonitorRunList, {}));
  assert.ok(defaults.includes('6 months'), 'default ranges');
  assert.ok(defaults.includes('Q2 Financial Overview'), 'default runs');
});

test('React SSR — EvalTurnBuilder role badges, mock tags and add row', async () => {
  const { default: EvalTurnBuilder } = await load('EvalTurnBuilder.tsx');
  const html = renderToStaticMarkup(
    h(EvalTurnBuilder, {
      turns: [
        { id: 't1', role: 'system', turn: 0, content: 'You are Riley.', mock: false },
        { id: 't2', role: 'user', turn: 1, content: 'Hi, can I reschedule?', mock: true },
        { id: 't3', role: 'tool', turn: 2, content: 'reschedule_appointment → success', mock: true },
      ],
    })
  );
  assert.ok(html.includes('data-eval-turn-builder'), 'builder hook');
  assert.ok(html.includes('data-eval-turn="t1"'), 'turn hook');
  assert.ok(html.includes('data-eval-role="system"'), 'role attr');
  assert.ok(html.includes('data-eval-turn-badge'), 'badge hook');
  assert.ok(html.includes('SYSTEM'), 'system label');
  assert.ok(html.includes('TOOL RESPONSE'), 'tool label');
  assert.ok(html.includes('data-eval-turn-mock'), 'mock tag');
  assert.ok(html.includes('Turn 1'), 'turn number');
  assert.ok(html.includes('data-eval-turn-content'), 'content hook');
  assert.ok(html.includes('You are Riley.'), 'content text');
  assert.ok(html.includes('data-eval-turn-remove'), 'remove hook');
  assert.ok(html.includes('data-eval-add-turn="user"'), 'add user hook');
  assert.ok(html.includes('data-eval-add-turn="tool"'), 'add tool hook');
  assert.ok(html.includes('+ Add Tool Response'), 'add tool label');

  const noMock = renderToStaticMarkup(
    h(EvalTurnBuilder, { turns: [{ id: 'x', role: 'user', turn: 1, content: 'q' }] })
  );
  assert.ok(!noMock.includes('data-eval-turn-mock'), 'no mock tag when mock falsy');
});

test('React SSR — AgentSessionTimeline header, strip, steps and requests', async () => {
  const { default: AgentSessionTimeline } = await load('AgentSessionTimeline.tsx');
  const html = renderToStaticMarkup(
    h(AgentSessionTimeline, {
      steps: [
        { id: 's1', kind: 'prompt', label: 'Summarize top 5', at: '0:00' },
        { id: 's2', kind: 'tool', label: 'Fetch API', at: '0:14' },
      ],
      requests: [
        { id: 'q1', url: 'techcrunch.com', method: 'HTTP probe', status: 'HTTP 200', duration: '0:03', ok: true },
        { id: 'q2', url: 'techcrunch.com/rate-limited', status: 'HTTP 429', duration: '0:50', ok: false },
      ],
    })
  );
  assert.ok(html.includes('data-agent-session-timeline'), 'timeline hook');
  assert.ok(html.includes('data-agent-session-title'), 'title hook');
  assert.ok(html.includes('techcrunch.com and summarize'), 'default title');
  assert.ok(html.includes('data-agent-session-status'), 'status hook');
  assert.ok(html.includes('Complete'), 'status text');
  assert.ok(html.includes('data-agent-session-duration'), 'duration hook');
  assert.ok(html.includes('1m 11s'), 'duration text');
  assert.ok(html.includes('data-agent-session-steps-count'), 'steps count hook');
  assert.ok(html.includes('data-agent-session-strip'), 'strip hook');
  assert.ok(html.includes('data-agent-step="s1"'), 'step hook');
  assert.ok(html.includes('data-agent-step-badge="prompt"'), 'prompt badge');
  assert.ok(html.includes('data-agent-step-badge="tool"'), 'tool badge');
  assert.ok(html.includes('Fetch API'), 'step label');
  assert.ok(html.includes('data-agent-request="q1"'), 'request hook');
  assert.ok(html.includes('data-agent-request-url'), 'request url hook');
  assert.ok(html.includes('HTTP 429'), 'failing status');
  assert.ok(html.includes('text-red-500'), 'failing status tone');
});
