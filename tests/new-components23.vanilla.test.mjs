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
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const quoteSource = stripComponent('QuoteMasonry.js', 'QuoteMasonryElement');
const footerSource = stripComponent('SiteFooter.js', 'SiteFooterElement');
const marqueeSource = stripComponent('MarqueeWall.js', 'MarqueeWallElement');
const stepperSource = stripComponent('OnboardingStepper.js', 'OnboardingStepperElement');
const toolbarSource = stripComponent('FilterToolbar.js', 'FilterToolbarElement');

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

test('QuoteMasonry — cards, quote marks and unmarked variant', () => {
  const { el } = mount(quoteSource, 'QuoteMasonryElement', 'quote-masonry');
  el.quotes = [
    { quote: '45% of our code changes are now fully written by AI.', name: 'Jordan Wei', role: 'CTO', company: 'Hexlab' },
    { quote: 'Review time dropped from days to hours.', name: 'Sam Ortiz', role: 'Eng Lead', company: 'Corely', marked: false },
  ];

  assert.equal(el.querySelectorAll('[data-quote-index]').length, 2, 'two cards');
  assert.ok(el.textContent.includes('45% of our code changes'), 'quote text');
  assert.ok(el.innerHTML.includes('&ldquo;') || el.innerHTML.includes('\u201C'), 'quote mark');
  assert.ok(el.textContent.includes('CTO · Hexlab'), 'role · company');
  assert.ok(el.innerHTML.includes('break-inside-avoid'), 'masonry break rule');

  el.quotes = [{ quote: 'plain', name: 'A' }];
  assert.equal(el.querySelectorAll('[data-quote-index]').length, 1, 're-rendered');
});

test('QuoteMasonry — columns attribute switches class', () => {
  const two = mount(quoteSource, 'QuoteMasonryElement', 'quote-masonry', { columns: '2' });
  two.el.quotes = [{ quote: 'x', name: 'A' }];
  assert.ok(two.el.className.includes('sm:columns-2'), 'two columns');
  const four = mount(quoteSource, 'QuoteMasonryElement', 'quote-masonry', { columns: '4' });
  four.el.quotes = [{ quote: 'x', name: 'A' }];
  assert.ok(four.el.className.includes('lg:columns-4'), 'four columns');
});

test('SiteFooter — columns, badges and bottom row', () => {
  const { el } = mount(footerSource, 'SiteFooterElement', 'site-footer', {
    copyright: '© 2026 Runner Labs',
    tagline: 'Compliance for AI teams',
  });
  el.columns = [
    { heading: 'Product', links: [{ label: 'Overview' }, { label: 'Pricing', href: '/pricing' }] },
    { heading: 'Legal', links: [{ label: 'Terms' }] },
  ];
  el.badges = [
    { title: 'SOC 2 Type 1', status: 'In progress', statusTone: 'amber', icon: 'clock' },
    { title: 'GDPR', status: 'Certified', statusTone: 'emerald' },
  ];

  assert.equal(el.querySelectorAll('[data-footer-column]').length, 2, 'two columns');
  assert.ok(el.textContent.includes('Product'), 'heading');
  assert.ok(el.textContent.includes('Pricing'), 'link');
  assert.ok(el.querySelector('a[href="/pricing"]'), 'link href');
  assert.ok(el.textContent.includes('SOC 2 Type 1'), 'badge title');
  assert.ok(el.innerHTML.includes('text-amber-400'), 'amber tone');
  assert.ok(el.innerHTML.includes('text-emerald-400'), 'emerald tone');
  assert.ok(el.textContent.includes('Compliance'), 'badges heading');
  assert.ok(el.textContent.includes('© 2026 Runner Labs'), 'copyright');
});

test('SiteFooter — re-render on attribute change', () => {
  const { el } = mount(footerSource, 'SiteFooterElement', 'site-footer');
  el.columns = [{ heading: 'Docs', links: [{ label: 'Guides' }] }];
  assert.ok(el.textContent.includes('Docs'), 'initial');
  el.setAttribute('tagline', 'v2 tagline');
  assert.ok(el.textContent.includes('v2 tagline'), 're-rendered with new tagline');
});

test('MarqueeWall — rows, doubled cards, animation and pause', () => {
  const { el } = mount(marqueeSource, 'MarqueeWallElement', 'marquee-wall', { 'speed-seconds': '30' });
  el.rows = [
    [
      { name: 'Ana Silva', handle: 'anadev', text: 'Shipping 2x faster since we switched.' },
      { name: 'Lee Grant', handle: 'leegrant', text: 'The dashboards are unreal.' },
    ],
    [{ name: 'NPS Respondent', text: 'Amazing product. No need to talk to sales reps.', anonymous: true }],
  ];

  assert.equal(el.querySelectorAll('[data-marquee-row]').length, 2, 'two rows');
  assert.equal(el.querySelectorAll('[data-marquee-card]').length, 6, 'cards doubled (4 + 2)');
  assert.ok(el.textContent.includes('@anadev'), 'handle');
  assert.ok(el.textContent.includes('Amazing product. No need to talk to sales reps.'), 'anonymous card');
  assert.ok(el.innerHTML.includes('marquee-scroll 30s linear infinite'), 'speed');
  assert.ok(el.innerHTML.includes(' reverse'), 'second row reversed');
  assert.ok(el.innerHTML.includes('@keyframes marquee-scroll'), 'keyframes');
  assert.ok(el.innerHTML.includes('.marquee-track:hover'), 'hover pause');
});

