/**
 * SSR smoke tests for the v1.42.0 batch
 * (FalRunCard, ImageGenMetaBar, GammaImageDetail).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n42.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — FalRunCard badge, meta, rows and actions', async () => {
  const { default: FalRunCard } = await load('FalRunCard.tsx');
  const html = renderToStaticMarkup(
    h(FalRunCard, {
      type: 'Text To Image',
      models: 4,
      time: '22 minutes ago',
      prompt: 'a calm, morning, beach scenery',
      aspect: '1:1',
      cost: '$0.241',
    })
  );
  assert.ok(html.includes('data-fal-run-card'), 'card hook');
  assert.ok(html.includes('data-fal-run-type'), 'type badge hook');
  assert.ok(html.includes('Text To Image'), 'type text');
  assert.ok(html.includes('data-fal-run-models'), 'models hook');
  assert.ok(html.includes('4 models'), 'models text');
  assert.ok(html.includes('22 minutes ago'), 'time text');
  assert.ok(html.includes('data-fal-run-prompt'), 'prompt hook');
  assert.ok(html.includes('a calm, morning, beach scenery'), 'prompt text');
  assert.ok(html.includes('Aspect Ratio:'), 'aspect label');
  assert.ok(html.includes('data-fal-run-aspect'), 'aspect hook');
  assert.ok(html.includes('Total Cost:'), 'cost label');
  assert.ok(html.includes('data-fal-run-cost'), 'cost hook');
  assert.ok(html.includes('$0.241'), 'cost text');
  assert.ok(html.includes('text-emerald-500'), 'green cost tone');
  assert.ok(html.includes('data-fal-run-duplicate'), 'duplicate action');
  assert.ok(html.includes('data-fal-run-rerun'), 'rerun action');
  assert.ok(html.includes('data-fal-run-delete'), 'delete action');
  assert.ok(html.includes('data-fal-run-share'), 'share action');

  const zinc = renderToStaticMarkup(h(FalRunCard, { costTone: 'zinc' }));
  assert.ok(!zinc.includes('text-emerald-500'), 'zinc cost tone when requested');
});

test('React SSR — ImageGenMetaBar job id, duration and cost', async () => {
  const { default: ImageGenMetaBar } = await load('ImageGenMetaBar.tsx');
  const html = renderToStaticMarkup(
    h(ImageGenMetaBar, {
      model: 'xai/grok-imagine-image',
      jobId: '# 019f1bb4',
      duration: '—',
      cost: '$ —',
    })
  );
  assert.ok(html.includes('data-image-gen-meta'), 'meta hook');
  assert.ok(html.includes('data-image-gen-model'), 'model badge hook');
  assert.ok(html.includes('xai/grok-imagine-image'), 'model text');
  assert.ok(html.includes('data-image-gen-job'), 'job hook');
  assert.ok(html.includes('# 019f1bb4'), 'job text');
  assert.ok(html.includes('data-image-gen-duration'), 'duration hook');
  assert.ok(html.includes('data-image-gen-cost'), 'cost hook');

  const fallback = renderToStaticMarkup(h(ImageGenMetaBar, {}));
  assert.ok(fallback.includes('openai/gpt-image-2'), 'default model');
  assert.ok(fallback.includes('169.0s'), 'default duration');
});

test('React SSR — GammaImageDetail preview, toolbar and prompt block', async () => {
  const { default: GammaImageDetail } = await load('GammaImageDetail.tsx');
  const html = renderToStaticMarkup(
    h(GammaImageDetail, {
      title: 'AI images',
      preview: 'https://example.com/preview.png',
      prompt: 'Generate the following image: Mobile-first carousel slide.',
      liked: true,
    })
  );
  assert.ok(html.includes('data-gamma-image-detail'), 'detail hook');
  assert.ok(html.includes('data-gamma-detail-title'), 'title hook');
  assert.ok(html.includes('data-gamma-detail-preview'), 'preview hook');
  assert.ok(html.includes('example.com/preview.png'), 'preview img src');
  assert.ok(html.includes('data-gamma-detail-download'), 'download action');
  assert.ok(html.includes('data-gamma-detail-zoom'), 'zoom action');
  assert.ok(html.includes('data-gamma-detail-delete'), 'delete action');
  assert.ok(html.includes('data-gamma-detail-like'), 'like action');
  assert.ok(html.includes('data-gamma-detail-dislike'), 'dislike action');
  assert.ok(html.includes('aria-pressed="true"'), 'liked pressed');
  assert.ok(html.includes('text-rose-500'), 'liked tone');
  assert.ok(html.includes('data-gamma-detail-prompt'), 'prompt hook');
  assert.ok(html.includes('Mobile-first carousel slide.'), 'prompt text');

  const empty = renderToStaticMarkup(h(GammaImageDetail, {}));
  assert.ok(!empty.includes('<img'), 'placeholder when no preview');
  assert.ok(empty.includes('aria-pressed="false"'), 'not liked by default');
});
