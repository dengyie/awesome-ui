/**
 * jsdom tests for the v1.41.0 vanilla components
 * (AiNoteAnswer, AudioNotePlayer, ImageActionMenu).
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

test('vanilla AiNoteAnswer — play/copy/source events, sources toggle', () => {
  const El = instantiate('AiNoteAnswer.js', 'AiNoteAnswerElement');
  const el = new El();
  el.setAttribute(
    'sources',
    JSON.stringify(['Product design sync: shorten onboarding', 'UX review highlights'])
  );
  el.setAttribute('answer', 'Consider simplifying navigation and reducing friction.');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-note-answer-card]'), 'card rendered');
  assert.ok(el.querySelector('[data-note-answer-play]'), 'play button');
  assert.ok(el.querySelector('[data-note-answer-waveform]'), 'waveform rendered');
  assert.ok(el.querySelector('[data-note-answer-question-text]').textContent.includes('What improvements'), 'default question');
  assert.ok(el.querySelector('[data-note-answer-text]').textContent.includes('simplifying navigation'), 'answer text');
  assert.equal(el.querySelectorAll('[data-note-answer-source]').length, 2, 'two source links');
  assert.ok(el.querySelector('[data-note-answer-sources]').textContent.includes('Other sources'), 'sources label');
  assert.ok(el.querySelector('[data-note-answer-copy]'), 'copy CTA');

  let played = false;
  let copied = null;
  let sourceClicked = null;
  el.addEventListener('play', () => { played = true; });
  el.addEventListener('copy', (e) => { copied = e.detail.answer; });
  el.addEventListener('source-click', (e) => { sourceClicked = e.detail.source; });

  el.querySelector('[data-note-answer-play]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(played, 'play event');

  el.querySelector('[data-note-answer-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copied && copied.includes('simplifying navigation'), 'copy event detail answer');

  el.querySelector('[data-note-answer-source]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(sourceClicked && sourceClicked.includes('Product design sync'), 'source-click event detail source');

  el.sources = [];
  assert.equal(el.querySelectorAll('[data-note-answer-source]').length, 0, 'sources cleared on property set');
  assert.equal(el.querySelector('[data-note-answer-sources]'), null, 'sources block hidden when empty');
});

test('vanilla AudioNotePlayer — toggle-play flips state and glyph', () => {
  const El = instantiate('AudioNotePlayer.js', 'AudioNotePlayerElement');
  const el = new El();
  el.setAttribute('waveform', JSON.stringify([40, 70, 55, 90, 30, 60]));
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-audio-note-player]'), 'host rendered');
  const toggle = el.querySelector('[data-audio-note-toggle]');
  assert.ok(toggle, 'toggle button');
  assert.equal(toggle.getAttribute('aria-label'), 'Play note', 'starts idle');
  assert.ok(el.querySelector('[data-audio-note-duration]').textContent.includes('00:47'), 'default duration');
  assert.ok(el.querySelector('[data-audio-note-title]').textContent.includes('Homepage walkthrough notes'), 'default title');

  let lastState = null;
  el.addEventListener('toggle-play', (e) => { lastState = e.detail.playing; });

  toggle.dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(lastState, true, 'toggle-play event playing=true');
  assert.equal(el.querySelector('[data-audio-note-toggle]').getAttribute('aria-label'), 'Pause note', 'playing after click');
  assert.ok(el.querySelector('[data-audio-note-waveform]').innerHTML.includes('bg-emerald-500'), 'played bars highlighted');

  el.querySelector('[data-audio-note-toggle]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(lastState, false, 'toggle-play event playing=false');
  assert.equal(el.querySelector('[data-audio-note-toggle]').getAttribute('aria-label'), 'Play note', 'idle again');

  el.waveform = [];
  assert.ok(el.querySelector('[data-audio-note-waveform]'), 'waveform re-rendered with default bars');
});

test('vanilla ImageActionMenu — action events, divider, open/close', () => {
  const El = instantiate('ImageActionMenu.js', 'ImageActionMenuElement');
  const el = new El();
  el.setAttribute(
    'actions',
    JSON.stringify([
      { id: 'fullscreen', label: 'Fullscreen' },
      { id: 'upscale', label: 'Upscale & enhance' },
      { id: 'download', label: 'Download' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-image-action-menu]'), 'menu rendered');
  assert.equal(el.querySelectorAll('[data-image-action]').length, 3, 'three actions');
  assert.ok(el.querySelector('[data-image-action="upscale"]').textContent.includes('Upscale & enhance'), 'upscale label');

  let picked = null;
  el.addEventListener('action', (e) => { picked = e.detail.action; });

  el.querySelector('[data-image-action="upscale"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'upscale', 'action event detail');

  el.open = false;
  assert.equal(el.innerHTML, '', 'content cleared when closed');

  el.open = true;
  el.actions = [];
  assert.ok(el.querySelector('[data-image-action-empty]'), 'empty state on property set');
});
