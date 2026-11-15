/**
 * jsdom tests for the v1.45.0 vanilla components
 * (VisionAnalysisCard, PrReviewQueue, IterationActionBar).
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

test('vanilla VisionAnalysisCard — sections render and section-click fires', () => {
  const El = instantiate('VisionAnalysisCard.js', 'VisionAnalysisCardElement');
  const el = new El();
  el.setAttribute(
    'sections',
    JSON.stringify([
      {
        heading: 'Design Strengths',
        rows: [
          { key: 'Color Palette', value: 'Warm sunset tones with high saturation' },
          { key: 'Composition', value: 'Balanced horizon at the upper third' },
        ],
      },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-vision-analysis-card]'), 'card rendered');
  assert.ok(el.querySelector('[data-vision-section-heading]').textContent.includes('Design Strengths'), 'heading text');
  assert.equal(el.querySelectorAll('[data-vision-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-vision-row="Color Palette"]'), 'row key attr');
  assert.ok(el.querySelector('[data-vision-row-key]').textContent.includes('Color Palette'), 'key text');
  assert.ok(el.querySelector('[data-vision-row-value]').textContent.includes('Warm sunset tones'), 'value text');

  let picked = null;
  el.addEventListener('section-click', (e) => { picked = e.detail.section; });
  el.querySelector('[data-vision-section-heading]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.heading === 'Design Strengths', 'section-click event detail');

  el.sections = [{ heading: 'Image Details', rows: [{ key: 'Lighting', value: 'Midday sun' }] }];
  assert.equal(el.querySelectorAll('[data-vision-row]').length, 1, 'sections property setter re-renders');
});

test('vanilla PrReviewQueue — groups, toggle collapse and pr-click', () => {
  const El = instantiate('PrReviewQueue.js', 'PrReviewQueueElement');
  const el = new El();
  el.setAttribute(
    'groups',
    JSON.stringify([
      {
        id: 'waiting',
        label: 'Waiting for reviewers',
        prs: [{ id: 'p1', title: 'Add activity feed API', repo: 'mini-landing-page', number: 4, author: 'Sam Lee' }],
      },
      {
        id: 'drafts',
        label: 'Drafts',
        prs: [
          { id: 'p2', title: 'Add user search', repo: 'mini-landing-page', number: 7, author: 'Sam Lee' },
          { id: 'p3', title: 'Add frontend for search', repo: 'mini-landing-page', number: 6, author: 'Sam Lee' },
        ],
      },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-pr-review-queue]'), 'queue rendered');
  assert.equal(el.querySelectorAll('[data-pr-group]').length, 2, 'two groups');
  assert.ok(el.querySelector('[data-pr-group="waiting"] [data-pr-group-label]').textContent.includes('Waiting for reviewers'), 'waiting label');
  assert.ok(el.querySelector('[data-pr-group="drafts"] [data-pr-group-count]').textContent.includes('2'), 'drafts count');
  assert.equal(el.querySelectorAll('[data-pr-row]').length, 3, 'three pr rows');
  assert.ok(el.querySelector('[data-pr-avatar]').textContent.includes('SL'), 'avatar initials');
  assert.ok(el.querySelector('[data-pr-meta]').textContent.includes('Sam Lee · mini-landing-page #4'), 'meta text');

  let picked = null;
  el.addEventListener('pr-click', (e) => { picked = e.detail.pr; });
  el.querySelector('[data-pr-row="p2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'p2', 'pr-click event detail');

  el.querySelector('[data-pr-group-toggle="drafts"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-pr-group="drafts"] [data-pr-row]').length, 0, 'drafts collapsed');
  assert.ok(el.querySelector('[data-pr-group="drafts"] [data-pr-group-caret]').textContent.includes('▶'), 'caret flipped');

  el.querySelector('[data-pr-group-toggle="drafts"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-pr-group="drafts"] [data-pr-row]').length, 2, 'drafts expanded again');
});

test('vanilla IterationActionBar — actions and page-change events', () => {
  const El = instantiate('IterationActionBar.js', 'IterationActionBarElement');
  const el = new El();
  el.setAttribute('page', '2');
  el.setAttribute('total-pages', '4');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-iteration-action-bar]'), 'bar rendered');
  assert.equal(el.querySelectorAll('[data-iteration-action]').length, 4, 'four action pills');
  assert.ok(el.querySelector('[data-iteration-action="brainstorm"]'), 'brainstorm pill');
  assert.ok(el.querySelector('[data-iteration-page-label]').textContent.includes('2/4'), 'page label');

  let lastAction = null;
  let lastPage = null;
  el.addEventListener('action', (e) => { lastAction = e.detail.action; });
  el.addEventListener('page-change', (e) => { lastPage = e.detail.page; });

  el.querySelector('[data-iteration-action="reply"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(lastAction, 'reply', 'action event detail');

  el.querySelector('[data-iteration-next]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(lastPage, 3, 'page-change detail after next');
  assert.ok(el.querySelector('[data-iteration-page-label]').textContent.includes('3/4'), 'label updated');

  el.querySelector('[data-iteration-prev]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(lastPage, 2, 'page-change detail after prev');

  // Walk to bounds and check disabled attributes.
  el.page = 1;
  assert.ok(el.querySelector('[data-iteration-prev]').hasAttribute('disabled'), 'prev disabled at page 1');
  el.page = 4;
  assert.ok(el.querySelector('[data-iteration-next]').hasAttribute('disabled'), 'next disabled at last page');
});
