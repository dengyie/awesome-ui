/**
 * v3.4.0 batch — vanilla behavior tests (jsdom)
 * McpConnectPanel, AgentNotificationFeed, AgentErrorRecovery,
 * AgentWorkspaceSettings, AgentEnvVarEditor.
 */
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
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const mcpSource = stripComponent('McpConnectPanel.js', 'McpConnectPanelElement');
const feedSource = stripComponent('AgentNotificationFeed.js', 'AgentNotificationFeedElement');
const errorSource = stripComponent('AgentErrorRecovery.js', 'AgentErrorRecoveryElement');
const settingsSource = stripComponent('AgentWorkspaceSettings.js', 'AgentWorkspaceSettingsElement');
const envSource = stripComponent('AgentEnvVarEditor.js', 'AgentEnvVarEditorElement');

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
    'window',
    'HTMLInputElement',
    'HTMLTextAreaElement',
    `${source}\nreturn ${exportName};`,
  );
  const Klass = factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.document,
    window,
    window.HTMLInputElement,
    window.HTMLTextAreaElement,
  );
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  // Capture dispatched events
  const events = [];
  el.dispatchEvent = ((orig) => (evt) => { events.push(evt); return orig.call(el, evt); })(el.dispatchEvent.bind(el));
  return { el, events, window };
}

