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

const toggleSource = stripComponent('ToggleSwitch.js', 'ToggleSwitchElement');
const stepperSource = stripComponent('Stepper.js', 'StepperElement');
const searchSource = stripComponent('SearchInput.js', 'SearchInputElement');
const tagSource = stripComponent('Tag.js', 'TagElement');
const modalSource = stripComponent('Modal.js', 'ModalElement');

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

test('ToggleSwitch — renders switch with aria state and label block', () => {
  const { el } = mount(toggleSource, 'ToggleSwitchElement', 'toggle-switch', {
    label: 'Email alerts',
    description: 'Weekly digest',
    checked: '',
  });
  const control = el.querySelector('[role="switch"]');
  assert.ok(control, 'switch rendered');
  assert.equal(control.getAttribute('aria-checked'), 'true', 'on state');
  assert.ok(el.textContent.includes('Email alerts'), 'label');
  assert.ok(el.textContent.includes('Weekly digest'), 'description');
  assert.ok(el.innerHTML.includes('bg-indigo-600'), 'on track');
});

test('ToggleSwitch — click toggles and fires change', () => {
  const { el } = mount(toggleSource, 'ToggleSwitchElement', 'toggle-switch', { label: 'SMS' });
  const changes = collect(el, 'change');
  const control = () => el.querySelector('[role="switch"]');

  assert.equal(control().getAttribute('aria-checked'), 'false', 'starts off');
  control().click();
  assert.equal(el.checked, true, 'property flipped');
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].checked, true, 'detail.checked true');
  assert.equal(el.querySelector('[role="switch"]').getAttribute('aria-checked'), 'true', 're-rendered on');

  el.querySelector('[role="switch"]').click();
  assert.equal(changes.length, 2, 'second change');
  assert.equal(changes[1].checked, false, 'detail.checked false');
});

test('ToggleSwitch — disabled ignores clicks', () => {
  const { el } = mount(toggleSource, 'ToggleSwitchElement', 'toggle-switch', { label: 'X', disabled: '' });
  const changes = collect(el, 'change');
  el.querySelector('[role="switch"]').click();
  assert.equal(changes.length, 0, 'no change when disabled');
  assert.equal(el.checked, false, 'still off');
});

test('ToggleSwitch — sm size uses compact track', () => {
  const { el } = mount(toggleSource, 'ToggleSwitchElement', 'toggle-switch', { label: 'S', size: 'sm' });
  assert.ok(el.innerHTML.includes('h-4 w-8'), 'sm track');
  assert.ok(el.innerHTML.includes('h-3 w-3'), 'sm knob');
});

test('Stepper — statuses derived from current attribute', () => {
  const { el } = mount(stepperSource, 'StepperElement', 'step-flow', { current: '2' });
  el.steps = [
    { id: 'a', label: 'Account', description: 'Basics' },
    { id: 'b', label: 'Workspace' },
    { id: 'c', label: 'Deploy' },
  ];

  assert.ok(el.innerHTML.includes('bg-indigo-600'), 'complete circle');
  assert.equal(el.querySelector('[aria-current="step"]').textContent.trim(), '2', 'current marker on step 2');
  assert.ok(el.textContent.includes('Account'), 'step label');
  assert.ok(el.textContent.includes('Basics'), 'description');
  assert.ok(el.textContent.includes('Deploy'), 'upcoming label');
  assert.equal(el.querySelectorAll('li').length, 3, 'three steps');
});

test('Stepper — step-click fires for complete steps only', () => {
  const { el } = mount(stepperSource, 'StepperElement', 'step-flow', { current: '2' });
  el.steps = [
    { id: 'a', label: 'Account' },
    { id: 'b', label: 'Workspace' },
    { id: 'c', label: 'Deploy' },
  ];
  const clicks = collect(el, 'step-click');

  const buttons = el.querySelectorAll('[data-step-index]');
  buttons[0].click();
  assert.equal(clicks.length, 1, 'complete step clickable');
  assert.equal(clicks[0].index, 0, 'detail.index');
  assert.equal(clicks[0].step.id, 'a', 'detail.step');

  buttons[2].click();
  assert.equal(clicks.length, 1, 'upcoming step not clickable');
  assert.ok(buttons[2].disabled, 'upcoming button disabled');
});

