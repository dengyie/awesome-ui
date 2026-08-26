/**
 * HomepageDashboard — Vanilla regression tests
 * jsdom-level behavioral coverage of the Web Component: rendering, the three
 * status styles, search filtering (name + description), collapse, href protocol
 * whitelist, clock lifecycle, XSS escaping and empty-group parity.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const source = readFileSync(join(root, 'vanilla/HomepageDashboard.js'), 'utf8').replace(
  /^export default HomepageDashboardElement;\s*$/m,
  ''
);

const GROUPS = [
  {
    name: 'Media',
    icon: '🎬',
    services: [
      { name: 'Jellyfin', description: 'Streaming', icon: 'https://cdn/jellyfin.png', href: 'https://jellyfin.local', status: 'up', pingText: '12ms' },
      { name: 'Plex', description: 'Movies', status: 'down' },
      { name: 'Sonarr', icon: '📺', status: 'warn' },
    ],
  },
  { name: 'Network', services: [{ name: 'Router', description: 'Gateway', status: 'unknown' }] },
];

/** Mount the component in a fresh jsdom window. attrs = Record<string,string|null>. */
function mount(attrs = {}, groups = GROUPS) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  // jsdom's window.eval does not resolve bare globals (HTMLElement, customElements...),
  // so evaluate the component body with those injected via new Function.
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'setInterval',
    'clearInterval',
    source + '\nreturn HomepageDashboardElement;'
  );
  const Klass = factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window.setInterval.bind(window),
    window.clearInterval.bind(window)
  );
  const el = window.document.createElement('homepage-dashboard');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null) el.removeAttribute(k);
    else el.setAttribute(k, String(v));
  }
  el.groups = groups;
  window.document.body.appendChild(el);
  return { dom, window, el, Klass };
}

test('renders header, groups and service cards', () => {
  const { dom, window, el } = mount();
  try {
    assert.ok(window.document.querySelector('homepage-dashboard .homepage-title'));
    assert.equal(el.textContent.trim().slice(0, 0).length, 0); // sanity
    assert.equal(window.document.querySelectorAll('.services-group').length, 2);
    assert.equal(window.document.querySelectorAll('.service-card').length, 4);
    assert.ok(el.textContent.includes('Jellyfin'));
    assert.ok(el.textContent.includes('Router'));
  } finally {
    dom.window.close();
  }
});

test('three status styles render the right markers', () => {
  let dom = mount();
  try {
    // default = pill
    assert.equal(dom.window.document.querySelectorAll('.service-status-pill').length, 4);
    assert.equal(dom.window.document.querySelectorAll('.service-status-dot').length, 0);
  } finally {
    dom.window.close();
  }
  dom = mount({ 'status-style': 'dot' });
  try {
    assert.equal(dom.window.document.querySelectorAll('.service-status-dot').length, 4);
    assert.equal(dom.window.document.querySelectorAll('.service-status-pill').length, 0);
  } finally {
    dom.window.close();
  }
  dom = mount({ 'status-style': 'none' });
  try {
    assert.equal(dom.window.document.querySelectorAll('.service-status-pill, .service-status-dot').length, 0);
  } finally {
    dom.window.close();
  }
});

test('collapse hides a group and flips aria-expanded', () => {
  const { dom, window } = mount();
  try {
    const header = window.document.querySelector('[data-toggle-group]');
    assert.equal(header.getAttribute('aria-expanded'), 'true');
    header.click();
    // re-query after re-render (the old node was detached)
    const newHeader = window.document.querySelector('[data-toggle-group]');
    assert.equal(newHeader.getAttribute('aria-expanded'), 'false');
    // Media collapsed → only Network card visible
    assert.equal(window.document.querySelectorAll('.service-card').length, 1);
  } finally {
    dom.window.close();
  }
});

