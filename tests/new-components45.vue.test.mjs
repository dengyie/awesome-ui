/**
 * v1.45.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n45' });
  const template = compileTemplate({
    id: 'n45',
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

test('vue SSR — VisionAnalysisCard sections, rows and keys', async () => {
  const html = await renderSfc('VisionAnalysisCard.vue', {
    sections: [
      {
        heading: 'Design Strengths',
        rows: [
          { key: 'Color Palette', value: 'Warm sunset tones with high saturation' },
          { key: 'Composition', value: 'Balanced horizon at the upper third' },
        ],
      },
    ],
  });
  assert.ok(html.includes('data-vision-analysis-card'), 'card hook');
  assert.ok(html.includes('data-vision-section'), 'section hook');
  assert.ok(html.includes('data-vision-section-heading'), 'heading hook');
  assert.ok(html.includes('Design Strengths'), 'heading text');
  assert.ok(html.includes('data-vision-rows'), 'rows wrapper hook');
  assert.ok(html.includes('data-vision-row="Color Palette"'), 'row key attr');
  assert.ok(html.includes('data-vision-row-key'), 'row key hook');
  assert.ok(html.includes('Color Palette'), 'row key text');
  assert.ok(html.includes('data-vision-row-value'), 'row value hook');
  assert.ok(html.includes('Warm sunset tones with high saturation'), 'row value text');

  const fallback = await renderSfc('VisionAnalysisCard.vue', {});
  assert.ok(fallback.includes('Image Details'), 'default section renders');
  assert.ok(fallback.includes('Wave Patterns'), 'default rows render');
});

test('vue SSR — PrReviewQueue groups, toggles and rows', async () => {
  const html = await renderSfc('PrReviewQueue.vue', {
    groups: [
      {
        id: 'waiting',
        label: 'Waiting for reviewers',
        prs: [{ id: 'p1', title: 'Add activity feed API', repo: 'mini-landing-page', number: 4, author: 'Sam Lee' }],
      },
      {
        id: 'drafts',
        label: 'Drafts',
        prs: [
          { id: 'p2', title: 'Add user search', repo: 'mini-landing-page', number: 7, author: 'Sam Lee' },
          { id: 'p3', title: 'Add frontend for search', repo: 'mini-landing-page', number: 6, author: 'Sam Lee' },
        ],
      },
    ],
  });
  assert.ok(html.includes('data-pr-review-queue'), 'queue hook');
  assert.ok(html.includes('data-pr-group="waiting"'), 'waiting group');
  assert.ok(html.includes('data-pr-group-toggle'), 'toggle hook');
  assert.ok(html.includes('data-pr-group-count'), 'count badge hook');
  assert.ok(html.includes('data-pr-group-label'), 'label hook');
  assert.ok(html.includes('Waiting for reviewers'), 'waiting label text');
  assert.ok(html.includes('Drafts'), 'drafts label text');
  assert.ok(html.includes('data-pr-row="p1"'), 'pr row p1');
  assert.ok(html.includes('data-pr-avatar'), 'avatar hook');
  assert.ok(html.includes('SL'), 'author initials');
  assert.ok(html.includes('data-pr-title'), 'title hook');
  assert.ok(html.includes('Add activity feed API'), 'title text');
  assert.ok(html.includes('data-pr-meta'), 'meta hook');
  assert.ok(html.includes('Sam Lee · mini-landing-page #4'), 'meta text');
});

test('vue SSR — IterationActionBar pills and pager', async () => {
  const html = await renderSfc('IterationActionBar.vue', { page: 2, totalPages: 5 });
  assert.ok(html.includes('data-iteration-action-bar'), 'bar hook');
  assert.ok(html.includes('data-iteration-action="show-more"'), 'show more pill');
  assert.ok(html.includes('Show More'), 'show more label');
  assert.ok(html.includes('data-iteration-action="brainstorm"'), 'brainstorm pill');
  assert.ok(html.includes('Brainstorm'), 'brainstorm label');
  assert.ok(html.includes('data-iteration-action="reply"'), 'reply pill');
  assert.ok(html.includes('Reply'), 'reply label');
  assert.ok(html.includes('data-iteration-action="more"'), 'more pill');
  assert.ok(html.includes('More actions'), 'more aria-label');
  assert.ok(html.includes('data-iteration-pager'), 'pager hook');
  assert.ok(html.includes('data-iteration-prev'), 'prev hook');
  assert.ok(html.includes('data-iteration-next'), 'next hook');
  assert.ok(html.includes('Previous page'), 'prev aria-label');
  assert.ok(html.includes('Next page'), 'next aria-label');
  assert.ok(html.includes('data-iteration-page-label'), 'page label hook');
  assert.ok(html.includes('2/5'), 'page label text');

  const bounds = await renderSfc('IterationActionBar.vue', { page: 1, totalPages: 4 });
  assert.ok(bounds.includes('disabled'), 'prev disabled at first page');
});
