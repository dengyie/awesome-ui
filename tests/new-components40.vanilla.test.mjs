/**
 * jsdom tests for the v1.40.0 vanilla components
 * (AiRewriteMenu, PromptPerformanceTable, ShareAccessDialog).
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

test('vanilla AiRewriteMenu — trigger toggle, select event, badge', () => {
  const El = instantiate('AiRewriteMenu.js', 'AiRewriteMenuElement');
  const el = new El();
  el.setAttribute(
    'actions',
    JSON.stringify([
      { id: 'a1', label: 'Expand' },
      { id: 'a2', label: 'Rephrase' },
      { id: 'a3', label: 'My tone of voice', badge: 'Get feature' },
      { id: 'a4', label: 'Translate to...' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-rewrite-menu-root]'), 'root rendered');
  assert.ok(el.querySelector('[data-rewrite-trigger]'), 'trigger rendered');
  assert.equal(el.querySelector('[data-rewrite-trigger]').getAttribute('aria-expanded'), 'false', 'starts closed');
  assert.equal(el.querySelectorAll('[data-rewrite-item]').length, 0, 'no items while closed');

  let toggled = null;
  let selected = null;
  el.addEventListener('toggle', (e) => { toggled = e.detail.open; });
  el.addEventListener('select', (e) => { selected = e.detail.action; });

  el.querySelector('[data-rewrite-trigger]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(toggled, true, 'toggle event open');
  assert.equal(el.querySelector('[data-rewrite-trigger]').getAttribute('aria-expanded'), 'true', 'open after click');
  assert.equal(el.querySelectorAll('[data-rewrite-item]').length, 4, 'four items when open');
  assert.ok(el.querySelector('[data-rewrite-item="a1"]').textContent.includes('Expand'), 'item label');
  assert.ok(el.querySelector('[data-rewrite-item="a3"] [data-rewrite-item-badge]'), 'badge rendered');
  assert.ok(el.querySelector('[data-rewrite-item="a3"]').textContent.includes('Get feature'), 'badge text');

  el.querySelector('[data-rewrite-item="a2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(selected && selected.id === 'a2', 'select event detail action');
  assert.equal(el.querySelector('[data-rewrite-trigger]').getAttribute('aria-expanded'), 'false', 'closes after select');

  el.actions = [];
  el.open = true;
  assert.equal(el.querySelectorAll('[data-rewrite-item]').length, 0, 'no items without actions');
});

test('vanilla PromptPerformanceTable — rows, trend marks, export/row-click events', () => {
  const El = instantiate('PromptPerformanceTable.js', 'PromptPerformanceTableElement');
  const el = new El();
  el.setAttribute(
    'rows',
    JSON.stringify([
      { id: 'p1', prompt: 'best ai note taking app', visibility: '68%', sentiment: '8.2', position: '#1', mentions: '42', trend: 'up' },
      { id: 'p2', prompt: 'how to summarize lectures', visibility: '31%', sentiment: '7.4', position: '#4', mentions: '17', trend: 'down' },
      { id: 'p3', prompt: 'meeting notes template', visibility: '12%', sentiment: '6.8', position: '#9', mentions: '5' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-prompt-performance-table]'), 'host rendered');
  assert.ok(el.querySelector('[data-prompt-performance-title]').textContent.includes('Prompt performance'), 'default title');
  assert.ok(el.querySelector('[data-prompt-performance-export]'), 'export CTA');
  assert.equal(el.querySelectorAll('[data-prompt-row]').length, 3, 'three rows');
  assert.ok(el.querySelector('[data-prompt-row="p1"]').textContent.includes('best ai note taking app'), 'prompt text');
  assert.ok(el.querySelector('[data-prompt-row="p1"] [data-prompt-row-visibility]').textContent.includes('68%'), 'visibility value');
  assert.ok(el.querySelector('[data-prompt-row="p1"] [data-prompt-row-sentiment]').textContent.includes('▲'), 'up trend mark');
  assert.ok(el.querySelector('[data-prompt-row="p2"] [data-prompt-row-sentiment]').textContent.includes('▼'), 'down trend mark');
  assert.ok(el.querySelector('[data-prompt-row="p3"] [data-prompt-row-sentiment]').textContent.includes('—'), 'flat trend mark');
  assert.ok(el.querySelector('[data-prompt-row="p2"] [data-prompt-row-position]').textContent.includes('#4'), 'position value');
  assert.ok(el.querySelector('[data-prompt-row="p1"] [data-prompt-row-mentions]').textContent.includes('42'), 'mentions value');

  let exported = false;
  let clickedRow = null;
  el.addEventListener('export', () => { exported = true; });
  el.addEventListener('row-click', (e) => { clickedRow = e.detail.row; });

  el.querySelector('[data-prompt-performance-export]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(exported, 'export event');

  el.querySelector('[data-prompt-row="p2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(clickedRow && clickedRow.id === 'p2', 'row-click event detail row');

  el.rows = [];
  assert.ok(el.querySelector('[data-prompt-performance-empty]'), 'empty state on property set');
});

test('vanilla ShareAccessDialog — people rows, remove, copy-link, close', () => {
  const El = instantiate('ShareAccessDialog.js', 'ShareAccessDialogElement');
  const el = new El();
  el.setAttribute(
    'people',
    JSON.stringify([
      { id: 'u1', name: 'Alex Smith', email: 'alex@team.com', role: 'Publisher' },
      { id: 'u2', name: 'Brook Taylor', email: 'brook@team.com' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-share-access-dialog]'), 'dialog rendered');
  assert.ok(el.querySelector('[data-share-access-title]').textContent.includes('Share Conversation'), 'default title');
  assert.ok(el.querySelector('[data-share-access-input]'), 'invite input');
  assert.equal(el.querySelectorAll('[data-access-person]').length, 2, 'two people');
  assert.ok(el.querySelector('[data-access-person="u1"]').textContent.includes('Alex Smith'), 'person name');
  assert.ok(el.querySelector('[data-access-person="u1"]').textContent.includes('alex@team.com'), 'person email');
  assert.ok(el.querySelector('[data-access-person="u1"] [data-access-person-role]').textContent.includes('Publisher'), 'role badge');
  assert.equal(el.querySelector('[data-access-person="u2"] [data-access-person-role]'), null, 'no role for u2');
  assert.ok(el.querySelector('[data-access-person="u1"]').textContent.includes('AS'), 'initials');
  assert.ok(el.querySelector('[data-share-access-url-text]').textContent.includes('https://example.com/share/abc123'), 'default url');
  assert.ok(el.querySelector('[data-share-access-copy]').textContent.includes('COPY LINK'), 'copy label');

  let copied = null;
  let removed = null;
  let closed = false;
  el.addEventListener('copy-link', (e) => { copied = e.detail.url; });
  el.addEventListener('remove-person', (e) => { removed = e.detail.person; });
  el.addEventListener('close', () => { closed = true; });

  el.querySelector('[data-share-access-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copied && copied.includes('example.com/share/abc123'), 'copy-link event detail url');

  el.querySelector('[data-access-person="u1"] [data-access-person-remove]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(removed && removed.id === 'u1', 'remove-person event detail person');
  assert.equal(el.querySelectorAll('[data-access-person]').length, 1, 'one person left after remove');

  el.querySelector('[data-share-access-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'close event');
  assert.equal(el.innerHTML, '', 'content cleared when closed');

  el.people = [];
  el.open = true;
  assert.ok(el.querySelector('[data-share-access-empty]'), 'empty state on property set');
});
