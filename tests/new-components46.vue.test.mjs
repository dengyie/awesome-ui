/**
 * v1.46.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n46' });
  const template = compileTemplate({
    id: 'n46',
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

test('vue SSR — MonitorRunList toolbar, histogram and run rows', async () => {
  const html = await renderSfc('MonitorRunList.vue', {
    runs: [
      { id: 'r1', name: 'Product Performance Metrics', startedAt: 'Oct 14, 1:00 AM', latencyMs: 7000, ok: true },
      { id: 'r2', name: 'Slow draft', startedAt: 'Oct 13, 9:00 PM', latencyMs: 4287, ok: false },
    ],
    histogram: [
      { label: '13:00', value: 40 },
      { label: '14:00', value: 80 },
    ],
    ranges: ['24 hrs', '7 days'],
    activeRange: '7 days',
  });
  assert.ok(html.includes('data-monitor-run-list'), 'list hook');
  assert.ok(html.includes('data-monitor-filter'), 'filter hook');
  assert.ok(html.includes('Filter'), 'filter label');
  assert.ok(html.includes('data-monitor-range="24 hrs"'), 'range pill');
  assert.ok(html.includes('aria-pressed="true"'), 'active range pressed');
  assert.ok(html.includes('data-monitor-histogram'), 'histogram hook');
  assert.ok(html.includes('data-monitor-bar="14:00"'), 'bar hook');
  assert.ok(html.includes('data-monitor-run="r1"'), 'run row');
  assert.ok(html.includes('Product Performance Metrics'), 'run name');
  assert.ok(html.includes('data-monitor-run-time'), 'time hook');
  assert.ok(html.includes('Oct 14, 1:00 AM'), 'time text');
  assert.ok(html.includes('data-monitor-run-latency'), 'latency hook');
  assert.ok(html.includes('7 s'), 'latency formatted seconds');

  const defaults = await renderSfc('MonitorRunList.vue', {});
  assert.ok(defaults.includes('6 months'), 'default ranges');
  assert.ok(defaults.includes('Q2 Financial Overview'), 'default runs');
});

test('vue SSR — EvalTurnBuilder role badges, mock tags and add row', async () => {
  const html = await renderSfc('EvalTurnBuilder.vue', {
    turns: [
      { id: 't1', role: 'system', turn: 0, content: 'You are Riley.', mock: false },
      { id: 't2', role: 'user', turn: 1, content: 'Hi, can I reschedule?', mock: true },
      { id: 't3', role: 'tool', turn: 2, content: 'reschedule_appointment → success', mock: true },
    ],
  });
  assert.ok(html.includes('data-eval-turn-builder'), 'builder hook');
  assert.ok(html.includes('data-eval-turn="t1"'), 'turn hook');
  assert.ok(html.includes('data-eval-role="system"'), 'role attr');
  assert.ok(html.includes('data-eval-turn-badge="system"'), 'badge hook');
  assert.ok(html.includes('SYSTEM'), 'system label');
  assert.ok(html.includes('TOOL RESPONSE'), 'tool label');
  assert.ok(html.includes('data-eval-turn-mock'), 'mock tag');
  assert.ok(html.includes('Turn 1'), 'turn number');
  assert.ok(html.includes('data-eval-turn-content'), 'content hook');
  assert.ok(html.includes('You are Riley.'), 'content text');
  assert.ok(html.includes('data-eval-turn-remove'), 'remove hook');
  assert.ok(html.includes('data-eval-add-turn="user"'), 'add user hook');
  assert.ok(html.includes('data-eval-add-turn="tool"'), 'add tool hook');
  assert.ok(html.includes('+ Add Tool Response'), 'add tool label');

  const noMock = await renderSfc('EvalTurnBuilder.vue', {
    turns: [{ id: 'x', role: 'user', turn: 1, content: 'q' }],
  });
  assert.ok(!noMock.includes('data-eval-turn-mock'), 'no mock tag when mock falsy');
});

test('vue SSR — AgentSessionTimeline header, strip, steps and requests', async () => {
  const html = await renderSfc('AgentSessionTimeline.vue', {
    steps: [
      { id: 's1', kind: 'prompt', label: 'Summarize top 5', at: '0:00' },
      { id: 's2', kind: 'tool', label: 'Fetch API', at: '0:14' },
    ],
    requests: [
      { id: 'q1', url: 'techcrunch.com', method: 'HTTP probe', status: 'HTTP 200', duration: '0:03', ok: true },
      { id: 'q2', url: 'techcrunch.com/rate-limited', status: 'HTTP 429', duration: '0:50', ok: false },
    ],
  });
  assert.ok(html.includes('data-agent-session-timeline'), 'timeline hook');
  assert.ok(html.includes('data-agent-session-title'), 'title hook');
  assert.ok(html.includes('techcrunch.com and summarize'), 'default title');
  assert.ok(html.includes('data-agent-session-status'), 'status hook');
  assert.ok(html.includes('Complete'), 'status text');
  assert.ok(html.includes('data-agent-session-duration'), 'duration hook');
  assert.ok(html.includes('1m 11s'), 'duration text');
  assert.ok(html.includes('data-agent-session-steps-count'), 'steps count hook');
  assert.ok(html.includes('data-agent-session-strip'), 'strip hook');
  assert.ok(html.includes('data-agent-step="s1"'), 'step hook');
  assert.ok(html.includes('data-agent-step-badge="prompt"'), 'prompt badge');
  assert.ok(html.includes('data-agent-step-badge="tool"'), 'tool badge');
  assert.ok(html.includes('Fetch API'), 'step label');
  assert.ok(html.includes('data-agent-request="q1"'), 'request hook');
  assert.ok(html.includes('data-agent-request-url'), 'request url hook');
  assert.ok(html.includes('HTTP 429'), 'failing status');
  assert.ok(html.includes('text-red-500'), 'failing status tone');
});
