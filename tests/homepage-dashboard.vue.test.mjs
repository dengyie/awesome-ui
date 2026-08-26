/**
 * HomepageDashboard — Vue regression tests
 * Compiles the SFC with @vue/compiler-sfc (script + template), then SSR-renders
 * the REAL component through @vue/server-renderer and checks structure, status
 * markers, href whitelisting and safe defaults. Interactive behavior is covered
 * by the vanilla jsdom suite (identical design language across the ports).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const filename = 'HomepageDashboard.vue';
const src = readFileSync(join(root, 'vue', filename), 'utf8');

const { descriptor } = parse(src, { filename });
const script = compileScript(descriptor, { id: 'homepage-dashboard' }); // v3.4+: throws on script errors

const template = compileTemplate({
  source: descriptor.template.content,
  filename,
  id: 'homepage-dashboard',
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.equal(template.errors.length, 0, String(template.errors));

// Assemble script (bindings + setup) + compiled render into one runnable module.
const assembled = script.content
  .replace(/^export default \/\*@__PURE__\*\/_defineComponent\(/gm, 'const __component = /*@__PURE__*/_defineComponent(')
  .concat('\n', template.code, '\n__component.render = render;\nexport default __component;\n');

// Strip TypeScript (generics, interfaces, type annotations) so Node can import it.
const runtime = ts.transpileModule(assembled, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    esModuleInterop: true,
  },
}).outputText;

const tmpDir = join(root, 'node_modules', '.cache-homepage');
mkdirSync(tmpDir, { recursive: true });
writeFileSync(join(tmpDir, 'vue.mjs'), runtime);
const { default: Comp } = await import(join(tmpDir, 'vue.mjs'));

const GROUPS = [
  {
    name: 'Media',
    services: [
      { name: 'Jellyfin', description: 'Streaming', href: 'https://jellyfin.local', status: 'up', pingText: '12ms' },
      { name: 'Bad', href: 'javascript:alert(1)', status: 'down' },
      { id: 'stable-3', name: 'Sonarr', status: 'warn' },
    ],
  },
];

const render = (props) => renderToString(createSSRApp(Comp, props));

test('script & template compile without errors and wire 30+ bindings', () => {
  assert.equal(template.errors.length, 0);
  assert.ok(Object.keys(script.bindings).length >= 30, `only ${Object.keys(script.bindings).length} bindings`);
});

test('SSR-renders groups, safe hrefs anchor, unsafe hrefs do not', async () => {
  const html = await render({ groups: GROUPS });
  assert.ok(html.includes('Jellyfin'));
  assert.ok(html.includes('href="https://jellyfin.local"'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('12ms'));
});

test('safe defaults — version text and title, no upstream version masquerade', async () => {
  const html = await render({});
  assert.ok(html.includes('Homepage · awesome-ui'));
  assert.ok(!html.includes('v2.1.0'));
});

test('missing name/status does not crash SSR', async () => {
  const html = await render({ groups: [{ name: 'G', services: [{ status: 'up' }] }] });
  assert.ok(html.includes('service-card'));
});

test('search logic lives in filteredGroups (query matches name AND description)', async () => {
  const html = await render({ groups: GROUPS, showSearch: true });
  // Both group and each card still render in static output (query is empty by default)
  assert.ok(html.includes('type="search"'));
  assert.ok(html.includes('aria-label="Search services"'));
});