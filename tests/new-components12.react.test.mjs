/**
 * SSR smoke tests for the v1.13.0 batch (RichToolbar, HeroSection,
 * FooterSection, TestimonialGrid). Interactive behavior lives in the vanilla suite.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n12.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — RichToolbar renders groups, dividers and states', async () => {
  const { RichToolbar } = await load('RichToolbar.tsx');
  const html = renderToStaticMarkup(
    h(RichToolbar, {
      groups: [
        {
          id: 'text',
          label: 'Text',
          items: [
            { id: 'bold', label: 'Bold', text: 'B', shortcut: '⌘B', active: true },
            { id: 'italic', label: 'Italic', text: 'I' },
          ],
        },
        {
          id: 'insert',
          label: 'Insert',
          items: [
            { id: 'code', label: 'Code block', icon: 'code' },
            { id: 'image', label: 'Image', icon: 'image', disabled: true },
          ],
        },
      ],
    })
  );

  assert.ok(html.includes('role="toolbar"'), 'toolbar role');
  assert.ok(html.includes('aria-label="Formatting"'), 'toolbar label');
  assert.ok(html.includes('aria-label="Text"'), 'first group label');
  assert.ok(html.includes('aria-label="Insert"'), 'second group label');
  assert.ok(html.includes('>B<'), 'text glyph');
  assert.ok(html.includes('aria-pressed="true"'), 'active item flagged');
  assert.ok(html.includes('title="Bold (⌘B)"'), 'shortcut in tooltip');
  assert.ok(html.includes('disabled'), 'disabled item');
  assert.ok(html.includes('bg-zinc-200 dark:bg-zinc-700'), 'divider between groups');
});

test('React SSR — RichToolbar with no groups renders an empty toolbar', async () => {
  const { RichToolbar } = await load('RichToolbar.tsx');
  const html = renderToStaticMarkup(h(RichToolbar, {}));
  assert.ok(html.includes('role="toolbar"'), 'toolbar still renders');
  assert.equal(html.includes('<button'), false, 'no buttons');
});

test('React SSR — HeroSection renders eyebrow, copy, CTAs and highlights', async () => {
  const { HeroSection } = await load('HeroSection.tsx');
  const html = renderToStaticMarkup(
    h(HeroSection, {
      eyebrow: 'New',
      title: 'Ship AI features faster',
      description: 'Copy-paste components for every surface.',
      primaryCta: 'Get started',
      secondaryCta: 'Read docs',
      highlights: ['Zero dependencies', 'Three ports'],
    })
  );

  assert.ok(html.includes('New'), 'eyebrow');
  assert.ok(html.includes('Ship AI features faster'), 'title');
  assert.ok(html.includes('Copy-paste components'), 'description');
  assert.ok(html.includes('Get started'), 'primary CTA');
  assert.ok(html.includes('Read docs'), 'secondary CTA');
  assert.ok(html.includes('Zero dependencies'), 'highlight 1');
  assert.ok(html.includes('Three ports'), 'highlight 2');
  assert.ok(html.includes('items-center text-center'), 'centered by default');
});

test('React SSR — HeroSection left-aligned without CTAs', async () => {
  const { HeroSection } = await load('HeroSection.tsx');
  const html = renderToStaticMarkup(h(HeroSection, { title: 'Left hero', align: 'left' }));
  assert.ok(html.includes('items-start text-left'), 'left alignment');
  assert.equal(html.includes('<button'), false, 'no buttons without CTA copy');
  assert.equal(html.includes('sparkles'), false, 'no eyebrow icon');
});

test('React SSR — FooterSection renders brand, columns, socials and copyright', async () => {
  const { FooterSection } = await load('FooterSection.tsx');
  const html = renderToStaticMarkup(
    h(FooterSection, {
      brand: 'Acme',
      tagline: 'Ship faster.',
      columns: [
        { title: 'Product', links: [{ label: 'Features' }, { label: 'Pricing' }] },
        { title: 'Company', links: [{ label: 'About' }] },
      ],
      socials: [{ label: 'GitHub', icon: 'git-branch' }, { label: 'Website' }],
      copyright: '© 2026 Acme Inc.',
    })
  );

  assert.ok(html.includes('Acme'), 'brand');
  assert.ok(html.includes('Ship faster.'), 'tagline');
  assert.ok(html.includes('Product'), 'column 1');
  assert.ok(html.includes('Company'), 'column 2');
  assert.ok(html.includes('Features'), 'link 1');
  assert.ok(html.includes('Pricing'), 'link 2');
  assert.ok(html.includes('aria-label="GitHub"'), 'social label');
  assert.ok(html.includes('aria-label="Website"'), 'social fallback label');
  assert.ok(html.includes('© 2026 Acme Inc.'), 'custom copyright');
});

test('React SSR — FooterSection falls back to a generated copyright', async () => {
  const { FooterSection } = await load('FooterSection.tsx');
  const html = renderToStaticMarkup(h(FooterSection, { brand: 'Acme' }));
  assert.ok(html.includes(`© ${new Date().getFullYear()} Acme`), 'generated copyright');
});

test('React SSR — TestimonialGrid renders quotes, stars and attribution', async () => {
  const { TestimonialGrid } = await load('TestimonialGrid.tsx');
  const html = renderToStaticMarkup(
    h(TestimonialGrid, {
      testimonials: [
        { id: 't1', quote: 'Saved us weeks.', name: 'Ada Lovelace', role: 'CTO', company: 'Acme', rating: 5 },
        { id: 't2', quote: 'Beautiful defaults.', name: 'Grace Hopper', company: 'Navy' },
      ],
    })
  );

  assert.ok(html.includes('Saved us weeks.'), 'quote 1');
  assert.ok(html.includes('Beautiful defaults.'), 'quote 2');
  assert.ok(html.includes('Ada Lovelace'), 'name 1');
  assert.ok(html.includes('CTO, Acme'), 'role + company');
  assert.ok(html.includes('AL'), 'initials avatar');
  assert.ok(html.includes('aria-label="5 out of 5 stars"'), 'rating label');
  assert.ok(html.includes('lg:grid-cols-3'), 'three columns by default');
});

test('React SSR — TestimonialGrid two columns and empty state', async () => {
  const { TestimonialGrid } = await load('TestimonialGrid.tsx');
  const two = renderToStaticMarkup(
    h(TestimonialGrid, { columns: 2, testimonials: [{ id: 't1', quote: 'Nice', name: 'Ada Lovelace' }] })
  );
  assert.ok(two.includes('sm:grid-cols-2'), 'two-column grid');
  assert.equal(two.includes('lg:grid-cols-3'), false, 'no third column');

  const empty = renderToStaticMarkup(h(TestimonialGrid, { testimonials: [] }));
  assert.ok(empty.includes('No testimonials yet.'), 'empty copy');
});
