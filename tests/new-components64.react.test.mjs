/**
 * v3.10.0 batch — React SSR smoke tests
 * ProfileEditForm, AvatarCropDialog, FollowSuggestionsCard.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n64.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ProfileEditForm fields, bio count and socials', async () => {
  const { default: ProfileEditForm } = await load('ProfileEditForm.tsx');
  const html = renderToStaticMarkup(
    h(ProfileEditForm, {
      title: 'Personal info',
      handle: '@alexsmith',
      defaultCountry: 'United States',
      defaultCity: 'Menlo Park',
      bio: 'Product designer and builder.',
      socials: [
        { id: 'instagram', label: 'Instagram', placeholder: '@Username' },
        { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com' },
      ],
    })
  );
  assert.ok(html.includes('data-profile-edit-form'));
  assert.ok(html.includes('Personal info'));
  assert.ok(html.includes('@alexsmith'));
  assert.ok(html.includes('data-profile-edit-country'));
  assert.ok(html.includes('United States'));
  assert.ok(html.includes('data-profile-edit-city'));
  assert.ok(html.includes('Menlo Park'));
  assert.ok(html.includes('data-profile-edit-bio'));
  assert.ok(html.includes('Product designer and builder.'));
  assert.ok(html.includes('29/750'));
  assert.ok(html.includes('data-profile-edit-email-toggle'));
  assert.ok(html.includes('data-profile-edit-social-input="linkedin"'));
  assert.ok(html.includes('Save changes'));
  assert.ok(!html.includes('data-profile-edit-saved'));
});

test('React SSR — ProfileEditForm clamps initial bio to limit', async () => {
  const { default: ProfileEditForm } = await load('ProfileEditForm.tsx');
  const html = renderToStaticMarkup(
    h(ProfileEditForm, { bio: 'x'.repeat(900), bioLimit: 100 })
  );
  assert.ok(html.includes('100/100'));
});

test('React SSR — AvatarCropDialog closed state renders trigger only', async () => {
  const { default: AvatarCropDialog } = await load('AvatarCropDialog.tsx');
  const html = renderToStaticMarkup(h(AvatarCropDialog, { title: 'Edit avatar' }));
  assert.ok(html.includes('data-avatar-crop-dialog'));
  assert.ok(html.includes('Edit avatar'));
  assert.ok(!html.includes('data-avatar-crop-panel'));
});

test('React SSR — AvatarCropDialog defaultOpen renders preview and zoom', async () => {
  const { default: AvatarCropDialog } = await load('AvatarCropDialog.tsx');
  const html = renderToStaticMarkup(
    h(AvatarCropDialog, {
      defaultOpen: true,
      title: 'Alex Smith',
      initials: 'AS',
      defaultZoom: 60,
    })
  );
  assert.ok(html.includes('data-avatar-crop-panel'));
  assert.ok(html.includes('data-avatar-crop-preview'));
  assert.ok(html.includes('For best results, upload images of at least 1000×1000 pixels.'));
  assert.ok(html.includes('data-avatar-crop-zoom'));
  assert.ok(html.includes('value="60"'));
  assert.ok(html.includes('aria-label="Zoom out"'));
  assert.ok(html.includes('aria-label="Zoom in"'));
  assert.ok(!html.includes('data-avatar-crop-saved'));
});

test('React SSR — AvatarCropDialog image mode uses avatarUrl', async () => {
  const { default: AvatarCropDialog } = await load('AvatarCropDialog.tsx');
  const html = renderToStaticMarkup(
    h(AvatarCropDialog, { defaultOpen: true, avatarUrl: 'https://example.com/a.png' })
  );
  assert.ok(html.includes('https://example.com/a.png'));
});

test('React SSR — FollowSuggestionsCard grid, follow state and dismiss', async () => {
  const { default: FollowSuggestionsCard } = await load('FollowSuggestionsCard.tsx');
  const html = renderToStaticMarkup(
    h(FollowSuggestionsCard, {
      title: 'Discover more people',
      suggestions: [
        { id: 'jimmy', name: 'Jimmy Darts' },
        { id: 'sb', name: 'SB Mowing', handle: '@sbmowing' },
        { id: 'pattie', name: 'Pattie Gon', avatarUrl: 'https://example.com/p.png', initials: 'PG' },
      ],
    })
  );
  assert.ok(html.includes('data-follow-suggestions'));
  assert.ok(html.includes('Discover more people'));
  assert.ok(html.includes('data-follow-suggestions-card="jimmy"'));
  assert.ok(html.includes('Jimmy Darts'));
  assert.ok(html.includes('@sbmowing'));
  assert.ok(html.includes('https://example.com/p.png'));
  assert.ok(html.includes('data-follow-suggestions-follow="jimmy"'));
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-pressed="false"'));
  assert.ok(html.includes('data-follow-suggestions-dismiss="sb"'));
});

test('React SSR — FollowSuggestionsCard empty suggestions shows empty text', async () => {
  const { default: FollowSuggestionsCard } = await load('FollowSuggestionsCard.tsx');
  const html = renderToStaticMarkup(h(FollowSuggestionsCard, {}));
  assert.ok(html.includes('data-follow-suggestions-empty'));
  assert.ok(html.includes('No more suggestions right now'));
  assert.ok(!html.includes('data-follow-suggestions-grid'));
});
