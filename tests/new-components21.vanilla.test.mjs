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

const wizardSource = stripComponent('WizardSteps.js', 'WizardStepsElement');
const formfieldSource = stripComponent('FormField.js', 'FormFieldElement');
const ganttSource = stripComponent('GanttTimeline.js', 'GanttTimelineElement');
const approvalSource = stripComponent('ApprovalCard.js', 'ApprovalCardElement');
const resourceSource = stripComponent('ResourceList.js', 'ResourceListElement');

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
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('WizardSteps — vertical states, step-click event and optional tag', () => {
  const { el, window } = mount(wizardSource, 'WizardStepsElement', 'wizard-steps', { current: '1' });
  const clicks = collect(el, 'step-click');
  let propertyClicks = 0;
  el.onStepClick = () => propertyClicks++;
  el.steps = [
    { label: 'Policy details' },
    { label: 'Submission method' },
    { label: 'Geofencing settings', optional: true },
    { label: 'Submission frequency' },
  ];

  assert.equal(el.querySelectorAll('[data-step-index]').length, 4, 'four steps');
  assert.ok(el.textContent.includes('Policy details'), 'step label');
  assert.ok(el.textContent.includes('(Optional)'), 'optional tag');
  assert.equal(el.querySelectorAll('[aria-current="step"]').length, 1, 'one active step');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'done tone');

  el.querySelectorAll('[data-step-index]')[0].click();
  assert.equal(clicks.length, 1, 'step-click fired');
  assert.equal(clicks[0].index, 0, 'index detail');
  assert.equal(clicks[0].step.label, 'Policy details', 'step detail');
  assert.equal(propertyClicks, 1, 'onStepClick property called');

  // clicking a future step is ignored
  el.querySelectorAll('[data-step-index]')[3].click();
  assert.equal(clicks.length, 1, 'future step ignored');

  el.current = 2;
  assert.equal(el.getAttribute('current'), '2', 'current setter syncs attribute');
});

test('WizardSteps — bar variant progress', () => {
  const { el } = mount(wizardSource, 'WizardStepsElement', 'wizard-steps', {
    current: '1',
    variant: 'bar',
  });
  el.steps = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];

  assert.ok(el.textContent.includes('2 of 3 steps'), 'counter');
  assert.ok(el.textContent.includes('Next: C'), 'next hint');
  assert.ok(el.innerHTML.includes('role="progressbar"'), 'progressbar');
  assert.ok(el.innerHTML.includes('aria-valuenow="2"'), 'value now');
  assert.ok(el.innerHTML.includes('bg-violet-600'), 'fill tone');
  assert.ok(el.innerHTML.includes('width:67%'), 'fill width');
});

test('FormField — label, required star, counter and error', () => {
  const { el } = mount(formfieldSource, 'FormFieldElement', 'form-field', {
    label: 'Policy name',
    for: 'policy-name',
    required: '',
    'counter-value': '19',
    'counter-max': '70',
    error: 'Name is required',
  });
  const input = el.ownerDocument.createElement('input');
  input.id = 'policy-name';
  input.value = 'Work Hours Tracking';
  el.appendChild(input);
  el.render();

  assert.ok(el.textContent.includes('Policy name'), 'label');
  assert.ok(el.innerHTML.includes('text-rose-500'), 'required star');
  assert.ok(el.textContent.includes('19/70'), 'counter');
  assert.ok(el.textContent.includes('Name is required'), 'error');
  assert.ok(el.innerHTML.includes('aria-invalid="true"'), 'invalid flag');
  assert.ok(el.querySelector('input'), 'slotted control preserved');
  assert.equal(el.querySelector('input').value, 'Work Hours Tracking', 'control value kept');
});

test('FormField — optional and hint variants', () => {
  const { el } = mount(formfieldSource, 'FormFieldElement', 'form-field', {
    label: 'Description',
    optional: '',
    hint: 'Max 140 characters',
  });
  assert.ok(el.textContent.includes('(Optional)'), 'optional tag');
  assert.ok(el.textContent.includes('Max 140 characters'), 'hint');
  assert.ok(!el.innerHTML.includes('text-rose-500'), 'no required star');
});

test('GanttTimeline — bars, today line, task-click and depth', () => {
  const { el } = mount(ganttSource, 'GanttTimelineElement', 'gantt-timeline', {
    columns: '10',
    today: '4',
  });
  const clicks = collect(el, 'task-click');
  let propertyClicks = 0;
  el.onTaskClick = () => propertyClicks++;
  el.tasks = [
    { label: 'Research', start: 0, span: 4, progress: 55, tone: 'emerald' },
    { label: 'User Research', start: 2, span: 5, depth: 1 },
    { label: 'Prototype', start: 6, span: 3, tone: 'amber' },
  ];

  assert.equal(el.querySelectorAll('[data-task-index]').length, 3, 'three rows');
  assert.ok(el.textContent.includes('Research'), 'task label');
  assert.ok(el.textContent.includes('55%'), 'progress label');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'emerald tone');
  assert.ok(el.innerHTML.includes('bg-amber-400'), 'amber tone');
  assert.ok(el.innerHTML.includes('bg-rose-400'), 'today line');
  assert.ok(el.innerHTML.includes('padding-left:2.25rem'), 'depth indent');

  el.querySelectorAll('[data-task-index]')[1].click();
  assert.equal(clicks.length, 1, 'task-click fired');
  assert.equal(clicks[0].index, 1, 'index detail');
  assert.equal(clicks[0].task.label, 'User Research', 'task detail');
  assert.equal(propertyClicks, 1, 'onTaskClick property called');
});

