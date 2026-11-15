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

const timelineSource = stripComponent('AgentStepTimeline.js', 'AgentStepTimelineElement');
const templateSource = stripComponent('PromptTemplateGrid.js', 'PromptTemplateGridElement');
const checklistSource = stripComponent('AgentTaskChecklist.js', 'AgentTaskChecklistElement');

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

test('AgentStepTimeline — renders step statuses with icons, connectors and escaping', () => {
  const { el } = mount(timelineSource, 'AgentStepTimelineElement', 'agent-step-timeline');
  el.steps = [
    { id: 1, title: 'Read repository', status: 'done', duration: '1.2s' },
    { id: 2, title: 'Apply patch <b>now</b>', status: 'running', description: 'Editing 3 files' },
    { id: 3, title: 'Run tests', status: 'pending' },
  ];

  assert.ok(el.innerHTML.includes('Read repository'), 'done step rendered');
  assert.ok(el.innerHTML.includes('1.2s'), 'duration rendered');
  assert.ok(el.innerHTML.includes('animate-spin'), 'running step spins loader');
  assert.ok(el.innerHTML.includes('Editing 3 files'), 'description rendered');
  assert.ok(!el.innerHTML.includes('<b>now</b>'), 'title escaped (no XSS)');
  assert.equal(el.querySelectorAll('li').length, 3, 'three steps rendered');

  const connectors = el.querySelectorAll('li > span[aria-hidden]');
  assert.equal(connectors.length, 2, 'connector between steps, none after last');
  assert.ok(connectors[0].className.includes('bg-emerald-300'), 'done connector tinted green');
  assert.ok(connectors[1].className.includes('bg-zinc-200'), 'running connector neutral');

  el.steps = [];
  assert.equal(el.innerHTML, '', 'empty steps render nothing');
});

test('PromptTemplateGrid — renders cards and dispatches use with the template', () => {
  const { el } = mount(templateSource, 'PromptTemplateGridElement', 'prompt-template-grid');
  el.templates = [
    { id: 't1', title: 'Code Review', description: 'Review a diff like a senior engineer', prompt: 'Review this diff...', tag: 'Dev' },
    { id: 't2', title: 'SQL Optimizer', description: 'Rewrite slow queries', prompt: 'Optimize this query...', tag: 'Data' },
  ];

  assert.ok(el.innerHTML.includes('Code Review'), 'title rendered');
  assert.ok(el.innerHTML.includes('Dev'), 'tag badge rendered');
  assert.equal(el.querySelectorAll('.template-card').length, 2, 'two cards rendered');

  let used = null;
  el.addEventListener('use', (e) => (used = e.detail));
  el.querySelectorAll('.template-card')[1].click();
  assert.equal(used?.id, 't2', 'use event carries clicked template');
  assert.equal(used?.prompt, 'Optimize this query...', 'prompt payload included');
});

test('AgentTaskChecklist — renders progress, status icons, dispatches toggle', () => {
  const { el } = mount(checklistSource, 'AgentTaskChecklistElement', 'agent-task-checklist', {
    title: 'Migration plan',
  });
  el.items = [
    { id: 1, label: 'Backup database', status: 'done' },
    { id: 2, label: 'Run migration', status: 'active' },
    { id: 3, label: 'Verify schema', status: 'pending' },
  ];

  assert.ok(el.innerHTML.includes('Migration plan'), 'title rendered');
  assert.ok(el.innerHTML.includes('1/3'), 'done/total counter rendered');
  assert.ok(el.innerHTML.includes('line-through'), 'done item struck through');
  assert.ok(el.innerHTML.includes('animate-spin'), 'active item spins');

  let toggledId = null;
  el.addEventListener('toggle', (e) => (toggledId = e.detail.id));
  el.querySelectorAll('.task-item')[2].click();
  assert.equal(toggledId, 3, 'toggle event carries task id');

  el.items = [
    { id: 1, label: 'Backup database', status: 'done' },
    { id: 2, label: 'Run migration', status: 'done' },
    { id: 3, label: 'Verify schema', status: 'done' },
  ];
  assert.ok(el.innerHTML.includes('3/3'), 'counter updates on items change');
});

test('vanilla host className — user classes survive renders across all three new components', () => {
  const { el: timeline } = mount(timelineSource, 'AgentStepTimelineElement', 'agent-step-timeline', { class: 'my-6' });
  timeline.steps = [{ id: 1, title: 'Step', status: 'done' }];
  assert.ok(timeline.className.includes('block'), 'timeline keeps layout class');
  assert.ok(timeline.className.includes('my-6'), 'timeline preserves user class');

  const { el: grid } = mount(templateSource, 'PromptTemplateGridElement', 'prompt-template-grid', { class: 'mt-4' });
  grid.templates = [{ id: 'a', title: 'T', prompt: 'P' }];
  assert.ok(grid.className.includes('grid'), 'grid keeps layout class');
  assert.ok(grid.className.includes('mt-4'), 'grid preserves user class');

  const { el: checklist } = mount(checklistSource, 'AgentTaskChecklistElement', 'agent-task-checklist', { class: 'w-80' });
  checklist.items = [{ id: 1, label: 'Task', status: 'pending' }];
  assert.ok(checklist.className.includes('rounded-xl'), 'checklist keeps layout class');
  assert.ok(checklist.className.includes('w-80'), 'checklist preserves user class');

  // re-render via observed attribute must not clobber the user class either
  checklist.setAttribute('title', 'Renamed');
  assert.ok(checklist.innerHTML.includes('Renamed'), 'title attribute re-renders header');
  assert.ok(checklist.className.includes('w-80'), 'user class survives attribute-driven re-render');
});

test('AgentTaskChecklist — keyboard Enter and Space dispatch toggle', () => {
  const { window, el } = mount(checklistSource, 'AgentTaskChecklistElement', 'agent-task-checklist');
  el.items = [{ id: 7, label: 'Keyboard task', status: 'pending' }];

  const seen = [];
  el.addEventListener('toggle', (e) => seen.push(e.detail.id));
  const row = el.querySelector('.task-item');
  row.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  row.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  row.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }));
  assert.deepEqual(seen, [7, 7], 'Enter and Space toggle, other keys ignored');
});

test('PromptTemplateGrid — card without tag/description renders minimal body', () => {
  const { el } = mount(templateSource, 'PromptTemplateGridElement', 'prompt-template-grid');
  el.templates = [{ id: 'bare', title: 'Bare Template', prompt: 'Do the thing' }];

  const card = el.querySelector('.template-card');
  assert.ok(card, 'card rendered');
  assert.ok(card.textContent.includes('Bare Template'), 'title rendered');
  assert.equal(card.querySelectorAll('.bg-indigo-50').length, 0, 'no tag badge without tag');
  assert.ok(!card.textContent.includes('undefined'), 'no undefined leakage for missing description');

  let used = null;
  el.addEventListener('use', (e) => (used = e.detail));
  card.click();
  assert.equal(used?.prompt, 'Do the thing', 'use event works on minimal card');
});

test('AgentStepTimeline — unknown status falls back to pending icon AND muted title color', () => {
  const { el } = mount(timelineSource, 'AgentStepTimelineElement', 'agent-step-timeline');
  el.steps = [{ id: 1, title: 'Mystery step', status: 'runnning' }];

  const title = el.querySelector('li .text-sm');
  assert.ok(title, 'title rendered');
  assert.ok(title.className.includes('text-zinc-400'), 'unknown status title uses muted pending color');
  assert.ok(!title.className.includes('text-zinc-800'), 'unknown status title not rendered as active');
});
