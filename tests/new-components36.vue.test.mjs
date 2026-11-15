/**
 * v1.36.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n36' });
  const template = compileTemplate({
    id: 'n36',
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

test('vue SSR — TraceSpanWaterfall rows, offsets and legend', async () => {
  const html = await renderSfc('TraceSpanWaterfall.vue', {
    spans: [
      { id: 's1', name: 'planner', startMs: 0, durationMs: 1200, depth: 0, kind: 'llm', costUsd: 0.002 },
      { id: 's2', name: 'web_search', startMs: 1200, durationMs: 300, depth: 1, kind: 'tool' },
    ],
  });
  assert.ok(html.includes('data-trace-waterfall'), 'host hook');
  assert.ok(html.includes('data-trace-row="s1"'), 'row hook');
  assert.ok(html.includes('data-trace-bar'), 'bar hook');
  assert.ok(html.includes('planner'), 'span name');
  assert.ok(html.includes('1.2s'), 'duration');
  assert.ok(html.includes('2 spans'), 'count');
  assert.ok(html.includes('Retrieval'), 'legend');
});

test('vue SSR — EvalScoreTable runs, criteria and add button', async () => {
  const html = await renderSfc('EvalScoreTable.vue', {
    runs: [
      { id: 'r1', name: 'Trip Planning.csv', score: 100, grader: 'String check grader' },
      { id: 'r2', name: 'Summary set', score: 42, grader: 'LLM grader', tone: 'warn' },
    ],
    criteria: [{ id: 'c1', title: 'String check grader', description: 'Check matches.' }],
    showAddCriteria: true,
  });
  assert.ok(html.includes('data-eval-score-table'), 'host hook');
  assert.ok(html.includes('data-eval-run="r1"'), 'run hook');
  assert.ok(html.includes('100%'), 'score');
  assert.ok(html.includes('bg-amber-500'), 'warn bar');
  assert.ok(html.includes('data-eval-criterion="c1"'), 'criteria card');
  assert.ok(html.includes('data-eval-add-criteria'), 'add button');
  assert.ok(html.includes('2 runs'), 'run count');
});

test('vue SSR — TokenCostBreakdown segments, legend and usage rows', async () => {
  const html = await renderSfc('TokenCostBreakdown.vue', {
    segments: [
      { id: 'agent', label: 'Custom Agent', amountUsd: 32.05 },
      { id: 'opt', label: 'SuperOptimizer', amountUsd: 1.94 },
    ],
    usageRows: [{ id: 'in', label: 'Input Tokens', tokens: 37654, percent: 13 }],
    spendUsed: 34.49,
    spendTotal: 55,
  });
  assert.ok(html.includes('data-token-cost'), 'host hook');
  assert.ok(html.includes('data-token-cost-segment="agent"'), 'segment hook');
  assert.ok(html.includes('Custom Agent'), 'legend label');
  assert.ok(html.includes('$32.05'), 'segment amount');
  assert.ok(html.includes('$34.49 of $55.00'), 'spend header');
  assert.ok(html.includes('data-token-usage-row="in"'), 'usage row');
  assert.ok(html.includes('37,654 (13%)'), 'token formatted');
});
