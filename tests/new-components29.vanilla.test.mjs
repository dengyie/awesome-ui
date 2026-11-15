import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const pickerSource = stripComponent('ColorPickerPopover.js', 'ColorPickerPopoverElement');
const paletteSource = stripComponent('EditorToolPalette.js', 'EditorToolPaletteElement');
const sheetSource = stripComponent('ShortcutCheatSheet.js', 'ShortcutCheatSheetElement');
const zoomSource = stripComponent('ZoomControlBar.js', 'ZoomControlBarElement');
const aiMenuSource = stripComponent('AIInlineMenu.js', 'AIInlineMenuElement');

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
    `${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('ColorPickerPopover — swatch select, hex input, custom add and change event', () => {
  const { el, window } = mount(pickerSource, 'ColorPickerPopoverElement', 'color-picker-popover');
  const changes = collect(el, 'change');
  const customs = collect(el, 'add-custom');
  const eyedroppers = collect(el, 'eyedropper-click');
  el.value = '#2563eb';
  el.documentColors = ['#476cc4', '#e61f5b'];
  el.customColors = ['#0f766e'];

  assert.ok(el.querySelector('[data-color-picker]'), 'host hook');
  assert.ok(el.querySelector('[data-color-swatch="#2563eb"]'), 'selected swatch');
  assert.ok(el.textContent.includes('Document colors'), 'document section');
  assert.ok(el.textContent.includes('Custom colors'), 'custom section');
  assert.ok(el.querySelector('[data-color-hex-input]'), 'hex input');
  assert.ok(el.querySelector('[data-color-custom-add]'), 'add custom tile');
  assert.ok(!el.querySelector('[data-color-eyedropper]'), 'no eyedropper by default');

  // click a document color
  el.querySelector('[data-color-swatch="#476cc4"]').click();
  assert.equal(changes.at(-1)?.hex, '#476cc4', 'change event fired');
  assert.equal(el.value, '#476cc4', 'value updated');

  // type a hex
  const hexInput = el.querySelector('[data-color-hex-input]');
  hexInput.value = '#ff0000';
  hexInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(changes.at(-1)?.hex, '#ff0000', 'hex input change');

  // eyedropper appears when enabled
  el.setAttribute('show-eyedropper', 'true');
  el.render();
  el.querySelector('[data-color-eyedropper]').click();
  assert.equal(eyedroppers.length, 1, 'eyedropper event');

  // add custom
  el.querySelector('[data-color-custom-add]').click();
  assert.equal(customs.at(-1)?.hex, el.value, 'add-custom event with current hex');
});

test('EditorToolPalette — select event, active state, kbd hints and badge', () => {
  const { el } = mount(paletteSource, 'EditorToolPaletteElement', 'editor-tool-palette');
  const selects = collect(el, 'select');
  const icon = '<svg viewBox="0 0 20 20"></svg>';
  el.tools = [
    { id: 'select', icon, label: 'Select', kbd: '1' },
    { id: 'hand', icon, label: 'Hand', kbd: '2' },
    { id: 'square', icon, label: 'Square', kbd: '3', disabled: true },
  ];
  el.activeId = 'select';
  el.setAttribute('active-count', '1');

  assert.ok(el.querySelector('[data-tool-palette]'), 'host hook');
  assert.ok(el.querySelector('[data-tool="select"]'), 'tool button');
  assert.ok(el.querySelector('[data-tool="square"]').disabled, 'disabled tool');
  assert.ok(el.innerHTML.includes('bg-blue-500'), 'active tone');
  assert.ok(el.innerHTML.includes('data-tool-badge'), 'count badge');

  el.querySelector('[data-tool="hand"]').click();
  assert.equal(selects.at(-1)?.id, 'hand', 'select event');
  assert.equal(el.activeId, 'hand', 'active updated');
  assert.ok(el.querySelector('[data-tool="hand"]').className.includes('bg-blue-500'), 'new active tone');

  // disabled tool does not emit
  el.querySelector('[data-tool="square"]').click();
  assert.equal(selects.length, 1, 'no event for disabled');
});

test('ShortcutCheatSheet — rows, keycaps, sections and search filter', () => {
  const { el, window } = mount(sheetSource, 'ShortcutCheatSheetElement', 'shortcut-cheat-sheet', {
    title: 'Editor',
    searchable: 'true',
  });
  el.shortcuts = [
    { id: 'bold', label: 'Bold', hint: '**Bold**', keys: ['⌘', 'B'], section: 'Editor' },
    { id: 'undo', label: 'Undo', keys: ['⌘', 'Z'], section: 'Editor' },
    { id: 'comment', label: 'Comment a selection', keys: ['⌥', '⌘', 'M'] },
  ];

  assert.ok(el.querySelector('[data-shortcut-sheet]'), 'host hook');
  assert.ok(el.querySelector('[data-shortcut-row="bold"]'), 'row hook');
  assert.ok(el.querySelector('[data-shortcut-section="Editor"]'), 'section header');
  assert.ok(el.textContent.includes('**Bold**'), 'markdown hint');
  assert.ok(el.textContent.includes('⌘'), 'keycap');
  assert.ok(el.textContent.includes('Comment a selection'), 'third row');
  assert.ok(el.querySelector('[data-shortcut-search]'), 'search input');

  const search = el.querySelector('[data-shortcut-search]');
  search.value = 'comment';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.ok(el.querySelector('[data-shortcut-row="comment"]'), 'filtered row kept');
  assert.ok(!el.querySelector('[data-shortcut-row="bold"]'), 'other rows filtered out');

  const noMatch = el.querySelector('[data-shortcut-search]');
  noMatch.value = 'zzz';
  noMatch.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.ok(el.querySelector('[data-shortcut-empty]'), 'empty state');
});

test('ZoomControlBar — stepper, dropdown presets, slider input and events', () => {
  const { el, window } = mount(zoomSource, 'ZoomControlBarElement', 'zoom-control-bar');
  const changes = collect(el, 'zoom-change');
  const fits = collect(el, 'fit');
  el.value = 100;

  assert.ok(el.querySelector('[data-zoom-control]'), 'host hook');
  assert.ok(el.querySelector('[data-zoom-out]'), 'zoom out');
  assert.ok(el.querySelector('[data-zoom-in]'), 'zoom in');
  assert.ok(el.textContent.includes('100%'), 'percent');

  el.querySelector('[data-zoom-in]').click();
  assert.equal(changes.at(-1)?.value, 110, 'step up event');
  assert.ok(el.textContent.includes('110%'), 'percent updated');

  el.querySelector('[data-zoom-out]').click();
  assert.equal(changes.at(-1)?.value, 100, 'step down event');

  // dropdown variant
  el.setAttribute('variant', 'dropdown');
  el.setAttribute('presets', '[25, 50, 100, 200]');
  el.setAttribute('show-fit', 'true');
  el.render();
  el.querySelector('[data-zoom-value]').click();
  assert.ok(el.querySelector('[data-zoom-menu]'), 'menu opens');
  el.querySelector('[data-zoom-preset="50"]').click();
  assert.equal(changes.at(-1)?.value, 50, 'preset event');
  assert.ok(el.textContent.includes('50%'), 'preset applied');
  assert.ok(!el.querySelector('[data-zoom-menu]'), 'menu closed after preset');

  // slider variant
  el.setAttribute('variant', 'slider');
  el.render();
  const slider = el.querySelector('[data-zoom-slider]');
  assert.ok(slider, 'slider input');
  slider.value = '75';
  slider.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(changes.at(-1)?.value, 75, 'slider event');
  assert.ok(el.textContent.includes('75%'), 'slider label');

  el.setAttribute('show-fit', 'true');
  el.render();
  el.querySelector('[data-zoom-fit]').click();
  assert.equal(fits.length, 1, 'fit event');
});

test('AIInlineMenu — simple action, dropdown option, dismiss and states', () => {
  const { el, window } = mount(aiMenuSource, 'AIInlineMenuElement', 'ai-inline-menu');
  const actions = collect(el, 'action');
  const dismisses = collect(el, 'dismiss');
  el.actions = [
    { id: 'edit', label: 'Edit' },
    { id: 'tone', label: 'Change tone', options: ['Professional', 'Friendly'] },
  ];

  assert.ok(el.querySelector('[data-ai-inline-menu]'), 'host hook');
  assert.ok(el.querySelector('[data-ai-action="edit"]'), 'action button');
  assert.ok(el.querySelector('[data-ai-action="tone"]'), 'dropdown action');
  assert.ok(el.textContent.includes('AI'), 'AI chip');
  assert.ok(el.innerHTML.includes('bg-indigo-50'), 'chip tone');
  assert.ok(el.querySelector('[data-ai-dismiss]'), 'dismiss button');
  assert.ok(!el.querySelector('[data-ai-menu]'), 'menu closed by default');

  // simple action
  el.querySelector('[data-ai-action="edit"]').click();
  assert.equal(actions.at(-1)?.id, 'edit', 'simple action event');
  assert.ok(el.textContent.includes('edit'), 'status echo');

  // dropdown action opens menu, then pick option
  el.querySelector('[data-ai-action="tone"]').click();
  assert.ok(el.querySelector('[data-ai-menu="tone"]'), 'menu opens');
  el.querySelector('[data-ai-option="Professional"]').click();
  assert.equal(actions.at(-1)?.id, 'tone', 'dropdown action id');
  assert.equal(actions.at(-1)?.option, 'Professional', 'dropdown option');
  assert.ok(!el.querySelector('[data-ai-menu]'), 'menu closed after pick');

  // dismiss
  el.querySelector('[data-ai-dismiss]').click();
  assert.equal(dismisses.length, 1, 'dismiss event');

  // loading + error states
  el.setAttribute('loading', 'true');
  assert.ok(el.textContent.includes('Working…'), 'loading label');
  el.setAttribute('loading', 'false');
  el.setAttribute('error', 'Request failed');
  assert.ok(el.textContent.includes('Request failed'), 'error label');

  // brand tone
  el.setAttribute('error', '');
  el.setAttribute('tone', 'brand');
  assert.ok(el.innerHTML.includes('bg-emerald-50'), 'brand chip tone');
});
