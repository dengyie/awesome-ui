/**
 * SSR smoke tests for the v1.32.0 batch
 * (ImageGenGallery, SharedChatViewer, MemoryPanel, ConnectorGrid, ModelComparePane).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n32.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ImageGenGallery prompt bar, tiles and generating skeleton', async () => {
  const { default: ImageGenGallery } = await load('ImageGenGallery.tsx');
  const html = renderToStaticMarkup(
    h(ImageGenGallery, {
      title: 'Image studio',
      images: [
        { id: 'img1', alt: 'Aurora over mountains', aspect: 'landscape', model: 'gpt-image-2' },
        { id: 'img2', alt: 'Sketching…', status: 'generating' },
      ],
      generateText: 'Generate',
    })
  );
  assert.ok(html.includes('data-image-gen'), 'host hook');
  assert.ok(html.includes('data-gen-input'), 'prompt input');
  assert.ok(html.includes('data-gen-generate'), 'generate button');
  assert.ok(html.includes('Generate'), 'generate text');
  assert.ok(html.includes('data-gen-tile="img1"'), 'done tile');
  assert.ok(html.includes('data-gen-tile="img2"'), 'generating tile');
  assert.ok(html.includes('data-gen-status="generating"'), 'generating status');
  assert.ok(html.includes('animate-pulse'), 'skeleton pulse');
  assert.ok(html.includes('data-gen-action="download"'), 'download action');
  assert.ok(html.includes('data-gen-action="delete"'), 'delete action');
  assert.ok(html.includes('gpt-image-2'), 'model badge');

  const empty = renderToStaticMarkup(h(ImageGenGallery, { images: [] }));
  assert.ok(empty.includes('data-gen-empty'), 'empty state');
});

test('React SSR — SharedChatViewer header, bubbles and CTA bar', async () => {
  const { default: SharedChatViewer } = await load('SharedChatViewer.tsx');
  const html = renderToStaticMarkup(
    h(SharedChatViewer, {
      appName: 'Nebula',
      title: 'Trip planning help',
      meta: '12 messages · Mar 3, 2026',
      messages: [
        { id: 'm1', role: 'user', text: 'Plan 3 days in Kyoto.' },
        { id: 'm2', role: 'assistant', text: 'Day 1 — Fushimi Inari at sunrise…' },
      ],
      ctaText: 'Try it yourself',
    })
  );
  assert.ok(html.includes('data-shared-chat'), 'host hook');
  assert.ok(html.includes('data-shared-header'), 'header hook');
  assert.ok(html.includes('Nebula'), 'brand name');
  assert.ok(html.includes('data-shared-meta'), 'meta hook');
  assert.ok(html.includes('12 messages · Mar 3, 2026'), 'meta text');
  assert.ok(html.includes('data-shared-msg="m1"'), 'user bubble');
  assert.ok(html.includes('data-shared-role="user"'), 'user role');
  assert.ok(html.includes('data-shared-role="assistant"'), 'assistant role');
  assert.ok(html.includes('data-shared-cta'), 'cta hook');
  assert.ok(html.includes('Try it yourself'), 'cta text');
  assert.ok(html.includes('read-only'), 'default cta note');
});

test('React SSR — MemoryPanel items, empty state and add input', async () => {
  const { default: MemoryPanel } = await load('MemoryPanel.tsx');
  const html = renderToStaticMarkup(
    h(MemoryPanel, {
      items: [
        { id: 'mem1', text: 'Prefers dark mode everywhere', source: 'Conversation · Nov 2' },
        { id: 'mem2', text: 'Writes in TypeScript' },
      ],
    })
  );
  assert.ok(html.includes('data-memory-panel'), 'host hook');
  assert.ok(html.includes('data-memory-item="mem1"'), 'item 1');
  assert.ok(html.includes('data-memory-text'), 'text hook');
  assert.ok(html.includes('Prefers dark mode everywhere'), 'item text');
  assert.ok(html.includes('data-memory-source'), 'source caption');
  assert.ok(html.includes('Conversation · Nov 2'), 'source text');
  assert.ok(html.includes('data-memory-edit'), 'edit button');
  assert.ok(html.includes('data-memory-delete'), 'delete button');
  assert.ok(html.includes('data-memory-clear'), 'clear all');
  assert.ok(html.includes('data-memory-add-input'), 'add input');
  assert.ok(html.includes('data-memory-add'), 'add button');

  const empty = renderToStaticMarkup(h(MemoryPanel, { items: [] }));
  assert.ok(empty.includes('data-memory-empty'), 'empty state');
  assert.ok(!empty.includes('data-memory-clear'), 'no clear-all when empty');
});

test('React SSR — ConnectorGrid cards, count badge and connected state', async () => {
  const { default: ConnectorGrid } = await load('ConnectorGrid.tsx');
  const html = renderToStaticMarkup(
    h(ConnectorGrid, {
      connectors: [
        { id: 'github', name: 'GitHub', description: 'Read issues and PRs', icon: '🐙', connected: true },
        { id: 'notion', name: 'Notion', description: 'Search your workspace' },
        { id: 'slack', name: 'Slack' },
      ],
    })
  );
  assert.ok(html.includes('data-connector-grid'), 'host hook');
  assert.ok(html.includes('data-connector="github"'), 'connector card');
  assert.ok(html.includes('data-connector-name'), 'name hook');
  assert.ok(html.includes('GitHub'), 'name text');
  assert.ok(html.includes('data-connector-desc'), 'desc hook');
  assert.ok(html.includes('Read issues and PRs'), 'desc text');
  assert.ok(html.includes('data-connector-count'), 'count badge');
  assert.ok(html.includes('1/3 connected'), 'count text');
  assert.ok(html.includes('data-connector-toggle'), 'toggle button');
  assert.ok(html.includes('Connected'), 'connected label');
  assert.ok(html.includes('Connect'), 'connect label');
  assert.ok(html.includes('aria-checked') === false, 'no stray aria');
});

test('React SSR — ModelComparePane columns, statuses and vote bar', async () => {
  const { default: ModelComparePane } = await load('ModelComparePane.tsx');
  const html = renderToStaticMarkup(
    h(ModelComparePane, {
      prompt: 'Explain CORS in one paragraph.',
      modelA: 'GPT-5.2',
      modelB: 'Claude 4.5',
      outputA: 'CORS is a browser mechanism…',
      outputB: 'Cross-Origin Resource Sharing…',
      statusA: 'streaming',
      statusB: 'error',
    })
  );
  assert.ok(html.includes('data-model-compare'), 'host hook');
  assert.ok(html.includes('data-compare-prompt'), 'prompt hook');
  assert.ok(html.includes('Explain CORS in one paragraph.'), 'prompt text');
  assert.ok(html.includes('data-compare-col="a"'), 'column A');
  assert.ok(html.includes('data-compare-col="b"'), 'column B');
  assert.ok(html.includes('data-compare-model="a"'), 'model badge A');
  assert.ok(html.includes('GPT-5.2'), 'model A name');
  assert.ok(html.includes('Claude 4.5'), 'model B name');
  assert.ok(html.includes('data-compare-output="a"'), 'output A');
  assert.ok(html.includes('data-compare-status="a"'), 'streaming status');
  assert.ok(html.includes('data-compare-status="b"'), 'error status');
  assert.ok(html.includes('Generation failed'), 'error text');
  assert.ok(html.includes('data-compare-vote="A"'), 'vote A');
  assert.ok(html.includes('data-compare-vote="tie"'), 'vote tie');
  assert.ok(html.includes('data-compare-vote="B"'), 'vote B');
  assert.ok(html.includes('A is better'), 'vote label');
});
