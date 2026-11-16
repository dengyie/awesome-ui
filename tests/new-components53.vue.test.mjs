/**
 * v2.6.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n53' });
  const template = compileTemplate({
    id: 'n53',
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

test('vue PermissionMatrix — roles table with grouped rows and state cells', async () => {
  const html = await renderSfc('PermissionMatrix.vue');
  assert.match(html, /data-permmtx/);
  assert.match(html, /data-permmtx-title/);
  assert.match(html, /data-permmtx-tab="details"/);
  assert.match(html, /Employee Experience/);
  assert.match(html, /data-permmtx-row="onboarding"/);
  assert.match(html, /data-permmtx-role="Editor"/);
  assert.match(html, /data-permmtx-state="edit"/);
  assert.match(html, /N \/ A/);
  assert.match(html, /No access/);
  assert.match(html, /View only/);
});

test('vue StockPhotoPicker — search bar, powered-by and photo grid', async () => {
  const html = await renderSfc('StockPhotoPicker.vue');
  assert.match(html, /data-stkpic/);
  assert.match(html, /Stock photos/);
  assert.match(html, /data-stkpic-close/);
  assert.match(html, /data-stkpic-input/);
  assert.match(html, /Powered by Unsplash/);
  assert.match(html, /data-stkpic-item="p1"/);
  assert.match(html, /data-stkpic-add="p6"/);
  assert.match(html, /Josephine Baran/);
});

test('vue MapActivityList — filter chips, activity cards, map pins', async () => {
  const html = await renderSfc('MapActivityList.vue');
  assert.match(html, /data-mapact/);
  assert.match(html, /data-mapact-filter="Filters"/);
  assert.match(html, /Water activities/);
  assert.match(html, /data-mapact-item="a1"/);
  assert.match(html, /Seine River Sightseeing Evening Cruise/);
  assert.match(html, /data-mapact-pin="a3"/);
  assert.match(html, /Close map/);
  assert.match(html, /4\.7/);
});

test('vue SearchResultsPage — topbar, filters, related chips and results', async () => {
  const html = await renderSfc('SearchResultsPage.vue');
  assert.match(html, /data-srchres/);
  assert.match(html, /data-srchres-input/);
  assert.match(html, /data-srchres-filter="updated"/);
  assert.match(html, /Related searches/);
  assert.match(html, /data-srchres-related-chip="brainstorming techniques"/);
  assert.match(html, /data-srchres-result="s1"/);
  assert.match(html, /Sam Design Guideline Document/);
  assert.match(html, /5 results/);
});
