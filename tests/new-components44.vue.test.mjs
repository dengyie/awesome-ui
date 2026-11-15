/**
 * v1.44.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n44' });
  const template = compileTemplate({
    id: 'n44',
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

test('vue SSR — AiSuggestionCard message, chips and close', async () => {
  const html = await renderSfc('AiSuggestionCard.vue', {
    message: 'Looking ahead to tomorrow in Tokyo.',
    chips: ['Weather for tomorrow', 'Summarize tomorrow'],
  });
  assert.ok(html.includes('data-ai-suggestion-card'), 'card hook');
  assert.ok(html.includes('data-ai-suggestion-message'), 'message hook');
  assert.ok(html.includes('Looking ahead to tomorrow in Tokyo.'), 'message text');
  assert.ok(html.includes('data-ai-suggestion-chip'), 'chip hook');
  assert.ok(html.includes('Weather for tomorrow'), 'chip text');
  assert.ok(html.includes('data-ai-suggestion-close'), 'close hook');
  assert.ok(html.includes('Dismiss suggestion'), 'close aria-label');

  const empty = await renderSfc('AiSuggestionCard.vue', { chips: [] });
  assert.ok(!empty.includes('data-ai-suggestion-chip'), 'no chips when empty');
});

test('vue SSR — JumpBackIn cards, kind badges and placeholders', async () => {
  const html = await renderSfc('JumpBackIn.vue', {
    cards: [
      { id: 'c1', kind: 'Trip', title: 'Trip to Japan, September 2026', subtitle: 'Tokyo · Starting 14 Sept' },
      { id: 'c2', kind: 'Chat', title: 'Mount Fuji Trip Planning', subtitle: 'Last touched 2 days ago' },
    ],
  });
  assert.ok(html.includes('data-jump-back-in'), 'row hook');
  assert.ok(html.includes('Jump back in'), 'title text');
  assert.ok(html.includes('data-jump-back-in-see-all'), 'see all hook');
  assert.ok(html.includes('data-jump-back-in-card="c1"'), 'card c1');
  assert.ok(html.includes('data-jump-back-in-kind'), 'kind badge hook');
  assert.ok(html.includes('Trip'), 'trip kind');
  assert.ok(html.includes('data-jump-back-in-placeholder'), 'gradient placeholder');
  assert.ok(html.includes('from-sky-400'), 'placeholder gradient');
  assert.ok(html.includes('data-jump-back-in-card-title'), 'card title hook');
  assert.ok(html.includes('Trip to Japan, September 2026'), 'card title text');
  assert.ok(html.includes('data-jump-back-in-card-subtitle'), 'card subtitle hook');
});

test('vue SSR — HelpResourcesPanel badges, minutes and links', async () => {
  const html = await renderSfc('HelpResourcesPanel.vue', {
    resources: [
      { id: 'r1', badge: 'Reference', title: 'Get started', description: 'Learn the basics.' },
      { id: 'r2', badge: 'Tutorial', title: 'CLI quick start', description: 'Author PRs with the CLI.', minutes: 10 },
    ],
    links: ['Send feedback', 'Docs'],
  });
  assert.ok(html.includes('data-help-resources-panel'), 'panel hook');
  assert.ok(html.includes('data-help-resources-header'), 'header hook');
  assert.ok(html.includes('Help'), 'header text');
  assert.ok(html.includes('data-help-resources-section'), 'section label hook');
  assert.ok(html.includes('Tutorials &amp; resources'), 'section label text');
  assert.ok(html.includes('data-help-resource="r1"'), 'resource r1');
  assert.ok(html.includes('data-help-resource-badge'), 'badge hook');
  assert.ok(html.includes('Reference'), 'reference badge');
  assert.ok(html.includes('bg-emerald-50'), 'tutorial badge tone');
  assert.ok(html.includes('data-help-resource-minutes'), 'minutes hook');
  assert.ok(html.includes('10 minutes'), 'minutes text');
  assert.ok(html.includes('data-help-resource-title'), 'title hook');
  assert.ok(html.includes('data-help-resource-desc'), 'desc hook');
  assert.ok(html.includes('data-help-resources-links'), 'links group hook');
  assert.ok(html.includes('data-help-resources-link'), 'link hook');
  assert.ok(html.includes('Send feedback'), 'link text');

  const noLinks = await renderSfc('HelpResourcesPanel.vue', { links: [] });
  assert.ok(!noLinks.includes('data-help-resources-links'), 'no links group when empty');
});
