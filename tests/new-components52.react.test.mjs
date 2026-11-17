/**
 * v2.5.0 — React regression tests
 * Compiles each TSX with the TypeScript compiler, evaluates the real
 * component and SSR-renders it through react-dom/server, checking
 * structure markers. Interactive behavior is covered by the vanilla suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const renderTsx = async (file, props) => {
  const source = require('fs').readFileSync(join(root, 'react', file), 'utf8');
  const out = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: file,
  }).outputText;
  const cacheFile = join(cacheDir, file.replace(/\.tsx$/, '.n52.mjs'));
  writeFileSync(cacheFile, out);
  const mod = await import(pathToFileURL(cacheFile).href);
  const h = React.createElement;
  return renderToStaticMarkup(h(mod.default, props));
};

test('react SSR — TaskCardModal header, attrs, checklist and activity', async () => {
  const html = await renderTsx('TaskCardModal.tsx', {
    isOpen: true,
    title: 'Ship pricing page',
    completed: false,
    members: [{ id: 'm1', name: 'Ada Lovelace', initials: 'AL' }],
    labels: [{ id: 'l1', label: 'Growth', color: 'bg-sky-500' }],
    dates: 'Dec 1 – Dec 15',
    description: 'Pricing tiers with annual toggle.',
    attachments: [{ id: 'a1', name: 'pricing.xlsx', meta: '48 KB', kind: 'file' }],
    checklist: [
      { id: 'c1', text: 'Draft tiers', done: true },
      { id: 'c2', text: 'Review copy', done: false },
    ],
    comments: [{ id: 'k1', author: 'Ada Lovelace', initials: 'AL', text: 'First draft is up.', time: 'just now' }],
  });
  assert.ok(html.includes('data-taskcard'), 'root hook');
  assert.ok(html.includes('data-taskcard-dialog'), 'dialog hook');
  assert.ok(html.includes('Ship pricing page'), 'title');
  assert.ok(html.includes('data-taskcard-complete'), 'complete toggle');
  assert.ok(html.includes('data-taskcard-close'), 'close button');
  assert.ok(html.includes('data-taskcard-members'), 'members block');
  assert.ok(html.includes('data-taskcard-member="m1"'), 'member avatar');
  assert.ok(html.includes('AL'), 'member initials');
  assert.ok(html.includes('data-taskcard-labels'), 'labels block');
  assert.ok(html.includes('bg-sky-500'), 'label tone');
  assert.ok(html.includes('data-taskcard-dates'), 'dates block');
  assert.ok(html.includes('Dec 1 – Dec 15'), 'dates value');
  assert.ok(html.includes('data-taskcard-description'), 'description');
  assert.ok(html.includes('Pricing tiers'), 'description text');
  assert.ok(html.includes('data-taskcard-attachments'), 'attachments');
  assert.ok(html.includes('data-taskcard-attachment="a1"'), 'attachment row');
  assert.ok(html.includes('pricing.xlsx'), 'attachment name');
  assert.ok(html.includes('data-taskcard-checklist'), 'checklist');
  assert.ok(html.includes('data-taskcard-checklist-count'), 'checklist percent');
  assert.ok(html.includes('50%'), '50 percent label');
  assert.ok(html.includes('data-taskcard-checklist-bar'), 'progress bar');
  assert.ok(html.includes('data-taskcard-checkitem="c1"'), 'check item');
  assert.ok(html.includes('Draft tiers'), 'check item text');
  assert.ok(html.includes('data-taskcard-activity'), 'activity column');
  assert.ok(html.includes('Comments &amp; activity'), 'activity title');
  assert.ok(html.includes('data-taskcard-input'), 'composer input');
  assert.ok(html.includes('data-taskcard-comment="k1"'), 'comment row');
  assert.ok(html.includes('First draft is up.'), 'comment text');

  const defaults = await renderTsx('TaskCardModal.tsx', { isOpen: true });
  const closed = await renderTsx('TaskCardModal.tsx', {});
  assert.equal(closed, '', 'closed by default renders nothing');
  assert.ok(defaults.includes('Design landing page hero'), 'default title');
  assert.ok(defaults.includes('hero-spec.pdf'), 'default attachment');
});

test('react SSR — FormTrackingDashboard stats, details and requests table', async () => {
  const html = await renderTsx('FormTrackingDashboard.tsx', {
    title: 'Intake form',
    stats: [{ id: 's1', label: 'Sent to', value: 5, pct: 100, tone: 'sky', icon: '📤' }],
    details: [{ label: 'Form name', value: 'Intake form' }],
    requests: [
      { id: 'r1', name: 'Ada Lovelace', initials: 'AL', submitted: 'Nov 15, 2026', service: 'Intake', status: 'completed' },
      { id: 'r2', name: 'Ben Gu', initials: 'BG', submitted: '—', service: 'Intake', status: 'not-completed' },
    ],
  });
  assert.ok(html.includes('data-formtrack'), 'root hook');
  assert.ok(html.includes('data-formtrack-header'), 'header');
  assert.ok(html.includes('Intake form'), 'title');
  assert.ok(html.includes('data-formtrack-active'), 'active pill');
  assert.ok(html.includes('Active'), 'active label');
  assert.ok(html.includes('data-formtrack-options'), 'options button');
  assert.ok(html.includes('data-formtrack-stats'), 'stats grid');
  assert.ok(html.includes('data-formtrack-stat="s1"'), 'stat card');
  assert.ok(html.includes('data-formtrack-stat-value="s1"'), 'stat value');
  assert.ok(html.includes('bg-sky-500'), 'sky dot/bar tone');
  assert.ok(html.includes('data-formtrack-details'), 'details grid');
  assert.ok(html.includes('data-formtrack-table'), 'table');
  assert.ok(html.includes('data-formtrack-row="r1"'), 'request row');
  assert.ok(html.includes('Ada Lovelace'), 'request name');
  assert.ok(html.includes('data-formtrack-status="completed"'), 'status pill');
  assert.ok(html.includes('Completed'), 'completed label');
  assert.ok(html.includes('Not completed'), 'not completed label');
  assert.ok(html.includes('bg-rose-100'), 'rose pill tone');

  const defaults = await renderTsx('FormTrackingDashboard.tsx', {});
  assert.ok(defaults.includes('Consultation form'), 'default title');
  assert.ok(defaults.includes('Anna Kowalski'), 'default request');
});

test('react SSR — AudioPlaylistPage cover, tracks, queue and player', async () => {
  const html = await renderTsx('AudioPlaylistPage.tsx', {
    title: 'Demo tape',
    tracks: [
      { id: 't1', title: 'Neon after rain', artist: 'Mira Sol', duration: '3:42', version: 'v5', liked: true },
      { id: 't2', title: 'Soft focus', artist: 'Mira Sol', duration: '2:58' },
    ],
    queue: [{ id: 'q1', title: 'City windows', artist: 'Mira Sol', duration: '3:10' }],
    activeTrackId: 't1',
  });
  assert.ok(html.includes('data-audioplaylist'), 'root hook');
  assert.ok(html.includes('data-audioplaylist-cover'), 'cover');
  assert.ok(html.includes('data-audioplaylist-title'), 'title hook');
  assert.ok(html.includes('Demo tape'), 'title text');
  assert.ok(html.includes('data-audioplaylist-play'), 'play button');
  assert.ok(html.includes('data-audioplaylist-toolbar'), 'toolbar');
  assert.ok(html.includes('2 songs'), 'song count');
  assert.ok(html.includes('data-audioplaylist-track="t1"'), 'track row');
  assert.ok(html.includes('Neon after rain'), 'track title');
  assert.ok(html.includes('Mira Sol'), 'artist');
  assert.ok(html.includes('data-audioplaylist-version'), 'version pill');
  assert.ok(html.includes('v5'), 'version value');
  assert.ok(html.includes('3:42'), 'duration');
  assert.ok(html.includes('data-audioplaylist-remix="t1"'), 'remix control');
  assert.ok(html.includes('data-audioplaylist-like-track="t1"'), 'like button');
  assert.ok(html.includes('text-rose-500'), 'liked tone');
  assert.ok(html.includes('data-audioplaylist-queue'), 'queue panel');
  assert.ok(html.includes('data-audioplaylist-queue-item="q1"'), 'queue item');
  assert.ok(html.includes('City windows'), 'queue track');
  assert.ok(html.includes('data-audioplaylist-player'), 'player bar');
  assert.ok(html.includes('data-audioplaylist-player-toggle'), 'player toggle');

  const defaults = await renderTsx('AudioPlaylistPage.tsx', {});
  assert.ok(defaults.includes('Late night sketches'), 'default title');
  assert.ok(defaults.includes('Signals in the dark'), 'default track');
});

test('react SSR — BlogPostArticle topbar, toc, blocks and code copy', async () => {
  const html = await renderTsx('BlogPostArticle.tsx', {
    siteName: 'My Blog',
    title: 'Getting started with HTML',
    subtitle: 'The bones of the web.',
    meta: '5 min read',
    blocks: [
      { type: 'paragraph', text: 'HTML defines the structure of pages.' },
      { type: 'heading', text: 'Elements', id: 'elements', level: 2 },
      { type: 'list', items: ['Headings', 'Paragraphs'] },
      { type: 'heading', text: 'Forms', id: 'forms', level: 3 },
      { type: 'code', language: 'html', code: '<p>hi</p>' },
    ],
    toc: [
      { id: 'elements', text: 'Elements', level: 2 },
      { id: 'forms', text: 'Forms', level: 3 },
    ],
    activeHeadingId: 'elements',
  });
  assert.ok(html.includes('data-blogpost'), 'root hook');
  assert.ok(html.includes('data-blogpost-topbar'), 'topbar');
  assert.ok(html.includes('My Blog'), 'site name');
  assert.ok(html.includes('⌘ K'), 'search hint');
  assert.ok(html.includes('data-blogpost-toc'), 'toc nav');
  assert.ok(html.includes('data-blogpost-tocitem="elements"'), 'toc item');
  assert.ok(html.includes('data-blogpost-toc-active="true"'), 'active toc');
  assert.ok(html.includes('data-blogpost-article'), 'article');
  assert.ok(html.includes('Getting started with HTML'), 'title');
  assert.ok(html.includes('The bones of the web.'), 'subtitle');
  assert.ok(html.includes('5 min read'), 'meta');
  assert.ok(html.includes('data-blogpost-content'), 'content');
  assert.ok(html.includes('HTML defines the structure of pages.'), 'paragraph');
  assert.ok(html.includes('data-blogpost-heading="elements"'), 'heading anchor');
  assert.ok(html.includes('data-blogpost-heading="forms"'), 'h3 anchor');
  assert.ok(html.includes('Headings'), 'list item');
  assert.ok(html.includes('data-blogpost-code'), 'code block');
  assert.ok(html.includes('&lt;p&gt;hi&lt;/p&gt;'), 'escaped code');
  assert.ok(html.includes('data-blogpost-code-copy'), 'copy button');

  const defaults = await renderTsx('BlogPostArticle.tsx', {});
  assert.ok(defaults.includes("Introduction to Front-End Development"), 'default title');
  assert.ok(defaults.includes('SLMobbin'), 'default site name');
});
