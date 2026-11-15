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

const clarifySource = stripComponent('ClarifyQuestionCard.js', 'ClarifyQuestionCardElement');
const taskSource = stripComponent('AgentTaskProgress.js', 'AgentTaskProgressElement');
const quotaSource = stripComponent('UsageQuotaCard.js', 'UsageQuotaCardElement');
const switcherSource = stripComponent('WorkspaceSwitcherMenu.js', 'WorkspaceSwitcherMenuElement');
const chipSource = stripComponent('AttachmentChip.js', 'AttachmentChipElement');

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

test('ClarifyQuestionCard — paging, input, answer event and answered state', () => {
  const { el, window } = mount(clarifySource, 'ClarifyQuestionCardElement', 'clarify-question', {
    question: 'What is the primary goal of this project?',
    title: 'Clarification needed',
    index: '2',
    total: '3',
  });
  const answers = collect(el, 'answer');
  const prevs = collect(el, 'prev');
  const nexts = collect(el, 'next');

  assert.ok(el.textContent.includes('Clarification needed'), 'title');
  assert.ok(el.textContent.includes('What is the primary goal of this project?'), 'question');
  assert.ok(el.textContent.includes('2 of 3'), 'paging counter');
  assert.ok(el.querySelector('[data-clarify-prev]'), 'prev button');
  assert.ok(el.querySelector('[data-clarify-next]'), 'next button');
  assert.ok(el.querySelector('[data-clarify-input]'), 'answer input');
  assert.ok(el.textContent.includes('Used ask user question'), 'step label');

  el.querySelector('[data-clarify-prev]').click();
  el.querySelector('[data-clarify-next]').click();
  assert.equal(prevs.length, 1, 'prev fired');
  assert.equal(nexts.length, 1, 'next fired');

  const input = el.querySelector('[data-clarify-input]');
  input.value = 'Build an internal dashboard';
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(answers.length, 1, 'answer fired');
  assert.equal(answers[0].value, 'Build an internal dashboard', 'answer detail');

  el.answered = true;
  el.value = 'Build an internal dashboard';
  assert.ok(el.querySelector('[data-clarify-value]'), 'answered pill');
  assert.ok(!el.querySelector('[data-clarify-input]'), 'input removed when answered');
  assert.ok(el.textContent.includes('Build an internal dashboard'), 'value shown');
});

test('ClarifyQuestionCard — no paging when total is 1', () => {
  const { el } = mount(clarifySource, 'ClarifyQuestionCardElement', 'clarify-question', {
    question: 'Target audience?',
    total: '1',
  });
  assert.ok(!el.querySelector('[data-clarify-paging]'), 'paging hidden');
});

test('AgentTaskProgress — steps, substeps and footer events', () => {
  const { el } = mount(taskSource, 'AgentTaskProgressElement', 'agent-task-progress', {
    title: 'Generating your site',
    'context-label': 'Working on',
    'context-text': 'Landing page · Hero + pricing',
  });
  const refines = collect(el, 'refine');
  const nexts = collect(el, 'next');
  el.steps = [
    { label: 'Collect requirements', state: 'done' },
    { label: 'Drafting layout', state: 'active', substeps: ['Placing hero section', 'Wiring navigation'] },
    { label: 'Publish', state: 'pending' },
  ];

  assert.ok(el.textContent.includes('Generating your site'), 'title');
  assert.ok(el.textContent.includes('Landing page · Hero + pricing'), 'context');
  assert.ok(el.querySelector('[data-task-step="0"]'), 'step 0');
  assert.ok(el.querySelector('[data-task-step="2"]'), 'step 2');
  assert.equal(el.querySelectorAll('[data-task-state="done"]').length, 1, 'done state');
  assert.equal(el.querySelectorAll('[data-task-state="active"]').length, 1, 'active state');
  assert.equal(el.querySelectorAll('[data-task-state="pending"]').length, 1, 'pending state');
  assert.ok(el.querySelector('[data-task-substeps]'), 'substeps rail');
  assert.ok(el.textContent.includes('Placing hero section'), 'substep content');
  assert.ok(el.textContent.includes('come back later'), 'hint');
  assert.ok(el.textContent.includes('Send feedback'), 'feedback');

  el.querySelector('[data-task-refine]').click();
  el.querySelector('[data-task-next]').click();
  assert.equal(refines.length, 1, 'refine fired');
  assert.equal(nexts.length, 1, 'next fired');
});

