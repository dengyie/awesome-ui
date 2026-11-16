/**
 * jsdom tests for the v2.1.0 vanilla components
 * (SessionDeviceTable, AuditLogTable, ChangelogTimeline).
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

test('vanilla SessionDeviceTable — header, rows, badges and pager', () => {
  const El = instantiate('SessionDeviceTable.js', 'SessionDeviceTableElement');
  const el = new El();
  el.setAttribute(
    'sessions',
    JSON.stringify([
      { id: 'x1', os: 'Mac OS X', application: 'Chrome 141', location: 'Singapore, Singapore', ip: '116.14.152.165', lastActive: '4 minutes ago', status: 'current' },
      { id: 'x2', os: 'Windows 11', application: 'Edge 140', location: 'Tokyo, Japan', ip: '203.0.113.42', lastActive: '2 days ago', status: 'logged-out' },
    ])
  );
  el.setAttribute('page', '2');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-session-table]'), 'root rendered');
  assert.ok(el.querySelector('[data-session-title]').textContent.includes('Login sessions'), 'default title');
  assert.ok(el.querySelector('[data-session-description]').textContent.includes('past 28 days'), 'default description');
  assert.ok(el.querySelector('[data-session-learn-more]'), 'learn more link');
  assert.ok(el.querySelector('[data-session-logout-all]').textContent.includes('Log out of all other sessions'), 'logout all label');
  assert.equal(el.querySelectorAll('[data-session-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-session-row-os="Mac OS X"]').textContent.includes('Mac OS X'), 'os cell');
  assert.ok(el.querySelector('[data-session-row-app="Edge 140"]'), 'app cell');
  assert.ok(el.querySelector('[data-session-row-location="Tokyo, Japan"]'), 'location cell');
  assert.ok(el.querySelector('[data-session-row-ip="203.0.113.42"]'), 'ip cell');
  assert.ok(el.querySelector('[data-session-row-active="4 minutes ago"]'), 'last active cell');
  assert.ok(el.querySelector('[data-session-row-status="current"]').textContent.includes('Current'), 'current badge');
  assert.ok(el.querySelector('[data-session-row-status="logged-out"]').textContent.includes('Logged out'), 'logged out badge');
  assert.ok(el.querySelector('[data-session-page="2"]').textContent.includes('Page 2'), 'page label');
  assert.ok(el.querySelector('[data-session-rows-select]'), 'rows select');

  // row click fires session-click
  let picked = null;
  el.addEventListener('session-click', (e) => { picked = e.detail; });
  el.querySelector('[data-session-row="x2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.session.id === 'x2', 'session-click detail');

  // logout-all click fires logout-all
  let loggedOut = false;
  el.addEventListener('logout-all', () => { loggedOut = true; });
  el.querySelector('[data-session-logout-all]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(loggedOut, 'logout-all event');

  // rows-per-page select fires rows-per-page-change
  let rowsChanged = null;
  el.addEventListener('rows-per-page-change', (e) => { rowsChanged = e.detail; });
  const select = el.querySelector('[data-session-rows-select]');
  select.value = '25';
  select.dispatchEvent(new window.CustomEvent('change', { bubbles: true }));
  assert.ok(rowsChanged && rowsChanged.rowsPerPage === 25, 'rows-per-page-change detail');
});

test('vanilla AuditLogTable — trend, views and event-click events', () => {
  const El = instantiate('AuditLogTable.js', 'AuditLogTableElement');
  const el = new El();
  el.setAttribute(
    'events',
    JSON.stringify([
      { id: 'x1', time: 'Jun 13 17:33:42', actor: 'Alex Smith (User)', event: 'profile.update', status: 'success', target: 'Sam Lee (User)' },
      { id: 'x2', time: 'Jun 13 17:25:57', actor: '180.252.167.22', event: 'user.session.login', status: 'failure', target: 'Sign-in attempt' },
    ])
  );
  el.setAttribute('active-view', 'Events');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-audit-log]'), 'root rendered');
  assert.ok(el.querySelector('[data-audit-title]').textContent.includes('System Log'), 'default title');
  assert.ok(el.querySelector('[data-audit-filter="Date range"]'), 'default filter');
  assert.equal(el.querySelectorAll('[data-audit-trend-bar]').length, 7, 'default trend bars');
  assert.ok(el.querySelector('[data-audit-count]').textContent.includes('2'), 'event count');
  assert.equal(el.querySelectorAll('[data-audit-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-audit-row-status="failure"]').textContent.includes('FAILURE'), 'failure badge');
  assert.ok(el.querySelector('[data-audit-row-target]'), 'target cell');

  // view switch updates active state and fires view-change
  let viewChanged = null;
  el.addEventListener('view-change', (e) => { viewChanged = e.detail; });
  el.querySelectorAll('[data-audit-view]')[1].dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(viewChanged && viewChanged.view === 'Raw export', 'view-change detail');
  assert.ok(el.querySelectorAll('[data-audit-view]')[1].getAttribute('aria-pressed') === 'true', 'active view updated');

  // row click fires event-click
  let picked = null;
  el.addEventListener('event-click', (e) => { picked = e.detail; });
  el.querySelector('[data-audit-row="x2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.event.id === 'x2', 'event-click detail');
});

test('vanilla ChangelogTimeline — entries, meta and entry-click events', () => {
  const El = instantiate('ChangelogTimeline.js', 'ChangelogTimelineElement');
  const el = new El();
  el.setAttribute(
    'entries',
    JSON.stringify([
      { id: 'n1', date: 'Nov 15, 2026', tag: 'Improved', tone: 'sky', title: 'Faster dashboard', body: 'Widgets reflow smoothly now.', likes: 24, views: 1832 },
      { id: 'n2', date: 'Nov 12, 2026', tag: 'New', tone: 'emerald', title: 'Skip onboarding', body: 'Returning users jump straight in.' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-changelog]'), 'root rendered');
  assert.ok(el.querySelector('[data-changelog-title]').textContent.includes('Changelog'), 'default title');
  assert.ok(el.querySelector('[data-changelog-search]'), 'search box');
  assert.ok(el.querySelector('[data-changelog-filter]'), 'filter button');
  assert.equal(el.querySelectorAll('[data-changelog-entry]').length, 2, 'two entries');
  assert.ok(el.querySelector('[data-changelog-date]').textContent.includes('Nov 15, 2026'), 'date');
  assert.ok(el.querySelector('[data-changelog-tag="Improved"]'), 'tag');
  assert.ok(el.querySelector('[data-changelog-entry-title]').textContent.includes('Faster dashboard'), 'entry title');
  assert.ok(el.querySelector('[data-changelog-likes="24"]').textContent.includes('♡ 24'), 'likes');
  assert.ok(el.querySelector('[data-changelog-views="1832"]'), 'views');

  let picked = null;
  el.addEventListener('entry-click', (e) => { picked = e.detail; });
  el.querySelectorAll('[data-changelog-entry]')[1].dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.entry.id === 'n2', 'entry-click detail');
});
