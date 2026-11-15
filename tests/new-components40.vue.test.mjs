/**
 * v1.40.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n40' });
  const template = compileTemplate({
    id: 'n40',
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

test('vue SSR — AiRewriteMenu trigger, actions and badges', async () => {
  const html = await renderSfc('AiRewriteMenu.vue', {
    open: true,
    actions: [
      { id: 'a1', label: 'Expand' },
      { id: 'a2', label: 'Rephrase' },
      { id: 'a3', label: 'My tone of voice', badge: 'Get feature' },
      { id: 'a4', label: 'Fix grammar & spelling' },
    ],
  });
  assert.ok(html.includes('data-rewrite-menu-root'), 'root hook');
  assert.ok(html.includes('data-rewrite-trigger'), 'trigger hook');
  assert.ok(html.includes('aria-expanded="true"'), 'expanded state');
  assert.ok(html.includes('Rewrite'), 'trigger label');
  assert.ok(html.includes('data-rewrite-menu'), 'menu hook');
  assert.ok(html.includes('data-rewrite-item="a1"'), 'item hook');
  assert.ok(html.includes('Expand'), 'expand label');
  assert.ok(html.includes('Rephrase'), 'rephrase label');
  assert.ok(html.includes('data-rewrite-item-badge'), 'badge hook');
  assert.ok(html.includes('Get feature'), 'badge text');
  assert.ok(html.includes('Fix grammar &amp; spelling'), 'grammar label escaped');

  const closed = await renderSfc('AiRewriteMenu.vue', {
    open: false,
    actions: [{ id: 'a1', label: 'Expand' }],
  });
  assert.ok(closed.includes('data-rewrite-trigger'), 'trigger still rendered');
  assert.ok(!closed.includes('data-rewrite-item'), 'menu items hidden when closed');
});

test('vue SSR — PromptPerformanceTable columns and export CTA', async () => {
  const html = await renderSfc('PromptPerformanceTable.vue', {
    rows: [
      { id: 'p1', prompt: 'best ai note taking app', visibility: '68%', sentiment: '8.2', position: '#1', mentions: '42', trend: 'up' },
      { id: 'p2', prompt: 'how to summarize lectures', visibility: '31%', sentiment: '7.4', position: '#4', mentions: '17', trend: 'down' },
    ],
  });
  assert.ok(html.includes('data-prompt-performance-table'), 'host hook');
  assert.ok(html.includes('Prompt performance'), 'default title');
  assert.ok(html.includes('data-prompt-performance-export'), 'export CTA');
  assert.ok(html.includes('Export'), 'export label');
  assert.ok(html.includes('data-prompt-performance-list'), 'list hook');
  assert.ok(html.includes('data-prompt-row="p1"'), 'row hook');
  assert.ok(html.includes('best ai note taking app'), 'prompt text');
  assert.ok(html.includes('data-prompt-row-visibility'), 'visibility col');
  assert.ok(html.includes('68%'), 'visibility value');
  assert.ok(html.includes('data-prompt-row-sentiment'), 'sentiment col');
  assert.ok(html.includes('8.2'), 'sentiment value');
  assert.ok(html.includes('data-prompt-row-position'), 'position col');
  assert.ok(html.includes('#1'), 'position value');
  assert.ok(html.includes('data-prompt-row-mentions'), 'mentions col');
  assert.ok(html.includes('42'), 'mentions value');
  assert.ok(html.includes('▲'), 'up trend');

  const empty = await renderSfc('PromptPerformanceTable.vue', {});
  assert.ok(empty.includes('data-prompt-performance-empty'), 'empty state');
});

test('vue SSR — ShareAccessDialog people list and copy link', async () => {
  const html = await renderSfc('ShareAccessDialog.vue', {
    url: 'https://superhuman.com/share/xyz',
    people: [
      { id: 'u1', name: 'Alex Smith', email: 'alex@team.com', role: 'Publisher' },
      { id: 'u2', name: 'Brook Taylor', email: 'brook@team.com' },
    ],
  });
  assert.ok(html.includes('data-share-access-backdrop'), 'backdrop hook');
  assert.ok(html.includes('data-share-access-dialog'), 'dialog hook');
  assert.ok(html.includes('Share Conversation'), 'title text');
  assert.ok(html.includes('data-share-access-description'), 'description hook');
  assert.ok(html.includes('data-share-access-close'), 'close button');
  assert.ok(html.includes('data-share-access-input'), 'invite input');
  assert.ok(html.includes('data-share-access-people'), 'people hook');
  assert.ok(html.includes('data-access-person="u1"'), 'person hook');
  assert.ok(html.includes('Alex Smith'), 'person name');
  assert.ok(html.includes('alex@team.com'), 'person email');
  assert.ok(html.includes('data-access-person-role'), 'role hook');
  assert.ok(html.includes('Publisher'), 'role text');
  assert.ok(html.includes('AS'), 'initials');
  assert.ok(html.includes('data-access-person-remove'), 'remove action');
  assert.ok(html.includes('https://superhuman.com/share/xyz'), 'url text');
  assert.ok(html.includes('data-share-access-copy'), 'copy CTA');
  assert.ok(html.includes('COPY LINK'), 'copy label');

  const empty = await renderSfc('ShareAccessDialog.vue', { people: [] });
  assert.ok(empty.includes('data-share-access-empty'), 'empty state');

  const closed = await renderSfc('ShareAccessDialog.vue', { open: false });
  assert.ok(!closed.includes('data-share-access-dialog'), 'not rendered when closed');
});
