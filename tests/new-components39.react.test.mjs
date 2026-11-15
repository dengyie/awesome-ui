/**
 * SSR smoke tests for the v1.39.0 batch
 * (AiResearchPanel, ApiKeyTable, VoiceSessionHistory).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n39.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — AiResearchPanel template cards and footer CTA', async () => {
  const { default: AiResearchPanel } = await load('AiResearchPanel.tsx');
  const html = renderToStaticMarkup(
    h(AiResearchPanel, {
      title: 'Research with AI',
      templates: [
        { id: 'r1', title: 'Research and evaluate a company for fit', description: 'Research a company to determine if their needs align with your offering.' },
        { id: 'r2', title: 'Confirm decision-maker', description: 'Determine if a contact is a valid decision-maker.' },
      ],
    })
  );
  assert.ok(html.includes('data-ai-research-panel'), 'host hook');
  assert.ok(html.includes('data-ai-research-title'), 'title hook');
  assert.ok(html.includes('Research with AI'), 'title text');
  assert.ok(html.includes('data-ai-research-close'), 'close button');
  assert.ok(html.includes('data-ai-research-list'), 'list hook');
  assert.ok(html.includes('data-research-card="r1"'), 'card hook');
  assert.ok(html.includes('Research and evaluate a company for fit'), 'card title');
  assert.ok(html.includes('data-research-run'), 'try CTA');
  assert.ok(html.includes('Try it'), 'try label');
  assert.ok(html.includes('data-ai-research-custom'), 'custom CTA');
  assert.ok(html.includes('Run custom AI prompt'), 'custom label');

  const empty = renderToStaticMarkup(h(AiResearchPanel, {}));
  assert.ok(empty.includes('data-ai-research-empty'), 'empty state');

  const closed = renderToStaticMarkup(h(AiResearchPanel, { open: false }));
  assert.ok(!closed.includes('data-ai-research-panel'), 'not rendered when closed');
});

test('React SSR — ApiKeyTable rows, status badges and actions', async () => {
  const { default: ApiKeyTable } = await load('ApiKeyTable.tsx');
  const html = renderToStaticMarkup(
    h(ApiKeyTable, {
      keys: [
        { id: 'k1', name: 'Production key', preview: 'sk-proj-••••••••••••4x8f', created: 'Nov 12, 2026', status: 'active' },
        { id: 'k2', name: 'Legacy key', preview: 'sk-proj-••••••••••••9q2m', status: 'revoked' },
      ],
    })
  );
  assert.ok(html.includes('data-api-key-table'), 'host hook');
  assert.ok(html.includes('data-api-key-count'), 'count hook');
  assert.ok(html.includes('1 active'), 'active count excludes revoked');
  assert.ok(html.includes('data-api-key-create'), 'create CTA');
  assert.ok(html.includes('Create new secret key'), 'create label');
  assert.ok(html.includes('data-api-key-row="k1"'), 'row hook');
  assert.ok(html.includes('Production key'), 'key name');
  assert.ok(html.includes('data-api-key-status'), 'status hook');
  assert.ok(html.includes('Revoked'), 'revoked badge');
  assert.ok(html.includes('data-api-key-preview'), 'preview hook');
  assert.ok(html.includes('sk-proj-••••••••••••4x8f'), 'preview text');
  assert.ok(html.includes('created Nov 12, 2026'), 'created date');
  assert.ok(html.includes('data-api-key-copy'), 'copy action');
  assert.ok(html.includes('data-api-key-revoke'), 'revoke action');

  const empty = renderToStaticMarkup(h(ApiKeyTable, {}));
  assert.ok(empty.includes('data-api-key-empty'), 'empty state');
});

test('React SSR — VoiceSessionHistory rows, statuses and play buttons', async () => {
  const { default: VoiceSessionHistory } = await load('VoiceSessionHistory.tsx');
  const html = renderToStaticMarkup(
    h(VoiceSessionHistory, {
      sessions: [
        { id: 's1', title: 'Homepage walkthrough', date: 'Today', duration: '04:12', status: 'completed' },
        { id: 's2', title: 'Weekly sync notes', date: 'Yesterday', duration: '11:38', status: 'in-progress' },
        { id: 's3', title: 'Broken recording', duration: '00:00', status: 'failed' },
      ],
    })
  );
  assert.ok(html.includes('data-voice-history'), 'host hook');
  assert.ok(html.includes('data-voice-history-count'), 'count hook');
  assert.ok(html.includes('data-voice-history-list'), 'list hook');
  assert.ok(html.includes('data-voice-session="s1"'), 'session hook');
  assert.ok(html.includes('Homepage walkthrough'), 'session title');
  assert.ok(html.includes('data-voice-session-meta'), 'meta hook');
  assert.ok(html.includes('Today · 04:12'), 'meta text');
  assert.ok(html.includes('data-voice-session-status'), 'status hook');
  assert.ok(html.includes('Completed'), 'completed label');
  assert.ok(html.includes('Running'), 'running label');
  assert.ok(html.includes('Failed'), 'failed label');
  assert.ok(html.includes('data-voice-session-play'), 'play button');

  const empty = renderToStaticMarkup(h(VoiceSessionHistory, {}));
  assert.ok(empty.includes('data-voice-history-empty'), 'empty state');
});
