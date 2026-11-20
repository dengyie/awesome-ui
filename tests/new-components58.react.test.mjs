/**
 * v3.4.0 batch — React SSR smoke tests
 * McpConnectPanel, AgentNotificationFeed, AgentErrorRecovery,
 * AgentWorkspaceSettings, AgentEnvVarEditor.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const transpile = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  return ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    })
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"');
};

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n58.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — McpConnectPanel tabs and steps', async () => {
  const { default: McpConnectPanel } = await load('McpConnectPanel.tsx');
  const html = renderToStaticMarkup(
    h(McpConnectPanel, {
      clients: [
        { id: 'chatgpt', label: 'ChatGPT', steps: ['Enable Developer mode', 'Add connector'], snippet: '{"mcpServers":{}}' },
        { id: 'claude', label: 'Claude Desktop', steps: ['Open settings'] },
      ],
    })
  );
  assert.ok(html.includes('data-mcp-tab="chatgpt"'));
  assert.ok(html.includes('Connection guide'));
  assert.ok(html.includes('Enable Developer mode'));
  assert.ok(html.includes('data-mcp-copy'));
});

test('React SSR — AgentNotificationFeed rows and unread badge', async () => {
  const { default: AgentNotificationFeed } = await load('AgentNotificationFeed.tsx');
  const html = renderToStaticMarkup(
    h(AgentNotificationFeed, {
      items: [
        { id: 'n1', kind: 'completed', title: 'Q: What places do you like?', statusText: 'completed training', caption: 'From your manual entry', time: '30 minutes ago', unread: true },
        { id: 'n2', kind: 'started', title: 'Q: How do you decide?', time: '3 hours ago' },
      ],
    })
  );
  assert.ok(html.includes('data-agent-feed-item="n1"'));
  assert.ok(html.includes('1 new'));
  assert.ok(html.includes('completed training'));
  assert.ok(html.includes('30 minutes ago'));
});

test('React SSR — AgentErrorRecovery alert with actions', async () => {
  const { default: AgentErrorRecovery } = await load('AgentErrorRecovery.tsx');
  const html = renderToStaticMarkup(
    h(AgentErrorRecovery, { runId: 'run_9f2', supportText: 'If the problem persists, contact us.' })
  );
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('Oops! Something went wrong'));
  assert.ok(html.includes('run_9f2'));
  assert.ok(html.includes('data-agent-error-retry'));
  assert.ok(html.includes('Start over'));
});

test('React SSR — AgentWorkspaceSettings sections and toggles', async () => {
  const { default: AgentWorkspaceSettings } = await load('AgentWorkspaceSettings.tsx');
  const html = renderToStaticMarkup(
    h(AgentWorkspaceSettings, {
      tabs: [{ id: 'general', label: 'General' }, { id: 'notifications', label: 'Notifications' }],
      sections: [
        {
          id: 'learning',
          title: 'Learning Settings',
          description: 'Customize your agent experience.',
          toggles: [
            { id: 'snippets', label: 'Topic snippets', description: 'Highlight key concepts.', enabled: true },
            { id: 'sound', label: 'Sound Effects', enabled: false },
          ],
        },
      ],
    })
  );
  assert.ok(html.includes('data-agent-settings-tab="general"'));
  assert.ok(html.includes('data-agent-setting-row="snippets"'));
  assert.ok(html.includes('aria-checked="true"'));
  assert.ok(html.includes('Learning Settings'));
});

test('React SSR — AgentEnvVarEditor rows and add form', async () => {
  const { default: AgentEnvVarEditor } = await load('AgentEnvVarEditor.tsx');
  const html = renderToStaticMarkup(
    h(AgentEnvVarEditor, {
      vars: [
        { key: 'API_TOKEN', value: 's3cr3t', secret: true },
        { key: 'LOG_LEVEL', value: 'debug' },
      ],
    })
  );
  assert.ok(html.includes('data-env-row="API_TOKEN"'));
  assert.ok(html.includes('type="password"'));
  assert.ok(html.includes('data-env-reveal'));
  assert.ok(html.includes('data-env-add-btn'));
  assert.ok(html.includes('LOG_LEVEL'));
});
