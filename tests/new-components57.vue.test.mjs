/**
 * v3.2.0 — Vue SSR regression tests
 * TableSavedViews, BottomTabBar, BentoFeatureGrid, LogoCloud, StatsBand.
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
  const script = compileScript(descriptor, { id: 'n57' });
  const template = compileTemplate({
    id: 'n57',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);

  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
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

test('vue SSR — TableSavedViews tabs and actions', async () => {
  const html = await renderSfc('TableSavedViews.vue', {});
  assert.ok(html.includes('All records'));
  assert.ok(html.includes('Save view'));
});

test('vue SSR — BottomTabBar items and badges', async () => {
  const html = await renderSfc('BottomTabBar.vue', {});
  assert.ok(html.includes('data-bottomtab-item="home"'));
  assert.ok(html.includes('Inbox'));
});

test('vue SSR — BentoFeatureGrid tiles with spans', async () => {
  const html = await renderSfc('BentoFeatureGrid.vue', {});
  assert.ok(html.includes('Ship faster'));
  assert.ok(html.includes('data-bento-tile'));
});

test('vue SSR — LogoCloud kicker and tiles', async () => {
  const html = await renderSfc('LogoCloud.vue', {});
  assert.ok(html.includes('Trusted by teams at'));
  assert.ok(html.includes('Acme Corp'));
});

test('vue SSR — StatsBand values and responsive grid', async () => {
  const html = await renderSfc('StatsBand.vue', {});
  assert.ok(html.includes('221+'));
  assert.ok(html.includes('Production components'));
});