test('UsageQuotaCard — card variant, progress bar and cta event', () => {
  const { el } = mount(quotaSource, 'UsageQuotaCardElement', 'usage-quota', {
    label: 'Credits Remaining',
    used: '120',
    total: '500',
    unit: 'credits',
    'upgrade-line': 'Upgrade to Pro for more credits',
    'cta-label': 'Upgrade plan',
  });
  const ctas = collect(el, 'cta');

  assert.ok(el.querySelector('[data-quota-card]'), 'card root');
  assert.ok(el.textContent.includes('Credits Remaining'), 'label');
  assert.ok(el.textContent.includes('120 credits of 500 credits'), 'summary');
  assert.ok(el.querySelector('.bg-sky-500'), 'progress bar');
  assert.ok(el.innerHTML.includes('width: 76%'), 'percent width');
  assert.ok(el.textContent.includes('Upgrade to Pro for more credits'), 'upgrade line');
  assert.ok(el.textContent.includes('Upgrade plan'), 'cta');

  el.querySelector('[data-quota-cta]').click();
  assert.equal(ctas.length, 1, 'cta fired');
});

test('UsageQuotaCard — banner variant', () => {
  const { el } = mount(quotaSource, 'UsageQuotaCardElement', 'usage-quota', {
    variant: 'banner',
    summary: "You've used all 100 free credits. Upgrade to keep building.",
    'cta-label': 'See plans',
  });
  assert.ok(el.querySelector('[data-quota-banner]'), 'banner root');
  assert.ok(!el.querySelector('[data-quota-card]'), 'no card chrome');
  assert.ok(el.textContent.includes('100 free credits'), 'summary');
  assert.ok(el.querySelector('.bg-emerald-600'), 'emerald cta');
  assert.ok(el.textContent.includes('See plans'), 'cta label');
});

test('WorkspaceSwitcherMenu — options, roles, create and logout events', () => {
  const { el } = mount(switcherSource, 'WorkspaceSwitcherMenuElement', 'workspace-switcher', {
    'footer-name': 'Sam Lee',
    'footer-email': 'sam@acme.dev',
  });
  const selections = collect(el, 'select');
  const creations = collect(el, 'create-new');
  const logouts = collect(el, 'logout');
  el.workspaces = [
    { id: 'acme', name: 'Acme Inc', memberCount: 12, role: 'Admin', current: true },
    { id: 'northwind', name: 'Northwind Labs', memberCount: 4, role: 'Editor' },
  ];

  assert.ok(el.textContent.includes('Workspaces'), 'title');
  assert.ok(el.textContent.includes('Choose the workspace you want to access'), 'subtitle');
  assert.ok(el.textContent.includes('Acme Inc'), 'workspace 1');
  assert.ok(el.textContent.includes('12 members · You are an Admin'), 'admin role line');
  assert.ok(el.textContent.includes('Northwind Labs'), 'workspace 2');
  assert.ok(el.textContent.includes('4 members · You are an Editor'), 'editor role line');
  assert.ok(el.textContent.includes('AI'), 'initials tile');
  assert.ok(el.textContent.includes('Sam Lee'), 'footer name');
  assert.ok(el.textContent.includes('sam@acme.dev'), 'footer email');
  assert.ok(el.textContent.includes('Log out'), 'logout label');

  el.querySelector('[data-workspace-option="northwind"]').click();
  assert.equal(selections.length, 1, 'select fired');
  assert.equal(selections[0].workspace.id, 'northwind', 'select detail');

  el.querySelector('[data-workspace-create]').click();
  el.querySelector('[data-workspace-logout]').click();
  assert.equal(creations.length, 1, 'create fired');
  assert.equal(logouts.length, 1, 'logout fired');
});

test('AttachmentChip — kind tone, meta, remove event and removable=false', () => {
  const { el, window } = mount(chipSource, 'AttachmentChipElement', 'attachment-chip', {
    name: 'quarterly-report.pdf',
    kind: 'pdf',
    size: '2.4 MB',
    meta: 'Uploaded just now',
  });
  const removals = collect(el, 'remove');

  assert.ok(el.textContent.includes('quarterly-report.pdf'), 'name');
  assert.ok(el.textContent.includes('PDF'), 'glyph');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'pdf tone');
  assert.ok(el.textContent.includes('2.4 MB · Uploaded just now'), 'meta');
  assert.ok(el.querySelector('[data-attachment-remove]'), 'remove button');

  el.querySelector('[data-attachment-remove]').click();
  assert.equal(removals.length, 1, 'remove fired');
  assert.equal(removals[0].name, 'quarterly-report.pdf', 'remove detail');

  el.removable = false;
  assert.ok(!el.querySelector('[data-attachment-remove]'), 'remove button hidden');
});
