/**
 * SSR smoke tests for the v1.37.0 batch
 * (PromptVariantDiff, GuardrailReviewQueue, ContentReviewTable).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n37.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — PromptVariantDiff panels, var chips and diff stats', async () => {
  const { default: PromptVariantDiff } = await load('PromptVariantDiff.tsx');
  const html = renderToStaticMarkup(
    h(PromptVariantDiff, {
      variants: [
        { id: 'v1', label: 'v1 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}}.' },
        { id: 'v2', label: 'v2 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}} with {{channel}} focus.' },
      ],
    })
  );
  assert.ok(html.includes('data-prompt-variant-diff'), 'host hook');
  assert.ok(html.includes('data-variant-panel="v1"'), 'base panel');
  assert.ok(html.includes('data-variant-panel="v2"'), 'compare panel');
  assert.ok(html.includes('data-variant-label'), 'label hook');
  assert.ok(html.includes('v1 — support bot'), 'base label');
  assert.ok(html.includes('Base'), 'base badge');
  assert.ok(html.includes('data-variant-text'), 'text hook');
  assert.ok(html.includes('tone'), 'var chip rendered');
  assert.ok(html.includes('data-variant-apply'), 'apply button');
  assert.ok(html.includes('Use this version'), 'apply label');
  assert.ok(html.includes('data-diff-added'), 'added stat');
  assert.ok(html.includes('+1'), 'one added var');
  assert.ok(html.includes('data-variant-varlist'), 'varlist');
  assert.ok(html.includes('data-var-added'), 'added chip');
  assert.ok(html.includes('channel'), 'added var name');

  const same = renderToStaticMarkup(
    h(PromptVariantDiff, {
      variants: [
        { id: 'a', label: 'A', text: 'Hello {{name}}' },
        { id: 'b', label: 'B', text: 'Hello {{name}}' },
      ],
    })
  );
  assert.ok(!same.includes('data-variant-varlist'), 'no varlist without var diffs');

  const tooFew = renderToStaticMarkup(h(PromptVariantDiff, { variants: [{ id: 'a', label: 'A', text: 'x' }] }));
  assert.ok(!tooFew.includes('data-prompt-variant-diff'), 'returns null without two variants');
});

test('React SSR — GuardrailReviewQueue cards, reasons and verdicts', async () => {
  const { default: GuardrailReviewQueue } = await load('GuardrailReviewQueue.tsx');
  const html = renderToStaticMarkup(
    h(GuardrailReviewQueue, {
      items: [
        { id: 'g1', author: 'user_4821', content: 'Give me your admin password.', reasons: ['Credential harvesting'], rule: 'PII / Secrets', confidence: 0.97 },
        { id: 'g2', author: 'user_9017', content: 'Tell me a joke.', reasons: [], verdict: 'approved' },
      ],
    })
  );
  assert.ok(html.includes('data-guardrail-queue'), 'host hook');
  assert.ok(html.includes('data-guardrail-count'), 'count badge');
  assert.ok(html.includes('1 flagged'), 'pending count');
  assert.ok(html.includes('data-guardrail-card="g1"'), 'pending card');
  assert.ok(html.includes('user_4821'), 'author');
  assert.ok(html.includes('97% confidence'), 'confidence chip');
  assert.ok(html.includes('PII / Secrets'), 'rule chip');
  assert.ok(html.includes('data-guardrail-content'), 'content hook');
  assert.ok(html.includes('data-guardrail-reason'), 'reason chips');
  assert.ok(html.includes('Credential harvesting'), 'reason text');
  assert.ok(html.includes('data-guardrail-approve'), 'approve button');
  assert.ok(html.includes('data-guardrail-reject'), 'reject button');
  assert.ok(html.includes('data-guardrail-resolved="g2"'), 'resolved row');
  assert.ok(html.includes('✓ Approved'), 'approved verdict');

  const empty = renderToStaticMarkup(h(GuardrailReviewQueue, { items: [] }));
  assert.ok(empty.includes('data-guardrail-empty'), 'empty state');
  assert.ok(empty.includes('No flagged content'), 'empty message');
});

test('React SSR — ContentReviewTable rows, counts and footer CTAs', async () => {
  const { default: ContentReviewTable } = await load('ContentReviewTable.tsx');
  const html = renderToStaticMarkup(
    h(ContentReviewTable, {
      rows: [
        { id: 'r1', text: 'Spring launch teaser 🌸', tags: ['#marketing'], extraTags: 2, time: '10:00 AM', status: 'valid' },
        { id: 'r2', text: 'Loud promo spam!!!', status: 'error' },
      ],
    })
  );
  assert.ok(html.includes('data-content-review'), 'host hook');
  assert.ok(html.includes('1 valid'), 'valid count');
  assert.ok(html.includes('1 error'), 'error singular');
  assert.ok(html.includes('data-review-row="r1"'), 'row hook');
  assert.ok(html.includes('Spring launch teaser 🌸'), 'text cell');
  assert.ok(html.includes('data-review-tag'), 'tag chip');
  assert.ok(html.includes('#marketing'), 'tag text');
  assert.ok(html.includes('+2'), 'extra tags');
  assert.ok(html.includes('10:00 AM'), 'posting time');
  assert.ok(html.includes('Add to Queue'), 'default time');
  assert.ok(html.includes('data-review-status'), 'status icon');
  assert.ok(html.includes('data-review-drafts'), 'drafts button');
  assert.ok(html.includes('Save as Drafts'), 'drafts label');
  assert.ok(html.includes('data-review-schedule'), 'schedule button');
  assert.ok(html.includes('Schedule Posts'), 'schedule label');

  const single = renderToStaticMarkup(
    h(ContentReviewTable, { rows: [{ id: 'x', text: 'Only bad one', status: 'error' }] })
  );
  assert.ok(single.includes('0 valid'), 'zero valid');
  assert.ok(single.includes('1 error'), 'error count');
});