test('Stepper — static attribute disables interaction', () => {
  const { el } = mount(stepperSource, 'StepperElement', 'step-flow', { current: '1', static: '' });
  el.steps = [{ id: 'a', label: 'Only' }];
  const clicks = collect(el, 'step-click');
  const button = el.querySelector('[data-step-index]');
  assert.ok(button.disabled, 'static makes button disabled');
  button.click();
  assert.equal(clicks.length, 0, 'no event');
});

test('Stepper — explicit error status shows rose tone', () => {
  const { el } = mount(stepperSource, 'StepperElement', 'step-flow');
  el.steps = [{ id: 'a', label: 'Build', status: 'error' }];
  assert.ok(el.innerHTML.includes('bg-rose-500'), 'error tone');
});

test('SearchInput — renders field, fires change and search', () => {
  const { el, window } = mount(searchSource, 'SearchInputElement', 'search-field', {
    placeholder: 'Search logs…',
    shortcut: '⌘K',
  });
  const changes = collect(el, 'change');
  const searches = collect(el, 'search');

  const input = el.querySelector('[data-search-input]');
  assert.ok(input, 'input rendered');
  assert.equal(input.getAttribute('placeholder'), 'Search logs…', 'placeholder');
  assert.ok(el.querySelector('kbd'), 'shortcut shown while empty');

  input.value = 'error';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].value, 'error', 'detail.value');
  assert.equal(el.value, 'error', 'property updated');

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(searches.length, 1, 'search fired');
  assert.equal(searches[0].value, 'error', 'search detail value');
});

test('SearchInput — clear button appears with value and works', () => {
  const { el, window } = mount(searchSource, 'SearchInputElement', 'search-field');
  el.value = 'logs';
  const clears = collect(el, 'clear');

  const clear = el.querySelector('[data-search-clear]');
  assert.ok(clear, 'clear button rendered');
  clear.click();
  assert.equal(el.value, '', 'value cleared');
  assert.equal(clears.length, 1, 'clear event fired');
  assert.ok(el.querySelector('[data-search-input]'), 'input re-rendered');
});

test('SearchInput — Escape clears when there is a value', () => {
  const { el, window } = mount(searchSource, 'SearchInputElement', 'search-field');
  el.value = 'term';
  const clears = collect(el, 'clear');
  el.querySelector('[data-search-input]').dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  );
  assert.equal(el.value, '', 'escaped value cleared');
  assert.equal(clears.length, 1, 'clear fired');
});

test('SearchInput — loading shows spinner instead of shortcut', () => {
  const { el } = mount(searchSource, 'SearchInputElement', 'search-field', {
    loading: '',
    shortcut: '⌘K',
  });
  assert.ok(el.innerHTML.includes('animate-spin'), 'spinner shown');
  assert.equal(el.querySelector('kbd'), null, 'no shortcut while loading');
  assert.equal(el.querySelector('[data-search-clear]'), null, 'no clear while loading');
});

test('Tag — tone, size and removable', () => {
  const { el } = mount(tagSource, 'TagElement', 'ui-tag', {
    label: 'beta',
    tone: 'indigo',
    removable: '',
  });
  assert.ok(el.textContent.includes('beta'), 'label');
  assert.ok(el.innerHTML.includes('bg-indigo-50'), 'indigo tone');
  assert.ok(el.innerHTML.includes('rounded-full'), 'pill shape');
  assert.ok(el.innerHTML.includes('text-[10.5px]'), 'md sizing default');

  const removes = collect(el, 'remove');
  el.querySelector('[data-tag-remove]').click();
  assert.equal(removes.length, 1, 'remove fired');
});

