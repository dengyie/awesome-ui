/**
 * v3.8.0 — Vue SSR regression tests
 * MetricLineChart, PaywallDialog, TrialExpiryNotice.
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
  const script = compileScript(descriptor, { id: 'n62' });
  const template = compileTemplate({
    id: 'n62',
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

test('vue SSR — MetricLineChart headline, delta and range pills', async () => {
  const html = await renderSfc('MetricLineChart.vue', {
    headline: 'Active users',
    value: '48.2k',
    delta: '12.4%',
    deltaTone: 'up',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [{ name: 'This week', color: '#8b5cf6', values: [20, 34, 28, 45, 52] }],
  });
  assert.ok(html.includes('data-metric-line-chart'));
  assert.ok(html.includes('Active users'));
  assert.ok(html.includes('48.2k'));
  assert.ok(html.includes('▲ 12.4%'));
  assert.ok(html.includes('data-metric-line-range-option="7d"'));
  assert.ok(html.includes('stroke="#8b5cf6"'));
});

test('vue SSR — MetricLineChart down delta and custom ranges', async () => {
  const html = await renderSfc('MetricLineChart.vue', {
    headline: 'Error rate',
    value: '0.8%',
    delta: '0.3%',
    deltaTone: 'down',
    ranges: ['1h', '24h', '7d'],
    defaultRange: '24h',
  });
  assert.ok(html.includes('▼ 0.3%'));
  assert.ok(html.includes('data-metric-line-range-option="24h"'));
});

test('vue SSR — PaywallDialog closed by default', async () => {
  const html = await renderSfc('PaywallDialog.vue', {});
  assert.ok(!html.includes('data-paywall-overlay'), 'closed dialog should not render overlay');
});

test('vue SSR — PaywallDialog open with cadence, plans and discount', async () => {
  const html = await renderSfc('PaywallDialog.vue', {
    defaultOpen: true,
    title: 'Upgrade to continue',
    discountBadge: '25% OFF',
    cadenceNote: { Yearly: '-25%' },
    cadencePrices: { pro: { Monthly: '$12', Yearly: '$9' } },
    plans: [
      { id: 'starter', name: 'Starter', price: 'Free', period: '', features: ['10 reports'] },
      { id: 'pro', name: 'Pro', price: '$12', period: '/mo', originalPrice: '$16', badge: 'Most popular', featured: true, features: ['Unlimited reports', 'Priority support'] },
    ],
  });
  assert.ok(html.includes('data-paywall-overlay'));
  assert.ok(html.includes('Upgrade to continue'));
  assert.ok(html.includes('data-paywall-discount'));
  assert.ok(html.includes('25% OFF'));
  assert.ok(html.includes('data-paywall-cadence-option="Yearly"'));
  assert.ok(html.includes('-25%'));
  assert.ok(html.includes('data-paywall-plan="pro"'));
  assert.ok(html.includes('$12'));
  assert.ok(html.includes('$16'));
  assert.ok(html.includes('Most popular'));
  assert.ok(html.includes('Maybe later'));
});

test('vue SSR — TrialExpiryNotice expiring tone', async () => {
  const html = await renderSfc('TrialExpiryNotice.vue', {
    planName: 'Pro',
    daysLeft: 7,
    expiresOn: 'Nov 28',
    losingFeatures: ['Custom reports', 'SSO'],
    keepingFeatures: ['Basic dashboards'],
  });
  assert.ok(html.includes('expires in 7 days'));
  assert.ok(html.includes('Deadline: Nov 28'));
  assert.ok(html.includes('data-trial-expiry-losing'));
  assert.ok(html.includes('Custom reports'));
  assert.ok(html.includes('data-trial-expiry-keeping'));
  assert.ok(html.includes('bg-amber-500'));
});

test('vue SSR — TrialExpiryNotice urgent tone and expired', async () => {
  const urgent = await renderSfc('TrialExpiryNotice.vue', { daysLeft: 2 });
  assert.ok(urgent.includes('expires in 2 days'));
  assert.ok(urgent.includes('bg-red-600'));
  const expired = await renderSfc('TrialExpiryNotice.vue', { daysLeft: 0 });
  assert.ok(expired.includes('has expired'));
});
