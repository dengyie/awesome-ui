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

// Strip each component's own escapeAttribute definition (sources reference it
// but it's per-file), the import, the default export and the `export` keyword.
const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const diffSource = stripComponent('DiffViewer.js', 'DiffViewerElement');
const sessionSource = stripComponent('ChatSessionList.js', 'ChatSessionListElement');
const paletteSource = stripComponent('CommandPalette.js', 'CommandPaletteElement');
const toastSource = stripComponent('ToastStack.js', 'ToastStackElement');
const promptSource = stripComponent('ChatPromptInput.js', 'ChatPromptInput');
const thinkingSource = stripComponent('ThinkingBlock.js', 'ThinkingBlock');

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

const ctx = (type) => ({ type, content: `line ${type}` });

test('DiffViewer — multi-file tabs render with per-file counts and switch content', () => {
  const { el } = mount(diffSource, 'DiffViewerElement', 'diff-viewer');
  el.files = [
    { filename: 'app.ts', language: 'ts', lines: [ctx('add'), ctx('remove')] },
    { filename: 'readme.md', lines: [ctx('context')] },
  ];
  assert.ok(el.querySelector('[role="tablist"]'), 'tab bar rendered');
  assert.ok(el.innerHTML.includes('app.ts'), 'first file name');
  assert.ok(el.innerHTML.includes('readme.md'), 'second file name');
  assert.ok(el.querySelector('[role="tab"][aria-selected="true"]'));

  const tabs = el.querySelectorAll('.diff-tab');
  tabs[1].click();
  assert.ok(el.innerHTML.includes('readme.md'));
  assert.equal(el.querySelector('[role="tab"][aria-selected="true"]').getAttribute('data-file-idx'), '1');
});

test('DiffViewer — long context runs fold into gap rows that expand with hidden lines', () => {
  const { el } = mount(diffSource, 'DiffViewerElement', 'diff-viewer');
  el.lines = [
    ctx('add'),
    ...Array.from({ length: 10 }, (_, i) => ({ type: 'context', content: `c${i}` })),
    ctx('remove'),
  ];
  const gap = el.querySelector('.diff-gap-toggle');
  assert.ok(gap, 'gap toggle rendered');
  assert.ok(gap.textContent.includes('4 unchanged lines'), '10 context - 3 head - 3 tail = 4 hidden');

  gap.click();
  // Expanded: 10 context rows visible, plus a "Collapse" button
  assert.equal(el.querySelectorAll('.diff-gap-toggle').length, 1);
  assert.ok(el.textContent.includes('Collapse unchanged lines'));
  assert.ok(el.textContent.includes('c9'), 'hidden tail line now visible');
});

test('DiffViewer — short context runs and tail runs stay unfolded / tail keeps head only', () => {
  const { el } = mount(diffSource, 'DiffViewerElement', 'diff-viewer');
  // 6 context lines (<= 2*3) between changes: no gap
  el.lines = [ctx('add'), ...Array.from({ length: 6 }, (_, i) => ({ type: 'context', content: `s${i}` })), ctx('remove')];
  assert.equal(el.querySelectorAll('.diff-gap-toggle').length, 0, 'no fold for short run');

  // Trailing context run: only head kept, rest folded
  el.lines = [ctx('add'), ...Array.from({ length: 8 }, (_, i) => ({ type: 'context', content: `t${i}` }))].map((l) =>
    typeof l === 'object' && l.content === undefined ? l : l
  );
  // rebuild with trailing context only (no trailing change line):
  const { el: el2 } = mount(diffSource, 'DiffViewerElement', 'diff-viewer');
  el2.lines = [ctx('add'), ...Array.from({ length: 8 }, (_, i) => ({ type: 'context', content: `t${i}` }))];
  const gaps = el2.querySelectorAll('.diff-gap-toggle');
  assert.equal(gaps.length, 1, 'tail run folds');
  assert.ok(gaps[0].textContent.includes('5 unchanged lines'), '8 - 3 head = 5 hidden');
});

