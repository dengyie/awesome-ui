/**
 * v3.6.0 — Vue SSR regression tests
 * BillingAddressForm, UsageCreditsDonut, SeatBillingTable.
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
  const script = compileScript(descriptor, { id: 'n60' });
  const template = compileTemplate({
    id: 'n60',
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

test('vue SSR — BillingAddressForm fields and optional rows', async () => {
  const html = await renderSfc('BillingAddressForm.vue', {
    defaultValue: { address1: '77 Robinson Rd', city: 'Singapore', zip: '068896' },
  });
  assert.ok(html.includes('data-billing-address-form'));
  assert.ok(html.includes('data-billing-country'));
  assert.ok(html.includes('77 Robinson Rd'));
  assert.ok(html.includes('068896'));
  assert.ok(html.includes('optional'));
  assert.ok(html.includes('data-billing-address-submit'));
  assert.ok(html.includes('data-billing-address-hint'));
});

test('vue SSR — BillingAddressForm hides optional rows', async () => {
  const html = await renderSfc('BillingAddressForm.vue', { showOptional: false });
  assert.ok(html.includes('data-billing-address1'));
  assert.ok(!html.includes('data-billing-address2'));
  assert.ok(!html.includes('data-billing-state'));
});

test('vue SSR — UsageCreditsDonut arcs, legend and range', async () => {
  const html = await renderSfc('UsageCreditsDonut.vue', {
    slices: [
      { id: 'chat', label: 'Chat completions', value: 2.4 },
      { id: 'embed', label: 'Embeddings', value: 0.8 },
    ],
  });
  assert.ok(html.includes('data-usage-donut-chart'));
  assert.ok(html.includes('data-usage-donut-range'));
  assert.ok(html.includes('Last 7 days'));
  assert.ok(html.includes('data-usage-donut-slice="chat"'));
  assert.ok(html.includes('3.20 credits'));
  assert.ok((html.match(/<path /g) || []).length >= 2);
});

test('vue SSR — SeatBillingTable rows, status badge and total', async () => {
  const html = await renderSfc('SeatBillingTable.vue', {
    rows: [
      { id: 'u1', user: 'Ada Lovelace', email: 'ada@example.com', seat: 'Admin', cost: 30, usage: '1.2 credits', status: 'active' },
      { id: 'u2', user: 'Grace Hopper', seat: 'Member', cost: 20, status: 'invited' },
    ],
    period: 'Monthly · Nov 2026',
  });
  assert.ok(html.includes('data-seat-table'));
  assert.ok(html.includes('data-seat-row="u1"'));
  assert.ok(html.includes('Ada Lovelace'));
  assert.ok(html.includes('Invited'));
  assert.ok(html.includes('$30.00'));
  assert.ok(html.includes('Monthly · Nov 2026'));
  assert.ok(html.includes('2 billed seats'));
  assert.ok(html.includes('$50.00'));
  assert.ok(html.includes('data-seat-search'));
});
