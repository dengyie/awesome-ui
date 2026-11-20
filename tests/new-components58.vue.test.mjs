/**
 * v3.4.0 — Vue SSR regression tests
 * McpConnectPanel, AgentNotificationFeed, AgentErrorRecovery,
 * AgentWorkspaceSettings, AgentEnvVarEditor.
 * Interactive behavior is covered by the vanilla jsdom suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { renderToString } from '@vue/server-renderer';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const vueModule = require('vue');

const renderSfc = async (file, props) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n58' });
  const template = compileTemplate({
    id: 'n58',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);

  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, bindings) => {
      const destructuring = bindings.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, ' $1: $2 ');
      return `const {${destructuring}} = vueMod;`;
    })
    .replace(/^export function render\(/m, 'function render(');

  const factory = new Function('vueMod', 'exports', 'requireShim', `
    const require = (name) => (name === 'vue' ? vueMod : requireShim(name));
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const exportsShim = {};
  const { default: component, render } = factory(vueModule, exportsShim, require);
  component.render = render;

  const app = vueModule.createSSRApp(component, props);
  return renderToString(app);
};

test('vue SSR — McpConnectPanel tabs and steps', async () => {
  const html = await renderSfc('McpConnectPanel.vue', {
    clients: [
      { id: 'chatgpt', label: 'ChatGPT', steps: ['Enable Developer mode'], snippet: '{"mcpServers":{}}' },
      { id: 'cursor', label: 'Cursor', steps: ['Add MCP server'] },
    ],
  });
  assert.ok(html.includes('data-mcp-tab="chatgpt"'));
  assert.ok(html.includes('Connection guide'));
  assert.ok(html.includes('Enable Developer mode'));
});

test('vue SSR — AgentNotificationFeed rows and badge', async () => {
  const html = await renderSfc('AgentNotificationFeed.vue', {
    items: [
      { id: 'n1', kind: 'completed', title: 'Q: What places do you like?', statusText: 'completed training', caption: 'From your manual entry', time: '30 minutes ago', unread: true },
    ],
  });
  assert.ok(html.includes('data-agent-feed-item="n1"'));
  assert.ok(html.includes('1 new'));
  assert.ok(html.includes('completed training'));
});

test('vue SSR — AgentErrorRecovery alert with actions', async () => {
  const html = await renderSfc('AgentErrorRecovery.vue', { runId: 'run_9f2' });
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('run_9f2'));
  assert.ok(html.includes('Retry'));
});

test('vue SSR — AgentWorkspaceSettings sections and toggles', async () => {
  const html = await renderSfc('AgentWorkspaceSettings.vue', {
    sections: [
      {
        id: 'learning',
        title: 'Learning Settings',
        toggles: [{ id: 'snippets', label: 'Topic snippets', enabled: true }],
      },
    ],
  });
  assert.ok(html.includes('data-agent-setting-row="snippets"'));
  assert.ok(html.includes('aria-checked="true"'));
  assert.ok(html.includes('Learning Settings'));
});

test('vue SSR — AgentEnvVarEditor rows and add form', async () => {
  const html = await renderSfc('AgentEnvVarEditor.vue', {
    vars: [
      { key: 'API_TOKEN', value: 's3cr3t', secret: true },
      { key: 'LOG_LEVEL', value: 'debug' },
    ],
  });
  assert.ok(html.includes('data-env-row="API_TOKEN"'));
  assert.ok(html.includes('data-env-reveal'));
  assert.ok(html.includes('data-env-add-btn'));
});
