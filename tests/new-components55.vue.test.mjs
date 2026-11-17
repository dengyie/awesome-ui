/**
 * v3.1.0 — Vue SSR regression tests
 * InvoiceHistoryTable, UsagePricingBreakdown, CancelRetentionFlow,
 * WebhookConfigPanel. Interactive behavior is covered by the vanilla
 * jsdom suite (new-components55.vanilla.test.mjs).
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
  const script = compileScript(descriptor, { id: 'n55' });
  const template = compileTemplate({
    id: 'n55',
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

test('vue SSR — InvoiceHistoryTable rows, badges and paid total', async () => {
  const html = await renderSfc('InvoiceHistoryTable.vue', {
    invoices: [
      { id: 'INV-1', period: 'November 2026', amount: '100.00', status: 'paid', date: 'Nov 1, 2026' },
      { id: 'INV-2', period: 'October 2026', amount: '50.00', status: 'pending', date: 'Oct 1, 2026' },
    ],
    currency: 'USD',
  });
  assert.ok(html.includes('data-invoice-row'), 'row hooks');
  assert.ok(html.includes('November 2026'));
  assert.ok(html.includes('data-invoice-download'), 'download button');
  assert.ok(html.includes('Paid total'));
});

test('vue SSR — UsagePricingBreakdown tiers and estimated total', async () => {
  const html = await renderSfc('UsagePricingBreakdown.vue', {
    tiers: [
      { range: 'Tier A', usage: 1000, unitPrice: 0.01, unit: 'calls' },
      { range: 'Tier B', usage: 0, unitPrice: 0.005 },
    ],
  });
  assert.ok(html.includes('data-pricing-tier'), 'tier hooks');
  assert.ok(html.includes('Tier A'));
  assert.ok(html.includes('Estimated total'));
});

test('vue SSR — CancelRetentionFlow reasons and step indicator', async () => {
  const html = await renderSfc('CancelRetentionFlow.vue', {});
  assert.ok(html.includes('data-cancel-flow'), 'host hook');
  assert.ok(html.includes('Too expensive'));
  assert.ok(html.includes('Step 1 / 2'));
});

test('vue SSR — WebhookConfigPanel endpoints and events legend', async () => {
  const html = await renderSfc('WebhookConfigPanel.vue', {});
  assert.ok(html.includes('data-webhook-endpoint'), 'endpoint hooks');
  assert.ok(html.includes('data-webhook-test'), 'test button');
  assert.ok(html.includes('Available events'));
});
