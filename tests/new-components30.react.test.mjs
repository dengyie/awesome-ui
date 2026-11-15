/**
 * SSR smoke tests for the v1.30.0 batch
 * (EmptyStateStarter, AuthGatePrompt, AuthSplitPanel, SuccessToast, EditableHeading).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n30.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — EmptyStateStarter variants and actions', async () => {
  const { default: EmptyStateStarter } = await load('EmptyStateStarter.tsx');
  const html = renderToStaticMarkup(
    h(EmptyStateStarter, {
      illustration: '📦',
      title: 'No brand kits here yet',
      description: 'Create your first brand kit to keep colors consistent.',
      actionLabel: '+ New brand kit',
      onAction: () => {},
    })
  );
  assert.ok(html.includes('data-empty-starter'), 'host hook');
  assert.ok(html.includes('data-empty-illustration'), 'illustration slot');
  assert.ok(html.includes('No brand kits here yet'), 'title');
  assert.ok(html.includes('Create your first brand kit'), 'description');
  assert.ok(html.includes('data-empty-action'), 'action button');
  assert.ok(html.includes('rounded-full'), 'solid pill default');

  const dashed = renderToStaticMarkup(h(EmptyStateStarter, { title: 'Nothing saved', variant: 'dashed', actionVariant: 'outline', actionLabel: 'Create a goal now' }));
  assert.ok(dashed.includes('border-dashed'), 'dashed variant');
  assert.ok(dashed.includes('border'), 'outline action');

  const sm = renderToStaticMarkup(h(EmptyStateStarter, { title: 'No filters', size: 'sm', actionVariant: 'link', actionLabel: '+ Add filter' }));
  assert.ok(sm.includes('text-sm font-semibold'), 'small title');
  assert.ok(sm.includes('hover:underline'), 'link action');

  const bare = renderToStaticMarkup(h(EmptyStateStarter, { title: 'Empty' }));
  assert.ok(!bare.includes('data-empty-action'), 'no action without label');
});

test('React SSR — AuthGatePrompt providers, divider and skip', async () => {
  const { default: AuthGatePrompt } = await load('AuthGatePrompt.tsx');
  const html = renderToStaticMarkup(
    h(AuthGatePrompt, {
      title: 'Create an account or sign in to save your history',
      secondaryAction: { label: 'Use phone number' },
      onProvider: () => {},
      onSkip: () => {},
    })
  );
  assert.ok(html.includes('data-auth-gate'), 'host hook');
  assert.ok(html.includes('data-auth-gate-title'), 'title hook');
  assert.ok(html.includes('Create an account or sign in'), 'contextual reason');
  assert.ok(html.includes('data-auth-provider="google"'), 'google pill');
  assert.ok(html.includes('data-auth-provider="facebook"'), 'facebook pill');
  assert.ok(html.includes('data-auth-provider="apple"'), 'apple pill');
  assert.ok(html.includes('#1877F2'), 'facebook brand tone');
  assert.ok(html.includes('rounded-full'), 'pill style');
  assert.ok(html.includes('data-auth-secondary'), 'secondary action');
  assert.ok(html.includes('Use phone number'), 'secondary label');
  assert.ok(html.includes('data-auth-skip'), 'skip link');
  assert.ok(html.includes('Not now'), 'skip label');

  const custom = renderToStaticMarkup(
    h(AuthGatePrompt, { title: 'Sign in', providers: [{ id: 'microsoft', label: 'Continue with Microsoft' }], skipLabel: 'Maybe later' })
  );
  assert.ok(custom.includes('data-auth-provider="microsoft"'), 'custom provider');
  assert.ok(custom.includes('Maybe later'), 'custom skip');
});

test('React SSR — AuthSplitPanel media side, cover mode and footer links', async () => {
  const { default: AuthSplitPanel } = await load('AuthSplitPanel.tsx');
  const html = renderToStaticMarkup(
    h(AuthSplitPanel, {
      mediaTitle: 'Welcome back',
      mediaSubtitle: 'Sign in to pick up where you left off.',
      footerLinks: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' },
      ],
    }, h('div', null, 'AUTH CONTENT'))
  );
  assert.ok(html.includes('data-auth-split'), 'host hook');
  assert.ok(html.includes('data-auth-media'), 'media panel');
  assert.ok(html.includes('Welcome back'), 'media title');
  assert.ok(html.includes('Sign in to pick up'), 'media subtitle');
  assert.ok(html.includes('AUTH CONTENT'), 'children in auth column');
  assert.ok(html.includes('/terms'), 'footer link href');
  assert.ok(html.includes('Terms'), 'footer link label');
  assert.ok(html.includes('md:grid-cols-2'), 'split grid');

  const right = renderToStaticMarkup(
    h(AuthSplitPanel, { mediaSide: 'right', mediaBackground: 'cover', mediaTitle: 'Fresha for customers' }, h('p', null, 'FORM'))
  );
  assert.ok(right.includes('bg-zinc-900'), 'cover background');
  assert.ok(right.includes('Fresha for customers'), 'cover title white');
  // media after children (right side): find positions
  const mediaIdx = right.indexOf('data-auth-media');
  const formIdx = right.indexOf('FORM');
  assert.ok(formIdx < mediaIdx, 'media on right comes after content');
});

test('React SSR — SuccessToast mint style, close and sticky mode', async () => {
  const { default: SuccessToast } = await load('SuccessToast.tsx');
  const html = renderToStaticMarkup(
    h(SuccessToast, { message: 'Link copied to clipboard', onClose: () => {} })
  );
  assert.ok(html.includes('data-success-toast'), 'host hook');
  assert.ok(html.includes('Link copied to clipboard'), 'message');
  assert.ok(html.includes('bg-emerald-100'), 'mint background');
  assert.ok(html.includes('data-toast-close'), 'close button');
  assert.ok(html.includes('role="status"'), 'aria status');
  assert.ok(html.includes('top-4'), 'top-right position');

  const bottom = renderToStaticMarkup(h(SuccessToast, { message: 'Saved', position: 'bottom-right' }));
  assert.ok(bottom.includes('bottom-4'), 'bottom position');
});

test('React SSR — EditableHeading idle display, input mode and meta', async () => {
  const { default: EditableHeading } = await load('EditableHeading.tsx');
  const html = renderToStaticMarkup(
    h(EditableHeading, {
      value: 'Q4 Pipeline',
      breadcrumb: 'Contacts / Lists',
      meta: 'List · 42 members',
      onChange: () => {},
    })
  );
  assert.ok(html.includes('data-editable-heading'), 'host hook');
  assert.ok(html.includes('data-heading-display'), 'display button');
  assert.ok(html.includes('Q4 Pipeline'), 'value');
  assert.ok(html.includes('Contacts / Lists'), 'breadcrumb');
  assert.ok(html.includes('42 members'), 'meta row');
  assert.ok(!html.includes('data-heading-input'), 'input hidden when idle');

  const md = renderToStaticMarkup(h(EditableHeading, { value: 'Small', size: 'md' }));
  assert.ok(md.includes('text-base'), 'md size');
});
