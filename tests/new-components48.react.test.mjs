/**
 * SSR smoke tests for the v2.1.0 batch
 * (SessionDeviceTable, AuditLogTable, ChangelogTimeline).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n48.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — SessionDeviceTable header, rows, badges and pager', async () => {
  const { default: SessionDeviceTable } = await load('SessionDeviceTable.tsx');
  const html = renderToStaticMarkup(
    h(SessionDeviceTable, {
      title: 'Login sessions',
      description: 'Review where you are signed in.',
      page: 2,
      sessions: [
        { id: 'x1', os: 'Mac OS X', application: 'Chrome 141', location: 'Singapore, Singapore', ip: '116.14.152.165', lastActive: '4 minutes ago', status: 'current' },
        { id: 'x2', os: 'Windows 11', application: 'Edge 140', location: 'Tokyo, Japan', ip: '203.0.113.42', lastActive: '2 days ago', status: 'logged-out' },
      ],
    })
  );
  assert.ok(html.includes('data-session-table'), 'root hook');
  assert.ok(html.includes('data-session-header'), 'header hook');
  assert.ok(html.includes('Login sessions'), 'title text');
  assert.ok(html.includes('Review where you are signed in.'), 'description text');
  assert.ok(html.includes('data-session-learn-more'), 'learn more hook');
  assert.ok(html.includes('Learn more'), 'learn more label');
  assert.ok(html.includes('data-session-logout-all'), 'logout all hook');
  assert.ok(html.includes('Log out of all other sessions'), 'logout all label');
  assert.ok(html.includes('Operating system'), 'os column');
  assert.ok(html.includes('IP address'), 'ip column');
  assert.ok(html.includes('data-session-row="x1"'), 'first row');
  assert.ok(html.includes('data-session-row="x2"'), 'second row');
  assert.ok(html.includes('data-session-row-os="Mac OS X"'), 'os cell');
  assert.ok(html.includes('data-session-row-app="Edge 140"'), 'app cell');
  assert.ok(html.includes('data-session-row-location="Tokyo, Japan"'), 'location cell');
  assert.ok(html.includes('data-session-row-ip'), 'ip cell');
  assert.ok(html.includes('data-session-row-active="4 minutes ago"'), 'last active cell');
  assert.ok(html.includes('data-session-row-status="current"'), 'status cell');
  assert.ok(html.includes('Current'), 'current badge');
  assert.ok(html.includes('Logged out'), 'logged out badge');
  assert.ok(html.includes('bg-violet-100'), 'current badge tone');
  assert.ok(html.includes('data-session-pager-prev'), 'pager prev');
  assert.ok(html.includes('data-session-pager-next'), 'pager next');
  assert.ok(html.includes('Page 2'), 'page label');
  assert.ok(html.includes('data-session-rows-select'), 'rows select');
  assert.ok(html.includes('Rows per page:'), 'rows label');

  const defaults = renderToStaticMarkup(h(SessionDeviceTable, {}));
  assert.ok(defaults.includes('Login sessions'), 'default title');
  assert.ok(defaults.includes('data-session-row="s1"'), 'default first session');
  assert.ok(defaults.includes('Airwallex iOS'), 'default app');
});

test('React SSR — AuditLogTable filters, trend and event rows', async () => {
  const { default: AuditLogTable } = await load('AuditLogTable.tsx');
  const html = renderToStaticMarkup(
    h(AuditLogTable, {
      title: 'System Log',
      filters: [{ label: 'Date range', value: 'Jun 5 – Jun 16' }],
      views: ['Events', 'Map'],
      activeView: 'Map',
      events: [
        { id: 'x1', time: 'Jun 13 17:33:42', actor: 'Alex Smith (User)', event: 'profile.update', status: 'success', target: 'Sam Lee (User)' },
        { id: 'x2', time: 'Jun 13 17:25:57', actor: '180.252.167.22', event: 'user.session.login', status: 'failure', target: 'Sign-in attempt' },
      ],
    })
  );
  assert.ok(html.includes('data-audit-log'), 'root hook');
  assert.ok(html.includes('System Log'), 'title text');
  assert.ok(html.includes('data-audit-filter="Date range"'), 'filter hook');
  assert.ok(html.includes('Jun 5 – Jun 16'), 'filter value');
  assert.ok(html.includes('data-audit-trend-bar'), 'trend bar');
  assert.ok(html.includes('data-audit-count'), 'count hook');
  assert.ok(html.includes('data-audit-view="Map"'), 'view hook');
  assert.ok(html.includes('data-audit-row="x1"'), 'row hook');
  assert.ok(html.includes('data-audit-row-status="failure"'), 'row status');
  assert.ok(html.includes('FAILURE'), 'failure badge');
  assert.ok(html.includes('profile.update'), 'event name');

  const defaults = renderToStaticMarkup(h(AuditLogTable, {}));
  assert.ok(defaults.includes('user.session.login'), 'default event');
  assert.ok(defaults.includes('admin@mango.dev'), 'default actor');
});

test('React SSR — ChangelogTimeline header, entries and meta', async () => {
  const { default: ChangelogTimeline } = await load('ChangelogTimeline.tsx');
  const html = renderToStaticMarkup(
    h(ChangelogTimeline, {
      title: "What's new",
      entries: [
        { id: 'n1', date: 'Nov 15, 2026', tag: 'Improved', tone: 'sky', title: 'Faster dashboard', body: 'Widgets reflow smoothly now.', likes: 24, views: 1832 },
        { id: 'n2', date: 'Nov 12, 2026', tag: 'New', tone: 'emerald', title: 'Skip onboarding', body: 'Returning users jump straight in.' },
      ],
    })
  );
  assert.ok(html.includes('data-changelog'), 'root hook');
  assert.ok(html.includes('What'), 'title text');
  assert.ok(html.includes('data-changelog-search'), 'search hook');
  assert.ok(html.includes('data-changelog-filter'), 'filter hook');
  assert.ok(html.includes('data-changelog-entry="n1"'), 'entry hook');
  assert.ok(html.includes('Nov 15, 2026'), 'date text');
  assert.ok(html.includes('data-changelog-tag="Improved"'), 'tag hook');
  assert.ok(html.includes('bg-sky-50'), 'sky tone');
  assert.ok(html.includes('bg-emerald-50'), 'emerald tone');
  assert.ok(html.includes('Faster dashboard'), 'entry title');
  assert.ok(html.includes('data-changelog-likes="24"'), 'likes hook');
  assert.ok(html.includes('data-changelog-views="1832"'), 'views hook');

  const defaults = renderToStaticMarkup(h(ChangelogTimeline, {}));
  assert.ok(defaults.includes('Changelog'), 'default title');
  assert.ok(defaults.includes('CSV export no longer drops trailing rows'), 'default entry');
});
