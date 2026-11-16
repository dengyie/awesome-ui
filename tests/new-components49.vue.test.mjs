/**
 * v2.2.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n49' });
  const template = compileTemplate({
    id: 'n49',
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

test('vue SSR — TaskDetailPanel header, fields, actions and activity', async () => {
  const html = await renderSfc('TaskDetailPanel.vue', {
    type: 'Task',
    title: 'Ship checkout redesign',
    statusLabel: 'IN REVIEW',
    fields: [
      { label: 'Assignees', value: 'A', icon: 'person' },
      { label: 'Tags', value: 'checkout', icon: 'tag', tag: true },
    ],
    actions: [{ id: 'subtask', icon: 'subtask', label: 'Add subtask' }],
    activity: [{ id: 'a1', actor: 'Mango', text: 'changed status', time: '2h ago' }],
  });
  assert.ok(html.includes('data-task-panel'), 'root hook');
  assert.ok(html.includes('data-task-main'), 'main column');
  assert.ok(html.includes('data-task-type'), 'type pill');
  assert.ok(html.includes('Ship checkout redesign'), 'title text');
  assert.ok(html.includes('data-task-ai-bar'), 'ai bar hook');
  assert.ok(html.includes('create a summary'), 'default ai action');
  assert.ok(html.includes('data-task-fields'), 'fields grid');
  assert.ok(html.includes('data-task-field="Status"'), 'status field');
  assert.ok(html.includes('IN REVIEW'), 'status label');
  assert.ok(html.includes('data-task-field-value="checkout"'), 'tag value');
  assert.ok(html.includes('bg-violet-100'), 'tag tone');
  assert.ok(html.includes('data-task-description'), 'description hook');
  assert.ok(html.includes('data-task-action="subtask"'), 'action hook');
  assert.ok(html.includes('data-task-activity-item="a1"'), 'activity item');
  assert.ok(html.includes('data-task-comment-input'), 'comment input');
  assert.ok(html.includes('data-task-comment-send'), 'comment send');

  const defaults = await renderSfc('TaskDetailPanel.vue', {});
  assert.ok(defaults.includes('Complete Dashboard Feature Screens'), 'default title');
  assert.ok(defaults.includes('IN DEVELOPMENT'), 'default status');
  assert.ok(defaults.includes('dashboard'), 'default tag');
});

test('vue SSR — DeliveryTrackingPanel map, stepper, courier and order', async () => {
  const html = await renderSfc('DeliveryTrackingPanel.vue', {
    title: 'Heading to Alex Kim',
    eta: '9:05 - 9:12 AM',
    steps: [
      { id: 'store', icon: 'store', label: 'Store', state: 'done' },
      { id: 'delivered', icon: 'home', label: 'Delivered', state: 'pending' },
    ],
    courierName: 'CHRIS P',
    items: [{ id: 'i1', name: 'Burger', quantity: '1×', price: '$9.99' }],
  });
  assert.ok(html.includes('data-delivery-panel'), 'root hook');
  assert.ok(html.includes('data-delivery-map'), 'map hook');
  assert.ok(html.includes('data-delivery-pin'), 'courier pin');
  assert.ok(html.includes('data-delivery-pin-destination'), 'destination pin');
  assert.ok(html.includes('Heading to Alex Kim'), 'title text');
  assert.ok(html.includes('9:05 - 9:12 AM'), 'eta text');
  assert.ok(html.includes('data-delivery-step="store"'), 'step hook');
  assert.ok(html.includes('data-delivery-step-state="pending"'), 'pending state');
  assert.ok(html.includes('CHRIS P'), 'courier name');
  assert.ok(html.includes('data-delivery-call'), 'call button');
  assert.ok(html.includes('data-delivery-message'), 'message button');
  assert.ok(html.includes('data-delivery-details-toggle'), 'details toggle');
  assert.ok(html.includes('data-delivery-item="i1"'), 'item hook');
  assert.ok(html.includes('$9.99'), 'item price');
  assert.ok(html.includes('data-delivery-gift'), 'gift block');
  assert.ok(html.includes('data-delivery-copy-link'), 'copy link');
  assert.ok(html.includes('data-delivery-text-link'), 'text link');

  const defaults = await renderSfc('DeliveryTrackingPanel.vue', {});
  assert.ok(defaults.includes('Heading to Sam Lee'), 'default title');
  assert.ok(defaults.includes('8:35 - 8:41 AM'), 'default eta');
});

test('vue SSR — MapPropertyCard pins and preview card', async () => {
  const html = await renderSfc('MapPropertyCard.vue', {
    pins: [
      { id: 'q1', price: '$99', x: 30, y: 40 },
      { id: 'q2', price: '$120', x: 60, y: 55 },
    ],
    activePinId: 'q2',
    card: {
      title: 'Loft in Ubud',
      rating: '4.88',
      reviews: 12,
      subtitle: 'Jungle view loft',
      price: '$120 for 2 nights',
      dates: 'Jul 1 – 3',
    },
  });
  assert.ok(html.includes('data-mappin-card'), 'root hook');
  assert.ok(html.includes('data-mappin-pin="q1"'), 'first pin');
  assert.ok(html.includes('data-mappin-price="$99"'), 'pin price');
  assert.ok(html.includes('data-mappin-preview'), 'preview card');
  assert.ok(html.includes('data-mappin-like'), 'like button');
  assert.ok(html.includes('data-mappin-close'), 'close button');
  assert.ok(html.includes('data-mappin-dots'), 'image dots');
  assert.ok(html.includes('Loft in Ubud'), 'card title');
  assert.ok(html.includes('data-mappin-rating'), 'rating hook');
  assert.ok(html.includes('4.88 (12)'), 'rating text');
  assert.ok(html.includes('Jungle view loft'), 'subtitle');
  assert.ok(html.includes('$120 for 2 nights'), 'price text');
  assert.ok(html.includes('Jul 1 – 3'), 'dates text');
  assert.ok(html.includes('data-mappin-zoom'), 'zoom controls');

  const defaults = await renderSfc('MapPropertyCard.vue', {});
  assert.ok(defaults.includes('data-mappin-pin="p2"'), 'default pins');
  assert.ok(defaults.includes('Home in Kecamatan Denpasar'), 'default card title');
});
