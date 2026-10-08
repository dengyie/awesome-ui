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

const sessionSource = stripComponent('ChatSessionList.js', 'ChatSessionListElement');
const diffSource = stripComponent('DiffViewer.js', 'DiffViewerElement');
const approvalSource = stripComponent('ToolApprovalCard.js', 'ToolApprovalCardElement');

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

test('ChatSessionList — renders sessions, highlights active, dispatches select and delete', () => {
  const { el } = mount(sessionSource, 'ChatSessionListElement', 'chat-session-list', {
    'active-id': '2',
  });
  el.sessions = [
    { id: 1, title: 'Refactor auth module <script>', timeLabel: '2h ago' },
    { id: 2, title: 'Deploy homepage', timeLabel: '1d ago' },
  ];

  assert.ok(el.innerHTML.includes('Refactor auth module'), 'session title rendered');
  assert.ok(!el.innerHTML.includes('<script>'), 'title escaped (no XSS)');
  assert.ok(el.innerHTML.includes('2'), 'session count badge rendered');

  const rows = el.querySelectorAll('.session-item');
  assert.ok(rows[1].className.includes('bg-indigo-50'), 'active session highlighted');
  assert.ok(!rows[0].className.includes('bg-indigo-50'), 'inactive session not highlighted');

  let selected = null;
  let deletedId = null;
  el.addEventListener('select', (e) => (selected = e.detail));
  el.addEventListener('delete', (e) => (deletedId = e.detail.id));

  rows[0].dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.equal(selected?.id, 1, 'click dispatches select with session');

  const deleteBtn = rows[0].querySelector('.session-delete');
  deleteBtn.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.equal(deletedId, 1, 'delete button dispatches delete with id');
  assert.equal(selected?.id, 1, 'delete does not trigger select again');

  el.activeId = '1';
  assert.ok(el.querySelectorAll('.session-item')[0].className.includes('bg-indigo-50'), 'active-id attribute update re-renders highlight');
});

test('DiffViewer — renders add/remove/context lines with counts and line numbers', () => {
  const { el } = mount(diffSource, 'DiffViewerElement', 'diff-viewer', {
    filename: 'src/app.ts',
    language: 'ts',
  });
  el.lines = [
    { type: 'context', content: 'import React from "react";' },
    { type: 'remove', content: 'const x = <img src=x>;' },
    { type: 'add', content: 'const x = sanitize(input);' },
    { type: 'add', content: 'export default x;' },
  ];

  assert.ok(el.innerHTML.includes('src/app.ts'), 'filename rendered');
  assert.ok(el.innerHTML.includes('+2'), 'added count rendered');
  assert.ok(el.innerHTML.includes('-1'), 'removed count rendered');
  assert.ok(el.innerHTML.includes('bg-emerald-500/10'), 'add line styled');
  assert.ok(el.innerHTML.includes('bg-rose-500/10'), 'remove line styled');
  assert.ok(!el.innerHTML.includes('<img src=x>'), 'line content escaped (no XSS)');
});

test('ToolApprovalCard — pending shows buttons, approve/reject dispatch events and update status', () => {
  const { el } = mount(approvalSource, 'ToolApprovalCardElement', 'tool-approval-card', {
    'tool-name': 'shell_execute',
    description: 'Run rm -rf on build output',
    risk: 'high',
  });
  el.args = { cmd: 'rm -rf dist' };

  assert.ok(el.innerHTML.includes('shell_execute'), 'tool name rendered');
  assert.ok(el.innerHTML.includes('high risk'), 'high risk badge rendered');
  assert.ok(el.className.includes('border-amber-300'), 'high risk border accent');
  assert.ok(el.innerHTML.includes('rm -rf dist'), 'args rendered');
  assert.ok(el.querySelector('.approval-approve'), 'approve button present while pending');

  let approved = false;
  el.addEventListener('approve', () => (approved = true));
  el.querySelector('.approval-approve').click();
  assert.ok(approved, 'approve event dispatched');
  assert.equal(el.getAttribute('status'), 'approved', 'status self-updated to approved');
  assert.ok(el.innerHTML.includes('Approved'), 'approved state rendered');
  assert.ok(!el.querySelector('.approval-approve'), 'buttons hidden after resolution');

  const { el: el2 } = mount(approvalSource, 'ToolApprovalCardElement', 'tool-approval-card', {
    'tool-name': 'file_write',
  });
  let rejected = false;
  el2.addEventListener('reject', () => (rejected = true));
  el2.querySelector('.approval-reject').click();
  assert.ok(rejected, 'reject event dispatched');
  assert.equal(el2.getAttribute('status'), 'rejected', 'status self-updated to rejected');
  assert.ok(el2.innerHTML.includes('Rejected'), 'rejected state rendered');
});