test('ChatSessionList — grouped sessions render collapsible headers; collapse hides rows', () => {
  const { el } = mount(sessionSource, 'ChatSessionListElement', 'chat-session-list');
  el.sessions = [
    { id: 1, title: 'Today chat', group: 'Today' },
    { id: 2, title: 'Yesterday chat', group: 'Previous 7 days' },
    { id: 3, title: 'Old chat' },
  ];
  const toggles = el.querySelectorAll('.group-toggle');
  assert.equal(toggles.length, 2, 'Today + Previous 7 days headers; ungrouped has none');
  assert.ok(el.textContent.includes('Old chat'), 'Recent bucket renders without header');

  toggles[0].click();
  assert.ok(!el.textContent.includes('Today chat'), 'Today rows hidden after collapse');
  assert.ok(el.textContent.includes('Yesterday chat'), 'other group unaffected');
  el.querySelectorAll('.group-toggle')[0].click();
  assert.ok(el.textContent.includes('Today chat'), 're-expand works');
});

test('ChatSessionList — user card renders initials, email and dispatches user-click', () => {
  const { el, window } = mount(sessionSource, 'ChatSessionListElement', 'chat-session-list');
  el.sessions = [{ id: 1, title: 'A chat' }];
  const events = [];
  el.addEventListener('user-click', (e) => events.push(e));
  el.user = { name: 'Ada Lovelace', email: 'ada@example.com' };
  const card = el.querySelector('.user-card');
  assert.ok(card, 'user card rendered');
  assert.ok(card.textContent.includes('AL'), 'initials from two words');
  assert.ok(card.textContent.includes('ada@example.com'), 'email shown');
  card.click();
  assert.equal(events.length, 1, 'user-click dispatched');
});

test('CommandPalette — shortcut hint bar renders with keys and labels', () => {
  const { el } = mount(paletteSource, 'CommandPaletteElement', 'command-palette', { open: '' });
  const bar = el.textContent;
  assert.ok(bar.includes('Navigate'), 'Navigate hint');
  assert.ok(bar.includes('Select'), 'Select hint');
  assert.ok(bar.includes('Close'), 'Close hint');
  assert.ok(el.textContent.includes('esc'), 'esc key rendered');
});

test('ToastStack — countdown bar rendered and shrinks; sticky mode (duration 0) has no bar', () => {
  const { el, window } = mount(toastSource, 'ToastStackElement', 'toast-stack', { duration: '4000' });
  el.push('Saved!', 'success');
  const bar = el.querySelector('[data-bar-id]');
  assert.ok(bar, 'countdown bar rendered');
  assert.ok(bar.className.includes('bg-emerald-500'), 'bar uses type color');
  assert.ok(bar.getAttribute('style').includes('%'), 'bar width is percentage-based');

  const sticky = mount(toastSource, 'ToastStackElement', 'toast-stack', { duration: '0' });
  sticky.el.push('Sticky', 'info');
  assert.equal(sticky.el.querySelector('[data-bar-id]'), null, 'no bar in sticky mode');
});

test('ChatPromptInput — chips row renders and dispatches chip event with payload', () => {
  const { el, window } = mount(promptSource, 'ChatPromptInput', 'chat-prompt-input');
  const events = [];
  el.addEventListener('chip', (e) => events.push(e.detail));
  el.chips = [
    { id: 'gpt', label: 'GPT-4o', icon: 'sparkles', active: true },
    { id: 'web', label: 'Web search' },
  ];
  const chips = el.querySelectorAll('.prompt-chip');
  assert.equal(chips.length, 2, 'two chips rendered');
  assert.ok(chips[0].getAttribute('aria-pressed') === 'true', 'active chip pressed');
  chips[1].click();
  assert.equal(events.length, 1);
  assert.equal(events[0].id, 'web');
  assert.equal(events[0].label, 'Web search');
});

test('ThinkingBlock — steps timeline with durations and collapsed running summary', () => {
  const { el } = mount(thinkingSource, 'ThinkingBlock', 'thinking-block');
  el.setAttribute('content', 'deliberating');
  el.steps = [
    { id: 's1', label: 'Parsing question', durationMs: 240 },
    { id: 's2', label: 'Searching memory' },
  ];
  // collapsed by default (no is-thinking attr) → summary row shows running step
  assert.ok(el.textContent.includes('Searching memory'), 'running step in collapsed summary');
  assert.ok(el.querySelector('.animate-pulse'), 'pulse dot for running step');

  // expand → timeline with durations
  el.querySelector('#toggle-btn').click();
  assert.ok(el.textContent.includes('Parsing question'), 'step labels in timeline');
  assert.ok(el.textContent.includes('240ms'), 'duration badge rendered');
  assert.ok(el.querySelector('ol li'), 'ol timeline rendered');
});