test('Tag — sm size and tone fallback', () => {
  const { el } = mount(tagSource, 'TagElement', 'ui-tag', { label: 'tiny', size: 'sm', tone: 'nope' });
  assert.ok(el.innerHTML.includes('text-[9.5px]'), 'sm sizing');
  assert.ok(el.innerHTML.includes('bg-zinc-100'), 'unknown tone falls back to neutral');
});

test('Tag — clickable variant fires tag-click, remove stops propagation', () => {
  const { el } = mount(tagSource, 'TagElement', 'ui-tag', {
    label: 'Filter',
    tone: 'amber',
    clickable: '',
    removable: '',
  });
  const clicks = collect(el, 'tag-click');
  const removes = collect(el, 'remove');

  el.querySelector('[data-tag-root]').click();
  assert.equal(clicks.length, 1, 'tag-click fired');

  el.querySelector('[data-tag-remove]').click();
  assert.equal(removes.length, 1, 'remove fired');
  assert.equal(clicks.length, 1, 'remove click did not bubble into tag-click');
});

test('Modal — closed renders nothing, open renders dialog with slots', () => {
  const { el } = mount(modalSource, 'ModalElement', 'modal-dialog', {
    title: 'Delete project?',
    description: 'This cannot be undone.',
  });
  const closed = collect(el, 'close');

  assert.equal(el.querySelector('[role="dialog"]'), null, 'nothing rendered when closed');

  const body = el.ownerDocument.createElement('p');
  body.textContent = 'Body copy';
  el.appendChild(body);
  const footerBtn = el.ownerDocument.createElement('button');
  footerBtn.textContent = 'Confirm';
  footerBtn.setAttribute('slot', 'footer');
  el.appendChild(footerBtn);
  el.open = true;

  assert.ok(el.querySelector('[role="dialog"]'), 'dialog rendered when open');
  assert.equal(el.querySelector('[role="dialog"]').getAttribute('aria-modal'), 'true', 'modal flag');
  assert.ok(el.textContent.includes('Delete project?'), 'title');
  assert.ok(el.textContent.includes('This cannot be undone.'), 'description');
  assert.ok(el.textContent.includes('Body copy'), 'body slot content');
  assert.ok(el.textContent.includes('Confirm'), 'footer slot content');
  assert.ok(el.querySelector('[data-modal-footer]'), 'footer bar');
  assert.equal(closed.length, 0, 'no close yet');
});

test('Modal — close button, Escape and backdrop all fire close', () => {
  const { el, window } = mount(modalSource, 'ModalElement', 'modal-dialog', {
    title: 'T',
    open: '',
  });
  const closed = collect(el, 'close');

  el.querySelector('[data-modal-close]').click();
  assert.equal(closed.length, 1, 'close button fired');
  assert.equal(el.open, false, 'open reset');
  assert.equal(el.querySelector('[role="dialog"]'), null, 'unmounted after close');

  el.open = true;
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(closed.length, 2, 'Escape fired close');
  assert.equal(el.open, false, 'open reset via Escape');

  el.open = true;
  const backdrop = el.querySelector('[data-modal-backdrop]');
  const root = el.querySelector('[data-modal-root]');
  root.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
  assert.equal(closed.length, 3, 'backdrop mousedown fired close');
  assert.ok(backdrop, 'backdrop exists');
});

test('Modal — dismissible=false blocks backdrop and Escape', () => {
  const { el, window } = mount(modalSource, 'ModalElement', 'modal-dialog', {
    title: 'T',
    open: '',
    dismissible: 'false',
  });
  const closed = collect(el, 'close');

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(closed.length, 0, 'Escape blocked');

  el.querySelector('[data-modal-root]').dispatchEvent(
    new window.MouseEvent('mousedown', { bubbles: true })
  );
  assert.equal(closed.length, 0, 'backdrop blocked');
  assert.ok(el.querySelector('[role="dialog"]'), 'still open');
});

test('Modal — show-close=false hides the close button', () => {
  const { el } = mount(modalSource, 'ModalElement', 'modal-dialog', {
    title: 'T',
    open: '',
    'show-close': 'false',
  });
  assert.equal(el.querySelector('[data-modal-close]'), null, 'no close button');
});