test('GanttTimeline — empty state text', () => {
  const { el } = mount(ganttSource, 'GanttTimelineElement', 'gantt-timeline', {
    'empty-text': 'Nothing scheduled',
  });
  assert.ok(el.textContent.includes('Nothing scheduled'), 'empty text');
});

test('ApprovalCard — approvers, decision and events', () => {
  const { el } = mount(approvalSource, 'ApprovalCardElement', 'approval-card', {
    title: 'A project needs approval',
    'approved-count': '1',
    'due-date': '3 Jun',
    decision: 'pending',
    note: 'Research and design approval required.',
  });
  const approves = collect(el, 'approve');
  const rejects = collect(el, 'reject');
  const changes = collect(el, 'request-change');
  let propertyApprove = 0;
  el.onApprove = () => propertyApprove++;
  el.onReject = () => {};
  el.onRequestChange = () => {};
  el.approvers = [
    { initials: 'JS', tone: 'indigo' },
    { initials: 'SL', tone: 'rose' },
  ];

  assert.ok(el.textContent.includes('A project needs approval'), 'title');
  assert.ok(el.textContent.includes('1/2'), 'counter');
  assert.ok(el.textContent.includes('3 Jun'), 'due date');
  assert.ok(el.innerHTML.includes('bg-rose-600'), 'rose avatar');
  assert.ok(el.textContent.includes('pending'), 'decision');

  el.querySelector('[data-approval-approve]').click();
  assert.equal(approves.length, 1, 'approve fired');
  assert.equal(propertyApprove, 1, 'onApprove called');
  el.querySelector('[data-approval-reject]').click();
  assert.equal(rejects.length, 1, 'reject fired');
  el.querySelector('[data-request-change]').click();
  assert.equal(changes.length, 1, 'request-change fired');
});

test('ApprovalCard — decision tones without buttons', () => {
  const approved = mount(approvalSource, 'ApprovalCardElement', 'approval-card', {
    title: 'T',
    decision: 'approved',
  });
  assert.ok(approved.el.innerHTML.includes('text-emerald-600'), 'approved tone');
  assert.equal(approved.el.querySelector('[data-approval-approve]'), null, 'no buttons without handlers');
  const rejected = mount(approvalSource, 'ApprovalCardElement', 'approval-card', {
    title: 'T',
    decision: 'rejected',
  });
  assert.ok(rejected.el.innerHTML.includes('text-rose-600'), 'rejected tone');
});

test('ResourceList — rows, kinds, select event and max-items', () => {
  const { el } = mount(resourceSource, 'ResourceListElement', 'resource-list', {
    title: 'Recents',
    'max-items': '2',
    selectable: '',
  });
  const selects = collect(el, 'select');
  el.items = [
    { name: 'Retail Job', kind: 'Job', kindTone: 'indigo', timeLabel: '13 minutes ago' },
    { name: 'mobbin_retail_sales', path: 'workspace.dataset', kind: 'Table' },
    { name: 'Transaction Trigger', kind: 'Alert', kindTone: 'amber', icon: 'bell' },
  ];

  assert.equal(el.querySelectorAll('[data-resource-index]').length, 2, 'maxItems caps rows');
  assert.ok(el.textContent.includes('Retail Job'), 'item name');
  assert.ok(el.textContent.includes('workspace.dataset'), 'mono path');
  assert.ok(el.innerHTML.includes('bg-indigo-100'), 'indigo kind tone');
  assert.ok(el.textContent.includes('13 minutes ago'), 'time label');
  assert.ok(el.innerHTML.includes('role="button"'), 'selectable rows');
  assert.ok(el.textContent.includes('3'), 'header count of full list');

  el.querySelectorAll('[data-resource-index]')[0].click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].index, 0, 'index detail');
  assert.equal(selects[0].item.name, 'Retail Job', 'item detail');
});

test('ResourceList — onSelect property and empty state', () => {
  const { el } = mount(resourceSource, 'ResourceListElement', 'resource-list');
  const calls = [];
  el.onSelect = (item, index) => calls.push([item, index]);
  el.items = [{ name: 'a' }, { name: 'b' }];
  el.querySelectorAll('[data-resource-index]')[1].click();
  assert.equal(calls.length, 1, 'onSelect called');
  assert.equal(calls[0][1], 1, 'index arg');

  const empty = mount(resourceSource, 'ResourceListElement', 'resource-list', {
    'empty-text': 'Nothing here',
  });
  assert.ok(empty.el.textContent.includes('Nothing here'), 'empty text');
});
