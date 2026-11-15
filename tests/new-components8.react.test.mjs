/**
 * SSR smoke tests for the v1.9.x component batches.
 * Transpiles each TSX (with its UiIcon dependency) into a temp ES module and
 * static-renders it, so both type-level and runtime rendering errors surface
 * without a browser. Interactive behavior lives in the vanilla jsdom suites.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const [pricing, stat, table, runLog, auth, settings, onboarding, upgrade] = await Promise.all([
  load('PricingTable.tsx'),
  load('StatCard.tsx'),
  load('DataTable.tsx'),
  load('AgentRunLog.tsx'),
  load('AuthForm.tsx'),
  load('SettingsPanel.tsx'),
  load('OnboardingChecklist.tsx'),
  load('UpgradePromptCard.tsx'),
]);

const h = React.createElement;
const html = (element) => renderToStaticMarkup(element);

test('React SSR — PricingTable renders highlighted plan', () => {
  const out = html(
    h(pricing.default, {
      plans: [
        { name: 'Free', price: '$0', features: ['1 workspace'] },
        { name: 'Pro', price: '$20', features: ['SSO'], highlighted: true },
      ],
    })
  );
  assert.ok(out.includes('Most popular'), 'default badge');
  assert.ok(out.includes('ring-2 ring-indigo-600'), 'highlight ring');
  assert.equal((out.match(/<button/g) || []).length, 2, 'one CTA per plan');
});

test('React SSR — StatCard renders delta and sparkline', () => {
  const out = html(h(stat.default, { label: 'Revenue', value: '$12.4k', delta: 8.2, trend: [1, 4, 2, 6] }));
  assert.ok(out.includes('Revenue'));
  assert.ok(out.includes('+8.2%'));
  assert.ok(out.includes('<polyline'), 'sparkline rendered');

  const plain = html(h(stat.default, { label: 'Churn', value: '4.1%', delta: -2.3 }));
  assert.ok(plain.includes('-2.3%'));
  assert.ok(!plain.includes('<polyline'), 'no sparkline without trend');
});

test('React SSR — DataTable renders rows, actions and numeric alignment', () => {
  const out = html(
    h(table.default, {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'seats', label: 'Seats', align: 'right' },
      ],
      rows: [
        { name: 'Alpha', seats: 12 },
        { name: 'Bravo', seats: 3 },
      ],
      actions: [{ label: 'Remove', icon: 'trash', onClick: () => {} }],
      selectable: true,
    })
  );
  assert.equal((out.match(/<tr/g) || []).length, 3, 'header + two body rows');
  assert.ok(out.includes('tabular-nums'), 'numeric alignment');
  assert.ok(out.includes('Remove'), 'row action rendered');
});

test('React SSR — DataTable empty state', () => {
  const out = html(h(table.default, { columns: [{ key: 'a', label: 'A' }], rows: [], emptyText: 'Nothing here' }));
  assert.ok(out.includes('Nothing here'));
});

test('React SSR — AgentRunLog renders counter and expanded detail', () => {
  const out = html(
    h(runLog.default, {
      title: 'Deploy',
      steps: [
        { id: 's1', label: 'Build', status: 'done', durationMs: 240 },
        { id: 's2', label: 'Deploy', status: 'running', durationMs: 1500, detail: 'OK 12 tables' },
      ],
    })
  );
  assert.ok(out.includes('Deploy'));
  assert.ok(out.includes('1/2'));
  assert.ok(out.includes('240ms'));
  assert.ok(out.includes('1.5s'));
  assert.ok(out.includes('OK 12 tables'), 'running detail auto-expanded');
});

test('React SSR — AuthForm signin vs signup', () => {
  const signin = html(h(auth.default, { providers: [{ name: 'GitHub' }], error: 'Invalid credentials' }));
  assert.ok(signin.includes('Welcome back'));
  assert.ok(signin.includes('Continue with GitHub'));
  assert.ok(signin.includes('role="alert"'));
  assert.ok(!signin.includes('name="name"'), 'no name field in signin');

  const signup = html(h(auth.default, { mode: 'signup' }));
  assert.ok(signup.includes('Create your account'));
  assert.ok(signup.includes('name="name"'));
  assert.ok(signup.includes('Create account'));
});

test('React SSR — SettingsPanel renders nav + active section', () => {
  const out = html(
    h(settings.default, {
      sections: [
        { id: 'account', title: 'Account', icon: 'user', items: [{ id: 'email', label: 'Email', value: 'a@b.c' }] },
        { id: 'security', title: 'Security', items: [{ id: 'pw', label: 'Password' }] },
      ],
      onSave: () => {},
    })
  );
  assert.ok(out.includes('Account'));
  assert.ok(out.includes('a@b.c'));
  assert.ok(out.includes('aria-current="page"'));
  assert.ok(out.includes('Save changes'));
});

test('React SSR — OnboardingChecklist progress and all-done state', () => {
  const partial = html(
    h(onboarding.default, {
      tasks: [
        { id: 'a', title: 'One', done: true },
        { id: 'b', title: 'Two', done: false, actionText: 'Invite' },
      ],
    })
  );
  assert.ok(partial.includes('1/2'));
  assert.ok(partial.includes('50% complete'));
  assert.ok(partial.includes('line-through'));
  assert.ok(partial.includes('Invite'));

  const done = html(h(onboarding.default, { tasks: [{ id: 'a', title: 'One', done: true }] }));
  assert.ok(done.includes('All set'));
});

test('React SSR — UpgradePromptCard thresholds', () => {
  const amber = html(h(upgrade.default, { used: 750, limit: 1000, features: ['Priority support'] }));
  assert.ok(amber.includes('75%'));
  assert.ok(amber.includes('bg-amber-500'));
  assert.ok(amber.includes('Priority support'));

  const red = html(h(upgrade.default, { used: 1000, limit: 1000 }));
  assert.ok(red.includes('bg-red-500'));

  const over = html(h(upgrade.default, { used: 5000, limit: 1000 }));
  assert.ok(over.includes('100%'), 'clamped');

  const zero = html(h(upgrade.default, { used: 0, limit: 0 }));
  assert.ok(zero.includes('0%'));
  assert.ok(!zero.includes('NaN'));
});
