/**
 * SSR smoke tests for the v1.29.0 batch
 * (ColorPickerPopover, EditorToolPalette, ShortcutCheatSheet, ZoomControlBar, AIInlineMenu).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n29.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ColorPickerPopover grid, hex input and sections', async () => {
  const { default: ColorPickerPopover } = await load('ColorPickerPopover.tsx');
  const html = renderToStaticMarkup(
    h(ColorPickerPopover, {
      value: '#2563eb',
      documentColors: ['#476cc4', '#e61f5b'],
      customColors: ['#0f766e'],
      showEyedropper: true,
      showRgbInputs: true,
      onChange: () => {},
      onAddCustom: () => {},
    })
  );
  assert.ok(html.includes('data-color-picker'), 'host hook');
  assert.ok(html.includes('data-color-swatch="#2563eb"'), 'selected swatch');
  assert.ok(html.includes('#476cc4'), 'document color');
  assert.ok(html.includes('#0f766e'), 'custom color');
  assert.ok(html.includes('Document colors'), 'document section');
  assert.ok(html.includes('Custom colors'), 'custom section');
  assert.ok(html.includes('data-color-hex-input'), 'hex input');
  assert.ok(html.includes('data-color-eyedropper'), 'eyedropper');
  assert.ok(html.includes('data-color-channel="r"'), 'rgb channel');
  assert.ok(html.includes('data-color-custom-add'), 'add custom tile');
  assert.ok(html.includes('ring-2'), 'selected ring');

  const plain = renderToStaticMarkup(h(ColorPickerPopover, { value: '#f3f4f6' }));
  assert.ok(plain.includes('text-zinc-500'), 'light swatch check tone');
  assert.ok(!plain.includes('data-color-eyedropper'), 'no eyedropper by default');
});

test('React SSR — EditorToolPalette active tool, kbd hints and badge', async () => {
  const { default: EditorToolPalette } = await load('EditorToolPalette.tsx');
  const icon = h('svg', { viewBox: '0 0 20 20' });
  const html = renderToStaticMarkup(
    h(EditorToolPalette, {
      tools: [
        { id: 'select', icon, label: 'Select', kbd: '1' },
        { id: 'hand', icon, label: 'Hand', kbd: '2' },
        { id: 'square', icon, label: 'Square', kbd: '3', disabled: true },
      ],
      activeId: 'select',
      activeCount: 1,
      onSelect: () => {},
    })
  );
  assert.ok(html.includes('data-tool-palette'), 'host hook');
  assert.ok(html.includes('data-tool="select"'), 'tool button');
  assert.ok(html.includes('data-tool="square"'), 'disabled tool');
  assert.ok(html.includes('bg-blue-500'), 'active tool tone');
  assert.ok(html.includes('>1</span>'), 'kbd hint');
  assert.ok(html.includes('data-tool-badge'), 'active count badge');
  assert.ok(html.includes('Select'), 'tool label');
  assert.ok(html.includes('disabled'), 'disabled attr');

  const vertical = renderToStaticMarkup(h(EditorToolPalette, { tools: [{ id: 'a', icon, label: 'A' }], orientation: 'vertical', showKbdHints: false }));
  assert.ok(vertical.includes('flex-col'), 'vertical layout');
  assert.ok(vertical.includes('aria-orientation="vertical"'), 'aria orientation');
});

test('React SSR — ShortcutCheatSheet rows, keycaps and search', async () => {
  const { default: ShortcutCheatSheet } = await load('ShortcutCheatSheet.tsx');
  const html = renderToStaticMarkup(
    h(ShortcutCheatSheet, {
      title: 'Editor',
      searchable: true,
      shortcuts: [
        { id: 'bold', label: 'Bold', hint: '**Bold**', keys: ['⌘', 'B'], section: 'Editor' },
        { id: 'undo', label: 'Undo', keys: ['⌘', 'Z'], section: 'Editor' },
        { id: 'comment', label: 'Comment a selection', keys: ['⌥', '⌘', 'M'] },
      ],
    })
  );
  assert.ok(html.includes('data-shortcut-sheet'), 'host hook');
  assert.ok(html.includes('data-shortcut-row="bold"'), 'row hook');
  assert.ok(html.includes('data-shortcut-section="Editor"'), 'section header');
  assert.ok(html.includes('**Bold**'), 'markdown hint');
  assert.ok(html.includes('text-indigo-600'), 'hint tone');
  assert.ok(html.includes('⌘'), 'keycap');
  assert.ok(html.includes('shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'), 'keycap shadow');
  assert.ok(html.includes('Comment a selection'), 'third entry');
  assert.ok(html.includes('data-shortcut-search'), 'search input');

  const filtered = renderToStaticMarkup(
    h(ShortcutCheatSheet, { shortcuts: [{ id: 'bold', label: 'Bold', keys: ['⌘B'] }], searchable: true })
  );
  assert.ok(filtered.includes('Bold'), 'base entry renders');
});

test('React SSR — ZoomControlBar stepper, dropdown and slider variants', async () => {
  const { default: ZoomControlBar } = await load('ZoomControlBar.tsx');
  const stepper = renderToStaticMarkup(
    h(ZoomControlBar, { value: 100, variant: 'stepper', showUndoRedo: true, showFit: true, onZoomChange: () => {} })
  );
  assert.ok(stepper.includes('data-zoom-control'), 'host hook');
  assert.ok(stepper.includes('data-zoom-out'), 'zoom out');
  assert.ok(stepper.includes('data-zoom-in'), 'zoom in');
  assert.ok(stepper.includes('data-zoom-undo'), 'undo');
  assert.ok(stepper.includes('data-zoom-redo'), 'redo');
  assert.ok(stepper.includes('100%'), 'percent');
  assert.ok(stepper.includes('data-zoom-fit'), 'fit button');

  const dropdown = renderToStaticMarkup(h(ZoomControlBar, { value: 67, variant: 'dropdown', presets: [25, 50, 100] }));
  assert.ok(dropdown.includes('67%'), 'dropdown percent');
  assert.ok(!dropdown.includes('data-zoom-menu'), 'menu closed by default');

  const slider = renderToStaticMarkup(h(ZoomControlBar, { value: 75, variant: 'slider' }));
  assert.ok(slider.includes('data-zoom-slider'), 'range input');
  assert.ok(slider.includes('value="75"'), 'slider value');

  const clamped = renderToStaticMarkup(h(ZoomControlBar, { value: 500, min: 10, max: 400 }));
  assert.ok(!clamped.includes('500%'), 'value clamped on mount');
});

test('React SSR — AIInlineMenu chip, actions, states and dismiss', async () => {
  const { default: AIInlineMenu } = await load('AIInlineMenu.tsx');
  const html = renderToStaticMarkup(
    h(AIInlineMenu, {
      actions: [
        { id: 'edit', label: 'Edit' },
        { id: 'tone', label: 'Change tone', options: ['Professional', 'Friendly'] },
      ],
      onAction: () => {},
    })
  );
  assert.ok(html.includes('data-ai-inline-menu'), 'host hook');
  assert.ok(html.includes('data-ai-action="edit"'), 'action button');
  assert.ok(html.includes('data-ai-action="tone"'), 'dropdown action');
  assert.ok(html.includes('>AI</span>') || html.includes('AI'), 'AI chip');
  assert.ok(html.includes('bg-indigo-50'), 'chip tone');
  assert.ok(html.includes('data-ai-dismiss'), 'dismiss button');
  assert.ok(!html.includes('data-ai-menu'), 'menu closed by default');

  const loading = renderToStaticMarkup(h(AIInlineMenu, { loading: true }));
  assert.ok(loading.includes('Working…'), 'loading label');
  assert.ok(loading.includes('animate-pulse'), 'pulse animation');

  const errored = renderToStaticMarkup(h(AIInlineMenu, { error: 'Request failed' }));
  assert.ok(errored.includes('Request failed'), 'error label');
  assert.ok(errored.includes('border-red-300'), 'error border');

  const brand = renderToStaticMarkup(h(AIInlineMenu, { tone: 'brand' }));
  assert.ok(brand.includes('bg-emerald-50'), 'brand chip tone');
});
