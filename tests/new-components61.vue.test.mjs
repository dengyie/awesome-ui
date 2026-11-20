/**
 * v3.7.0 — Vue SSR regression tests
 * CreditBalanceCard, SpendTrendChart, TopUpBalanceDialog.
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
  const script = compileScript(descriptor, { id: 'n61' });
  const template = compileTemplate({
    id: 'n61',
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

test('vue SSR — CreditBalanceCard balance, plan badge and actions', async () => {
  const html = await renderSfc('CreditBalanceCard.vue', { balance: 6.68, currency: '$' });
  assert.ok(html.includes('data-credit-balance-card'));
  assert.ok(html.includes('data-credit-balance-value'));
  assert.ok(html.includes('$6.68'));
  assert.ok(html.includes('Current plan'));
  assert.ok(html.includes('bg-emerald-500'));
  assert.ok(html.includes('data-credit-balance-buy'));
  assert.ok(html.includes('Apply Coupon'));
  assert.ok(!html.includes('data-credit-balance-warning'));
});

test('vue SSR — CreditBalanceCard low-balance warning state', async () => {
  const html = await renderSfc('CreditBalanceCard.vue', { balance: 2.1, warnBelow: 5 });
  assert.ok(html.includes('data-credit-balance-warning'));
  assert.ok(html.includes('running low'));
  assert.ok(html.includes('bg-amber-500'));
});

test('vue SSR — SpendTrendChart bars, total and granularity switch', async () => {
  const html = await renderSfc('SpendTrendChart.vue', {
    unit: '$',
    points: {
      Daily: [
        { label: '2026-03-01', value: 4.2 },
        { label: '2026-03-02', value: 7.5 },
      ],
      Weekly: [{ label: '2026-W09', value: 11.7 }],
    },
  });
  assert.ok(html.includes('data-spend-trend-chart'));
  assert.ok(html.includes('$11.70'));
  assert.ok(html.includes('Daily'));
  assert.ok(html.includes('Weekly'));
  assert.ok(html.includes('data-spend-trend-granularity-option="Daily"'));
  assert.ok(html.includes('data-spend-trend-bar="2026-03-01"'));
  assert.ok(html.includes('aria-selected="true"'));
});

test('vue SSR — SpendTrendChart empty state', async () => {
  const html = await renderSfc('SpendTrendChart.vue', { points: {} });
  assert.ok(html.includes('No spend recorded'));
});

test('vue SSR — TopUpBalanceDialog trigger closed by default', async () => {
  const html = await renderSfc('TopUpBalanceDialog.vue', { balance: 6.68 });
  assert.ok(html.includes('data-topup-balance-dialog'));
  assert.ok(html.includes('data-topup-open'));
  assert.ok(html.includes('Top up balance'));
  assert.ok(!html.includes('data-topup-overlay'));
});

test('vue SSR — TopUpBalanceDialog fields when open', async () => {
  const html = await renderSfc('TopUpBalanceDialog.vue', {
    defaultOpen: true,
    balance: 6.68,
    billToOptions: ['Acme Inc.', 'Acme Ltd'],
  });
  assert.ok(html.includes('data-topup-overlay'));
  assert.ok(html.includes('data-topup-billto'));
  assert.ok(html.includes('Acme Ltd'));
  assert.ok(html.includes('data-topup-currency'));
  assert.ok(html.includes('data-topup-amount'));
  assert.ok(html.includes('data-topup-quick-amount="100"'));
  assert.ok(html.includes('$6.68'));
  assert.ok(html.includes('Confirm top-up'));
});
