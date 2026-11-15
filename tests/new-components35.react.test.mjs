/**
 * SSR smoke tests for the v1.35.0 batch
 * (PromptSaveDialog, AiTemplatePicker, CreationComposer).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n35.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — PromptSaveDialog folder, variables and actions', async () => {
  const { default: PromptSaveDialog } = await load('PromptSaveDialog.tsx');
  const html = renderToStaticMarkup(
    h(PromptSaveDialog, {
      title: 'Onboarding Ratings',
      folder: 'Research',
      variables: ['company', 'audience'],
    })
  );
  assert.ok(html.includes('data-prompt-save'), 'host hook');
  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('data-prompt-save-folder'), 'folder picker');
  assert.ok(html.includes('Research'), 'folder name');
  assert.ok(html.includes('data-prompt-save-title'), 'title input');
  assert.ok(html.includes('Onboarding Ratings'), 'title value');
  assert.ok(html.includes('data-prompt-save-body'), 'prompt textarea');
  assert.ok(html.includes('data-prompt-save-add-var'), 'add variable CTA');
  assert.ok(html.includes('data-prompt-save-var'), 'variable chips');
  assert.ok(html.includes('{{company}}'), 'company var');
  assert.ok(html.includes('{{audience}}'), 'audience var');
  assert.ok(html.includes('data-prompt-save-cancel'), 'cancel button');
  assert.ok(html.includes('data-prompt-save-submit'), 'save button');
  assert.ok(html.includes('Save prompt'), 'save label');

  const noVars = renderToStaticMarkup(h(PromptSaveDialog, { variables: [] }));
  assert.ok(!noVars.includes('data-prompt-save-vars'), 'no var chips row when empty');

  const closed = renderToStaticMarkup(h(PromptSaveDialog, { open: false }));
  assert.equal(closed, '', 'closed renders nothing');
});

test('React SSR — AiTemplatePicker categories, cards and custom action', async () => {
  const { default: AiTemplatePicker } = await load('AiTemplatePicker.tsx');
  const html = renderToStaticMarkup(
    h(AiTemplatePicker, {
      categories: [
        { id: 'all', label: 'All templates', count: 26 },
        { id: 'targeting', label: 'Improve your targeting', count: 13 },
      ],
      templates: [
        { id: 't1', name: 'Research a company', description: 'Research a company to determine fit.', category: 'all' },
        { id: 't2', name: 'Summarize news', description: 'Gather the most recent news.', category: 'targeting' },
      ],
      activeCategory: 'targeting',
    })
  );
  assert.ok(html.includes('data-ai-template-picker'), 'host hook');
  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('data-ai-templates-rail'), 'category rail');
  assert.ok(html.includes('data-ai-templates-category="targeting"'), 'category hook');
  assert.ok(html.includes('Improve your targeting'), 'category label');
  assert.ok(html.includes('data-ai-template-card="t2"'), 'visible template card');
  assert.ok(!html.includes('data-ai-template-card="t1"'), 'other-category card filtered out');
  assert.ok(html.includes('Try it'), 'try CTA');
  assert.ok(html.includes('data-ai-templates-custom'), 'custom action');
  assert.ok(html.includes('Run custom AI prompt'), 'custom label');

  const empty = renderToStaticMarkup(
    h(AiTemplatePicker, {
      categories: [{ id: 'x', label: 'Empty', count: 0 }],
      templates: [{ id: 't1', name: 'A', description: 'B', category: 'other' }],
      activeCategory: 'x',
    })
  );
  assert.ok(empty.includes('data-ai-templates-empty'), 'empty state');

  const closed = renderToStaticMarkup(h(AiTemplatePicker, { open: false, templates: [] }));
  assert.equal(closed, '', 'closed renders nothing');
});

test('React SSR — CreationComposer assist toggle, selects and create', async () => {
  const { default: CreationComposer } = await load('CreationComposer.tsx');
  const html = renderToStaticMarkup(
    h(CreationComposer, { imageAssist: true, resolution: '4K', count: 2 })
  );
  assert.ok(html.includes('data-creation-composer'), 'host hook');
  assert.ok(html.includes('data-creation-assist-toggle'), 'assist toggle');
  assert.ok(html.includes('aria-checked="true"'), 'assist checked when on');
  assert.ok(html.includes('Image Assist'), 'assist label');
  assert.ok(html.includes('data-creation-input'), 'prompt textarea');
  assert.ok(html.includes('Ad creative, product shot, social post…'), 'placeholder');
  assert.ok(html.includes('data-creation-resolution'), 'resolution select');
  assert.ok(html.includes('data-creation-count'), 'count select');
  assert.ok(html.includes('2×'), 'count option');
  assert.ok(html.includes('data-creation-submit'), 'submit CTA');
  assert.ok(html.includes('Create'), 'create label');

  const off = renderToStaticMarkup(h(CreationComposer, { imageAssist: false }));
  assert.ok(off.includes('aria-checked="false"'), 'assist unchecked when off');

  const closed = renderToStaticMarkup(h(CreationComposer, { open: false }));
  assert.equal(closed, '', 'closed renders nothing');
});
