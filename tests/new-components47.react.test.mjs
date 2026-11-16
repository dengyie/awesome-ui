/**
 * SSR smoke tests for the v1.47.0 batch
 * (EvalRunResults, EventTagGrid, PromptTunerResult).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n47.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — EvalRunResults header, filter and evaluator sections', async () => {
  const { default: EvalRunResults } = await load('EvalRunResults.tsx');
  const html = renderToStaticMarkup(
    h(EvalRunResults, {
      passRate: '82.50%',
      counters: { passed: 33, unknown: 1, failed: 6, total: 40 },
      sections: [
        {
          id: 'judge',
          name: 'tone_judge',
          subtitle: 'AI-Powered / LLM as a Judge',
          results: [
            {
              id: 'r1',
              status: 'passed',
              reason: 'Tone is neutral and professional throughout.',
              response: 'Key Points: Q2 revenue grew 12% quarter over quarter.',
              variables: [{ name: 'CATEGORY', value: 'Finance' }],
            },
            {
              id: 'r2',
              status: 'failed',
              reason: 'Summary invents a forecast not present in the source.',
              response: 'Key Points: The document predicts a 40% uplift next year.',
            },
          ],
        },
      ],
    })
  );
  assert.ok(html.includes('data-eval-run-results'), 'root hook');
  assert.ok(html.includes('data-eval-score'), 'score hook');
  assert.ok(html.includes('82.50%'), 'score text');
  assert.ok(html.includes('data-eval-counter="passed"'), 'passed counter');
  assert.ok(html.includes('data-eval-counter="failed"'), 'failed counter');
  assert.ok(html.includes('33'), 'passed count');
  assert.ok(html.includes('data-eval-filter'), 'filter hook');
  assert.ok(html.includes('has any of'), 'filter label');
  assert.ok(html.includes('data-eval-section="judge"'), 'section hook');
  assert.ok(html.includes('tone_judge'), 'section name');
  assert.ok(html.includes('data-eval-section-subtitle'), 'subtitle hook');
  assert.ok(html.includes('data-eval-row="r1"'), 'row hook');
  assert.ok(html.includes('data-eval-row-status="failed"'), 'failed row status');
  assert.ok(html.includes('text-red-600'), 'failed tone');
  assert.ok(html.includes('data-eval-row-reason'), 'reason hook');
  assert.ok(html.includes('data-eval-row-response'), 'response hook');
  assert.ok(html.includes('data-eval-var="CATEGORY"'), 'variable chip');

  const defaults = renderToStaticMarkup(h(EvalRunResults, {}));
  assert.ok(defaults.includes('64.00%'), 'default pass rate');
  assert.ok(defaults.includes('summary_quality_judge'), 'default section');
  assert.ok(defaults.includes('cost_efficiency_guard'), 'default second section');
});

test('React SSR — EventTagGrid scopes and key/value rows', async () => {
  const { default: EventTagGrid } = await load('EventTagGrid.tsx');
  const html = renderToStaticMarkup(
    h(EventTagGrid, {
      title: 'Tags',
      scopes: ['All', 'Client'],
      activeScope: 'Client',
      groups: [
        {
          id: 'left',
          title: 'left',
          tags: [
            { key: 'level', value: 'error' },
            { key: 'transaction', value: '/checkout', link: true },
          ],
        },
        { id: 'right', title: 'right', tags: [{ key: 'handled', value: 'no' }] },
      ],
    })
  );
  assert.ok(html.includes('data-tag-grid'), 'root hook');
  assert.ok(html.includes('data-tag-grid-title'), 'title hook');
  assert.ok(html.includes('data-tag-grid-scopes'), 'scopes hook');
  assert.ok(html.includes('data-tag-scope="Client"'), 'scope pill');
  assert.ok(html.includes('aria-pressed="true"'), 'active scope pressed');
  assert.ok(html.includes('data-tag-group="left"'), 'left group');
  assert.ok(html.includes('data-tag-group="right"'), 'right group');
  assert.ok(html.includes('data-tag-key'), 'key hook');
  assert.ok(html.includes('data-tag-value="error"'), 'value hook');
  assert.ok(html.includes('/checkout'), 'link value');

  const defaults = renderToStaticMarkup(h(EventTagGrid, {}));
  assert.ok(defaults.includes('Chrome 141.0.0'), 'default browser tag');
  assert.ok(defaults.includes('Other'), 'default scopes');
});

test('React SSR — PromptTunerResult prompt panel, copy and completions', async () => {
  const { default: PromptTunerResult } = await load('PromptTunerResult.tsx');
  const html = renderToStaticMarkup(
    h(PromptTunerResult, {
      optimizedPrompt: 'Summarize the document in exactly three sections.',
      completions: [
        { id: 'x1', label: 'Completion #9', text: 'First variant output.' },
        { id: 'x2', label: 'Completion #10', text: 'Second variant output.' },
      ],
      activeCompletionId: 'x2',
    })
  );
  assert.ok(html.includes('data-prompt-tuner'), 'root hook');
  assert.ok(html.includes('data-tuner-prompt-panel'), 'prompt panel hook');
  assert.ok(html.includes('OPTIMIZED PROMPT'), 'prompt label');
  assert.ok(html.includes('Summarize the document in exactly three sections.'), 'prompt text');
  assert.ok(html.includes('data-tuner-copy'), 'copy hook');
  assert.ok(html.includes('Copy'), 'copy label');
  assert.ok(html.includes('COMPLETIONS'), 'completions label');
  assert.ok(html.includes('data-tuner-completion-select'), 'select hook');
  assert.ok(html.includes('Completion #10'), 'completion option');
  assert.ok(html.includes('data-tuner-completion-text'), 'completion text hook');
  assert.ok(html.includes('Second variant output.'), 'active completion rendered');
  assert.ok(!html.includes('First variant output.'), 'inactive completion hidden');

  const defaults = renderToStaticMarkup(h(PromptTunerResult, {}));
  assert.ok(defaults.includes('Your optimized prompt will appear here.'), 'default prompt');
  assert.ok(defaults.includes('Completion #2'), 'default completions');
});
