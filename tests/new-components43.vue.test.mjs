/**
 * v1.43.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n43' });
  const template = compileTemplate({
    id: 'n43',
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

test('vue SSR — WriterStyleGuide tabs, entries and minutes', async () => {
  const html = await renderSfc('WriterStyleGuide.vue', {
    activeTab: 'team',
    entries: [
      { id: 'g1', title: 'Avoid passive voice', description: 'It dilutes meaning.', minutes: 3 },
      { id: 'g2', title: 'Contracted forms', description: 'Write "can\'t".', minutes: 2 },
    ],
  });
  assert.ok(html.includes('data-writer-style-guide'), 'guide hook');
  assert.ok(html.includes('data-writer-tab="company"'), 'company tab');
  assert.ok(html.includes('data-writer-tab="team"'), 'team tab');
  assert.ok(html.includes('data-writer-tab="my"'), 'my tab');
  assert.ok(html.includes('border-indigo-500'), 'active tab underline');
  assert.ok(html.includes('data-writer-entry="g1"'), 'entry g1');
  assert.ok(html.includes('Avoid passive voice'), 'entry title');
  assert.ok(html.includes('data-writer-entry-minutes'), 'minutes hook');
  assert.ok(html.includes('3 min'), 'minutes text');
  assert.ok(html.includes('data-writer-add'), 'add CTA');

  const empty = await renderSfc('WriterStyleGuide.vue', { entries: [] });
  assert.ok(!empty.includes('data-writer-entry='), 'no entries rendered');
});

test('vue SSR — CampsiteHandoff checklist, avatars and summary', async () => {
  const html = await renderSfc('CampsiteHandoff.vue', {
    items: [
      { id: 'h1', label: 'Redlines attached', done: true, assignee: 'Alex Smith', due: 'Nov 12' },
      { id: 'h2', label: 'Motion review', done: false, assignee: 'Brook Taylor' },
    ],
    summary: '2 tasks, 1 done.',
  });
  assert.ok(html.includes('data-campsite-handoff'), 'panel hook');
  assert.ok(html.includes('data-campsite-handoff-title'), 'title hook');
  assert.ok(html.includes('data-campsite-handoff-count'), 'count hook');
  assert.ok(html.includes('1/2 done'), 'done count');
  assert.ok(html.includes('data-campsite-handoff-item="h1"'), 'item h1');
  assert.ok(html.includes('data-campsite-handoff-check'), 'checkbox hook');
  assert.ok(html.includes('line-through'), 'done strikethrough');
  assert.ok(html.includes('data-campsite-handoff-assignee'), 'assignee hook');
  assert.ok(html.includes('AS'), 'initials avatar');
  assert.ok(html.includes('data-campsite-handoff-due'), 'due hook');
  assert.ok(html.includes('Nov 12'), 'due text');
  assert.ok(html.includes('data-campsite-handoff-summary'), 'summary hook');
  assert.ok(html.includes('AI summary'), 'summary label');
});

test('vue SSR — ZendeskFieldSuggest chips, confidence and dismiss', async () => {
  const html = await renderSfc('ZendeskFieldSuggest.vue', {
    fields: [
      { id: 'f1', label: 'Priority', value: 'Urgent', confidence: 0.94 },
      { id: 'f2', label: 'Type', value: 'Incident', confidence: 0.87 },
    ],
  });
  assert.ok(html.includes('data-zendesk-field-suggest'), 'bar hook');
  assert.ok(html.includes('Suggested fields'), 'label text');
  assert.ok(html.includes('data-zendesk-suggest-field="f1"'), 'field f1');
  assert.ok(html.includes('Priority:'), 'field label');
  assert.ok(html.includes('Urgent'), 'field value');
  assert.ok(html.includes('94%'), 'confidence percent');
  assert.ok(html.includes('data-zendesk-suggest-dismiss'), 'dismiss hook');
  assert.ok(html.includes('Ignore'), 'dismiss label');
  assert.ok(html.includes('bg-amber-50'), 'amber tone');

  const empty = await renderSfc('ZendeskFieldSuggest.vue', { fields: [] });
  assert.ok(!empty.includes('data-zendesk-suggest-field='), 'no chips when empty');
});