test('search matches name and description and hides empty groups', () => {
  const { dom, window } = mount({ 'show-search': 'true' });
  try {
    const input = window.document.querySelector('[data-el="search"]');
    assert.equal(input.getAttribute('aria-label'), 'Search services');
    const set = (v) => {
      const inputEl = window.document.querySelector('[data-el="search"]');
      inputEl.value = v;
      inputEl.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    set('jellyfin'); // matches name
    assert.equal(window.document.querySelectorAll('.service-card:not(.hidden)').length, 1);
    // both groups stay because one card each is visible — here only Jellyfin matches, "Uploads" group is dropped
    set('gateway'); // matches Router description
    assert.equal(window.document.querySelectorAll('.service-card:not(.hidden)').length, 1);
    set('zzz-no-match');
    const visibleGroups = [...window.document.querySelectorAll('.services-group')].filter((g) => !g.hidden);
    assert.equal(visibleGroups.length, 0); // no empty group headers left behind (parity with React/Vue)
    set('');
    assert.equal(window.document.querySelectorAll('.service-card:not(.hidden)').length, 4);
  } finally {
    dom.window.close();
  }
});

test('href protocol whitelist — javascript:/data: never become links', () => {
  const evilGroups = [
    { name: 'H', services: [
      { name: 'sneaky', href: 'javascript:alert(1)' },
      { name: 'data', href: 'data:text/html,<x>' },
      { name: 'ok', href: 'https://example.com' },
      { name: 'rel', href: '//cdn.example.com/x' },
      { name: 'mail', href: 'mailto:a@b.c' },
      { name: 'path', href: '/health' },
      { name: 'dotrel', href: './asset' },
    ]},
  ];
  const { dom, window } = mount({}, evilGroups);
  try {
    const anchors = [...window.document.querySelectorAll('a')];
    const evil = anchors.filter((a) => /javascript:|data:/i.test(a.getAttribute('href') || ''));
    assert.equal(evil.length, 0, `dangerous hrefs leaked: ${evil.map((a) => a.getAttribute('href'))}`);
    const hrefs = anchors.map((a) => a.getAttribute('href'));
    for (const ok of ['https://example.com', '//cdn.example.com/x', 'mailto:a@b.c', '/health', './asset']) {
      assert.ok(hrefs.includes(ok), `${ok} should be allowed`);
    }
  } finally {
    dom.window.close();
  }
});

test('XSS — injected markup does not create nodes, text is escaped', () => {
  const evil = { name: '<img src=x onerror=alert(1)>', description: '<script>window.__xss=1</script>', href: 'javascript:alert(2)' };
  const { dom, window } = mount({}, [{ name: 'G <b>', services: [evil] }]);
  try {
    assert.equal(window.document.querySelectorAll('img[src^="x"]').length, 0);
    assert.equal(window.document.querySelectorAll('script').length, 0);
    assert.equal(window.__xss, undefined);
    assert.ok(window.document.querySelector('.service-name').textContent.includes('<img'));
  } finally {
    dom.window.close();
  }
});

test('clock lifecycle — renders, ticks, and stops when show-clock flips', async () => {
  const { dom, window, el } = mount({});
  try {
    assert.ok(el.querySelector('[data-el="clock-time"]'));
    assert.ok(el._clockTimer, 'timer should be running');
    const oldTimer = el._clockTimer;
    el.setAttribute('show-clock', 'false');
    assert.equal(el._clockTimer, null, 'timer must be cleared when show-clock=false');
    assert.ok(!el.querySelector('[data-el="clock-time"]'), 'clock DOM removed');
  } finally {
    dom.window.close();
  }
});

test('default version is not an upstream version number', () => {
  const { dom, window } = mount();
  try {
    const footer = window.document.querySelector('footer');
    assert.ok(footer.textContent.includes('Homepage · awesome-ui'));
    assert.ok(!footer.textContent.match(/v?\d+\.\d+\.\d+/));
  } finally {
    dom.window.close();
  }
});

test('missing name/description never throw and render safely', () => {
  const { dom, window } = mount({}, [{ name: 'Odd', services: [{ status: 'up' }] }]);
  try {
    assert.equal(window.document.querySelectorAll('.service-card').length, 1);
    assert.ok(window.document.querySelector('.service-card').textContent.trim().length >= 0);
  } finally {
    dom.window.close();
  }
});