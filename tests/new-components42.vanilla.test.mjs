/**
 * jsdom tests for the v1.42.0 vanilla components
 * (FalRunCard, ImageGenMetaBar, GammaImageDetail).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
const { window } = dom;

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const instantiate = (file, className) => {
  const src = stripComponent(file, className);
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    'MutationObserver',
    `${src}\nreturn ${className};`
  );
  return factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.MutationObserver);
};

test('vanilla FalRunCard — attribute rendering and action events', () => {
  const El = instantiate('FalRunCard.js', 'FalRunCardElement');
  const el = new El();
  el.setAttribute('prompt', 'a calm, morning, beach scenery');
  el.setAttribute('cost', '$0.241');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-fal-run-card]'), 'card rendered');
  assert.ok(el.querySelector('[data-fal-run-type]').textContent.includes('Text To Image'), 'default type');
  assert.ok(el.querySelector('[data-fal-run-models]').textContent.includes('4 models'), 'default models');
  assert.ok(el.querySelector('[data-fal-run-prompt]').textContent.includes('beach scenery'), 'prompt text');
  assert.equal(el.querySelector('[data-fal-run-aspect]').textContent, '1:1', 'default aspect');
  assert.equal(el.querySelector('[data-fal-run-cost]').textContent, '$0.241', 'cost text');
  assert.ok(el.querySelector('[data-fal-run-cost]').className.includes('text-emerald-500'), 'green cost tone');

  let fired = null;
  el.addEventListener('duplicate', () => { fired = 'duplicate'; });
  el.querySelector('[data-fal-run-duplicate]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(fired, 'duplicate', 'duplicate event');

  el.addEventListener('rerun', () => { fired = 'rerun'; });
  el.querySelector('[data-fal-run-rerun]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(fired, 'rerun', 'rerun event');

  el.addEventListener('delete', () => { fired = 'delete'; });
  el.querySelector('[data-fal-run-delete]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(fired, 'delete', 'delete event');

  el.costTone = 'zinc';
  assert.ok(!el.querySelector('[data-fal-run-cost]').className.includes('text-emerald-500'), 'zinc tone on property set');
  el.prompt = 'sunset over ocean cliffs';
  assert.ok(el.querySelector('[data-fal-run-prompt]').textContent.includes('ocean cliffs'), 'prompt re-rendered');
});

test('vanilla ImageGenMetaBar — attribute defaults and overrides', () => {
  const El = instantiate('ImageGenMetaBar.js', 'ImageGenMetaBarElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-image-gen-meta]'), 'meta rendered');
  assert.equal(el.querySelector('[data-image-gen-model]').textContent, 'openai/gpt-image-2', 'default model');
  assert.equal(el.querySelector('[data-image-gen-job]').textContent, '# 019f1ba4', 'default job id');
  assert.equal(el.querySelector('[data-image-gen-duration]').textContent, '169.0s', 'default duration');
  assert.equal(el.querySelector('[data-image-gen-cost]').textContent, '$ 0.211', 'default cost');

  el.model = 'krea/v2/large/text-to-image';
  el.jobId = '# 019f1ba9';
  assert.equal(el.querySelector('[data-image-gen-model]').textContent, 'krea/v2/large/text-to-image', 'model overridden');
  assert.equal(el.querySelector('[data-image-gen-job]').textContent, '# 019f1ba9', 'job overridden');

  const el2 = new El();
  el2.setAttribute('model', 'xai/grok-imagine-image');
  el2.setAttribute('duration', '—');
  window.document.body.appendChild(el2);
  assert.equal(el2.querySelector('[data-image-gen-model]').textContent, 'xai/grok-imagine-image', 'attr model respected');
  assert.equal(el2.querySelector('[data-image-gen-duration]').textContent, '—', 'attr duration respected');
});

test('vanilla GammaImageDetail — toolbar events, liked toggle and preview', () => {
  const El = instantiate('GammaImageDetail.js', 'GammaImageDetailElement');
  const el = new El();
  el.setAttribute('prompt', 'Generate the following image: carousel slide.');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-gamma-image-detail]'), 'detail rendered');
  assert.ok(el.querySelector('[data-gamma-detail-preview]').innerHTML.includes('🖼'), 'placeholder without preview');
  assert.equal(el.querySelector('[data-gamma-detail-like]').getAttribute('aria-pressed'), 'false', 'not liked by default');

  const fired = [];
  ['download', 'zoom', 'delete', 'like', 'dislike', 'close'].forEach((name) => {
    el.addEventListener(name, () => { fired.push(name); });
  });
  el.querySelector('[data-gamma-detail-download]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-gamma-detail-zoom]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-gamma-detail-delete]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-gamma-detail-like]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-gamma-detail-dislike]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-gamma-detail-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.deepEqual(fired, ['download', 'zoom', 'delete', 'like', 'dislike', 'close'], 'all toolbar events in order');

  el.liked = true;
  assert.equal(el.querySelector('[data-gamma-detail-like]').getAttribute('aria-pressed'), 'true', 'liked toggled via property');
  assert.ok(el.querySelector('[data-gamma-detail-like]').className.includes('text-rose-500'), 'liked tone applied');

  el.preview = 'https://example.com/cat.png';
  assert.ok(el.querySelector('[data-gamma-detail-preview]').innerHTML.includes('img'), 'img rendered after preview set');
  assert.ok(el.querySelector('[data-gamma-detail-prompt]').textContent.includes('carousel slide.'), 'prompt text');
});
