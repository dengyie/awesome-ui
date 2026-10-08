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

const msgSource = stripComponent('ChatMessageRow.js', 'ChatMessageRowElement');
const paletteSource = stripComponent('CommandPalette.js', 'CommandPaletteElement');
const toastSource = stripComponent('ToastStack.js', 'ToastStackElement');

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
    'setTimeout',
    'clearTimeout',
    `${uiIconSource}\n${sources}\nreturn ${exportName};`
  );
  factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.document,
    window.setTimeout.bind(window),
    window.clearTimeout.bind(window)
  );
  const el = window.document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  window.document.body.appendChild(el);
  return { dom, window, el };
}

test('ChatMessageRow — user/assistant/system role rendering with escaping', () => {
  const { el: userEl } = mount(msgSource, 'ChatMessageRowElement', 'chat-message-row', {
    role: 'user',
    name: 'Mango',
    timestamp: '21:30',
  });
  userEl.content = 'hello <img src=x onerror=alert(1)>';
  assert.ok(userEl.innerHTML.includes('bg-indigo-600'), 'user bubble uses accent background');
  assert.ok(userEl.innerHTML.includes('Mango'), 'shows sender name');
  assert.ok(!userEl.innerHTML.includes('<img src=x'), 'content escaped (no XSS)');

  const { el: sysEl } = mount(msgSource, 'ChatMessageRowElement', 'chat-message-row', {
    role: 'system',
  });
  sysEl.content = 'You joined the chat';
  assert.ok(sysEl.innerHTML.includes('rounded-full'), 'system message renders as pill');
  assert.ok(sysEl.innerHTML.includes('You joined the chat'), 'system content rendered');

  const { el: aiEl } = mount(msgSource, 'ChatMessageRowElement', 'chat-message-row', { role: 'assistant' });
  aiEl.content = 'I can help with that.';
  assert.ok(aiEl.innerHTML.includes('rounded-tl-sm'), 'assistant bubble alignment');
  assert.ok(!aiEl.innerHTML.includes('bg-indigo-600'), 'assistant does not use user accent');
});

test('CommandPalette — opens, filters by query, selects via click, closes with Escape', () => {
  const { el, window } = mount(paletteSource, 'CommandPaletteElement', 'command-palette');
  el.items = [
    { id: 'new-chat', label: 'New Chat', hint: 'Start a blank session', icon: 'plus', group: 'Chat', shortcut: '⌘N' },
    { id: 'toggle-theme', label: 'Toggle Theme', hint: 'Switch light/dark', icon: 'sun', group: 'Settings' },
    { id: 'copy-all', label: 'Copy All', hint: 'Copy conversation', icon: 'copy', group: 'Chat' },
  ];

  assert.equal(el.innerHTML, '', 'closed palette renders nothing');

  el.open = true;
  assert.ok(el.innerHTML.includes('New Chat'), 'open palette lists items');
  assert.ok(el.innerHTML.includes('Chat'), 'group headers render');

  // search filter
  const input = el.querySelector('.cmd-input');
  input.value = 'theme';
  input.dispatchEvent(new window.Event('input'));
  const listbox = el.querySelector('[role="listbox"]');
  assert.ok(listbox.innerHTML.includes('Toggle Theme'), 'filter keeps matching item');
  assert.ok(!listbox.innerHTML.includes('New Chat'), 'filter drops non-matching item');

  // select via click → dispatches event and closes
  let selected = null;
  let closed = false;
  el.addEventListener('select', (e) => (selected = e.detail));
  el.addEventListener('close', () => (closed = true));
  el.querySelector('.cmd-item').click();
  assert.equal(selected?.id, 'toggle-theme', 'click dispatches select with item');
  assert.ok(closed, 'select closes palette');
  assert.equal(el.innerHTML, '', 'palette collapsed after select');

  // Escape closes
  el.open = true;
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.ok(!el.open, 'Escape closes palette');
});

test('ChatMessageRow — content attribute channel renders and re-renders on change', () => {
  const { el } = mount(msgSource, 'ChatMessageRowElement', 'chat-message-row', {
    role: 'user',
    content: 'Hello from attribute',
  });
  assert.ok(el.innerHTML.includes('Hello from attribute'), 'content attribute rendered');

  el.setAttribute('content', 'Updated via setAttribute');
  assert.ok(el.innerHTML.includes('Updated via setAttribute'), 'attribute change re-renders');
  assert.ok(!el.innerHTML.includes('Hello from attribute'), 'old content replaced');
});

test('ChatMessageRow — host class attribute is preserved, not clobbered', () => {
  const { el } = mount(msgSource, 'ChatMessageRowElement', 'chat-message-row', {
    role: 'assistant',
    class: 'my-4 custom-flag',
  });
  el.content = 'hi';
  assert.ok(el.className.includes('my-4'), 'user class preserved');
  assert.ok(el.className.includes('flex gap-3'), 'layout class applied');
});

test('CommandPalette — keyboard ArrowDown + Enter selects the active item', () => {
  const { el, window } = mount(paletteSource, 'CommandPaletteElement', 'command-palette');
  el.items = [
    { id: 'first', label: 'First Action', group: 'A' },
    { id: 'second', label: 'Second Action', group: 'A' },
  ];
  el.open = true;

  let selected = null;
  el.addEventListener('select', (e) => (selected = e.detail));
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));
  assert.equal(selected?.id, 'second', 'ArrowDown moved active index, Enter selected it');
  assert.ok(!el.open, 'palette closed after Enter select');
});

test('ToastStack — duration="0" disables auto-dismiss', async () => {
  const { el } = mount(toastSource, 'ToastStackElement', 'toast-stack', { duration: '0' });
  assert.equal(el.duration, 0, 'getter preserves explicit 0');

  el.push('Stay forever', 'info');
  assert.ok(el.innerHTML.includes('Stay forever'), 'toast rendered');
  await new Promise((r) => setTimeout(r, 120));
  assert.ok(el.innerHTML.includes('Stay forever'), 'toast still present (auto-dismiss disabled)');
});

test('ToastStack — push renders toast, manual dismiss removes it, auto-dismiss fires', async () => {
  const { el } = mount(toastSource, 'ToastStackElement', 'toast-stack', { duration: '80' });

  const id = el.push('Deployed successfully', 'success');
  assert.ok(el.innerHTML.includes('Deployed successfully'), 'toast message rendered');
  assert.ok(el.innerHTML.includes('text-emerald-500'), 'success color applied');

  let dismissedId = null;
  el.addEventListener('dismiss', (e) => (dismissedId = e.detail.id));

  // manual dismiss
  el.querySelector('.toast-dismiss').click();
  assert.equal(dismissedId, id, 'dismiss event carries id');
  assert.ok(!el.innerHTML.includes('Deployed successfully'), 'toast removed after dismiss');

  // auto-dismiss
  el.push('Auto clear me', 'warning');
  assert.ok(el.innerHTML.includes('Auto clear me'), 'second toast rendered');
  await new Promise((r) => setTimeout(r, 180));
  assert.ok(!el.innerHTML.includes('Auto clear me'), 'toast auto-dismissed after duration');
});
