/**
 * v3.5.0 batch — React SSR smoke tests
 * AgentScheduleEditor, AgentGuardrailViolationCard, AgentModelFallbackList.
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
    .outputText;
};

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n59.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — AgentScheduleEditor pills, cron and save', async () => {
  const { default: AgentScheduleEditor } = await load('AgentScheduleEditor.tsx');
  const html = renderToStaticMarkup(
    h(AgentScheduleEditor, {
      frequencies: [
        { id: 'hourly', label: 'Every hour', expression: '0 * * * *' },
        { id: 'daily', label: 'Daily', expression: '0 9 * * *' },
      ],
      activeId: 'daily',
      nextRun: 'Tomorrow at 09:00',
      timezone: 'UTC+8',
    })
  );
  assert.ok(html.includes('data-schedule-frequency="daily"'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('0 9 * * *'));
  assert.ok(html.includes('Tomorrow at 09:00'));
  assert.ok(html.includes('UTC+8'));
  assert.ok(html.includes('data-schedule-save'));
});

test('React SSR — AgentGuardrailViolationCard severity and match highlight', async () => {
  const { default: AgentGuardrailViolationCard } = await load('AgentGuardrailViolationCard.tsx');
  const html = renderToStaticMarkup(
    h(AgentGuardrailViolationCard, {
      rule: 'PII disclosure',
      severity: 'high',
      runId: 'run_7c2a',
      input: 'User email is jane@example.com, send it to marketing.',
      match: 'jane@example.com',
      policyRef: 'policy/security#pii-1',
      time: '2 minutes ago',
    })
  );
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('PII disclosure'));
  assert.ok(html.includes('High severity'));
  assert.ok(html.includes('run_7c2a'));
  assert.ok(html.includes('data-violation-match'));
  assert.ok(html.includes('jane@example.com'));
  assert.ok(html.includes('policy/security#pii-1'));
  assert.ok(html.includes('data-violation-block'));
  assert.ok(html.includes('data-violation-proceed'));
});

test('React SSR — AgentModelFallbackList rows with primary badge', async () => {
  const { default: AgentModelFallbackList } = await load('AgentModelFallbackList.tsx');
  const html = renderToStaticMarkup(
    h(AgentModelFallbackList, {
      entries: [
        { id: 'm1', model: 'claude-sonnet-4-5', provider: 'Anthropic', health: 'healthy', condition: 'primary', latency: '420ms' },
        { id: 'm2', model: 'gpt-5-2', provider: 'OpenAI', health: 'degraded', condition: 'on rate limit', latency: '510ms' },
      ],
    })
  );
  assert.ok(html.includes('data-fallback-row="m1"'));
  assert.ok(html.includes('data-fallback-row="m2"'));
  assert.ok(html.includes('Primary'));
  assert.ok(html.includes('on rate limit'));
  assert.ok(html.includes('bg-amber-500'));
  assert.ok(html.includes('data-fallback-up'));
  assert.ok(html.includes('data-fallback-down'));
});
