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

const confirmSource = stripComponent('ConfirmDialog.js', 'ConfirmDialogElement');
const shortcutsSource = stripComponent('ShortcutsOverlay.js', 'ShortcutsOverlayElement');

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

const press = (windown, key) =>
  windown.document.dispatchEvent(new windown.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

test('ConfirmDialog — closed state renders nothing', () => {
  const { el } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', { title: 'Delete?' });
  assert.equal(el.innerHTML.trim(), '', 'no markup while closed');
  assert.equal(el.querySelector('[role="dialog"]'), null, 'no dialog node while closed');
});

test('ConfirmDialog — renders title, description and emits confirm', () => {
  const { el } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', {
    open: '',
    title: 'Delete project?',
    description: 'This cannot be undone.',
    'confirm-text': 'Delete',
  });

  assert.ok(el.querySelector('[role="dialog"]').hasAttribute('aria-modal'), 'modal semantics');
  assert.ok(el.innerHTML.includes('Delete project?'), 'title rendered');
  assert.ok(el.innerHTML.includes('This cannot be undone.'), 'description rendered');
  assert.ok(el.querySelector('.confirm-accept').textContent.trim().includes('Delete'), 'custom confirm label');
  assert.equal(el.querySelector('.confirm-accept').disabled, false, 'confirm enabled without a gate');

  const seen = [];
  el.addEventListener('confirm', () => seen.push('confirm'));
  el.querySelector('.confirm-accept').click();
  assert.deepEqual(seen, ['confirm'], 'confirm event dispatched');
});

test('ConfirmDialog — cancel button, backdrop and Escape all cancel', () => {
  const { el, window: win } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', { open: '', title: 'T' });
  const seen = [];
  el.addEventListener('cancel', () => seen.push('cancel'));

  el.querySelector('.confirm-cancel').click();
  press(win, 'Escape');
  el.querySelector('.confirm-overlay').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));

  assert.equal(seen.length, 3, 'three cancel events');
  assert.equal(el.querySelectorAll('.confirm-overlay').length, 1, 'still mounted; host decides to close');
});

test('ConfirmDialog — clicking inside the panel does not cancel', () => {
  const { el, window: win } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', { open: '', title: 'T' });
  let cancelled = 0;
  el.addEventListener('cancel', () => cancelled++);
  el.querySelector('.confirm-accept').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert.equal(cancelled, 0, 'inner clicks bubble but target !== overlay');
});

test('ConfirmDialog — require-text gates confirm until the exact token is typed', () => {
  const { el } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', {
    open: '',
    title: 'Drop table',
    'require-text': 'users',
  });

  const accept = el.querySelector('.confirm-accept');
  const input = el.querySelector('.confirm-typed');
  assert.ok(accept.disabled, 'confirm disabled initially');
  assert.ok(el.innerHTML.includes('placeholder="users"'), 'placeholder mirrors the token');

  input.value = 'user';
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
  assert.ok(accept.disabled, 'partial token still blocked');

  let confirmed = 0;
  el.addEventListener('confirm', () => confirmed++);
  input.value = 'users';
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
  assert.equal(accept.disabled, false, 'exact token unlocks confirm');

  input.value = 'stale';
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
  accept.click();
  assert.equal(confirmed, 0, 'stale render cannot confirm');

  input.value = 'users';
  input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
  accept.click();
  assert.equal(confirmed, 1, 'confirm fires once unlocked');
});

test('ConfirmDialog — reopening resets the typed token', () => {
  const { el, window: win } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', {
    open: '',
    title: 'Drop',
    'require-text': 'users',
  });
  const input = el.querySelector('.confirm-typed');
  input.value = 'users';
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
  assert.equal(el.querySelector('.confirm-accept').disabled, false, 'unlocked by match');

  el.removeAttribute('open');
  assert.equal(el.innerHTML, '', 'collapsed when closed');

  el.setAttribute('open', '');
  assert.ok(el.querySelector('.confirm-accept').disabled, 'confirm re-locked after reopen');
  assert.equal(el.querySelector('.confirm-typed').value, '', 'typed token cleared');
});

test('ConfirmDialog — loading disables both actions and shows a spinner', () => {
  const { el, window: win } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', {
    open: '',
    title: 'Saving',
    loading: '',
  });

  assert.ok(el.querySelector('.confirm-accept').disabled, 'confirm disabled');
  assert.ok(el.querySelector('.confirm-cancel').disabled, 'cancel disabled');
  assert.ok(el.innerHTML.includes('animate-spin'), 'spinner rendered');

  let fired = 0;
  el.addEventListener('cancel', () => fired++);
  press(win, 'Escape');
  el.querySelector('.confirm-overlay').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert.equal(fired, 0, 'escape and backdrop ignored while loading');
});

