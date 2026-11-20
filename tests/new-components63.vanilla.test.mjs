/**
 * v3.9.0 batch — vanilla behavior tests (jsdom)
 * WorkspaceSurveyCard, WorkspaceSetupPanel, InviteTeammatesCard.
 */
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

const surveySource = stripComponent('WorkspaceSurveyCard.js', 'WorkspaceSurveyCardElement');
const setupSource = stripComponent('WorkspaceSetupPanel.js', 'WorkspaceSetupPanelElement');
const inviteSource = stripComponent('InviteTeammatesCard.js', 'InviteTeammatesCardElement');

function mount(source, exportName, attrs = {}) {
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
    `${uiIconSource}\n${source}\nreturn ${exportName};`,
  );
  const Klass = factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  const events = [];
  el.dispatchEvent = ((orig) => (evt) => { events.push(evt); return orig.call(el, evt); })(el.dispatchEvent.bind(el));
  return { el, events, window };
}

const click = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));

test('vanilla — WorkspaceSurveyCard pills, gating and answer events', () => {
  const { el, events } = mount(surveySource, 'WorkspaceSurveyCardElement', {
    title: 'Tell us about your workspace',
    'step-label': 'Step 1 of 2',
    answers: JSON.stringify({ role: 'dev' }),
  });
  el.questions = [
    {
      id: 'role',
      label: 'What best describes your role?',
      options: [
        { id: 'founder', label: 'Founder' },
        { id: 'dev', label: 'Developer' },
      ],
    },
    {
      id: 'goals',
      label: 'What are you hoping to accomplish?',
      multi: true,
      options: [{ id: 'automate', label: 'Automate workflows' }],
    },
  ];

  assert.ok(el.querySelector('[data-workspace-survey]'));
  assert.ok(el.querySelector('[data-workspace-survey-title]').textContent.includes('Tell us about your workspace'));
  assert.ok(el.querySelector('[data-workspace-survey-step]').textContent.includes('Step 1 of 2'));
  assert.equal(el.querySelectorAll('[data-workspace-survey-option]').length, 3);
  assert.ok(el.querySelector('[data-workspace-survey-option="dev"]').getAttribute('aria-checked') === 'true');
  assert.ok(el.querySelector('[data-workspace-survey-next]').hasAttribute('disabled'));
  assert.ok(el.querySelector('[data-workspace-survey-dots]').textContent.includes('1/2'));

  click(el, el.querySelector('[data-workspace-survey-option="automate"]'));
  const evt = events.find((e) => e.type === 'answer');
  assert.ok(evt);
  assert.equal(evt.detail.questionId, 'goals');
  assert.equal(evt.detail.optionId, 'automate');

  el.setAttribute('title', 'Workspace <b>survey</b>');
  assert.ok(!el.querySelector('b'), 'no raw element injected');
  assert.ok(el.querySelector('[data-workspace-survey-title]').innerHTML.includes('&lt;b&gt;survey&lt;/b&gt;'));
});

test('vanilla — WorkspaceSurveyCard text input and next event when complete', () => {
  const { el, events } = mount(surveySource, 'WorkspaceSurveyCardElement');
  el.questions = [
    { id: 'a', label: 'Question A', options: [{ id: 'x', label: 'X' }] },
    { id: 'src', label: 'Source', options: [{ id: 'search', label: 'Search' }], placeholder: 'Other source' },
  ];
  el.answers = { a: 'x' };

  const input = el.querySelector('[data-workspace-survey-input="src"]');
  assert.ok(input);
  input.value = 'A podcast';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  const textEvt = events.find((e) => e.type === 'text');
  assert.ok(textEvt);
  assert.equal(textEvt.detail.questionId, 'src');
  assert.equal(textEvt.detail.text, 'A podcast');

  el.answers = { a: 'x', src: 'search' };
  const nextBtn = el.querySelector('[data-workspace-survey-next]');
  assert.ok(!nextBtn.hasAttribute('disabled'));
  click(el, nextBtn);
  const nextEvt = events.find((e) => e.type === 'next');
  assert.ok(nextEvt);
  assert.equal(nextEvt.detail.answers.src, 'search');
});

