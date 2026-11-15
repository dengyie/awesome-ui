/**
 * SSR smoke tests for the v1.14.0 batch (VoiceModePanel, PromptLibrary).
 * Interactive behavior lives in the vanilla suite.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n13.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — VoiceModePanel idle state', async () => {
  const { VoiceModePanel } = await load('VoiceModePanel.tsx');
  const html = renderToStaticMarkup(h(VoiceModePanel, {}));

  assert.ok(html.includes('Tap to speak'), 'idle label');
  assert.ok(html.includes('Voice mode is ready'), 'idle hint');
  assert.ok(html.includes('aria-label="Start voice mode"'), 'start label');
  assert.ok(html.includes('aria-pressed="false"'), 'not pressed');
  assert.equal(html.includes('End voice session'), false, 'no end button without onEnd');
});

test('React SSR — VoiceModePanel listening with transcript and end action', async () => {
  const { VoiceModePanel } = await load('VoiceModePanel.tsx');
  const html = renderToStaticMarkup(
    h(VoiceModePanel, {
      state: 'listening',
      transcript: 'Summarize this thread',
      reply: 'On it…',
      onEnd: () => {},
    })
  );

  assert.ok(html.includes('Listening…'), 'listening label');
  assert.ok(html.includes('Speak now'), 'listening hint');
  assert.ok(html.includes('aria-label="Stop voice mode"'), 'stop label');
  assert.ok(html.includes('aria-pressed="true"'), 'pressed');
  assert.ok(html.includes('Summarize this thread'), 'transcript');
  assert.ok(html.includes('On it…'), 'reply');
  assert.ok(html.includes('End voice session'), 'end button');
  assert.ok(html.includes('animate-ping'), 'pulse ring while active');
});

test('React SSR — VoiceModePanel thinking and speaking states', async () => {
  const { VoiceModePanel } = await load('VoiceModePanel.tsx');
  const thinking = renderToStaticMarkup(h(VoiceModePanel, { state: 'thinking' }));
  assert.ok(thinking.includes('Thinking…'), 'thinking label');
  assert.ok(thinking.includes('animate-pulse'), 'thinking pulse');

  const speaking = renderToStaticMarkup(h(VoiceModePanel, { state: 'speaking' }));
  assert.ok(speaking.includes('Speaking…'), 'speaking label');
  assert.ok(speaking.includes('Tap to interrupt'), 'speaking hint');
});

test('React SSR — PromptLibrary renders header, chips and cards', async () => {
  const { PromptLibrary } = await load('PromptLibrary.tsx');
  const html = renderToStaticMarkup(
    h(PromptLibrary, {
      prompts: [
        { id: 'p1', title: 'Summarize thread', description: 'Condense a long chat', prompt: 'Summarize the following…', category: 'Writing', tags: ['summary'], favorite: true },
        { id: 'p2', title: 'Refactor code', prompt: 'Refactor this function…', category: 'Code' },
      ],
    })
  );

  assert.ok(html.includes('Prompt library'), 'title');
  assert.ok(html.includes('Search prompts'), 'search input');
  assert.ok(html.includes('>All<'), 'all chip');
  assert.ok(html.includes('Writing'), 'category chip');
  assert.ok(html.includes('Code'), 'second category chip');
  assert.ok(html.includes('Summarize thread'), 'card 1');
  assert.ok(html.includes('Refactor code'), 'card 2');
  assert.ok(html.includes('Condense a long chat'), 'description');
  assert.ok(html.includes('aria-pressed="true"'), 'favorite pressed');
  assert.ok(html.includes('>Use<') || html.includes('Use'), 'use button');
});

test('React SSR — PromptLibrary hides search when disabled', async () => {
  const { PromptLibrary } = await load('PromptLibrary.tsx');
  const html = renderToStaticMarkup(
    h(PromptLibrary, { searchable: false, prompts: [{ id: 'p1', title: 'Only', prompt: 'x' }] })
  );
  assert.equal(html.includes('Search prompts'), false, 'no search input');
  assert.ok(html.includes('Only'), 'card still renders');
});

test('React SSR — PromptLibrary empty state', async () => {
  const { PromptLibrary } = await load('PromptLibrary.tsx');
  const html = renderToStaticMarkup(h(PromptLibrary, { prompts: [] }));
  assert.ok(html.includes('No prompts match your filters.'), 'empty copy');
  assert.ok(html.includes('>0<'), 'zero count');
});
