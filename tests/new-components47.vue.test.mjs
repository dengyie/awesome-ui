/**
 * v1.47.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n47' });
  const template = compileTemplate({
    id: 'n47',
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

test('vue SSR — EvalRunResults header, filter and evaluator sections', async () => {
  const html = await renderSfc('EvalRunResults.vue', {
    passRate: '82.50%',
    counters: { passed: 33, unknown: 1, failed: 6, total: 40 },
    sections: [
      {
        id: 'judge',
        name: 'tone_judge',
        subtitle: 'AI-Powered / LLM as a Judge',
        results: [
          {
            id: 'r1',
            status: 'passed',
            reason: 'Tone is neutral and professional throughout.',
            response: 'Key Points: Q2 revenue grew 12% quarter over quarter.',
            variables: [{ name: 'CATEGORY', value: 'Finance' }],
          },
          {
            id: 'r2',
            status: 'failed',
            reason: 'Summary invents a forecast not present in the source.',
            response: 'Key Points: The document predicts a 40% uplift next year.',
          },
        ],
      },
    ],
  });
  assert.ok(html.includes('data-eval-run-results'), 'root hook');
  assert.ok(html.includes('data-eval-score'), 'score hook');
  assert.ok(html.includes('82.50%'), 'score text');
  assert.ok(html.includes('data-eval-counter="passed"'), 'passed counter');
  assert.ok(html.includes('data-eval-filter'), 'filter hook');
  assert.ok(html.includes('has any of'), 'filter label');
  assert.ok(html.includes('data-eval-section="judge"'), 'section hook');
  assert.ok(html.includes('tone_judge'), 'section name');
  assert.ok(html.includes('data-eval-row="r1"'), 'row hook');
  assert.ok(html.includes('data-eval-row-status="failed"'), 'failed row status');
  assert.ok(html.includes('text-red-600'), 'failed tone');
  assert.ok(html.includes('data-eval-var="CATEGORY"'), 'variable chip');

  const defaults = await renderSfc('EvalRunResults.vue', {});
  assert.ok(defaults.includes('64.00%'), 'default pass rate');
  assert.ok(defaults.includes('summary_quality_judge'), 'default section');
});

test('vue SSR — EventTagGrid scopes and key/value rows', async () => {
  const html = await renderSfc('EventTagGrid.vue', {
    scopes: ['All', 'Client'],
    activeScope: 'Client',
    groups: [
      {
        id: 'left',
        title: 'left',
        tags: [
          { key: 'level', value: 'error' },
          { key: 'transaction', value: '/checkout', link: true },
        ],
      },
      { id: 'right', title: 'right', tags: [{ key: 'handled', value: 'no' }] },
    ],
  });
  assert.ok(html.includes('data-tag-grid'), 'root hook');
  assert.ok(html.includes('data-tag-grid-title'), 'title hook');
  assert.ok(html.includes('data-tag-grid-scopes'), 'scopes hook');
  assert.ok(html.includes('data-tag-scope="Client"'), 'scope pill');
  assert.ok(html.includes('aria-pressed="true"'), 'active scope pressed');
  assert.ok(html.includes('data-tag-group="left"'), 'left group');
  assert.ok(html.includes('data-tag-key'), 'key hook');
  assert.ok(html.includes('data-tag-value="error"'), 'value hook');
  assert.ok(html.includes('/checkout'), 'link value');

  const defaults = await renderSfc('EventTagGrid.vue', {});
  assert.ok(defaults.includes('Chrome 141.0.0'), 'default browser tag');
  assert.ok(defaults.includes('Other'), 'default scopes');
});

test('vue SSR — PromptTunerResult prompt panel, copy and completions', async () => {
  const html = await renderSfc('PromptTunerResult.vue', {
    optimizedPrompt: 'Summarize the document in exactly three sections.',
    completions: [
      { id: 'x1', label: 'Completion #9', text: 'First variant output.' },
      { id: 'x2', label: 'Completion #10', text: 'Second variant output.' },
    ],
    activeCompletionId: 'x2',
  });
  assert.ok(html.includes('data-prompt-tuner'), 'root hook');
  assert.ok(html.includes('data-tuner-prompt-panel'), 'prompt panel hook');
  assert.ok(html.includes('OPTIMIZED PROMPT'), 'prompt label');
  assert.ok(html.includes('Summarize the document in exactly three sections.'), 'prompt text');
  assert.ok(html.includes('data-tuner-copy'), 'copy hook');
  assert.ok(html.includes('COMPLETIONS'), 'completions label');
  assert.ok(html.includes('data-tuner-completion-select'), 'select hook');
  assert.ok(html.includes('Completion #10'), 'completion option');
  assert.ok(html.includes('Second variant output.'), 'active completion rendered');

  const defaults = await renderSfc('PromptTunerResult.vue', {});
  assert.ok(defaults.includes('Your optimized prompt will appear here.'), 'default prompt');
  assert.ok(defaults.includes('Completion #2'), 'default completions');
});
