/**
 * v3.10.0 — Vue SSR regression tests
 * ProfileEditForm, AvatarCropDialog, FollowSuggestionsCard.
 * Interactive behavior is covered by the vanilla jsdom suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { renderToString } from '@vue/server-renderer';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const vueModule = require('vue');

const compileSfcParts = (file, id) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id });
  const template = compileTemplate({
    id,
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, bindings) => {
      const destructuring = bindings.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, ' $1: $2 ');
      return `const {${destructuring}} = vueMod;`;
    })
    .replace(/^export function render\(/m, 'function render(');
  return { cjs, templateCode };
};

const renderSfc = async (file, props) => {
  const { cjs, templateCode } = compileSfcParts(file, 'n64');
  const factory = new Function('vueMod', `
    const require = (name) => (name === 'vue' ? vueMod : null);
    const exports = {};
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const { default: component, render } = factory(vueModule);
  component.render = render;
  const app = vueModule.createSSRApp(component, props);
  return renderToString(app);
};

test('vue SSR — ProfileEditForm fields, bio count and socials', async () => {
  const html = await renderSfc('ProfileEditForm.vue', {
    title: 'Personal info',
    handle: '@alexsmith',
    defaultCountry: 'United States',
    defaultCity: 'Menlo Park',
    bio: 'Product designer and builder.',
    socials: [
      { id: 'instagram', label: 'Instagram', placeholder: '@Username' },
      { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com' },
    ],
  });
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

test('vue SSR — ProfileEditForm bio limit counter', async () => {
  const html = await renderSfc('ProfileEditForm.vue', { bio: 'y'.repeat(40), bioLimit: 120 });
  assert.ok(html.includes('40/120'));
});

test('vue SSR — AvatarCropDialog closed state renders trigger only', async () => {
  const html = await renderSfc('AvatarCropDialog.vue', { title: 'Edit avatar' });
  assert.ok(html.includes('data-avatar-crop-dialog'));
  assert.ok(html.includes('Edit avatar'));
  assert.ok(!html.includes('data-avatar-crop-panel'));
});

test('vue SSR — AvatarCropDialog defaultOpen renders preview and zoom', async () => {
  const html = await renderSfc('AvatarCropDialog.vue', {
    defaultOpen: true,
    title: 'Alex Smith',
    initials: 'AS',
    defaultZoom: 60,
  });
  assert.ok(html.includes('data-avatar-crop-panel'));
  assert.ok(html.includes('data-avatar-crop-preview'));
  assert.ok(html.includes('For best results, upload images of at least 1000×1000 pixels.'));
  assert.ok(html.includes('data-avatar-crop-zoom'));
  assert.ok(html.includes('aria-label="Zoom out"'));
  assert.ok(html.includes('aria-label="Zoom in"'));
  assert.ok(html.includes('>AS<'));
  assert.ok(!html.includes('data-avatar-crop-saved'));
});

test('vue SSR — AvatarCropDialog image mode uses avatar-url', async () => {
  const html = await renderSfc('AvatarCropDialog.vue', {
    defaultOpen: true,
    avatarUrl: 'https://example.com/a.png',
  });
  assert.ok(html.includes('https://example.com/a.png'));
});

test('vue SSR — FollowSuggestionsCard grid, follow state and dismiss buttons', async () => {
  const html = await renderSfc('FollowSuggestionsCard.vue', {
    title: 'Discover more people',
    suggestions: [
      { id: 'jimmy', name: 'Jimmy Darts' },
      { id: 'sb', name: 'SB Mowing', handle: '@sbmowing' },
      { id: 'pattie', name: 'Pattie Gon', avatarUrl: 'https://example.com/p.png', initials: 'PG' },
    ],
  });
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
  assert.ok(html.includes('Follow'));
});

test('vue SSR — FollowSuggestionsCard empty suggestions shows empty text', async () => {
  const html = await renderSfc('FollowSuggestionsCard.vue', {});
  assert.ok(html.includes('data-follow-suggestions-empty'));
  assert.ok(html.includes('No more suggestions right now'));
  assert.ok(!html.includes('data-follow-suggestions-grid'));
});
