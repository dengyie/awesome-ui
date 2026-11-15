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

const toolbarSource = stripComponent('RichToolbar.js', 'RichToolbarElement');
const heroSource = stripComponent('HeroSection.js', 'HeroSectionElement');
const footerSource = stripComponent('FooterSection.js', 'FooterSectionElement');
const testimonialSource = stripComponent('TestimonialGrid.js', 'TestimonialGridElement');

function mount(source, exportName, tag, attrs = {}, buildChildren) {
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
  if (buildChildren) buildChildren(el, window);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail));
  return seen;
};

const GROUPS = [
  {
    id: 'text',
    label: 'Text',
    items: [
      { id: 'bold', label: 'Bold', text: 'B', shortcut: '⌘B', active: true },
      { id: 'italic', label: 'Italic', text: 'I' },
    ],
  },
  {
    id: 'insert',
    label: 'Insert',
    items: [
      { id: 'code', label: 'Code block', icon: 'code' },
      { id: 'image', label: 'Image', icon: 'image', disabled: true },
    ],
  },
];

test('RichToolbar — renders groups, dividers and item states', () => {
  const { el } = mount(toolbarSource, 'RichToolbarElement', 'rich-toolbar');
  el.groups = GROUPS;

  assert.ok(el.querySelector('[role="toolbar"]'), 'toolbar role');
  assert.equal(el.querySelectorAll('.toolbar-item').length, 4, 'four items');
  assert.equal(el.querySelectorAll('[role="group"]').length, 2, 'two groups');
  assert.ok(el.innerHTML.includes('aria-label="Text"'), 'group label');
  assert.ok(el.innerHTML.includes('>B<'), 'text glyph');
  assert.equal(el.querySelector('.toolbar-item[data-action="bold"]').getAttribute('aria-pressed'), 'true', 'active flagged');
  assert.equal(el.querySelector('.toolbar-item[data-action="image"]').disabled, true, 'disabled item');
  assert.ok(el.innerHTML.includes('title="Bold (⌘B)"'), 'shortcut tooltip');
  assert.ok(el.innerHTML.includes('bg-zinc-200 dark:bg-zinc-700'), 'divider');
});

test('RichToolbar — clicking an item emits action, disabled is inert', () => {
  const { el } = mount(toolbarSource, 'RichToolbarElement', 'rich-toolbar');
  el.groups = GROUPS;
  const actions = collect(el, 'action');

  el.querySelector('.toolbar-item[data-action="italic"]').click();
  assert.deepEqual(actions, ['italic'], 'action carries the item id');

  el.querySelector('.toolbar-item[data-action="image"]').click();
  assert.equal(actions.length, 1, 'disabled item emits nothing');
});

test('RichToolbar — empty groups render an empty toolbar', () => {
  const { el } = mount(toolbarSource, 'RichToolbarElement', 'rich-toolbar');
  el.groups = [];
  assert.ok(el.querySelector('[role="toolbar"]'), 'toolbar present');
  assert.equal(el.querySelectorAll('.toolbar-item').length, 0, 'no items');
});

test('HeroSection — attributes render eyebrow, copy, CTAs and highlights', () => {
  const { el } = mount(heroSource, 'HeroSectionElement', 'hero-section', {
    eyebrow: 'New',
    title: 'Ship AI features faster',
    description: 'Copy-paste components.',
    'primary-cta': 'Get started',
    'secondary-cta': 'Read docs',
  });
  el.highlights = ['Zero dependencies', 'Three ports'];

  assert.ok(el.innerHTML.includes('New'), 'eyebrow');
  assert.ok(el.innerHTML.includes('Ship AI features faster'), 'title');
  assert.ok(el.innerHTML.includes('Copy-paste components.'), 'description');
  assert.ok(el.querySelector('.hero-primary').textContent.includes('Get started'), 'primary CTA');
  assert.ok(el.querySelector('.hero-secondary').textContent.includes('Read docs'), 'secondary CTA');
  assert.ok(el.innerHTML.includes('Zero dependencies'), 'highlight 1');
  assert.ok(el.innerHTML.includes('Three ports'), 'highlight 2');
  assert.ok(el.innerHTML.includes('items-center text-center'), 'centered by default');
});

test('HeroSection — primary and secondary buttons emit events', () => {
  const { el } = mount(heroSource, 'HeroSectionElement', 'hero-section', {
    title: 'Hero',
    'primary-cta': 'Go',
    'secondary-cta': 'More',
  });
  const primary = [];
  const secondary = [];
  el.addEventListener('primary', () => primary.push(true));
  el.addEventListener('secondary', () => secondary.push(true));

  el.querySelector('.hero-primary').click();
  el.querySelector('.hero-secondary').click();

  assert.equal(primary.length, 1, 'primary fired');
  assert.equal(secondary.length, 1, 'secondary fired');
});

