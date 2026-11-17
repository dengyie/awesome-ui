/**
 * v3.1.1 — Vue SSR regression tests
 * IntegrationConnectGrid, NotificationPrefsMatrix, PermissionDeniedState,
 * NoResultsState. Interactive behavior is covered by the vanilla jsdom
 * suite (new-components56.vanilla.test.mjs).
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
  const script = compileScript(descriptor, { id: 'n56' });
  const template = compileTemplate({
    id: 'n56',
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

test('vue SSR — IntegrationConnectGrid tabs and cards', async () => {
  const html = await renderSfc('IntegrationConnectGrid.vue', {});
  assert.ok(html.includes('data-integration-card'), 'card hooks');
  assert.ok(html.includes('Connected'));
  assert.ok(html.includes('Not connected'));
});

test('vue SSR — NotificationPrefsMatrix rows and columns', async () => {
  const html = await renderSfc('NotificationPrefsMatrix.vue', {});
  assert.ok(html.includes('Mentions &amp; replies'));
  assert.ok(html.includes('data-pref-cell'), 'cell hooks');
  assert.ok(html.includes('In-app'));
});

test('vue SSR — PermissionDeniedState copy and CTA', async () => {
  const html = await renderSfc('PermissionDeniedState.vue', { title: 'Restricted' });
  assert.ok(html.includes('Restricted'));
  assert.ok(html.includes('Request access'));
  assert.ok(html.includes('data-denied-contact'));
});

test('vue SSR — NoResultsState query echo and suggestions', async () => {
  const html = await renderSfc('NoResultsState.vue', { query: 'deploy', suggestions: ['deployment'] });
  assert.ok(html.includes('deploy'));
  assert.ok(html.includes('Clear all filters'));
});
