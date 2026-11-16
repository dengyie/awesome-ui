/**
 * v2.7.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n54' });
  const template = compileTemplate({
    id: 'n54',
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

test('vue SessionDiagnosticsPanel — devices, tracks and events render', async () => {
  const html = await renderSfc('SessionDiagnosticsPanel.vue');
  assert.match(html, /data-sdiag/);
  assert.match(html, /data-sdiag-title/);
  assert.match(html, /data-sdiag-device="Browser"/);
  assert.match(html, /data-sdiag-track="network"/);
  assert.match(html, /data-sdiag-event="1"/);
  assert.match(html, /data-sdiag-search/);
});

test('vue HelpCenterHome — search and expandable topics render', async () => {
  const html = await renderSfc('HelpCenterHome.vue');
  assert.match(html, /data-helpct/);
  assert.match(html, /data-helpct-form/);
  assert.match(html, /data-helpct-input/);
  assert.match(html, /data-helpct-topic-btn="management"/);
  assert.match(html, /data-helpct-article="Refund policy"/);
  assert.match(html, /Or browse by topic/);
});

test('vue AccountSecurityPanel — tabs, password and sessions render', async () => {
  const html = await renderSfc('AccountSecurityPanel.vue');
  assert.match(html, /data-acctsec/);
  assert.match(html, /data-acctsec-tab="Security"/);
  assert.match(html, /data-acctsec-panel/);
  assert.match(html, /data-acctsec-edit-password/);
  assert.match(html, /Manage verified sessions/);
  assert.match(html, /data-acctsec-remove="s2"/);
  assert.match(html, /data-acctsec-done/);
});

test('vue MasonryDensityControls — controls, meta and grid render', async () => {
  const html = await renderSfc('MasonryDensityControls.vue');
  assert.match(html, /data-masn/);
  assert.match(html, /data-masn-size/);
  assert.match(html, /data-masn-padding/);
  assert.match(html, /data-masn-close/);
  assert.match(html, /data-masn-meta/);
  assert.match(html, /4 cols · 12px/);
  assert.match(html, /data-masn-item="m1"/);
});
