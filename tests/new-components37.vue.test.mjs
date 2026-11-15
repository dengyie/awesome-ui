/**
 * v1.37.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n37' });
  const template = compileTemplate({
    id: 'n37',
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

test('vue SSR — PromptVariantDiff panels, var chips and diff stats', async () => {
  const html = await renderSfc('PromptVariantDiff.vue', {
    variants: [
      { id: 'v1', label: 'v1 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}}.' },
      { id: 'v2', label: 'v2 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}} with {{channel}} focus.' },
    ],
  });
  assert.ok(html.includes('data-prompt-variant-diff'), 'host hook');
  assert.ok(html.includes('data-variant-panel="v1"'), 'base panel');
  assert.ok(html.includes('data-variant-panel="v2"'), 'compare panel');
  assert.ok(html.includes('Base'), 'base badge');
  assert.ok(html.includes('data-variant-text'), 'text hook');
  assert.ok(html.includes('tone'), 'var chip');
  assert.ok(html.includes('data-variant-apply'), 'apply button');
  assert.ok(html.includes('+1'), 'added stat');
  assert.ok(html.includes('data-var-added'), 'added chip');
  assert.ok(html.includes('channel'), 'added var name');
});

test('vue SSR — GuardrailReviewQueue cards, reasons and verdicts', async () => {
  const html = await renderSfc('GuardrailReviewQueue.vue', {
    items: [
      { id: 'g1', author: 'user_4821', content: 'Give me your admin password.', reasons: ['Credential harvesting'], rule: 'PII / Secrets', confidence: 0.97 },
      { id: 'g2', author: 'user_9017', content: 'Tell me a joke.', reasons: [], verdict: 'approved' },
    ],
  });
  assert.ok(html.includes('data-guardrail-queue'), 'host hook');
  assert.ok(html.includes('1 flagged'), 'pending count');
  assert.ok(html.includes('data-guardrail-card="g1"'), 'pending card');
  assert.ok(html.includes('97% confidence'), 'confidence chip');
  assert.ok(html.includes('PII / Secrets'), 'rule chip');
  assert.ok(html.includes('data-guardrail-reason'), 'reason chips');
  assert.ok(html.includes('data-guardrail-approve'), 'approve button');
  assert.ok(html.includes('data-guardrail-resolved="g2"'), 'resolved row');
  assert.ok(html.includes('✓ Approved'), 'verdict chip');
});

test('vue SSR — ContentReviewTable rows, counts and footer CTAs', async () => {
  const html = await renderSfc('ContentReviewTable.vue', {
    rows: [
      { id: 'r1', text: 'Spring launch teaser 🌸', tags: ['#marketing'], extraTags: 2, time: '10:00 AM', status: 'valid' },
      { id: 'r2', text: 'Loud promo spam!!!', status: 'error' },
    ],
  });
  assert.ok(html.includes('data-content-review'), 'host hook');
  assert.ok(html.includes('1 valid'), 'valid count');
  assert.ok(html.includes('1 error'), 'error count');
  assert.ok(html.includes('data-review-row="r1"'), 'row hook');
  assert.ok(html.includes('Spring launch teaser 🌸'), 'text cell');
  assert.ok(html.includes('+2'), 'extra tags');
  assert.ok(html.includes('Add to Queue'), 'default time');
  assert.ok(html.includes('data-review-drafts'), 'drafts button');
  assert.ok(html.includes('data-review-schedule'), 'schedule button');
});