test('vanilla — WorkspaceSetupPanel sections, task-click and up-next events', () => {
  const { el, events } = mount(setupSource, 'WorkspaceSetupPanelElement', {
    title: 'Workspace setup',
  });
  el.sections = [
    {
      id: 'channels',
      title: 'Set up your channels',
      tasks: [
        { id: 'email', label: 'Connect email channel', done: true },
        { id: 'sms', label: 'Connect SMS channel', done: false },
      ],
    },
    {
      id: 'data',
      title: 'Integrate your data',
      tasks: [{ id: 'warehouse', label: 'Connect warehouse', done: true }],
    },
  ];
  el.upNext = [
    { id: 'invite', title: 'Invite team members' },
    { id: 'import', title: 'Import contacts' },
  ];

  assert.ok(el.querySelector('[data-workspace-setup]'));
  assert.ok(el.querySelector('[data-workspace-setup-count]').textContent.includes('2 of 3 steps complete'));
  assert.equal(el.querySelectorAll('[data-workspace-setup-section]').length, 2);
  assert.ok(el.querySelector('[data-workspace-setup-section-count="channels"]').textContent.includes('1/2'));
  assert.ok(el.querySelector('[data-workspace-setup-section-count="data"]').textContent.includes('1/1'));
  assert.ok(el.querySelector('[data-workspace-setup-task="email"] button .line-through, [data-workspace-setup-task="email"] .line-through'));

  click(el, el.querySelector('[data-workspace-setup-task="sms"] button'));
  const taskEvt = events.find((e) => e.type === 'task-click');
  assert.ok(taskEvt);
  assert.equal(taskEvt.detail.section.id, 'channels');
  assert.equal(taskEvt.detail.task.id, 'sms');

  click(el, el.querySelector('[data-workspace-setup-next-card="invite"]'));
  const upEvt = events.find((e) => e.type === 'up-next');
  assert.ok(upEvt);
  assert.equal(upEvt.detail.id, 'invite');

  el.setAttribute('title', 'Setup <img src=x onerror=alert(1)>panel');
  assert.ok(!el.querySelector('img'), 'no raw element injected');
  assert.ok(el.querySelector('[data-workspace-setup-title]').innerHTML.includes('&lt;img'));
});

test('vanilla — WorkspaceSetupPanel all done caption and no up-next block', () => {
  const { el } = mount(setupSource, 'WorkspaceSetupPanelElement');
  el.sections = [{ id: 's', title: 'Solo', tasks: [{ id: 't', label: 'Only task', done: true }] }];
  assert.ok(el.querySelector('[data-workspace-setup-count]').textContent.includes('All steps complete'));
  assert.ok(!el.querySelector('[data-workspace-setup-up-next]'));
});

test('vanilla — InviteTeammatesCard validation, invite and remove', () => {
  const { el, events } = mount(inviteSource, 'InviteTeammatesCardElement', {
    title: 'Invite your teammates',
  });
  el.roles = ['Admin', 'Editor', 'Viewer'];

  assert.ok(el.querySelector('[data-invite-teammates]'));
  assert.ok(el.querySelector('[data-invite-teammates-title]').textContent.includes('Invite your teammates'));
  assert.ok(el.querySelector('[data-invite-teammates-send]').hasAttribute('disabled'));

  const input = el.querySelector('[data-invite-teammates-input]');
  input.value = 'not-an-email';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  click(el, el.querySelector('[data-invite-teammates-add]'));
  assert.ok(el.querySelector('[data-invite-teammates-error]'));
  assert.ok(el.querySelector('[data-invite-teammates-error]').textContent.includes('valid email'));

  input.value = 'ada@lovelace.dev';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  const roleSelect = el.querySelector('[data-invite-teammates-role]');
  roleSelect.value = 'Editor';
  roleSelect.dispatchEvent(new el.ownerDocument.defaultView.Event('change', { bubbles: true }));
  click(el, el.querySelector('[data-invite-teammates-add]'));
  const inviteEvt = events.find((e) => e.type === 'invite');
  assert.ok(inviteEvt);
  assert.equal(inviteEvt.detail.email, 'ada@lovelace.dev');
  assert.equal(inviteEvt.detail.role, 'Editor');
  assert.ok(!el.querySelector('[data-invite-teammates-error]'));

  el.pending = [
    { email: 'ada@lovelace.dev', role: 'Editor' },
    { email: 'grace@hopper.io', role: 'Viewer' },
  ];
  assert.equal(el.querySelectorAll('[data-invite-teammates-row]').length, 2);
  assert.ok(el.querySelector('[data-invite-teammates-send]').textContent.includes('Send invites'));
  assert.ok(el.querySelector('[data-invite-teammates-send] ~ * , [data-invite-teammates-send]'));

  click(el, el.querySelector('[data-invite-teammates-row="grace@hopper.io"] [data-invite-teammates-remove]'));
  const removeEvt = events.find((e) => e.type === 'remove');
  assert.ok(removeEvt);
  assert.equal(removeEvt.detail.email, 'grace@hopper.io');

  click(el, el.querySelector('[data-invite-teammates-skip]'));
  assert.ok(events.find((e) => e.type === 'skip'));
});

test('vanilla — InviteTeammatesCard send event and XSS escape', () => {
  const { el, events } = mount(inviteSource, 'InviteTeammatesCardElement');
  el.pending = [{ email: 'ada@lovelace.dev', role: 'Admin' }];
  assert.ok(!el.querySelector('[data-invite-teammates-send]').hasAttribute('disabled'));
  click(el, el.querySelector('[data-invite-teammates-send]'));
  const sendEvt = events.find((e) => e.type === 'send');
  assert.ok(sendEvt);
  assert.equal(sendEvt.detail.length, 1);
  assert.equal(sendEvt.detail[0].email, 'ada@lovelace.dev');

  el.setAttribute('title', 'Invite <script>alert(1)</script>team');
  assert.ok(!el.querySelector('script'), 'no raw script injected');
  assert.ok(el.querySelector('[data-invite-teammates-title]').innerHTML.includes('&lt;script&gt;'));
});
