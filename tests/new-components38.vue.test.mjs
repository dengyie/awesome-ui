/**
 * v1.38.0 — Vue regression tests
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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const vueModule = require('vue');

const renderSfc = async (file, props) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n38' });
  const template = compileTemplate({
    id: 'n38',
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

test('vue SSR — QaTestTable rows, ratings and counts', async () => {
  const html = await renderSfc('QaTestTable.vue', {
    rows: [
      { id: 'q1', question: 'Does SLMobbin have a community?', rating: 'good' },
      { id: 'q2', question: 'What if I run into an issue?', rating: 'acceptable' },
      { id: 'q3', question: 'Is SLMobbin free?', rating: 'poor' },
      { id: 'q4', question: 'How do I start?', answered: false },
    ],
  });
  assert.ok(html.includes('data-qa-test-table'), 'host hook');
  assert.ok(html.includes('data-qa-row="q1"'), 'row hook');
  assert.ok(html.includes('data-qa-question'), 'question hook');
  assert.ok(html.includes('Does SLMobbin have a community?'), 'question text');
  assert.ok(html.includes('data-qa-check'), 'checkbox');
  assert.ok(html.includes('data-qa-rating="good"'), 'good chip');
  assert.ok(html.includes('Acceptable'), 'rating label');
  assert.ok(html.includes('4 questions'), 'question count');
  assert.ok(html.includes('3 answered'), 'answered count');
});

test('vue SSR — AppealRestrictionDialog reason card and actions', async () => {
  const html = await renderSfc('AppealRestrictionDialog.vue', {
    reasonTitle: 'Unsafe Conduct',
    reasonDetail: 'Dangerous stunts by non-professionals.',
  });
  assert.ok(html.includes('data-appeal-dialog'), 'host hook');
  assert.ok(html.includes('Request another review'), 'title text');
  assert.ok(html.includes('180 days to appeal'), 'appeal window note');
  assert.ok(html.includes('data-appeal-reason-title'), 'reason title hook');
  assert.ok(html.includes('Unsafe Conduct'), 'reason title');
  assert.ok(html.includes('Dangerous stunts'), 'reason detail');
  assert.ok(html.includes('Content Policy'), 'policy link');
  assert.ok(html.includes('data-appeal-submit'), 'appeal button');
  assert.ok(html.includes('data-appeal-back'), 'back button');
  assert.ok(html.includes('data-appeal-close'), 'close button');
});

test('vue SSR — ModelPricingCard pricing rows and copy button', async () => {
  const html = await renderSfc('ModelPricingCard.vue', {
    modelName: 'Glm 4.7 Flash',
    modelId: 'workers-ai/@cf/zai-org/glm-4.7-flash',
    pricing: { inputPerMillion: 0.06, outputPerMillion: 0.4 },
  });
  assert.ok(html.includes('data-model-pricing-card'), 'host hook');
  assert.ok(html.includes('Glm 4.7 Flash'), 'model name');
  assert.ok(html.includes('glm-4.7-flash'), 'model id');
  assert.ok(html.includes('data-model-pricing-copy'), 'copy button');
  assert.ok(html.includes('$ 0.06 / million tokens'), 'input price');
  assert.ok(html.includes('$ 0.40 / million tokens'), 'output price');
});