test('HeroSection — left alignment and no CTAs', () => {
  const { el } = mount(heroSource, 'HeroSectionElement', 'hero-section', { title: 'Left', align: 'left' });
  assert.ok(el.innerHTML.includes('items-start text-left'), 'left alignment');
  assert.equal(el.querySelector('.hero-primary'), null, 'no primary button');
  assert.equal(el.querySelector('.hero-secondary'), null, 'no secondary button');
});

test('FooterSection — renders brand, columns, socials and copyright', () => {
  const { el } = mount(footerSource, 'FooterSectionElement', 'footer-section', {
    brand: 'Acme',
    tagline: 'Ship faster.',
    copyright: '© 2026 Acme Inc.',
  });
  el.columns = [
    { title: 'Product', links: [{ label: 'Features' }, { label: 'Pricing' }] },
    { title: 'Company', links: [{ label: 'About' }] },
  ];
  el.socials = [{ label: 'GitHub', icon: 'git-branch' }, { label: 'Website' }];

  assert.ok(el.innerHTML.includes('Acme'), 'brand');
  assert.ok(el.innerHTML.includes('Ship faster.'), 'tagline');
  assert.ok(el.innerHTML.includes('Product'), 'column 1');
  assert.ok(el.innerHTML.includes('Company'), 'column 2');
  assert.equal(el.querySelectorAll('.footer-link').length, 3, 'three links');
  assert.ok(el.innerHTML.includes('aria-label="GitHub"'), 'social label');
  assert.ok(el.innerHTML.includes('aria-label="Website"'), 'social fallback');
  assert.ok(el.innerHTML.includes('© 2026 Acme Inc.'), 'custom copyright');
});

test('FooterSection — link clicks emit the full link object', () => {
  const { el } = mount(footerSource, 'FooterSectionElement', 'footer-section', { brand: 'Acme' });
  el.columns = [{ title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }] }];
  const clicks = collect(el, 'link-click');

  el.querySelector('.footer-link[data-label="Pricing"]').click();
  assert.equal(clicks.length, 1, 'link-click fired');
  assert.deepEqual(clicks[0], { label: 'Pricing', href: '/pricing' }, 'full link detail');
});

test('FooterSection — generated copyright when none is provided', () => {
  const { el } = mount(footerSource, 'FooterSectionElement', 'footer-section', { brand: 'Acme' });
  assert.ok(el.innerHTML.includes(`© ${new Date().getFullYear()} Acme`), 'generated copyright');
});

test('TestimonialGrid — renders quotes, stars and attribution', () => {
  const { el } = mount(testimonialSource, 'TestimonialGridElement', 'testimonial-grid');
  el.testimonials = [
    { id: 't1', quote: 'Saved us weeks.', name: 'Ada Lovelace', role: 'CTO', company: 'Acme', rating: 5 },
    { id: 't2', quote: 'Beautiful defaults.', name: 'Grace Hopper', company: 'Navy' },
  ];

  assert.equal(el.querySelectorAll('.testimonial-card').length, 2, 'two cards');
  assert.ok(el.innerHTML.includes('Saved us weeks.'), 'quote 1');
  assert.ok(el.innerHTML.includes('Beautiful defaults.'), 'quote 2');
  assert.ok(el.innerHTML.includes('Ada Lovelace'), 'name 1');
  assert.ok(el.innerHTML.includes('CTO, Acme'), 'role + company');
  assert.ok(el.innerHTML.includes('AL'), 'initials avatar');
  assert.ok(el.innerHTML.includes('aria-label="5 out of 5 stars"'), 'rating label');
  assert.ok(el.innerHTML.includes('lg:grid-cols-3'), 'three columns by default');
});

test('TestimonialGrid — selecting a card emits the testimonial', () => {
  const { el } = mount(testimonialSource, 'TestimonialGridElement', 'testimonial-grid');
  el.testimonials = [{ id: 't1', quote: 'Nice', name: 'Ada Lovelace' }];
  const selected = collect(el, 'select');

  el.querySelector('.testimonial-card[data-testimonial="t1"]').click();
  assert.equal(selected.length, 1, 'select fired');
  assert.equal(selected[0].id, 't1', 'selected testimonial');
});

test('TestimonialGrid — two columns and empty state', () => {
  const { el } = mount(testimonialSource, 'TestimonialGridElement', 'testimonial-grid', { columns: '2' });
  el.testimonials = [{ id: 't1', quote: 'Nice', name: 'Ada Lovelace' }];
  assert.ok(el.innerHTML.includes('sm:grid-cols-2'), 'two-column grid');
  assert.equal(el.innerHTML.includes('lg:grid-cols-3'), false, 'no third column');

  el.testimonials = [];
  assert.ok(el.innerHTML.includes('No testimonials yet.'), 'empty copy');
});
