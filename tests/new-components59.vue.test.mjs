/**
 * v3.5.0 — Vue SSR regression tests
 * AgentScheduleEditor, AgentGuardrailViolationCard, AgentModelFallbackList.
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
  const script = compileScript(descriptor, { id: 'n59' });
  const template = compileTemplate({
    id: 'n59',
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

test('vue SSR — AgentScheduleEditor pills and cron', async () => {
  const html = await renderSfc('AgentScheduleEditor.vue', {
    frequencies: [
      { id: 'daily', label: 'Daily', expression: '0 9 * * *' },
      { id: 'weekly', label: 'Weekly', expression: '0 9 * * 1' },
    ],
    activeId: 'daily',
    nextRun: 'Tomorrow at 09:00',
  });
  assert.ok(html.includes('data-schedule-frequency="daily"'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('0 9 * * *'));
  assert.ok(html.includes('data-schedule-save'));
});

test('vue SSR — AgentGuardrailViolationCard severity and match', async () => {
  const html = await renderSfc('AgentGuardrailViolationCard.vue', {
    rule: 'PII disclosure',
    severity: 'high',
    runId: 'run_7c2a',
    input: 'User email is jane@example.com.',
    match: 'jane@example.com',
  });
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('High severity'));
  assert.ok(html.includes('data-violation-match'));
  assert.ok(html.includes('jane@example.com'));
});

test('vue SSR — AgentModelFallbackList rows and primary', async () => {
  const html = await renderSfc('AgentModelFallbackList.vue', {
    entries: [
      { id: 'm1', model: 'the-model-4-5', health: 'healthy', condition: 'primary' },
      { id: 'm2', model: 'gpt-5-2', health: 'degraded', condition: 'on rate limit' },
    ],
  });
  assert.ok(html.includes('data-fallback-row="m1"'));
  assert.ok(html.includes('Primary'));
  assert.ok(html.includes('on rate limit'));
  assert.ok(html.includes('data-fallback-up'));
});
