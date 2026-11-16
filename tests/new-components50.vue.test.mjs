/**
 * v2.3.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n50' });
  const template = compileTemplate({
    id: 'n50',
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

test('vue SSR — ApiReferenceViewer definition, responses and code panel', async () => {
  const html = await renderSfc('ApiReferenceViewer.vue', {
    title: 'List all charges',
    params: [{ name: 'limit', type: 'integer', required: false, description: 'Max items' }],
    responses: [
      { status: '200', tone: 'success', label: 'OK', schema: 'Charge[]', body: '[]' },
      { status: '402', tone: 'error', label: 'Card declined', schema: 'Error', body: '{}' },
    ],
  });
  assert.ok(html.includes('data-api-viewer'), 'root hook');
  assert.ok(html.includes('data-api-definition'), 'definition hook');
  assert.ok(html.includes('List all charges'), 'custom title');
  assert.ok(html.includes('data-api-method'), 'method badge');
  assert.ok(html.includes('data-api-endpoint'), 'endpoint hook');
  assert.ok(html.includes('data-api-params-title'), 'params title');
  assert.ok(html.includes('data-api-param="limit"'), 'param hook');
  assert.ok(html.includes('optional'), 'optional label');
  assert.ok(html.includes('data-api-response="200"'), '200 response');
  assert.ok(html.includes('data-api-response="402"'), '402 response');
  assert.ok(html.includes('data-api-response-toggle'), 'response toggle');
  assert.ok(html.includes('data-api-code-panel'), 'code panel');
  assert.ok(html.includes('data-api-language-select'), 'language select');
  assert.ok(html.includes('data-api-sample'), 'sample block');
  assert.ok(html.includes('data-api-test'), 'test button');
  assert.ok(html.includes('data-api-json'), 'json block');

  const defaults = await renderSfc('ApiReferenceViewer.vue', {});
  assert.ok(defaults.includes('List all pets'), 'default title');
  assert.ok(defaults.includes('petstore.example.com'), 'default endpoint');
  assert.ok(defaults.includes('data-api-response-schema'), 'default 200 open');
  assert.ok(defaults.includes('Fluffy'), 'default json body');
});

test('vue SSR — WeekCalendarGrid toolbar, gutter, events and now line', async () => {
  const html = await renderSfc('WeekCalendarGrid.vue', {
    days: [
      { id: 'mon', label: 'Mon', date: '16' },
      { id: 'tue', label: 'Tue', date: '17' },
    ],
    events: [
      { id: 'e1', dayId: 'mon', title: 'Standup', start: 9, end: 10, tone: 'solid', color: 'green' },
      { id: 'e2', dayId: 'tue', title: 'Focus Time', start: 10, end: 12, tone: 'dashed', color: 'blue' },
    ],
  });
  assert.ok(html.includes('data-week-grid'), 'root hook');
  assert.ok(html.includes('data-week-toolbar'), 'toolbar hook');
  assert.ok(html.includes('data-week-view="day"'), 'day toggle');
  assert.ok(html.includes('data-week-view="week"'), 'week toggle');
  assert.ok(html.includes('data-week-timezone'), 'timezone hook');
  assert.ok(html.includes('Find time'), 'find time button');
  assert.ok(html.includes('data-week-composer'), 'composer input');
  assert.ok(html.includes('data-week-day="mon"'), 'day header');
  assert.ok(html.includes('data-week-gutter'), 'gutter hook');
  assert.ok(html.includes('data-week-column="mon"'), 'column hook');
  assert.ok(html.includes('data-week-event="e1"'), 'event block');
  assert.ok(html.includes('Standup'), 'event title');
  assert.ok(html.includes('border-dashed'), 'dashed event tone');
  assert.ok(html.includes('data-week-now'), 'current-time line');

  const defaults = await renderSfc('WeekCalendarGrid.vue', {});
  assert.ok(defaults.includes('Alex // Sam'), 'default event');
  assert.ok(defaults.includes('data-week-day="fri"'), 'default five days');
});

test('vue SSR — VideoProjectSettings chapters panel, form and thumbnails', async () => {
  const html = await renderSfc('VideoProjectSettings.vue', {
    chapters: [{ id: 'c1', label: 'Intro', timestamp: '0:00' }],
    titleValue: 'Product launch teaser',
    storageUsed: '64MB',
  });
  assert.ok(html.includes('data-video-settings'), 'root hook');
  assert.ok(html.includes('data-video-chapters'), 'chapters panel');
  assert.ok(html.includes('Chapters'), 'panel title');
  assert.ok(html.includes('data-video-chapter="c1"'), 'chapter item');
  assert.ok(html.includes('Intro'), 'chapter label');
  assert.ok(html.includes('data-video-add-chapter'), 'add chapter button');
  assert.ok(html.includes('Add a chapter'), 'add chapter label');
  assert.ok(html.includes('Product launch teaser'), 'custom title value');
  assert.ok(html.includes('data-video-title-input'), 'title input');
  assert.ok(html.includes('data-video-description-input'), 'description textarea');
  assert.ok(html.includes('data-video-thumbnails'), 'thumbnail row');
  assert.ok(html.includes('data-video-thumbnail="t1"'), 'first thumbnail');
  assert.ok(html.includes('64MB'), 'custom storage');
  assert.ok(html.includes('data-video-storage-badge'), 'storage badge');

  const defaults = await renderSfc('VideoProjectSettings.vue', {});
  assert.ok(defaults.includes('Video project'), 'default title');
  assert.ok(defaults.includes('Add chapters so your viewers'), 'empty state text');
  assert.ok(defaults.includes('31MB'), 'default storage');
});

test('vue SSR — EventStreamPanel list, metadata and details JSON', async () => {
  const html = await renderSfc('EventStreamPanel.vue', {
    events: [
      {
        id: 'ev1',
        name: 'user.updated',
        date: 'Nov 14, 2026 3:12 PM',
        metadata: [{ label: 'User', value: 'Sama Lee' }],
        details: '{\n  "event": "user.updated"\n}',
      },
    ],
  });
  assert.ok(html.includes('data-stream-panel'), 'root hook');
  assert.ok(html.includes('data-stream-list'), 'list hook');
  assert.ok(html.includes('data-stream-filter'), 'filter input');
  assert.ok(html.includes('Filter by event name'), 'filter placeholder');
  assert.ok(html.includes('data-stream-columns'), 'column headers');
  assert.ok(html.includes('data-stream-event="ev1"'), 'event row');
  assert.ok(html.includes('user.updated'), 'event name');
  assert.ok(html.includes('data-stream-details'), 'details column');
  assert.ok(html.includes('data-stream-metadata-title'), 'metadata title');
  assert.ok(html.includes('Sama Lee'), 'metadata value');
  assert.ok(html.includes('data-stream-view-event'), 'view event button');
  assert.ok(html.includes('data-stream-details-title'), 'details title');
  assert.ok(html.includes('data-stream-json'), 'json block');
  assert.ok(html.includes('data-stream-json-lines'), 'line numbers');
  assert.ok(html.includes('data-stream-pager'), 'pager');
  assert.ok(html.includes('Previous'), 'pager previous');

  const defaults = await renderSfc('EventStreamPanel.vue', {});
  assert.ok(defaults.includes('organization_membership.updated'), 'default event');
  assert.ok(defaults.includes('session.created'), 'default event 2');
});
