import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const uiIconSource = readFileSync(join(root, 'vanilla/UiIcon.js'), 'utf8')
  .replace(/^export default uiIcon;\s*$/m, '')
  .replace(/^export function uiIcon/m, 'function uiIcon');

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const attachSource = stripComponent('FileAttachmentList.js', 'FileAttachmentListElement');
const progressSource = stripComponent('StreamingProgressBar.js', 'StreamingProgressBarElement');
const emptySource = stripComponent('EmptyState.js', 'EmptyStateElement');

function mount(sources, exportName, tag, attrs = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    `${uiIconSource}\n${sources}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  const el = window.document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  window.document.body.appendChild(el);
  return { dom, window, el };
}

test('FileAttachmentList — renders files with icons/sizes, dispatches remove, escapes names', () => {
  const { el } = mount(attachSource, 'FileAttachmentListElement', 'file-attachment-list');
  el.files = [
    { id: 'a', name: 'screenshot.png', size: 204800, type: 'image/png' },
    { id: 'b', name: 'app.ts', size: 512 },
    { id: 'c', name: 'notes <img src=x onerror=alert(1)>.txt', size: 100 },
  ];

  assert.ok(el.innerHTML.includes('screenshot.png'), 'image file rendered');
  assert.ok(el.innerHTML.includes('200.0 KB'), 'size formatted to KB');
  assert.ok(el.innerHTML.includes('512 B'), 'small size formatted to B');
  assert.equal(el.querySelector('img'), null, 'filename escaped (no img node injected)');
  assert.ok(el.innerHTML.includes('&lt;img src=x'), 'filename entity-escaped');

  let removedId = null;
  el.addEventListener('remove', (e) => (removedId = e.detail.id));
  el.querySelectorAll('.file-remove')[1].click();
  assert.equal(removedId, 'b', 'remove event carries file id');

  el.files = [];
  assert.equal(el.innerHTML, '', 'empty file list renders nothing');
});

test('StreamingProgressBar — determinate value, clamping, indeterminate and status colors', () => {
  const { el } = mount(progressSource, 'StreamingProgressBarElement', 'streaming-progress-bar', {
    value: '42',
    label: 'Generating',
  });
  assert.ok(el.innerHTML.includes('42%'), 'percentage label rendered');
  assert.ok(el.innerHTML.includes('width: 42%'), 'bar width applied');
  assert.ok(el.querySelector('[role="progressbar"]').getAttribute('aria-valuenow') === '42', 'aria-valuenow set');
  assert.ok(el.innerHTML.includes('bg-indigo-500'), 'streaming color applied');

  el.setAttribute('value', '140');
  assert.ok(el.innerHTML.includes('width: 100%'), 'value clamped to 100');

  el.setAttribute('status', 'done');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'done color applied');

  const { el: ind } = mount(progressSource, 'StreamingProgressBarElement', 'streaming-progress-bar');
  assert.ok(ind.innerHTML.includes('animate-pulse'), 'indeterminate renders pulsing bar');
  assert.equal(ind.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'), null, 'no aria-valuenow when indeterminate');
});

test('EmptyState — renders icon/title/description and dispatches action', () => {
  const { el } = mount(emptySource, 'EmptyStateElement', 'empty-state', {
    icon: 'search',
    title: 'No results <b>bold</b>',
    description: 'Try a different query',
    'action-label': 'Clear filters',
  });

  assert.ok(el.innerHTML.includes('No results'), 'title rendered');
  assert.ok(!el.innerHTML.includes('<b>bold</b>'), 'title escaped (no XSS)');
  assert.ok(el.innerHTML.includes('Try a different query'), 'description rendered');
  assert.ok(el.querySelector('.empty-action'), 'action button rendered');

  let fired = false;
  el.addEventListener('action', () => (fired = true));
  el.querySelector('.empty-action').click();
  assert.ok(fired, 'action event dispatched');

  el.removeAttribute('action-label');
  assert.ok(!el.querySelector('.empty-action'), 'button removed when action-label cleared');
});
