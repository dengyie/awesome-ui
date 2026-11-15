/**
 * SSR smoke tests for the v1.41.0 batch
 * (AiNoteAnswer, AudioNotePlayer, ImageActionMenu).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n41.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — AiNoteAnswer waveform, sources and copy', async () => {
  const { default: AiNoteAnswer } = await load('AiNoteAnswer.tsx');
  const html = renderToStaticMarkup(
    h(AiNoteAnswer, {
      question: 'What improvements should I prioritize for Homepage?',
      answer: 'Consider simplifying navigation and reducing friction in finding key information.',
      sources: ['Product design sync: shorten onboarding', 'UX review highlights'],
    })
  );
  assert.ok(html.includes('data-note-answer-card'), 'card hook');
  assert.ok(html.includes('data-note-answer-question'), 'question row hook');
  assert.ok(html.includes('data-note-answer-play'), 'play button');
  assert.ok(html.includes('data-note-answer-waveform'), 'waveform hook');
  assert.ok(html.includes('data-note-answer-question-text'), 'question text hook');
  assert.ok(html.includes('What improvements should I prioritize'), 'question text');
  assert.ok(html.includes('data-note-answer-text'), 'answer hook');
  assert.ok(html.includes('simplifying navigation'), 'answer text');
  assert.ok(html.includes('data-note-answer-sources'), 'sources hook');
  assert.ok(html.includes('Other sources'), 'sources label');
  assert.ok(html.includes('data-note-answer-source'), 'source link');
  assert.ok(html.includes('Product design sync'), 'source text');
  assert.ok(html.includes('data-note-answer-copy'), 'copy CTA');
  assert.ok(html.includes('Copy'), 'copy label');

  const noSources = renderToStaticMarkup(h(AiNoteAnswer, { sources: [] }));
  assert.ok(!noSources.includes('data-note-answer-sources'), 'sources hidden when empty');
});

test('React SSR — AudioNotePlayer waveform, duration and playing state', async () => {
  const { default: AudioNotePlayer } = await load('AudioNotePlayer.tsx');
  const html = renderToStaticMarkup(
    h(AudioNotePlayer, {
      title: 'Homepage walkthrough notes',
      duration: '02:35',
      playing: true,
      waveform: [40, 70, 55, 90, 30],
    })
  );
  assert.ok(html.includes('data-audio-note-player'), 'host hook');
  assert.ok(html.includes('data-audio-note-toggle'), 'toggle button');
  assert.ok(html.includes('aria-label="Pause note"'), 'pause label when playing');
  assert.ok(html.includes('❚❚'), 'pause glyph');
  assert.ok(html.includes('data-audio-note-waveform'), 'waveform hook');
  assert.ok(html.includes('data-audio-note-duration'), 'duration hook');
  assert.ok(html.includes('02:35'), 'duration text');
  assert.ok(html.includes('bg-emerald-500'), 'played bars highlighted');
  assert.ok(html.includes('data-audio-note-title'), 'title hook');
  assert.ok(html.includes('Homepage walkthrough notes'), 'title text');

  const idle = renderToStaticMarkup(h(AudioNotePlayer, {}));
  assert.ok(idle.includes('aria-label="Play note"'), 'play label when idle');
  assert.ok(idle.includes('▶'), 'play glyph');
  assert.ok(!idle.includes('bg-emerald-500'), 'no played bars when idle');
});

test('React SSR — ImageActionMenu actions, divider and closed state', async () => {
  const { default: ImageActionMenu } = await load('ImageActionMenu.tsx');
  const html = renderToStaticMarkup(
    h(ImageActionMenu, {
      open: true,
      actions: [
        { id: 'fullscreen', label: 'Fullscreen' },
        { id: 'vary', label: 'Vary' },
        { id: 'edit', label: 'Edit' },
        { id: 'upscale', label: 'Upscale & enhance' },
        { id: 'video', label: 'Make video' },
        { id: 'download', label: 'Download' },
      ],
    })
  );
  assert.ok(html.includes('data-image-action-menu'), 'menu hook');
  assert.ok(html.includes('data-image-action="fullscreen"'), 'fullscreen action');
  assert.ok(html.includes('data-image-action="vary"'), 'vary action');
  assert.ok(html.includes('data-image-action="edit"'), 'edit action');
  assert.ok(html.includes('data-image-action="upscale"'), 'upscale action');
  assert.ok(html.includes('Upscale &amp; enhance'), 'upscale label escaped');
  assert.ok(html.includes('data-image-action="video"'), 'make video action');
  assert.ok(html.includes('data-image-action="download"'), 'download action');
  assert.ok(html.includes('data-image-action-label'), 'label hook');
  assert.ok(html.includes('bg-zinc-100'), 'divider before download');

  const empty = renderToStaticMarkup(h(ImageActionMenu, { open: true, actions: [] }));
  assert.ok(empty.includes('data-image-action-empty'), 'empty state');

  const closed = renderToStaticMarkup(h(ImageActionMenu, { open: false }));
  assert.ok(!closed.includes('data-image-action-menu'), 'not rendered when closed');
});
