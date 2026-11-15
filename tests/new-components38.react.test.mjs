/**
 * SSR smoke tests for the v1.38.0 batch
 * (QaTestTable, AppealRestrictionDialog, ModelPricingCard).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n38.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — QaTestTable rows, ratings and counts', async () => {
  const { default: QaTestTable } = await load('QaTestTable.tsx');
  const html = renderToStaticMarkup(
    h(QaTestTable, {
      rows: [
        { id: 'q1', question: 'Does SLMobbin have a community?', rating: 'good' },
        { id: 'q2', question: 'What if I run into an issue?', rating: 'acceptable' },
        { id: 'q3', question: 'Is SLMobbin free?', rating: 'poor' },
        { id: 'q4', question: 'How do I start?', answered: false },
      ],
    })
  );
  assert.ok(html.includes('data-qa-test-table'), 'host hook');
  assert.ok(html.includes('data-qa-row="q1"'), 'row hook');
  assert.ok(html.includes('data-qa-question'), 'question hook');
  assert.ok(html.includes('Does SLMobbin have a community?'), 'question text');
  assert.ok(html.includes('data-qa-check'), 'checkbox');
  assert.ok(html.includes('data-qa-status'), 'status hook');
  assert.ok(html.includes('data-qa-rating="good"'), 'good chip');
  assert.ok(html.includes('data-qa-rating="acceptable"'), 'acceptable chip');
  assert.ok(html.includes('data-qa-rating="poor"'), 'poor chip');
  assert.ok(html.includes('Acceptable'), 'rating label');
  assert.ok(html.includes('4 questions'), 'question count');
  assert.ok(html.includes('3 answered'), 'answered count');
});

test('React SSR — AppealRestrictionDialog reason card and actions', async () => {
  const { default: AppealRestrictionDialog } = await load('AppealRestrictionDialog.tsx');
  const html = renderToStaticMarkup(
    h(AppealRestrictionDialog, {
      reasonTitle: 'Unsafe Conduct',
      reasonDetail: 'Dangerous stunts by non-professionals.',
    })
  );
  assert.ok(html.includes('data-appeal-dialog'), 'host hook');
  assert.ok(html.includes('data-appeal-title'), 'title hook');
  assert.ok(html.includes('Request another review'), 'title text');
  assert.ok(html.includes('180 days to appeal'), 'appeal window note');
  assert.ok(html.includes('data-appeal-reason'), 'reason card');
  assert.ok(html.includes('data-appeal-reason-title'), 'reason title hook');
  assert.ok(html.includes('Unsafe Conduct'), 'reason title');
  assert.ok(html.includes('data-appeal-reason-detail'), 'reason detail hook');
  assert.ok(html.includes('Dangerous stunts'), 'reason detail');
  assert.ok(html.includes('Content Policy'), 'policy link');
  assert.ok(html.includes('data-appeal-submit'), 'appeal button');
  assert.ok(html.includes('Appeal'), 'appeal label');
  assert.ok(html.includes('data-appeal-back'), 'back button');
  assert.ok(html.includes('data-appeal-close'), 'close button');

  const closed = renderToStaticMarkup(h(AppealRestrictionDialog, { open: false }));
  assert.ok(!closed.includes('data-appeal-dialog'), 'not rendered when closed');
});

test('React SSR — ModelPricingCard pricing rows and copy button', async () => {
  const { default: ModelPricingCard } = await load('ModelPricingCard.tsx');
  const html = renderToStaticMarkup(
    h(ModelPricingCard, {
      modelName: 'Glm 4.7 Flash',
      modelId: 'workers-ai/@cf/zai-org/glm-4.7-flash',
      pricing: { inputPerMillion: 0.06, outputPerMillion: 0.4 },
    })
  );
  assert.ok(html.includes('data-model-pricing-card'), 'host hook');
  assert.ok(html.includes('data-model-pricing-name'), 'name hook');
  assert.ok(html.includes('Glm 4.7 Flash'), 'model name');
  assert.ok(html.includes('data-model-pricing-id'), 'id hook');
  assert.ok(html.includes('workers-ai/@cf/zai-org/glm-4.7-flash'), 'model id');
  assert.ok(html.includes('data-model-pricing-copy'), 'copy button');
  assert.ok(html.includes('data-model-pricing-input'), 'input row');
  assert.ok(html.includes('$ 0.06 / million tokens'), 'input price');
  assert.ok(html.includes('data-model-pricing-output'), 'output row');
  assert.ok(html.includes('$ 0.40 / million tokens'), 'output price');

  const noPricing = renderToStaticMarkup(h(ModelPricingCard, { modelName: 'Bare' }));
  assert.ok(noPricing.includes('—'), 'dash fallback without pricing');
  assert.ok(!noPricing.includes('data-model-pricing-copy'), 'no copy button without id');
});