test('MarqueeWall — paused attribute freezes animation', () => {
  const { el } = mount(marqueeSource, 'MarqueeWallElement', 'marquee-wall', { paused: '' });
  el.rows = [[{ name: 'A', text: 'x' }]];
  assert.ok(el.innerHTML.includes('animation-play-state:paused'), 'paused play state');
});

test('OnboardingStepper — chain, segments, example rows and events', () => {
  const { el, window } = mount(stepperSource, 'OnboardingStepperElement', 'onboarding-stepper', {
    current: '2',
    title: 'Transaction types',
  });
  const stepClicks = collect(el, 'step-click');
  const continues = collect(el, 'continue');
  el.steps = ['Security', 'Accounts', 'Transactions', 'Subscription', 'Review'];
  el.segments = [
    { label: 'Regular', description: 'Everyday purchases and bill payments.', examples: [{ label: 'Credit card payment', value: '$259.14' }] },
    { label: 'Internal', description: 'Transfers between your own accounts.' },
    { label: 'Income', description: 'Salary, refunds and incoming wires.' },
  ];

  assert.equal(el.querySelectorAll('[data-step-index]').length, 5, 'five steps');
  assert.ok(el.innerHTML.includes('aria-current="step"'), 'current marked');
  assert.ok(el.innerHTML.includes('width:60%'), 'progress 3 of 5');
  assert.ok(el.textContent.includes('Credit card payment'), 'example row');
  assert.ok(el.textContent.includes('$259.14'), 'example value');

  // segment switch re-renders with the second description
  el.querySelectorAll('[data-segment-index]')[1].click();
  assert.ok(el.textContent.includes('Transfers between your own accounts.'), 'segment switched');

  el.querySelectorAll('[data-step-index]')[0].click();
  assert.equal(stepClicks.length, 1, 'step-click fired');
  assert.equal(stepClicks[0].index, 0, 'index detail');

  el.querySelector('[data-stepper-continue]').click();
  assert.equal(continues.length, 1, 'continue fired');
});

test('OnboardingStepper — current setter syncs attribute', () => {
  const { el } = mount(stepperSource, 'OnboardingStepperElement', 'onboarding-stepper');
  el.steps = ['A', 'B', 'C'];
  el.current = 2;
  assert.equal(el.getAttribute('current'), '2', 'attribute synced');
  assert.ok(el.innerHTML.includes('width:100%'), 'full progress');
});

test('FilterToolbar — chips, removable value, events and view toggle', () => {
  const { el, window } = mount(toolbarSource, 'FilterToolbarElement', 'filter-toolbar', {
    'search-placeholder': 'Search files…',
    view: 'grid',
    'action-label': 'Create',
  });
  const removals = collect(el, 'chip-remove');
  const searches = collect(el, 'search');
  const viewChanges = collect(el, 'view-change');
  const actions = collect(el, 'action');
  el.chips = [
    { label: 'Type' },
    { label: 'Risk level', value: 'High', valueTone: 'rose', removable: true },
    { label: 'Owner', value: 'Alex' },
  ];

  assert.equal(el.querySelectorAll('[data-filter-chip]').length, 3, 'three chips');
  assert.ok(el.textContent.includes('High'), 'value pill');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'rose tone');
  assert.ok(el.querySelector('[data-chip-remove]'), 'remove button');
  assert.equal(el.querySelector('[data-toolbar-search]').getAttribute('placeholder'), 'Search files…', 'placeholder');
  assert.ok(el.innerHTML.includes('data-view-mode="grid"'), 'grid button');
  assert.ok(el.innerHTML.includes('aria-pressed="true"'), 'pressed state');
  assert.ok(el.textContent.includes('Create'), 'action label');

  el.querySelector('[data-chip-remove]').click();
  assert.equal(removals.length, 1, 'chip-remove fired');
  assert.equal(removals[0].chip.label, 'Risk level', 'chip detail');

  const search = el.querySelector('[data-toolbar-search]');
  search.value = 'deck';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(searches.length, 1, 'search fired');
  assert.equal(searches[0].value, 'deck', 'search value detail');

  el.querySelectorAll('[data-view-mode]')[0].click();
  assert.equal(viewChanges.length, 1, 'view-change fired');
  assert.equal(viewChanges[0].view, 'list', 'view detail');

  el.querySelector('[data-toolbar-action]').click();
  assert.equal(actions.length, 1, 'action fired');
});

test('FilterToolbar — view="none" hides toggle', () => {
  const { el } = mount(toolbarSource, 'FilterToolbarElement', 'filter-toolbar', { view: 'none' });
  el.chips = [{ label: 'Type' }];
  assert.equal(el.querySelector('[data-view-toggle]'), null, 'no view toggle');
});
