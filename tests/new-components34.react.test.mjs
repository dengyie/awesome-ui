/**
 * SSR smoke tests for the v1.34.0 batch
 * (VoiceOrb, ShareChatDialog, BrandPromptTable).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n34.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — VoiceOrb states, wave, label and controls', async () => {
  const { default: VoiceOrb } = await load('VoiceOrb.tsx');
  const html = renderToStaticMarkup(
    h(VoiceOrb, { state: 'listening', hint: 'Ask anything', size: 'lg' })
  );
  assert.ok(html.includes('data-voice-orb'), 'host hook');
  assert.ok(html.includes('data-voice-orb-disc'), 'orb disc');
  assert.ok(html.includes('data-orb-state="listening"'), 'state hook');
  assert.ok(html.includes('animate-pulse'), 'listening pulse');
  assert.ok(html.includes('from-sky-400'), 'listening gradient');
  assert.ok(html.includes('data-voice-orb-wave'), 'waveform visible when active');
  assert.ok(html.includes('height:34px'), 'bar heights');
  assert.ok(html.includes('Listening…'), 'state label');
  assert.ok(html.includes('Ask anything'), 'hint');
  assert.ok(html.includes('h-56 w-56'), 'lg size');
  assert.ok(html.includes('data-voice-orb-mute'), 'mute button');
  assert.ok(html.includes('Mute'), 'mute label');
  assert.ok(html.includes('data-voice-orb-end'), 'end button');
  assert.ok(html.includes('End call'), 'end label');

  const idle = renderToStaticMarkup(h(VoiceOrb, { state: 'idle' }));
  assert.ok(idle.includes('Tap to talk'), 'idle label');
  assert.ok(!idle.includes('data-voice-orb-wave'), 'no waveform when idle');
  assert.ok(idle.includes('dark:from-zinc-600'), 'idle gradient');

  const muted = renderToStaticMarkup(h(VoiceOrb, { state: 'speaking', muted: true }));
  assert.ok(muted.includes('Unmute'), 'muted shows Unmute');
  assert.ok(muted.includes('aria-pressed="true"'), 'aria-pressed');
  assert.ok(muted.includes('from-emerald-400'), 'speaking gradient');

  const compact = renderToStaticMarkup(h(VoiceOrb, { showControls: false }));
  assert.ok(!compact.includes('data-voice-orb-end'), 'controls hidden');
});

test('React SSR — ShareChatDialog private/public choice and link row', async () => {
  const { default: ShareChatDialog } = await load('ShareChatDialog.tsx');
  const html = renderToStaticMarkup(
    h(ShareChatDialog, { open: true, shared: false })
  );
  assert.ok(html.includes('data-share-chat'), 'host hook');
  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('Share chat'), 'title');
  assert.ok(html.includes('Future messages'), 'description');
  assert.ok(html.includes('data-share-close'), 'close button');
  assert.ok(html.includes('data-share-private'), 'private option');
  assert.ok(html.includes('Keep private'), 'private label');
  assert.ok(html.includes('data-share-public'), 'public option');
  assert.ok(html.includes('Create public link'), 'public label');

  const shared = renderToStaticMarkup(
    h(ShareChatDialog, { shared: true, link: 'https://example.com/s/abc123' })
  );
  assert.ok(shared.includes('data-share-link'), 'link code shown');
  assert.ok(shared.includes('https://example.com/s/abc123'), 'link text');
  assert.ok(shared.includes('data-share-copy'), 'copy button');
  assert.ok(shared.includes('Copy link'), 'copy label');
  assert.ok(!shared.includes('data-share-create'), 'no create when link exists');

  const noLink = renderToStaticMarkup(h(ShareChatDialog, { shared: true, link: '' }));
  assert.ok(noLink.includes('data-share-create'), 'create button when shared but no link');
  assert.ok(noLink.includes('Create link'), 'create label');

  const closed = renderToStaticMarkup(h(ShareChatDialog, { open: false }));
  assert.equal(closed, '', 'closed renders nothing');
});

test('React SSR — BrandPromptTable rows, quota and empty state', async () => {
  const { default: BrandPromptTable } = await load('BrandPromptTable.tsx');
  const html = renderToStaticMarkup(
    h(BrandPromptTable, {
      title: 'Prompts',
      quotaUsed: 49,
      quotaTotal: 50,
      rows: [
        { id: 'p1', prompt: 'best CRM for startups', visibility: 82, sentiment: 74, position: 2 },
        { id: 'p2', prompt: 'affordable invoicing tool', visibility: 41, sentiment: 55, position: 5 },
        { id: 'p3', prompt: 'enterprise payroll software', visibility: 12, sentiment: 31, position: 9 },
      ],
    })
  );
  assert.ok(html.includes('data-brand-prompt-table'), 'host hook');
  assert.ok(html.includes('data-brand-quota'), 'quota badge');
  assert.ok(html.includes('49 / 50 prompts'), 'quota text');
  assert.ok(html.includes('+ Add Prompt'), 'add CTA');
  assert.ok(html.includes('data-brand-row="p1"'), 'row hook');
  assert.ok(html.includes('best CRM for startups'), 'prompt text');
  assert.ok(html.includes('data-brand-visibility'), 'visibility col');
  assert.ok(html.includes('82%'), 'visibility value');
  assert.ok(html.includes('data-brand-sentiment'), 'sentiment col');
  assert.ok(html.includes('text-emerald-600'), 'high sentiment green');
  assert.ok(html.includes('text-amber-600'), 'mid sentiment amber');
  assert.ok(html.includes('text-red-600'), 'low sentiment red');
  assert.ok(html.includes('data-brand-position'), 'position col');
  assert.ok(html.includes('#2'), 'position value');

  const empty = renderToStaticMarkup(h(BrandPromptTable, { rows: [] }));
  assert.ok(empty.includes('data-brand-empty'), 'empty state');
  assert.ok(empty.includes('add your first brand prompt'), 'empty text');
});
