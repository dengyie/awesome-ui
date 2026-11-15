/**
 * SSR smoke tests for the v1.45.0 batch
 * (VisionAnalysisCard, PrReviewQueue, IterationActionBar).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n45.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — VisionAnalysisCard sections, rows and keys', async () => {
  const { default: VisionAnalysisCard } = await load('VisionAnalysisCard.tsx');
  const html = renderToStaticMarkup(
    h(VisionAnalysisCard, {
      sections: [
        {
          heading: 'Design Strengths',
          rows: [
            { key: 'Color Palette', value: 'Warm sunset tones with high saturation' },
            { key: 'Composition', value: 'Balanced horizon at the upper third' },
          ],
        },
      ],
    })
  );
  assert.ok(html.includes('data-vision-analysis-card'), 'card hook');
  assert.ok(html.includes('data-vision-section'), 'section hook');
  assert.ok(html.includes('data-vision-section-heading'), 'heading hook');
  assert.ok(html.includes('Design Strengths'), 'heading text');
  assert.ok(html.includes('data-vision-rows'), 'rows wrapper hook');
  assert.ok(html.includes('data-vision-row="Color Palette"'), 'row key attr');
  assert.ok(html.includes('data-vision-row-key'), 'row key hook');
  assert.ok(html.includes('Color Palette'), 'row key text');
  assert.ok(html.includes('data-vision-row-value'), 'row value hook');
  assert.ok(html.includes('Warm sunset tones with high saturation'), 'row value text');

  const fallback = renderToStaticMarkup(h(VisionAnalysisCard, {}));
  assert.ok(fallback.includes('Image Details'), 'default section renders');
  assert.ok(fallback.includes('Wave Patterns'), 'default rows render');
});

test('React SSR — PrReviewQueue groups, toggles and rows', async () => {
  const { default: PrReviewQueue } = await load('PrReviewQueue.tsx');
  const html = renderToStaticMarkup(
    h(PrReviewQueue, {
      groups: [
        {
          id: 'waiting',
          label: 'Waiting for reviewers',
          prs: [{ id: 'p1', title: 'Add activity feed API', repo: 'mini-landing-page', number: 4, author: 'Sam Lee' }],
        },
        {
          id: 'drafts',
          label: 'Drafts',
          prs: [
            { id: 'p2', title: 'Add user search', repo: 'mini-landing-page', number: 7, author: 'Sam Lee' },
            { id: 'p3', title: 'Add frontend for search', repo: 'mini-landing-page', number: 6, author: 'Sam Lee' },
          ],
        },
      ],
    })
  );
  assert.ok(html.includes('data-pr-review-queue'), 'queue hook');
  assert.ok(html.includes('data-pr-group="waiting"'), 'waiting group');
  assert.ok(html.includes('data-pr-group-toggle'), 'toggle hook');
  assert.ok(html.includes('data-pr-group-count'), 'count badge hook');
  assert.ok(html.includes('data-pr-group-label'), 'label hook');
  assert.ok(html.includes('Waiting for reviewers'), 'waiting label text');
  assert.ok(html.includes('Drafts'), 'drafts label text');
  assert.ok(html.includes('data-pr-row="p1"'), 'pr row p1');
  assert.ok(html.includes('data-pr-avatar'), 'avatar hook');
  assert.ok(html.includes('SL'), 'author initials');
  assert.ok(html.includes('data-pr-title'), 'title hook');
  assert.ok(html.includes('Add activity feed API'), 'title text');
  assert.ok(html.includes('data-pr-meta'), 'meta hook');
  assert.ok(html.includes('Sam Lee · mini-landing-page #4'), 'meta text');
});

test('React SSR — IterationActionBar pills and pager', async () => {
  const { default: IterationActionBar } = await load('IterationActionBar.tsx');
  const html = renderToStaticMarkup(
    h(IterationActionBar, { page: 2, totalPages: 5 })
  );
  assert.ok(html.includes('data-iteration-action-bar'), 'bar hook');
  assert.ok(html.includes('data-iteration-action="show-more"'), 'show more pill');
  assert.ok(html.includes('Show More'), 'show more label');
  assert.ok(html.includes('data-iteration-action="brainstorm"'), 'brainstorm pill');
  assert.ok(html.includes('Brainstorm'), 'brainstorm label');
  assert.ok(html.includes('data-iteration-action="reply"'), 'reply pill');
  assert.ok(html.includes('Reply'), 'reply label');
  assert.ok(html.includes('data-iteration-action="more"'), 'more pill');
  assert.ok(html.includes('More actions'), 'more aria-label');
  assert.ok(html.includes('data-iteration-pager'), 'pager hook');
  assert.ok(html.includes('data-iteration-prev'), 'prev hook');
  assert.ok(html.includes('data-iteration-next'), 'next hook');
  assert.ok(html.includes('Previous page'), 'prev aria-label');
  assert.ok(html.includes('Next page'), 'next aria-label');
  assert.ok(html.includes('data-iteration-page-label'), 'page label hook');
  assert.ok(html.includes('2/5'), 'page label text');

  const bounds = renderToStaticMarkup(h(IterationActionBar, { page: 1, totalPages: 4 }));
  assert.ok(bounds.includes('disabled'), 'prev disabled at first page');
});
