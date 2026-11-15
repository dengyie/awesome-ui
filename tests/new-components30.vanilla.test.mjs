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

const emptySource = stripComponent('EmptyStateStarter.js', 'EmptyStateStarterElement');
const gateSource = stripComponent('AuthGatePrompt.js', 'AuthGatePromptElement');
const splitSource = stripComponent('AuthSplitPanel.js', 'AuthSplitPanelElement');
const toastSource = stripComponent('SuccessToast.js', 'SuccessToastElement');
const headingSource = stripComponent('EditableHeading.js', 'EditableHeadingElement');

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

test('EmptyStateStarter — variants, action events and illustration slot', () => {
  const { el } = mount(emptySource, 'EmptyStateStarterElement', 'empty-state-starter');
  const actions = collect(el, 'action');
  el.setAttribute('title', 'No brand kits here yet');
  el.setAttribute('description', 'Create your first brand kit to keep colors consistent.');
  el.setAttribute('action-label', '+ New brand kit');
  el.illustration = '📦';

  assert.ok(el.querySelector('[data-empty-starter]'), 'host hook');
  assert.ok(el.querySelector('[data-empty-illustration]'), 'illustration');
  assert.ok(el.textContent.includes('No brand kits here yet'), 'title');
  assert.ok(el.textContent.includes('Create your first brand kit'), 'description');
  assert.ok(el.querySelector('[data-empty-action]'), 'action button');

  el.querySelector('[data-empty-action]').click();
  assert.equal(actions.length, 1, 'action event');

  el.setAttribute('variant', 'dashed');
  assert.ok(el.innerHTML.includes('border-dashed'), 'dashed variant class');
  el.setAttribute('action-variant', 'outline');
  assert.ok(el.innerHTML.includes('border-zinc-300'), 'outline action class');

  el.setAttribute('action-label', '');
  assert.ok(!el.querySelector('[data-empty-action]'), 'no action without label');
});

test('AuthGatePrompt — provider pills, secondary, skip and custom providers', () => {
  const { el } = mount(gateSource, 'AuthGatePromptElement', 'auth-gate-prompt');
  const providers = collect(el, 'provider');
  const skips = collect(el, 'skip');
  el.setAttribute('title', 'Create an account or sign in to save your history');
  el.setAttribute('secondary-label', 'Use phone number');

  assert.ok(el.querySelector('[data-auth-gate]'), 'host hook');
  assert.ok(el.textContent.includes('Create an account or sign in'), 'contextual title');
  assert.ok(el.querySelector('[data-auth-provider="google"]'), 'google default');
  assert.ok(el.querySelector('[data-auth-provider="facebook"]'), 'facebook default');
  assert.ok(el.querySelector('[data-auth-provider="apple"]'), 'apple default');
  assert.ok(el.innerHTML.includes('#1877F2'), 'facebook brand tone');
  assert.ok(el.querySelector('[data-auth-secondary]'), 'secondary button');
  assert.ok(el.querySelector('[data-auth-skip]'), 'skip link');

  el.querySelector('[data-auth-provider="google"]').click();
  assert.equal(providers.at(-1)?.id, 'google', 'provider event');
  el.querySelector('[data-auth-skip]').click();
  assert.equal(skips.length, 1, 'skip event');

  el.providers = [{ id: 'microsoft', label: 'Continue with Microsoft' }];
  assert.ok(el.querySelector('[data-auth-provider="microsoft"]'), 'custom provider renders');
  assert.ok(!el.querySelector('[data-auth-provider="google"]'), 'defaults replaced');
});

