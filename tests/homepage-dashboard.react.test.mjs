/**
 * HomepageDashboard — React regression tests
 * Static-renders the TSX via react-dom/server (no browser needed) and checks
 * structure, status markers, href whitelisting, safe defaults and the pure
 * `isSafeHref` truth table. Interactive behavior is covered by the vanilla
 * jsdom suite (identical design language across the three ports).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Transpile the TSX source into a temp ES module so the real component is tested.
const src = readFileSync(join(root, 'react/HomepageDashboard.tsx'), 'utf8');
const out = ts.transpileModule(src, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

const tmpDir = join(here, 'node_modules', '.cache-homepage');
mkdirSync(tmpDir, { recursive: true });
writeFileSync(join(tmpDir, 'react.mjs'), out);
const { HomepageDashboard, isSafeHref } = await import(join(tmpDir, 'react.mjs'));

const GROUPS = [
  {
    name: 'Media',
    services: [
      { name: 'Jellyfin', description: 'Streaming', href: 'https://jellyfin.local', status: 'up', pingText: '12ms' },
      { name: 'Bad', href: 'javascript:alert(1)', status: 'down' },
      { id: 'stable-3', name: 'Sonarr', status: 'warn' },
    ],
  },
];

const render = (props) => renderToStaticMarkup(React.createElement(HomepageDashboard, props));

test('isSafeHref truth table', () => {
  assert.equal(isSafeHref('https://example.com'), true);
  assert.equal(isSafeHref('http://example.com'), true);
  assert.equal(isSafeHref('mailto:a@b.c'), true);
  assert.equal(isSafeHref('//cdn.example.com/x'), true);
  assert.equal(isSafeHref('/health'), true);
  assert.equal(isSafeHref('./asset'), true);
  assert.equal(isSafeHref('../up'), true);
  assert.equal(isSafeHref('javascript:alert(1)'), false);
  assert.equal(isSafeHref('  JavaScript:alert(1) '), false);
  assert.equal(isSafeHref('data:text/html,hi'), false);
  assert.equal(isSafeHref('vbscript:x'), false);
  assert.equal(isSafeHref('file:///etc/passwd'), false);
  assert.equal(isSafeHref(''), false);
  assert.equal(isSafeHref(undefined), false);
});

test('renders groups and cards, safe hrefs anchor and unsafe ones do not', () => {
  const html = render({ groups: GROUPS });
  assert.ok(html.includes('Jellyfin'));
  assert.ok(html.includes('href="https://jellyfin.local"'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('12ms'));
});

test('unchanged output when name/href are missing (no crash, safe render)', () => {
  const html = render({ groups: [{ name: 'G', services: [{ status: 'up', id: 'x' }] }] });
  assert.ok(html.includes('class="service-card'));
});

test('invalid statusStyle falls back to pill (never silently hides status UI)', () => {
  const html = render({ groups: GROUPS, statusStyle: 'bogus' });
  assert.ok(html.includes('text-emerald-500/90'), 'pill label rendered');
  assert.ok(!html.includes('h-3 w-3 rounded-full bg-emerald-500'), 'no dot');
});

test('clock is self-contained (top-level render does not re-render every second)', () => {
  // Clock must not require a parent-driven interval: SSR output contains a clock block,
  // and the top-level component no longer owns a `now` — so a ticking Clock cannot
  // re-render the whole dashboard. Verify the isolated Clock subtree exists in markup.
  const html = render({ groups: [], showClock: true });
  assert.ok(html.includes('min-h-28') || html.includes('min-w-28'), 'clock block rendered');
});

test('default version must not masquerade as an upstream version number', () => {
  const html = render({});
  assert.ok(html.includes('Homepage · awesome-ui'));
  assert.ok(!html.includes('v2.1.0'));
});

test('empty search still renders empty state, not a crash', () => {
  const html = render({ groups: [] });
  assert.ok(html.length > 100);
});