test('ConfirmDialog — danger tone swaps icon chip and button color, host classes kept', () => {
  const { el } = mount(confirmSource, 'ConfirmDialogElement', 'confirm-dialog', {
    open: '',
    title: 'Delete',
    tone: 'danger',
    class: 'my-custom',
  });

  assert.ok(el.querySelector('.confirm-accept').className.includes('bg-red-600'), 'red confirm button');
  assert.ok(el.innerHTML.includes('bg-red-50'), 'red icon chip');
  assert.ok(el.className.includes('my-custom'), 'user host class preserved');
});

test('ShortcutsOverlay — closed state renders nothing', () => {
  const { el } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay');
  assert.equal(el.innerHTML.trim(), '', 'no markup while closed');
});

test('ShortcutsOverlay — flat shortcuts bucket into groups with keycaps', () => {
  const { el } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay', { open: '' });
  el.shortcuts = [
    { keys: ['⌘', 'K'], label: 'Open command palette', group: 'Navigation' },
    { keys: ['⌘', 'B'], label: 'Toggle sidebar', group: 'Navigation' },
    { keys: ['⌘', '↵'], label: 'Send message', group: 'Composer' },
  ];

  const sections = el.querySelectorAll('section');
  assert.equal(sections.length, 2, 'one section per bucket');
  assert.equal(sections[1].querySelectorAll('kbd').length, 2, 'one keycap per key of the lone composer item');
  assert.ok(el.innerHTML.includes('Navigation') && el.innerHTML.includes('Composer'), 'bucket labels');
  assert.ok(el.innerHTML.includes('>3<'), 'total count shown');
});

test('ShortcutsOverlay — groups prop wins over shortcuts, items without group land in General', () => {
  const { el } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay', { open: '' });
  el.shortcuts = [{ keys: ['?'], label: 'Show shortcuts' }];
  assert.ok(el.innerHTML.includes('General'), 'ungrouped items fall back to General');

  el.groups = [{ id: 'nav', label: 'Navigation', items: [{ keys: ['g', 'h'], label: 'Go home' }] }];
  assert.ok(el.innerHTML.includes('Navigation'), 'supplied group rendered');
  assert.ok(!el.innerHTML.includes('General'), 'supplied groups replace the flat list');
});

test('ShortcutsOverlay — search filters by label and by keys', () => {
  const { el } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay', { open: '' });
  el.shortcuts = [
    { keys: ['⌘', 'K'], label: 'Open command palette', group: 'Navigation' },
    { keys: ['⌘', 'S'], label: 'Save draft', group: 'Composer' },
  ];

  const type = (value) => {
    const input = el.querySelector('.shortcuts-search');
    input.value = value;
    input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true }));
    return el.querySelector('.shortcuts-search');
  };

  type('save');
  assert.ok(el.innerHTML.includes('Save draft'), 'label match kept');
  assert.ok(!el.innerHTML.includes('Open command palette'), 'non-match dropped');
  assert.ok(!el.innerHTML.includes('>Navigation<'), 'empty group dropped');

  type('⌘K');
  assert.ok(el.innerHTML.includes('Open command palette'), 'keys match kept');
  assert.ok(!el.innerHTML.includes('Save draft'), 'keys mismatch dropped');
  assert.ok(el.querySelector('.shortcuts-search').value === '⌘K', 'query survives re-render');

  type('zzz');
  assert.ok(el.innerHTML.includes('No shortcuts match'), 'empty state shown');
});

test('ShortcutsOverlay — close button, backdrop and Escape emit close', () => {
  const { el, window: win } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay', { open: '' });
  el.groups = [{ id: 'g', label: 'G', items: [{ keys: ['a'], label: 'A' }] }];

  let closes = 0;
  el.addEventListener('close', () => closes++);

  el.querySelector('.shortcuts-close').click();
  press(win, 'Escape');
  el.querySelector('.shortcuts-overlay').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert.equal(closes, 3, 'three close events');

  // Reopening clears the query.
  el.querySelector('.shortcuts-search').value = 'A';
  el.removeAttribute('open');
  el.setAttribute('open', '');
  assert.equal(el.querySelector('.shortcuts-search').value, '', 'query reset on reopen');
});

test('ShortcutsOverlay — custom title and host classes', () => {
  const { el } = mount(shortcutsSource, 'ShortcutsOverlayElement', 'shortcuts-overlay', {
    open: '',
    title: 'Cheat sheet',
    class: 'user-class',
  });
  el.shortcuts = [{ keys: ['?'], label: 'Help', group: 'General' }];
  assert.ok(el.innerHTML.includes('Cheat sheet'), 'custom title');
  assert.ok(el.className.split(' ').includes('user-class'), 'user class kept');
});
