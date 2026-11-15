/**
 * jsdom tests for the v1.44.0 vanilla components
 * (AiSuggestionCard, JumpBackIn, HelpResourcesPanel).
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

test('vanilla AiSuggestionCard — chips, chip-click and close events', () => {
  const El = instantiate('AiSuggestionCard.js', 'AiSuggestionCardElement');
  const el = new El();
  el.setAttribute(
    'chips',
    JSON.stringify(['Weather for tomorrow', 'Summarize tomorrow'])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-ai-suggestion-card]'), 'card rendered');
  assert.ok(el.querySelector('[data-ai-suggestion-message]').textContent.includes('Tokyo'), 'default message');
  assert.equal(el.querySelectorAll('[data-ai-suggestion-chip]').length, 2, 'two chips');
  assert.ok(el.querySelector('[data-ai-suggestion-close]'), 'close button');

  let chipPicked = null;
  let closed = false;
  el.addEventListener('chip-click', (e) => { chipPicked = e.detail.chip; });
  el.addEventListener('close', () => { closed = true; });

  el.querySelector('[data-ai-suggestion-chip]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(chipPicked, 'Weather for tomorrow', 'chip-click event detail');

  el.querySelector('[data-ai-suggestion-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'close event fired');

  el.chips = [];
  assert.equal(el.querySelectorAll('[data-ai-suggestion-chip]').length, 0, 'chips cleared on property set');

  el.message = 'New plan ready.';
  assert.ok(el.querySelector('[data-ai-suggestion-message]').textContent.includes('New plan ready.'), 'message property setter');
});

test('vanilla JumpBackIn — cards render and card-click fires', () => {
  const El = instantiate('JumpBackIn.js', 'JumpBackInElement');
  const el = new El();
  el.setAttribute(
    'cards',
    JSON.stringify([
      { id: 'c1', kind: 'Trip', title: 'Trip to Japan, September 2026', subtitle: 'Tokyo · Starting 14 Sept' },
      { id: 'c2', kind: 'Chat', title: 'Mount Fuji Trip Planning', subtitle: 'Last touched 2 days ago' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-jump-back-in]'), 'row rendered');
  assert.ok(el.querySelector('[data-jump-back-in-title]').textContent.includes('Jump back in'), 'title');
  assert.equal(el.querySelectorAll('[data-jump-back-in-card]').length, 2, 'two cards');
  assert.equal(el.querySelectorAll('[data-jump-back-in-placeholder]').length, 2, 'gradient placeholders');
  assert.ok(el.querySelector('[data-jump-back-in-card="c1"] [data-jump-back-in-kind]').textContent.includes('Trip'), 'kind badge');
  assert.ok(el.querySelector('[data-jump-back-in-card="c1"]').textContent.includes('Tokyo · Starting 14 Sept'), 'subtitle text');

  let picked = null;
  el.addEventListener('card-click', (e) => { picked = e.detail.card; });
  el.querySelector('[data-jump-back-in-card="c2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'c2', 'card-click event detail');

  el.cards = [
    { id: 'c3', kind: 'Chat', title: 'T', subtitle: 'S', image: 'https://example.com/a.png' },
  ];
  assert.equal(el.querySelectorAll('[data-jump-back-in-image]').length, 1, 'image renders via property');
  assert.equal(el.querySelectorAll('[data-jump-back-in-placeholder]').length, 0, 'placeholder replaced by image');
});

test('vanilla HelpResourcesPanel — resources, minutes and link-click', () => {
  const El = instantiate('HelpResourcesPanel.js', 'HelpResourcesPanelElement');
  const el = new El();
  el.setAttribute(
    'resources',
    JSON.stringify([
      { id: 'r1', badge: 'Reference', title: 'Get started', description: 'Learn the basics.' },
      { id: 'r2', badge: 'Tutorial', title: 'CLI quick start', description: 'Author PRs with the CLI.', minutes: 10 },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-help-resources-panel]'), 'panel rendered');
  assert.ok(el.querySelector('[data-help-resources-header]').textContent.includes('Help'), 'header text');
  assert.equal(el.querySelectorAll('[data-help-resource]').length, 2, 'two resources');
  assert.ok(el.querySelector('[data-help-resource="r2"] [data-help-resource-badge]').textContent.includes('Tutorial'), 'tutorial badge');
  assert.ok(el.querySelector('[data-help-resource-minutes]').textContent.includes('10 minutes'), 'minutes text');
  assert.ok(el.querySelector('[data-help-resources-links]'), 'links group');

  let resourcePicked = null;
  let linkPicked = null;
  el.addEventListener('resource-click', (e) => { resourcePicked = e.detail.resource; });
  el.addEventListener('link-click', (e) => { linkPicked = e.detail.link; });

  el.querySelector('[data-help-resource="r1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(resourcePicked && resourcePicked.id === 'r1', 'resource-click event detail');

  el.querySelector('[data-help-resources-link]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(linkPicked, 'Send feedback', 'link-click event detail');

  el.links = [];
  assert.equal(el.querySelectorAll('[data-help-resources-links]').length, 0, 'links cleared on property set');
});
