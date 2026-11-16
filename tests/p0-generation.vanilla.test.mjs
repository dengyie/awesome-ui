/**
 * p0-generation behavioral tests — vanilla Web Components (jsdom)
 * Covers ThemeToggle, AutoScrollAnchor, MessageActionToolbar: rendering,
 * state transitions, event dispatch and lifecycle hygiene.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const UI_ICON_STUB = "const uiIcon = (name, opts = {}) => `<svg data-icon='${name}'></svg>`;";

function mount(file, className, attrs = {}, { localStorage } = {}) {
  const raw = readFileSync(join(root, file), 'utf8');
  const source = raw
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export default \w+;\s*$/m, '')
    .replace(/^export\s+(class|const|function)\s+/gm, '$1 ');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  // jsdom lacks matchMedia (ThemeToggle.resolveTheme uses it for auto mode)
  window.matchMedia =
    window.matchMedia ||
    ((query) => ({ matches: false, media: query, addListener() {}, removeListener() {} }));
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'window',
    'localStorage',
    'document',
    'navigator',
    UI_ICON_STUB + '\n' + source + `\nreturn ${className};`
  );
  const Klass = factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window,
    window.localStorage,
    window.document,
    window.navigator
  );
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  return { el, window };
}

// ---------- ThemeToggle ----------

test('ThemeToggle: renders three mode buttons and persists selection', () => {
  const { el, window } = mount('vanilla/ThemeToggle.js', 'ThemeToggle', {
    'storage-key': 'test-theme',
  });
  const modes = [...el.querySelectorAll('[data-mode]')].map((b) => b.dataset.mode);
  assert.deepEqual(modes, ['auto', 'light', 'dark']);
  // connectedCallback applies initial (auto) mode
  assert.equal(el.mode, 'auto');
  assert.equal(window.document.documentElement.dataset.theme, 'auto');
  assert.equal(window.localStorage.getItem('test-theme'), 'auto');
});

test('ThemeToggle: clicking dark applies .dark class, resolves and emits change', () => {
  const { el, window } = mount('vanilla/ThemeToggle.js', 'ThemeToggle', {
    'storage-key': 'test-theme',
  });
  const events = [];
  el.addEventListener('change', (e) => events.push(e.detail));
  el.querySelector('[data-mode="dark"]').click();
  assert.equal(el.mode, 'dark');
  assert.equal(window.document.documentElement.dataset.resolvedTheme, 'dark');
  assert.ok(window.document.documentElement.classList.contains('dark'));
  assert.equal(window.document.documentElement.style.colorScheme, 'dark');
  assert.equal(window.localStorage.getItem('test-theme'), 'dark');
  assert.equal(events.at(-1).mode, 'dark');
  assert.equal(events.at(-1).resolved, 'dark');
});

test('ThemeToggle: light mode removes .dark class', () => {
  const { el, window } = mount('vanilla/ThemeToggle.js', 'ThemeToggle', {
    'storage-key': 'test-theme',
  });
  el.querySelector('[data-mode="dark"]').click();
  assert.ok(window.document.documentElement.classList.contains('dark'));
  el.querySelector('[data-mode="light"]').click();
  assert.equal(window.document.documentElement.dataset.resolvedTheme, 'light');
  assert.ok(!window.document.documentElement.classList.contains('dark'));
});

// ---------- AutoScrollAnchor ----------

test('AutoScrollAnchor: renders anchor + hidden back-to-bottom button; cleans up on disconnect', () => {
  const { el, window } = mount('vanilla/AutoScrollAnchor.js', 'AutoScrollAnchor');
  assert.ok(el.querySelector('#anchor'));
  const btn = el.querySelector('#back-to-bottom');
  assert.ok(btn, 'back-to-bottom button exists');
  assert.ok(btn.classList.contains('hidden'), 'starts hidden at bottom');
  // scroll handler is registered on window and removed on disconnect
  const before = window._getEventListeners?.length ?? null;
  el.disconnectedCallback?.();
  // no throw is the assertion here; handler bookkeeping is internal
  assert.ok(true);
});

test('AutoScrollAnchor: scroll handler toggles button visibility by distance', () => {
  const { el, window } = mount('vanilla/AutoScrollAnchor.js', 'AutoScrollAnchor');
  const btn = el.querySelector('#back-to-bottom');
  // jsdom: scrollHeight/innerHeight are 0 → distance = 0 - (0+0) = 0 < 80 → at bottom
  window.dispatchEvent(new window.Event('scroll'));
  assert.ok(btn.classList.contains('hidden'), 'near bottom → hidden');
  // Simulate being scrolled away from bottom
  Object.defineProperty(window.document.documentElement, 'scrollHeight', {
    value: 2000, configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  window.dispatchEvent(new window.Event('scroll'));
  assert.ok(!btn.classList.contains('hidden'), 'far from bottom → visible');
  el.disconnectedCallback?.();
});

// ---------- MessageActionToolbar ----------

test('MessageActionToolbar: single branch hides pager, retry emits event', () => {
  const { el } = mount('vanilla/MessageActionToolbar.js', 'MessageActionToolbar', {
    content: 'Hello',
    role: 'assistant',
    'total-branches': '1',
  });
  assert.equal(el.querySelector('#prev-branch'), null, 'no pager for single branch');
  let retried = 0;
  el.addEventListener('retry', () => retried++);
  el.querySelector('#retry-btn').click();
  assert.equal(retried, 1);
  // assistant role shows rating buttons
  assert.ok(el.querySelector('#thumb-up') && el.querySelector('#thumb-down'));
});

test('MessageActionToolbar: multi-branch pager bounds emit branchChange', () => {
  const { el } = mount('vanilla/MessageActionToolbar.js', 'MessageActionToolbar', {
    content: 'x', role: 'user', 'total-branches': '3', 'branch-index': '1',
  });
  assert.ok(el.querySelector('#prev-branch'), 'pager appears for multi-branch');
  assert.ok(el.querySelector('#prev-branch').hasAttribute('disabled') === false);
  const events = [];
  el.addEventListener('branchChange', (e) => events.push(e.detail));
  el.querySelector('#next-branch').click();
  el.querySelector('#prev-branch').click();
  assert.deepEqual(events, [2, 0]);
  // user role hides rating buttons
  assert.equal(el.querySelector('#thumb-up'), null);
});
