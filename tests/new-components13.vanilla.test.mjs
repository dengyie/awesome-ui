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
    .replace(/^const escapeAttribute = [\s\S]*?;\r?\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const voiceSource = stripComponent('VoiceModePanel.js', 'VoiceModePanelElement');
const promptSource = stripComponent('PromptLibrary.js', 'PromptLibraryElement');

function mount(source, exportName, tag, attrs = {}) {
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
    'FormData',
    `${uiIconSource}\n${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail));
  return seen;
};

const PROMPTS = [
  {
    id: 'p1',
    title: 'Summarize thread',
    description: 'Condense a long chat',
    prompt: 'Summarize the following conversation…',
    category: 'Writing',
    tags: ['summary', 'chat'],
    favorite: true,
  },
  {
    id: 'p2',
    title: 'Refactor function',
    description: 'Clean up legacy code',
    prompt: 'Refactor this function for readability…',
    category: 'Code',
    tags: ['refactor'],
  },
  {
    id: 'p3',
    title: 'Cold email',
    prompt: 'Write a short cold outreach email…',
    category: 'Writing',
  },
];

test('VoiceModePanel — idle render', () => {
  const { el } = mount(voiceSource, 'VoiceModePanelElement', 'voice-mode-panel');
  assert.ok(el.innerHTML.includes('Tap to speak'));
  assert.ok(el.innerHTML.includes('Voice mode is ready'));
  assert.ok(el.innerHTML.includes('aria-label="Start voice mode"'));
  assert.ok(el.innerHTML.includes('aria-pressed="false"'));
  assert.equal(el.querySelector('.voice-end'), null);
  assert.equal(el.querySelectorAll('.voice-toggle').length, 1);
});

test('VoiceModePanel — listening state swaps label, icon and pulse', () => {
  const { el } = mount(voiceSource, 'VoiceModePanelElement', 'voice-mode-panel', {
    state: 'listening',
    transcript: 'Hey there',
    reply: 'On it',
  });
  assert.ok(el.innerHTML.includes('Listening…'));
  assert.ok(el.innerHTML.includes('Speak now'));
  assert.ok(el.innerHTML.includes('aria-label="Stop voice mode"'));
  assert.ok(el.innerHTML.includes('aria-pressed="true"'));
  assert.ok(el.innerHTML.includes('animate-ping'));
  assert.ok(el.innerHTML.includes('Hey there'));
  assert.ok(el.innerHTML.includes('On it'));
});

test('VoiceModePanel — unknown state falls back to idle', () => {
  const { el } = mount(voiceSource, 'VoiceModePanelElement', 'voice-mode-panel', { state: 'bogus' });
  assert.ok(el.innerHTML.includes('Tap to speak'));
  assert.ok(el.innerHTML.includes('aria-pressed="false"'));
});

test('VoiceModePanel — toggle and end events', () => {
  const { el } = mount(voiceSource, 'VoiceModePanelElement', 'voice-mode-panel', { 'show-end': '' });
  const toggles = collect(el, 'toggle');
  const ends = collect(el, 'end');

  el.querySelector('.voice-toggle').click();
  assert.equal(toggles.length, 1);

  el.querySelector('.voice-end').click();
  assert.equal(ends.length, 1);
});

test('VoiceModePanel — attribute change re-renders', () => {
  const { el } = mount(voiceSource, 'VoiceModePanelElement', 'voice-mode-panel');
  assert.ok(el.innerHTML.includes('Tap to speak'));
  el.setAttribute('state', 'speaking');
  assert.ok(el.innerHTML.includes('Speaking…'));
  assert.ok(el.innerHTML.includes('Tap to interrupt'));
});

test('PromptLibrary — renders header, chips and cards', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library', { searchable: '' });
  el.prompts = PROMPTS;

  assert.ok(el.innerHTML.includes('Prompt library'));
  assert.ok(el.querySelector('.prompt-search'));
  assert.equal(el.querySelectorAll('.prompt-chip').length, 3, 'all + 2 categories');
  assert.equal(el.querySelectorAll('.prompt-card').length, 3);
  assert.equal(el.querySelector('.prompt-count').textContent, '3');
  assert.ok(el.innerHTML.includes('Condense a long chat'));
  assert.ok(el.innerHTML.includes('aria-pressed="true"'), 'favorite pressed');
});

test('PromptLibrary — category chip filters the list', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library');
  el.prompts = PROMPTS;

  const findCodeChip = () =>
    Array.from(el.querySelectorAll('.prompt-chip')).find(
      (chip) => chip.getAttribute('data-category') === 'Code'
    );
  findCodeChip().click();

  assert.equal(el.querySelectorAll('.prompt-card').length, 1);
  assert.ok(el.innerHTML.includes('Refactor function'));
  assert.equal(el.querySelector('.prompt-count').textContent, '1');
  assert.equal(findCodeChip().getAttribute('aria-pressed'), 'true');
});

test('PromptLibrary — search filters across title, body and tags', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library', { searchable: '' });
  el.prompts = PROMPTS;

  const input = el.querySelector('.prompt-search');
  input.value = 'refactor';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));

  assert.equal(el.querySelectorAll('.prompt-card').length, 1);
  assert.ok(el.innerHTML.includes('Refactor function'));

  input.value = 'summary';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  assert.equal(el.querySelectorAll('.prompt-card').length, 1);
  assert.ok(el.innerHTML.includes('Summarize thread'));
});

test('PromptLibrary — empty state when nothing matches', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library', { searchable: '' });
  el.prompts = PROMPTS;

  const input = el.querySelector('.prompt-search');
  input.value = 'zzzz-no-match';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));

  assert.equal(el.querySelectorAll('.prompt-card').length, 0);
  assert.ok(el.innerHTML.includes('No prompts match your filters.'));
  assert.equal(el.querySelector('.prompt-count').textContent, '0');
});

test('PromptLibrary — use and toggle-favorite events carry the prompt', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library');
  el.prompts = PROMPTS;
  const used = collect(el, 'use');
  const favs = collect(el, 'toggle-favorite');

  el.querySelector('.prompt-use').click();
  assert.equal(used.length, 1);
  assert.equal(used[0].id, 'p1');

  el.querySelector('.prompt-fav').click();
  assert.equal(favs.length, 1);
  assert.equal(favs[0].id, 'p1');
});

test('PromptLibrary — search input keeps focus after filtering', () => {
  const { el, window } = mount(promptSource, 'PromptLibraryElement', 'prompt-library', { searchable: '' });
  el.prompts = PROMPTS;

  const input = el.querySelector('.prompt-search');
  input.focus();
  input.value = 'cold';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));

  assert.equal(el.querySelector('.prompt-search'), input, 'same input node reused');
  assert.equal(window.document.activeElement, input, 'focus preserved');
  assert.equal(el.querySelectorAll('.prompt-card').length, 1);
});

test('PromptLibrary — searchable attribute toggles the input', () => {
  const { el } = mount(promptSource, 'PromptLibraryElement', 'prompt-library');
  el.prompts = PROMPTS;
  assert.equal(el.querySelector('.prompt-search'), null);

  el.setAttribute('searchable', '');
  assert.ok(el.querySelector('.prompt-search'));
});
