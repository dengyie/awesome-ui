/**
 * Vanilla jsdom tests for the v1.34.0 batch
 * (VoiceOrb, ShareChatDialog, BrandPromptTable).
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

const loadElement = (file, className) => {
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

test('VoiceOrb — state rendering, mute toggle and end event', () => {
  const El = loadElement('VoiceOrb.js', 'VoiceOrbElement');
  const el = window.document.createElement('voice-orb');
  el.setAttribute('state', 'listening');
  el.setAttribute('hint', 'Ask away');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-voice-orb]'), 'host hook');
  const disc = el.querySelector('[data-voice-orb-disc]');
  assert.ok(disc, 'orb disc');
  assert.equal(disc.getAttribute('data-orb-state'), 'listening', 'state hook');
  assert.ok(disc.className.includes('animate-pulse'), 'listening pulse');
  assert.ok(disc.className.includes('from-sky-400'), 'listening gradient');
  assert.ok(el.querySelector('[data-voice-orb-wave]'), 'waveform when active');
  assert.ok(el.querySelector('[data-voice-orb-label]').textContent.includes('Listening'), 'state label');
  assert.ok(el.textContent.includes('Ask away'), 'hint');
  assert.ok(el.querySelector('[data-voice-orb-mute]'), 'mute button');
  assert.ok(el.textContent.includes('Mute'), 'mute label');
  assert.ok(el.querySelector('[data-voice-orb-end]'), 'end button');

  let muted = null;
  let ended = false;
  el.addEventListener('toggle-mute', (e) => { muted = e.detail.muted; });
  el.addEventListener('end', () => { ended = true; });
  el.querySelector('[data-voice-orb-mute]').click();
  assert.equal(muted, true, 'mute event payload');
  assert.equal(el.getAttribute('muted'), 'true', 'muted attr set');
  assert.ok(el.querySelector('[data-voice-orb-mute]').textContent.includes('Unmute'), 'Unmute label after toggle');
  assert.ok(el.querySelector('[data-voice-orb-mute]').getAttribute('aria-pressed') === 'true', 'aria-pressed true');
  el.querySelector('[data-voice-orb-end]').click();
  assert.ok(ended, 'end event');
  window.document.body.removeChild(el);
});

test('VoiceOrb — idle state hides wave, show-controls=false hides buttons', () => {
  const El = loadElement('VoiceOrb.js', 'VoiceOrbElement');
  const el = window.document.createElement('voice-orb');
  el.setAttribute('state', 'idle');
  el.setAttribute('show-controls', 'false');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-voice-orb-label]').textContent.includes('Tap to talk'), 'idle label');
  assert.equal(el.querySelector('[data-voice-orb-wave]'), null, 'no waveform when idle');
  assert.ok(el.querySelector('[data-voice-orb-disc]').className.includes('dark:from-zinc-600'), 'idle gradient');
  assert.equal(el.querySelector('[data-voice-orb-end]'), null, 'no controls');
  window.document.body.removeChild(el);
});

test('ShareChatDialog — private/public toggle, create and copy link', () => {
  const El = loadElement('ShareChatDialog.js', 'ShareChatDialogElement');
  const el = window.document.createElement('share-chat-dialog');
  el.setAttribute('title', 'Share chat');
  el.setAttribute('shared', 'false');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-share-chat]'), 'host hook');
  assert.ok(el.querySelector('[data-share-chat]').getAttribute('role') === 'dialog', 'dialog role');
  assert.ok(el.querySelector('[data-share-close]'), 'close hook');
  assert.ok(el.querySelector('[data-share-private]'), 'private option');
  assert.ok(el.querySelector('[data-share-public]'), 'public option');
  assert.equal(el.querySelector('[data-share-create]'), null, 'no create when private');

  let toggled = null;
  let created = false;
  let copied = null;
  let closed = false;
  el.addEventListener('toggle-shared', (e) => { toggled = e.detail.shared; });
  el.addEventListener('create-link', () => { created = true; });
  el.addEventListener('copy-link', (e) => { copied = e.detail.link; });
  el.addEventListener('close', () => { closed = true; });

  el.querySelector('[data-share-public]').click();
  assert.equal(toggled, true, 'public toggle event');
  assert.equal(el.getAttribute('shared'), 'true', 'shared attr set');
  assert.ok(el.querySelector('[data-share-create]'), 'create button after public');

  el.setAttribute('link', 'https://example.com/s/xyz');
  assert.ok(el.querySelector('[data-share-link]'), 'link shown');
  assert.ok(el.querySelector('[data-share-link]').textContent.includes('/s/xyz'), 'link text');
  el.querySelector('[data-share-copy]').click();
  assert.equal(copied, 'https://example.com/s/xyz', 'copy event payload');

  el.querySelector('[data-share-private]').click();
  assert.equal(toggled, false, 'private toggle event');
  assert.equal(el.querySelector('[data-share-link]'), null, 'link hidden after private');

  el.querySelector('[data-share-close]').click();
  assert.ok(closed, 'close event');
  assert.equal(el.getAttribute('open'), 'false', 'open attr set false');
  assert.equal(el.innerHTML, '', 'markup cleared when closed');
  window.document.body.removeChild(el);
});

test('BrandPromptTable — rows, quota badge, add and row-click events', () => {
  const El = loadElement('BrandPromptTable.js', 'BrandPromptTableElement');
  const el = window.document.createElement('brand-prompt-table');
  el.setAttribute('quota-used', '49');
  el.setAttribute('quota-total', '50');
  window.document.body.appendChild(el);
  el.rows = [
    { id: 'p1', prompt: 'best CRM for startups', visibility: 82, sentiment: 74, position: 2 },
    { id: 'p2', prompt: 'affordable invoicing tool', visibility: 41, sentiment: 55, position: 5 },
    { id: 'p3', prompt: 'enterprise payroll software', visibility: 12, sentiment: 31, position: 9 },
  ];

  assert.ok(el.querySelector('[data-brand-prompt-table]'), 'host hook');
  assert.ok(el.querySelector('[data-brand-quota]').textContent.includes('49 / 50 prompts'), 'quota badge');
  assert.ok(el.querySelector('[data-brand-add]'), 'add CTA');
  assert.ok(el.querySelector('[data-brand-row="p1"]'), 'row hook');
  assert.ok(el.querySelector('[data-brand-row="p1"] td').textContent.includes('best CRM'), 'prompt text');
  assert.ok(el.querySelector('[data-brand-row="p1"] [data-brand-visibility]').textContent.includes('82%'), 'visibility');
  assert.ok(el.querySelector('[data-brand-row="p1"] [data-brand-sentiment]').className.includes('text-emerald-600'), 'high sentiment green');
  assert.ok(el.querySelector('[data-brand-row="p2"] [data-brand-sentiment]').className.includes('text-amber-600'), 'mid sentiment amber');
  assert.ok(el.querySelector('[data-brand-row="p3"] [data-brand-sentiment]').className.includes('text-red-600'), 'low sentiment red');
  assert.ok(el.querySelector('[data-brand-row="p3"] [data-brand-position]').textContent.includes('#9'), 'position');

  let added = false;
  let clicked = null;
  el.addEventListener('add-prompt', () => { added = true; });
  el.addEventListener('row-click', (e) => { clicked = e.detail.row; });
  el.querySelector('[data-brand-add]').click();
  assert.ok(added, 'add event');
  el.querySelector('[data-brand-row="p2"]').click();
  assert.ok(clicked && clicked.id === 'p2', 'row-click payload');
  window.document.body.removeChild(el);
});

test('BrandPromptTable — empty state when no rows', () => {
  const El = loadElement('BrandPromptTable.js', 'BrandPromptTableElement');
  const el = window.document.createElement('brand-prompt-table');
  window.document.body.appendChild(el);
  el.rows = [];
  assert.ok(el.querySelector('[data-brand-empty]'), 'empty hook');
  assert.ok(el.textContent.includes('add your first brand prompt'), 'empty text');
  window.document.body.removeChild(el);
});
