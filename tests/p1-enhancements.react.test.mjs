/**
 * SSR smoke tests for the P1 enhancement batch (chips, steps, multi-file diff,
 * shortcut bar, countdown bar, session groups + user card). Transpiles each
 * TSX into the shared cache dir and static-renders it. Interactive behavior
 * lives in the vanilla jsdom suites.
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
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"');
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.p1.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — DiffViewer renders multi-file tabs with per-file counts', async () => {
  const { DiffViewer } = await load('DiffViewer.tsx');
  const files = [
    { filename: 'app.ts', language: 'ts', lines: [{ type: 'add', content: 'x' }, { type: 'remove', content: 'y' }] },
    { filename: 'readme.md', lines: [{ type: 'context', content: 'z' }] },
  ];
  const html = renderToStaticMarkup(h(DiffViewer, { files }));
  assert.ok(html.includes('app.ts'), 'tab 1');
  assert.ok(html.includes('readme.md'), 'tab 2');
  assert.ok(html.includes('aria-selected="true"'), 'active tab');
  assert.ok(html.includes('>+1<'), 'add count on tab');
});

test('React SSR — DiffViewer folds long context runs into gap rows', async () => {
  const { DiffViewer } = await load('DiffViewer.tsx');
  const lines = [
    { type: 'add', content: 'x' },
    ...Array.from({ length: 10 }, (_, i) => ({ type: 'context', content: `c${i}` })),
    { type: 'remove', content: 'y' },
  ];
  const html = renderToStaticMarkup(h(DiffViewer, { lines }));
  assert.ok(html.includes('⋯ 4 unchanged lines'), 'gap summary (10 - 3 - 3 = 4)');
  assert.ok(!html.includes('>c6<'), 'middle hidden line not rendered when collapsed');
  assert.ok(html.includes('>c2<') && html.includes('>c7<'), '3 lines of context on each side');
});

test('React SSR — ThinkingBlock renders step timeline with durations', async () => {
  const { ThinkingBlock } = await load('ThinkingBlock.tsx');
  const html = renderToStaticMarkup(
    h(ThinkingBlock, {
      content: 'thinking…',
      isThinking: true,
      steps: [
        { id: 's1', label: 'Parsing', durationMs: 240 },
        { id: 's2', label: 'Searching' },
      ],
    })
  );
  assert.ok(html.includes('Parsing'), 'step label');
  assert.ok(html.includes('240ms'), 'duration badge');
  assert.ok(html.includes('Searching'), 'running step');
});

test('React SSR — ChatSessionList groups sessions and renders user card', async () => {
  const { ChatSessionList } = await load('ChatSessionList.tsx');
  const html = renderToStaticMarkup(
    h(ChatSessionList, {
      sessions: [
        { id: 1, title: 'Today chat', group: 'Today' },
        { id: 2, title: 'Old chat' },
      ],
      user: { name: 'Ada Lovelace', email: 'ada@example.com' },
      activeId: 1,
    })
  );
  assert.ok(html.includes('>Today</span>'), 'group header label');
  assert.ok(html.includes('uppercase'), 'group header uppercase styling');
  assert.ok(html.includes('Ada Lovelace'), 'user name');
  assert.ok(html.includes('ada@example.com'), 'user email');
  assert.ok(html.includes('AL'), 'avatar initials');
});

test('React SSR — CommandPalette renders shortcut hint bar', async () => {
  const { CommandPalette } = await load('CommandPalette.tsx');
  const html = renderToStaticMarkup(h(CommandPalette, { items: [{ id: 'a', label: 'Alpha' }], isOpen: true }));
  assert.ok(html.includes('Navigate'), 'Navigate hint');
  assert.ok(html.includes('Select'), 'Select hint');
  assert.ok(html.includes('Close'), 'Close hint');
});

test('React SSR — ToastStack renders countdown bar with type color', async () => {
  const { ToastStack } = await load('ToastStack.tsx');
  const html = renderToStaticMarkup(
    h(ToastStack, { toasts: [{ id: 1, message: 'Saved!', type: 'success' }], duration: 4000 })
  );
  assert.ok(html.includes('Saved!'), 'message');
  assert.ok(html.includes('bg-emerald-500'), 'emerald bar');
  assert.ok(html.includes('width:'), 'inline width style');
});

test('React SSR — ChatPromptInput renders chips row', async () => {
  const { ChatPromptInput } = await load('ChatPromptInput.tsx');
  const html = renderToStaticMarkup(
    h(ChatPromptInput, {
      value: '',
      chips: [
        { id: 'gpt', label: 'GPT-4o', active: true },
        { id: 'web', label: 'Web search' },
      ],
    })
  );
  assert.ok(html.includes('GPT-4o'), 'chip 1');
  assert.ok(html.includes('Web search'), 'chip 2');
  assert.ok(html.includes('aria-pressed="true"'), 'active chip state');
});
