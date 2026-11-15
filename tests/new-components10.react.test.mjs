/**
 * SSR smoke tests for the v1.11.0 batch (FileDropzone, NotificationCenter,
 * CommentThread, DatePicker). Interactive behavior lives in the vanilla suite.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n10.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — FileDropzone renders hints, files and accepts validation helpers', async () => {
  const { FileDropzone, matchesAccept } = await load('FileDropzone.tsx');
  const html = renderToStaticMarkup(
    h(FileDropzone, {
      accept: 'image/*,.pdf',
      maxSizeMb: 5,
      files: [
        { id: 'a', name: 'photo.png', size: 2048 * 1024, type: 'image/png' },
        { id: 'b', name: 'notes.pdf', size: 512, type: 'application/pdf' },
      ],
    })
  );

  assert.ok(html.includes('Drag &amp; drop files here'), 'drop copy');
  assert.ok(html.includes('Accepts image/*,.pdf'), 'accept hint');
  assert.ok(html.includes('up to 5 MB'), 'size hint');
  assert.ok(html.includes('photo.png'), 'file row 1');
  assert.ok(html.includes('2.0 MB'), 'formatted size');
  assert.ok(html.includes('512 B'), 'bytes formatting');
  assert.equal(html.includes('role="alert"'), false, 'no error before a rejected file');

  assert.ok(matchesAccept({ name: 'a.pdf', type: 'application/pdf' }, '.pdf,image/*'), 'extension match');
  assert.ok(matchesAccept({ name: 'a.bin', type: 'image/webp' }, '.pdf,image/*'), 'mime wildcard match');
  assert.ok(!matchesAccept({ name: 'a.bin', type: 'application/zip' }, '.pdf,image/*'), 'rejects other types');
  assert.ok(matchesAccept({ name: 'anything' }, undefined), 'no accept means anything passes');
});

test('React SSR — FileDropzone single mode says "a file"', async () => {
  const { FileDropzone } = await load('FileDropzone.tsx');
  const html = renderToStaticMarkup(h(FileDropzone, { multiple: false }));
  assert.ok(html.includes('drop a file here'), 'singular copy');
  assert.ok(html.includes('Any file type'), 'default hint');
});

test('React SSR — NotificationCenter renders closed as empty', async () => {
  const { NotificationCenter } = await load('NotificationCenter.tsx');
  const html = renderToStaticMarkup(h(NotificationCenter, { isOpen: false, notifications: [] }));
  assert.equal(html, '', 'closed center renders nothing');
});

test('React SSR — NotificationCenter counts unread and lists items', async () => {
  const { NotificationCenter } = await load('NotificationCenter.tsx');
  const html = renderToStaticMarkup(
    h(NotificationCenter, {
      isOpen: true,
      notifications: [
        { id: 1, title: 'Deploy finished', description: 'v1.10.0 is live', time: '2m ago', type: 'success', unread: true },
        { id: 2, title: 'New comment', time: '1h ago', unread: true },
        { id: 3, title: 'Weekly report', type: 'info' },
      ],
    })
  );

  assert.ok(html.includes('Notifications'), 'title');
  assert.ok(html.includes('2 new'), 'unread badge');
  assert.ok(html.includes('Deploy finished'), 'first item');
  assert.ok(html.includes('v1.10.0 is live'), 'description');
  assert.ok(html.includes('bg-emerald-50'), 'success tone chip');
  assert.ok(html.includes('Mark all read'), 'bulk action');
  assert.ok(html.includes('>all<span'), 'all filter carries its total inline');
  assert.ok(html.includes('>unread<span'), 'unread filter carries its total inline');
  assert.ok(html.includes('aria-pressed="true"'), 'active filter flagged');
});

test('React SSR — NotificationCenter shows the empty state for an empty list', async () => {
  const { NotificationCenter } = await load('NotificationCenter.tsx');
  const html = renderToStaticMarkup(h(NotificationCenter, { isOpen: true, notifications: [] }));
  assert.ok(html.includes("You&#x27;re all caught up") || html.includes("You're all caught up"), 'empty copy');
});

test('React SSR — CommentThread nests replies and marks resolved ones', async () => {
  const { CommentThread } = await load('CommentThread.tsx');
  const html = renderToStaticMarkup(
    h(CommentThread, {
      allowComment: false,
      comments: [
        { id: 1, author: 'Ada Lovelace', text: 'Root comment', likes: 3 },
        { id: 2, parentId: 1, author: 'Grace Hopper', text: 'Nested reply' },
        { id: 3, parentId: 2, author: 'Alan Turing', text: 'Deeper reply' },
        { id: 4, author: 'Katherine Johnson', text: 'Second root', resolved: true },
      ],
    })
  );

  assert.ok(html.includes('Root comment'), 'root text');
  assert.ok(html.includes('Nested reply'), 'child text');
  assert.ok(html.includes('Deeper reply'), 'grandchild text');
  assert.ok(html.includes('border-l'), 'nested indent border');
  assert.ok(html.includes('Resolved'), 'resolved chip');
  assert.ok(html.includes('Reopen'), 'resolved row offers reopen');
  assert.ok(html.includes('AL'), 'avatar initials');
  assert.ok(html.includes('>3<'), 'like count');
  assert.equal(html.includes('Write a comment...'), false, 'composer hidden when allowComment=false');
});

test('React SSR — CommentThread empty state and composer', async () => {
  const { CommentThread } = await load('CommentThread.tsx');
  const html = renderToStaticMarkup(h(CommentThread, { placeholder: 'Say something', submitText: 'Post' }));
  assert.ok(html.includes('No comments yet'), 'empty copy');
  assert.ok(html.includes('placeholder="Say something"'), 'composer placeholder');
  assert.ok(html.includes('>Post<'), 'custom submit label');
  assert.ok(html.includes('disabled'), 'submit disabled while empty');
});

test('React SSR — DatePicker renders month grid, selection and min/max blocking', async () => {
  const { DatePicker } = await load('DatePicker.tsx');
  const html = renderToStaticMarkup(
    h(DatePicker, { value: '2026-11-14', min: '2026-11-10', max: '2026-11-20' })
  );

  assert.ok(html.includes('November 2026'), 'month + year header');
  assert.ok(html.includes('aria-pressed="true"'), 'selected day marked');
  assert.ok(html.includes('aria-label="2026-11-14"'), 'iso aria label');
  assert.ok(html.includes('disabled'), 'out-of-range days disabled');
  assert.ok(html.includes('Previous month') && html.includes('Next month'), 'nav buttons');
  assert.ok(html.includes('>Today<'), 'today shortcut');
  assert.ok(html.includes('>Mo<'), 'week starts Monday by default');
  assert.ok(html.includes('>Su<'), 'sunday column still present');
});

test('React SSR — DatePicker honours weekStartsOn=0', async () => {
  const { DatePicker } = await load('DatePicker.tsx');
  const html = renderToStaticMarkup(h(DatePicker, { value: '2026-11-14', weekStartsOn: 0, showToday: false }));
  const firstHeader = html.indexOf('>Su<');
  const secondHeader = html.indexOf('>Mo<');
  assert.ok(firstHeader > -1 && firstHeader < secondHeader, 'sunday leads the header row');
  assert.equal(html.includes('>Today<'), false, 'today row can be hidden');
});
