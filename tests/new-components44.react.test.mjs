/**
 * SSR smoke tests for the v1.44.0 batch
 * (AiSuggestionCard, JumpBackIn, HelpResourcesPanel).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n44.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — AiSuggestionCard message, chips and close', async () => {
  const { default: AiSuggestionCard } = await load('AiSuggestionCard.tsx');
  const html = renderToStaticMarkup(
    h(AiSuggestionCard, {
      message: 'Looking ahead to tomorrow in Tokyo.',
      chips: ['Weather for tomorrow', 'Summarize tomorrow'],
    })
  );
  assert.ok(html.includes('data-ai-suggestion-card'), 'card hook');
  assert.ok(html.includes('data-ai-suggestion-message'), 'message hook');
  assert.ok(html.includes('Looking ahead to tomorrow in Tokyo.'), 'message text');
  assert.ok(html.includes('data-ai-suggestion-chip'), 'chip hook');
  assert.ok(html.includes('Weather for tomorrow'), 'chip text');
  assert.ok(html.includes('data-ai-suggestion-close'), 'close hook');
  assert.ok(html.includes('Dismiss suggestion'), 'close aria-label');

  const empty = renderToStaticMarkup(h(AiSuggestionCard, { chips: [] }));
  assert.ok(!empty.includes('data-ai-suggestion-chip'), 'no chips when empty');
});

test('React SSR — JumpBackIn cards, kind badges and placeholders', async () => {
  const { default: JumpBackIn } = await load('JumpBackIn.tsx');
  const html = renderToStaticMarkup(
    h(JumpBackIn, {
      cards: [
        { id: 'c1', kind: 'Trip', title: 'Trip to Japan, September 2026', subtitle: 'Tokyo · Starting 14 Sept' },
        { id: 'c2', kind: 'Chat', title: 'Mount Fuji Trip Planning', subtitle: 'Last touched 2 days ago' },
      ],
    })
  );
  assert.ok(html.includes('data-jump-back-in'), 'row hook');
  assert.ok(html.includes('Jump back in'), 'title text');
  assert.ok(html.includes('data-jump-back-in-see-all'), 'see all hook');
  assert.ok(html.includes('data-jump-back-in-card="c1"'), 'card c1');
  assert.ok(html.includes('data-jump-back-in-kind'), 'kind badge hook');
  assert.ok(html.includes('Trip'), 'trip kind');
  assert.ok(html.includes('data-jump-back-in-placeholder'), 'gradient placeholder');
  assert.ok(html.includes('from-sky-400'), 'placeholder gradient');
  assert.ok(html.includes('data-jump-back-in-card-title'), 'card title hook');
  assert.ok(html.includes('Trip to Japan, September 2026'), 'card title text');
  assert.ok(html.includes('data-jump-back-in-card-subtitle'), 'card subtitle hook');

  const withImage = renderToStaticMarkup(
    h(JumpBackIn, {
      cards: [{ id: 'c3', kind: 'Chat', title: 'T', subtitle: 'S', image: 'https://example.com/a.png' }],
    })
  );
  assert.ok(withImage.includes('data-jump-back-in-image'), 'image renders when provided');
  assert.ok(!withImage.includes('data-jump-back-in-placeholder'), 'no placeholder with image');
});

test('React SSR — HelpResourcesPanel badges, minutes and links', async () => {
  const { default: HelpResourcesPanel } = await load('HelpResourcesPanel.tsx');
  const html = renderToStaticMarkup(
    h(HelpResourcesPanel, {
      resources: [
        { id: 'r1', badge: 'Reference', title: 'Get started', description: 'Learn the basics.' },
        { id: 'r2', badge: 'Tutorial', title: 'CLI quick start', description: 'Author PRs with the CLI.', minutes: 10 },
      ],
      links: ['Send feedback', 'Docs'],
    })
  );
  assert.ok(html.includes('data-help-resources-panel'), 'panel hook');
  assert.ok(html.includes('data-help-resources-header'), 'header hook');
  assert.ok(html.includes('Help'), 'header text');
  assert.ok(html.includes('data-help-resources-section'), 'section label hook');
  assert.ok(html.includes('Tutorials &amp; resources'), 'section label text');
  assert.ok(html.includes('data-help-resource="r1"'), 'resource r1');
  assert.ok(html.includes('data-help-resource-badge'), 'badge hook');
  assert.ok(html.includes('Reference'), 'reference badge');
  assert.ok(html.includes('bg-emerald-50'), 'tutorial badge tone');
  assert.ok(html.includes('data-help-resource-minutes'), 'minutes hook');
  assert.ok(html.includes('10 minutes'), 'minutes text');
  assert.ok(html.includes('data-help-resource-title'), 'title hook');
  assert.ok(html.includes('data-help-resource-desc'), 'desc hook');
  assert.ok(html.includes('data-help-resources-links'), 'links group hook');
  assert.ok(html.includes('data-help-resources-link'), 'link hook');
  assert.ok(html.includes('Send feedback'), 'link text');

  const noLinks = renderToStaticMarkup(h(HelpResourcesPanel, { links: [] }));
  assert.ok(!noLinks.includes('data-help-resources-links'), 'no links group when empty');
});