test('AuthSplitPanel — media side, cover tint, footer links and slot', () => {
  const { el } = mount(splitSource, 'AuthSplitPanelElement', 'auth-split-panel');
  el.setAttribute('media-title', 'Welcome back');
  el.setAttribute('media-subtitle', 'Sign in to pick up where you left off.');
  el.footerLinks = [
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ];
  el.innerHTML = '<p>AUTH CONTENT</p>';
  el._contentHtml = el.innerHTML; // simulate light-DOM capture before first render
  el.render();

  assert.ok(el.querySelector('[data-auth-media="left"]'), 'left media panel');
  assert.ok(el.textContent.includes('Welcome back'), 'media title');
  assert.ok(el.textContent.includes('Sign in to pick up'), 'media subtitle');
  assert.ok(el.textContent.includes('AUTH CONTENT'), 'slotted content (innerHTML fallback)');
  assert.ok(el.innerHTML.includes('/terms'), 'footer link');

  el.setAttribute('media-side', 'right');
  el.setAttribute('media-background', 'cover');
  el.render();
  assert.ok(el.querySelector('[data-auth-media="right"]'), 'right media panel');
  assert.ok(!el.querySelector('[data-auth-media="left"]'), 'left panel removed');
  assert.ok(el.innerHTML.includes('bg-zinc-900'), 'cover tint');

  el.media = '<img src="photo.jpg" alt="lifestyle"/>';
  el.render();
  assert.ok(el.innerHTML.includes('photo.jpg'), 'media property rendered');
});

test('SuccessToast — auto dismiss, sticky mode, close event and re-show', async () => {
  const { el, window } = mount(toastSource, 'SuccessToastElement', 'success-toast', { message: 'Link copied to clipboard', duration: '60' });
  const closes = collect(el, 'close');

  assert.ok(el.querySelector('[data-success-toast]'), 'host hook');
  assert.ok(el.textContent.includes('Link copied to clipboard'), 'message');
  assert.ok(el.innerHTML.includes('bg-emerald-100'), 'mint background');
  assert.ok(el.querySelector('[data-toast-close]'), 'close button');

  // manual close
  el.querySelector('[data-toast-close]').click();
  assert.equal(closes.length, 1, 'close event');
  assert.ok(!el.querySelector('[data-success-toast]'), 'hidden after close');

  // re-show
  el.show();
  assert.ok(el.querySelector('[data-success-toast]'), 're-shown');

  // auto dismiss
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.ok(!el.querySelector('[data-success-toast]'), 'auto-dismissed after duration');

  // sticky mode
  el.setAttribute('duration', '0');
  el.show();
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.ok(el.querySelector('[data-success-toast]'), 'sticky keeps visible');
});

test('EditableHeading — edit mode commit/cancel and change event', () => {
  const { el, window } = mount(headingSource, 'EditableHeadingElement', 'editable-heading', { value: 'Q4 Pipeline' });
  const changes = collect(el, 'change');
  el.setAttribute('breadcrumb', 'Contacts / Lists');
  el.setAttribute('meta', '<span>List · 42 members</span>');

  assert.ok(el.querySelector('[data-heading-display]'), 'display button');
  assert.ok(el.textContent.includes('Q4 Pipeline'), 'value shown');
  assert.ok(el.textContent.includes('Contacts / Lists'), 'breadcrumb');
  assert.ok(el.textContent.includes('42 members'), 'meta');
  assert.ok(!el.querySelector('[data-heading-input]'), 'input hidden idle');

  // enter edit mode
  el.querySelector('[data-heading-display]').click();
  const input = el.querySelector('[data-heading-input]');
  assert.ok(input, 'input appears');
  input.value = 'Q4 Renewals';
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(changes.at(-1)?.value, 'Q4 Renewals', 'change event');
  assert.ok(el.querySelector('[data-heading-display]'), 'back to display');
  assert.ok(el.textContent.includes('Q4 Renewals'), 'new value shown');

  // esc cancels
  el.querySelector('[data-heading-display]').click();
  const input2 = el.querySelector('[data-heading-input]');
  input2.value = 'WRONG';
  input2.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.ok(el.textContent.includes('Q4 Renewals'), 'value unchanged after cancel');
  assert.equal(changes.length, 1, 'no change event on cancel');
});
