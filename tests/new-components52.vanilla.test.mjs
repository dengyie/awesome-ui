/**
 * jsdom tests for the v2.5.0 vanilla components
 * (TaskCardModal, FormTrackingDashboard, AudioPlaylistPage, BlogPostArticle).
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

test('vanilla TaskCardModal — structure, checklist toggle and comment submit', () => {
  const El = instantiate('TaskCardModal.js', 'TaskCardModalElement');
  const el = new El();
  el.setAttribute(
    'checklist',
    JSON.stringify([
      { id: 'c1', text: 'Draft tiers', done: true },
      { id: 'c2', text: 'Review copy', done: false },
    ])
  );
  window.document.body.appendChild(el);

  // Closed by default: the fixed inset-0 overlay must not blanket the page
  assert.equal(el.querySelector('[data-taskcard]'), null, 'overlay hidden without open attr');
  el.setAttribute('open', '');
  assert.ok(el.querySelector('[data-taskcard]'), 'root rendered after open');
  assert.ok(el.querySelector('[data-taskcard-dialog]'), 'dialog');
  assert.ok(el.querySelector('[data-taskcard-title]').textContent.includes('Design landing page hero'), 'default title');
  assert.ok(el.querySelector('[data-taskcard-complete]'), 'complete toggle');
  assert.ok(el.querySelector('[data-taskcard-member="m1"]'), 'member');
  assert.ok(el.querySelector('[data-taskcard-label="l1"]'), 'label chip');
  assert.ok(el.querySelector('[data-taskcard-dates]'), 'dates');
  assert.ok(el.querySelector('[data-taskcard-attachment="a1"]'), 'attachment');
  assert.ok(el.querySelector('[data-taskcard-checklist-count]').textContent.includes('50%'), '50% progress');
  assert.ok(el.querySelector('[data-taskcard-checklist-bar]'), 'progress bar');
  assert.ok(el.querySelector('[data-taskcard-checkitem="c1"]'), 'check item');
  assert.ok(el.querySelector('[data-taskcard-comment="k1"]'), 'comment');
  assert.ok(el.querySelector('[data-taskcard-input]'), 'composer input');

  // checklist toggle → 100% + event
  let toggled = null;
  el.addEventListener('checklist-toggle', (e) => { toggled = e.detail; });
  el.querySelector('[data-taskcard-checkitem="c2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(toggled && toggled.item.id === 'c2' && toggled.item.done === true, 'checklist-toggle detail');
  assert.ok(el.querySelector('[data-taskcard-checklist-count]').textContent.includes('100%'), 'progress updated to 100%');

  // complete toggle event
  let completed = null;
  el.addEventListener('complete-toggle', (e) => { completed = e.detail; });
  el.querySelector('[data-taskcard-complete]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(completed && completed.completed === true, 'complete-toggle detail');

  // comment submit via Enter key
  let submitted = null;
  el.addEventListener('comment-submit', (e) => { submitted = e.detail; });
  const input = el.querySelector('[data-taskcard-input]');
  input.value = 'Nice progress!';
  input.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(submitted && submitted.text === 'Nice progress!', 'comment-submit via Enter');

  // close event
  let closed = false;
  el.addEventListener('card-close', () => { closed = true; });
  el.querySelector('[data-taskcard-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'card-close fired');
});

test('vanilla FormTrackingDashboard — stats, sort menu and request click', () => {
  const El = instantiate('FormTrackingDashboard.js', 'FormTrackingDashboardElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-formtrack]'), 'root rendered');
  assert.ok(el.querySelector('[data-formtrack-title]').textContent.includes('Consultation form'), 'default title');
  assert.ok(el.querySelector('[data-formtrack-active]'), 'active pill');
  assert.ok(el.querySelector('[data-formtrack-options]'), 'options button');
  assert.ok(el.querySelector('[data-formtrack-stat="s2"]'), 'stat card');
  assert.ok(el.querySelector('[data-formtrack-stat-value="s2"]').textContent.includes('8'), 'stat value');
  assert.ok(el.querySelector('[data-formtrack-details]'), 'details grid');
  assert.ok(el.querySelector('[data-formtrack-row="r1"]'), 'request row');
  assert.ok(el.querySelector('[data-formtrack-status="completed"]'), 'status pill');

  // open sort menu and pick an option
  let sorted = null;
  el.addEventListener('sort-change', (e) => { sorted = e.detail; });
  el.querySelector('[data-formtrack-options]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-formtrack-sortmenu]'), 'sort menu open');
  el.querySelector('[data-formtrack-sortoption="Status"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(sorted && sorted.option === 'Status', 'sort-change detail');
  assert.ok(!el.querySelector('[data-formtrack-sortmenu]'), 'sort menu closed after pick');

  // request row click
  let picked = null;
  el.addEventListener('request-click', (e) => { picked = e.detail; });
  el.querySelector('[data-formtrack-row="r3"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.row.id === 'r3' && picked.row.name === 'Chen Wei', 'request-click detail');

  // back event
  let backed = false;
  el.addEventListener('back', () => { backed = true; });
  el.querySelector('[data-formtrack-back]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(backed, 'back fired');
});

test('vanilla AudioPlaylistPage — tracks, like toggle, queue and play', () => {
  const El = instantiate('AudioPlaylistPage.js', 'AudioPlaylistPageElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-audioplaylist]'), 'root rendered');
  assert.ok(el.querySelector('[data-audioplaylist-cover]'), 'cover');
  assert.ok(el.querySelector('[data-audioplaylist-title]').textContent.includes('Late night sketches'), 'default title');
  assert.ok(el.querySelector('[data-audioplaylist-track="t1"]'), 'track row');
  assert.ok(el.querySelector('[data-audioplaylist-track="t1"]').textContent.includes('Neon after rain'), 'track title');
  assert.ok(el.querySelector('[data-audioplaylist-version]'), 'version pill');
  assert.ok(el.querySelector('[data-audioplaylist-remix="t2"]'), 'remix control');
  assert.ok(el.querySelector('[data-audioplaylist-queue-item="q1"]'), 'queue item');
  assert.ok(el.querySelector('[data-audioplaylist-player]'), 'player bar');
  assert.ok(el.querySelector('[data-audioplaylist-player-toggle]'), 'player toggle');

  // like toggle: ♡ → ♥ and event
  let liked = null;
  el.addEventListener('like', (e) => { liked = e.detail; });
  const likeBtn = el.querySelector('[data-audioplaylist-like-track="t2"]');
  assert.ok(likeBtn.textContent.includes('♡'), 'initially unliked');
  likeBtn.dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(liked && liked.track.id === 't2', 'like event detail');
  assert.ok(el.querySelector('[data-audioplaylist-like-track="t2"]').textContent.includes('♥'), 'liked after toggle');

  // track click
  let trackPicked = null;
  el.addEventListener('track-click', (e) => { trackPicked = e.detail; });
  el.querySelector('[data-audioplaylist-track-play="t3"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(trackPicked && trackPicked.track.id === 't3' && trackPicked.track.title === 'Signals in the dark', 'track-click detail');

  // queue click
  let queuePicked = null;
  el.addEventListener('queue-click', (e) => { queuePicked = e.detail; });
  el.querySelector('[data-audioplaylist-queue-item="q2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(queuePicked && queuePicked.track.id === 'q2', 'queue-click detail');

  // play toggle flips label
  el.querySelector('[data-audioplaylist-play]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-audioplaylist-play]').textContent.includes('Pause'), 'play toggled to Pause');
});

test('vanilla BlogPostArticle — toc highlight and copy flip', () => {
  const El = instantiate('BlogPostArticle.js', 'BlogPostArticleElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-blogpost]'), 'root rendered');
  assert.ok(el.querySelector('[data-blogpost-site]').textContent.includes('SLMobbin'), 'default site');
  assert.ok(el.querySelector('[data-blogpost-title]').textContent.includes('Introduction to Front-End Development'), 'default title');
  assert.ok(el.querySelector('[data-blogpost-tocitem="key-technologies"]'), 'toc item');
  assert.ok(el.querySelector('[data-blogpost-toc-active="true"]'), 'active toc');
  assert.ok(el.querySelector('[data-blogpost-heading="key-technologies"]'), 'heading anchor');
  assert.ok(el.querySelector('[data-blogpost-code]'), 'code block');
  assert.ok(el.querySelector('[data-blogpost-code]').textContent.includes('My First Web Page'), 'escaped code content');

  // toc click → active moves + event
  let headed = null;
  el.addEventListener('heading-click', (e) => { headed = e.detail; });
  el.querySelector('[data-blogpost-tocitem="html"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(headed && headed.heading.id === 'html', 'heading-click detail');
  assert.ok(el.querySelector('[data-blogpost-tocitem="html"]').getAttribute('data-blogpost-toc-active') === 'true', 'active moved to html');

  // copy button flips label then restores
  let copied = false;
  el.addEventListener('copy-code', () => { copied = true; });
  el.querySelector('[data-blogpost-code-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copied, 'copy-code fired');
  assert.ok(el.querySelector('[data-blogpost-code-copy]').textContent.includes('Copied!'), 'copied label');
  setTimeout(() => {
    assert.ok(el.querySelector('[data-blogpost-code-copy]').textContent.includes('Copy'), 'label restored');
  }, 1600);
});