test('vanilla — McpConnectPanel renders tabs, steps, snippet and copy event', () => {
  const { el, events } = mount(mcpSource, 'McpConnectPanelElement');
  el.clients = [
    { id: 'chatgpt', label: 'ChatGPT', mark: '🤖', steps: ['Enable Developer mode', 'Add connector'], snippet: '{"mcpServers":{}}' },
    { id: 'claude', label: 'Claude Desktop', steps: ['Open settings'], snippet: '{"mcpServers":{"awesome-ui":{"command":"npx"}}}' },
  ];
  assert.ok(el.querySelector('[data-mcp-tab="chatgpt"]'));
  assert.ok(el.querySelector('[data-mcp-tab="claude"]'));
  assert.ok(el.innerHTML.includes('Enable Developer mode'));
  assert.ok(el.innerHTML.includes('data-mcp-copy'));

  // Switch tab re-renders steps
  el.querySelector('[data-mcp-tab="claude"]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.ok(el.innerHTML.includes('Open settings'));
  assert.ok(!el.innerHTML.includes('Enable Developer mode'));

  // Copy button fires copy event with the active client (re-query after
  // re-render — render() replaces the copy node)
  el.querySelector('[data-mcp-copy]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'copy');
  assert.equal(events[0].detail.client.id, 'claude');
  // Copy feedback label rendered
  assert.ok(el.innerHTML.includes('Copied!'));
});

test('vanilla — McpConnectPanel escapeAttribute neutralizes hostile labels', () => {
  const { el } = mount(mcpSource, 'McpConnectPanelElement');
  el.clients = [{ id: 'x" onmouseover="alert(1)', label: '<script>alert(1)</script>', steps: ['<img src=x>'] }];
  assert.ok(!el.innerHTML.includes('<script>alert(1)'));
  assert.ok(!el.innerHTML.includes('onmouseover="alert(1)"'));
});

test('vanilla — AgentNotificationFeed unread badge and click marks read', () => {
  const { el, events } = mount(feedSource, 'AgentNotificationFeedElement');
  el.items = [
    { id: 'n1', kind: 'completed', title: 'Q: What places do you like?', statusText: 'completed training', caption: 'From your manual entry', time: '30 minutes ago', unread: true },
    { id: 'n2', kind: 'started', title: 'Q: How do you decide?', time: '3 hours ago', unread: true },
  ];
  assert.ok(el.innerHTML.includes('2 new'));
  assert.ok(el.innerHTML.includes('completed training'));

  // Click first row → marks read, count drops, open event fires
  el.querySelector('[data-agent-feed-item="n1"]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.ok(el.innerHTML.includes('1 new'));
  const row = el.querySelector('[data-agent-feed-item="n1"]');
  assert.equal(row.getAttribute('data-unread'), 'false');
  assert.equal(events[0].type, 'open');
  assert.equal(events[0].detail.item.id, 'n1');
});

test('vanilla — AgentErrorRecovery renders alert and fires retry/reset', () => {
  const { el, events } = mount(errorSource, 'AgentErrorRecoveryElement', { 'run-id': 'run_9f2' });
  assert.ok(el.querySelector('[data-agent-error]'));
  assert.ok(el.innerHTML.includes('run_9f2'));
  assert.ok(el.innerHTML.includes('Retry'));
  assert.ok(el.innerHTML.includes('Start over'));

  el.querySelector('[data-agent-error-retry]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  el.querySelector('[data-agent-error-reset]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.deepEqual(events.map((e) => e.type), ['retry', 'reset']);
});

test('vanilla — AgentErrorRecovery reset-label empty hides button', () => {
  const { el } = mount(errorSource, 'AgentErrorRecoveryElement', { 'reset-label': '' });
  assert.ok(el.innerHTML.includes('Retry'));
  assert.ok(!el.querySelector('[data-agent-error-reset]'));
});

test('vanilla — AgentWorkspaceSettings toggles fire events with count', () => {
  const { el, events } = mount(settingsSource, 'AgentWorkspaceSettingsElement');
  el.tabs = [{ id: 'general', label: 'General' }];
  el.sections = [
    {
      id: 'learning',
      title: 'Learning Settings',
      toggles: [
        { id: 'snippets', label: 'Topic snippets', enabled: true },
        { id: 'sound', label: 'Sound Effects', enabled: false },
      ],
    },
  ];
  assert.ok(el.innerHTML.includes('General'));
  assert.ok(el.innerHTML.includes('Learning Settings'));
  assert.ok(el.innerHTML.includes('1/2 on'));

  const toggles = el.querySelectorAll('[data-agent-setting-toggle]');
  toggles[1].dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.equal(events[0].type, 'toggle');
  assert.equal(events[0].detail.toggle.id, 'sound');
  assert.equal(events[0].detail.enabled, true);
  assert.ok(el.innerHTML.includes('2/2 on'));
});

test('vanilla — AgentEnvVarEditor add, reveal, delete and change events', () => {
  const { el, events } = mount(envSource, 'AgentEnvVarEditorElement');
  el.vars = [{ key: 'API_TOKEN', value: 's3cr3t', secret: true }];

  // Secret row renders masked with reveal button
  const valueInput = el.querySelector('[data-env-value]');
  assert.equal(valueInput.getAttribute('type'), 'password');

  // Reveal toggles type
  el.querySelector('[data-env-reveal]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.equal(el.querySelector('[data-env-value]').getAttribute('type'), 'text');

  // Add row via inputs
  const keyInput = el.querySelector('[data-env-new-key]');
  keyInput.value = 'LOG_LEVEL';
  keyInput.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  const valInput = el.querySelector('[data-env-new-value]');
  valInput.value = 'debug';
  valInput.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  el.querySelector('[data-env-add-btn]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-env-row="LOG_LEVEL"]'));
  assert.equal(events.filter((e) => e.type === 'change').length, 1);

  // Delete row fires change with remaining vars
  el.querySelector('[data-env-row="API_TOKEN"] [data-env-delete]').dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
  assert.ok(!el.querySelector('[data-env-row="API_TOKEN"]'));
  const lastChange = events.filter((e) => e.type === 'change').pop();
  assert.equal(lastChange.detail.vars.length, 1);
  assert.equal(lastChange.detail.vars[0].key, 'LOG_LEVEL');
});

test('vanilla — AgentEnvVarEditor hostile key/value cannot inject markup', () => {
  const { el } = mount(envSource, 'AgentEnvVarEditorElement');
  el.vars = [{ key: '<img src=x onerror=alert(1)>', value: '" onfocus="alert(1)' }];
  // Keys render as attribute values / text after escaping — no live element
  // or attribute boundary break may survive.
  assert.ok(!el.querySelector('img'));
  assert.ok(!el.querySelector('[onerror]'));
  assert.ok(!el.querySelector('[onfocus]'));
  const row = el.querySelector('[data-env-row]');
  assert.ok(row, 'escaped row still renders');
  assert.equal(row.getAttribute('data-env-row'), '<img src=x onerror=alert(1)>');
});
