/**
 * v1.42.0 — Vue regression tests
 * Compiles each SFC with @vue/compiler-sfc (+ TypeScript transpile),
 * evaluates the real component and SSR-renders it through
 * @vue/server-renderer, checking structure markers.
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

const renderSfc = async (file, props) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n42' });
  const template = compileTemplate({
    id: 'n42',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);

  // Transpile the compiled script (ESM w/ vue import + TS types) to CJS,
  // then evaluate it with `vue` and the render fn provided.
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
    // script-setup re-exports types (type-only) — strip leftover ESM exports
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, bindings) => {
      const destructuring = bindings.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, ' $1: $2 ');
      return `const {${destructuring}} = vueMod;`;
    })
    .replace(/^export function render\(/m, 'function render(');

  const factory = new Function('vueMod', 'exports', 'requireShim', `
    const require = (name) => (name === 'vue' ? vueMod : requireShim(name));
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const exportsShim = {};
  const { default: component, render } = factory(vueModule, exportsShim, require);
  component.render = render;

  const app = vueModule.createSSRApp(component, props);
  return renderToString(app);
};

test('vue SSR — FalRunCard badge, meta, rows and actions', async () => {
  const html = await renderSfc('FalRunCard.vue', {
    type: 'Text To Image',
    models: 4,
    time: '22 minutes ago',
    prompt: 'a calm, morning, beach scenery',
    aspect: '1:1',
    cost: '$0.241',
  });
  assert.ok(html.includes('data-fal-run-card'), 'card hook');
  assert.ok(html.includes('data-fal-run-type'), 'type badge hook');
  assert.ok(html.includes('Text To Image'), 'type text');
  assert.ok(html.includes('4 models'), 'models text');
  assert.ok(html.includes('22 minutes ago'), 'time text');
  assert.ok(html.includes('data-fal-run-prompt'), 'prompt hook');
  assert.ok(html.includes('a calm, morning, beach scenery'), 'prompt text');
  assert.ok(html.includes('data-fal-run-aspect'), 'aspect hook');
  assert.ok(html.includes('data-fal-run-cost'), 'cost hook');
  assert.ok(html.includes('$0.241'), 'cost text');
  assert.ok(html.includes('text-emerald-500'), 'green cost tone');
  assert.ok(html.includes('data-fal-run-duplicate'), 'duplicate action');
  assert.ok(html.includes('data-fal-run-rerun'), 'rerun action');
  assert.ok(html.includes('data-fal-run-delete'), 'delete action');

  const zinc = await renderSfc('FalRunCard.vue', { costTone: 'zinc' });
  assert.ok(!zinc.includes('text-emerald-500'), 'zinc cost tone when requested');
});

test('vue SSR — ImageGenMetaBar job id, duration and cost', async () => {
  const html = await renderSfc('ImageGenMetaBar.vue', {
    model: 'xai/grok-imagine-image',
    jobId: '# 019f1bb4',
    duration: '—',
    cost: '$ —',
  });
  assert.ok(html.includes('data-image-gen-meta'), 'meta hook');
  assert.ok(html.includes('data-image-gen-model'), 'model badge hook');
  assert.ok(html.includes('xai/grok-imagine-image'), 'model text');
  assert.ok(html.includes('data-image-gen-job'), 'job hook');
  assert.ok(html.includes('# 019f1bb4'), 'job text');
  assert.ok(html.includes('data-image-gen-duration'), 'duration hook');
  assert.ok(html.includes('data-image-gen-cost'), 'cost hook');

  const fallback = await renderSfc('ImageGenMetaBar.vue', {});
  assert.ok(fallback.includes('openai/gpt-image-2'), 'default model');
  assert.ok(fallback.includes('169.0s'), 'default duration');
});

test('vue SSR — GammaImageDetail preview, toolbar and prompt block', async () => {
  const html = await renderSfc('GammaImageDetail.vue', {
    title: 'AI images',
    preview: 'https://example.com/preview.png',
    prompt: 'Generate the following image: Mobile-first carousel slide.',
    liked: true,
  });
  assert.ok(html.includes('data-gamma-image-detail'), 'detail hook');
  assert.ok(html.includes('data-gamma-detail-title'), 'title hook');
  assert.ok(html.includes('data-gamma-detail-preview'), 'preview hook');
  assert.ok(html.includes('example.com/preview.png'), 'preview img src');
  assert.ok(html.includes('data-gamma-detail-download'), 'download action');
  assert.ok(html.includes('data-gamma-detail-zoom'), 'zoom action');
  assert.ok(html.includes('data-gamma-detail-delete'), 'delete action');
  assert.ok(html.includes('data-gamma-detail-like'), 'like action');
  assert.ok(html.includes('data-gamma-detail-dislike'), 'dislike action');
  assert.ok(html.includes('aria-pressed="true"'), 'liked pressed');
  assert.ok(html.includes('text-rose-500'), 'liked tone');
  assert.ok(html.includes('data-gamma-detail-prompt'), 'prompt hook');
  assert.ok(html.includes('Mobile-first carousel slide.'), 'prompt text');

  const empty = await renderSfc('GammaImageDetail.vue', {});
  assert.ok(!empty.includes('<img'), 'placeholder when no preview');
  assert.ok(empty.includes('aria-pressed="false"'), 'not liked by default');
});
