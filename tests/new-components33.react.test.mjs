/**
 * SSR smoke tests for the v1.33.0 batch
 * (SystemPromptEditor, ToolSchemaEditor, FineTuneJobList, PersonaPresetGrid, AgentBuilderCard).
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
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"')
    .replace(/import\s*{\s*([^}]*)\s*}\s*from\s*["']\.\/UiIcon\.mjs["'];/g, (match) =>
      match.replace(/type\s+/g, '')
    );
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n33.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — SystemPromptEditor textarea, tokens, variables and temp slider', async () => {
  const { default: SystemPromptEditor } = await load('SystemPromptEditor.tsx');
  const html = renderToStaticMarkup(
    h(SystemPromptEditor, {
      title: 'System prompt',
      value: 'You are a support agent for {{company}}.',
      savedValue: 'You are a support agent.',
      version: 'v4',
      variables: ['company', 'tone'],
      temperature: 0.7,
    })
  );
  assert.ok(html.includes('data-prompt-editor'), 'host hook');
  assert.ok(html.includes('data-editor-textarea'), 'textarea');
  assert.ok(html.includes('data-editor-version'), 'version chip');
  assert.ok(html.includes('v4'), 'version text');
  assert.ok(html.includes('data-editor-state'), 'state label');
  assert.ok(html.includes('Unsaved changes'), 'dirty state');
  assert.ok(html.includes('data-editor-tokens'), 'token counter');
  assert.ok(html.includes('~10 tokens'), 'token estimate');
  assert.ok(html.includes('data-editor-variables'), 'variables chips');
  assert.ok(html.includes('{{company}}'), 'variable chip');
  assert.ok(html.includes('data-editor-temperature'), 'temp slider');
  assert.ok(html.includes('0.7'), 'temp value');
  assert.ok(html.includes('data-editor-save'), 'save button');
  assert.ok(html.includes('data-editor-reset'), 'reset button');
  assert.ok(html.includes('disabled'), 'save disabled logic present');
});

test('React SSR — ToolSchemaEditor tool cards, params and enable count', async () => {
  const { default: ToolSchemaEditor } = await load('ToolSchemaEditor.tsx');
  const html = renderToStaticMarkup(
    h(ToolSchemaEditor, {
      tools: [
        {
          id: 'search',
          name: 'search_docs',
          description: 'Full-text search across docs',
          method: 'POST',
          endpoint: 'https://api.example.com/v1/search',
          parameters: [
            { name: 'query', type: 'string', required: true },
            { name: 'limit', type: 'number' },
            { name: 'fuzzy', type: 'boolean' },
          ],
        },
        { id: 'weather', name: 'get_weather', method: 'GET' },
      ],
    })
  );
  assert.ok(html.includes('data-tool-editor'), 'host hook');
  assert.ok(html.includes('data-tool-card="search"'), 'tool card');
  assert.ok(html.includes('data-tool-name'), 'name hook');
  assert.ok(html.includes('search_docs'), 'tool name');
  assert.ok(html.includes('data-tool-method'), 'method badge');
  assert.ok(html.includes('data-tool-endpoint'), 'endpoint hook');
  assert.ok(html.includes('data-tool-params'), 'params block');
  assert.ok(html.includes('data-tool-param="query"'), 'param hook');
  assert.ok(html.includes('required') === true && html.includes('title="required"'), 'required marker');
  assert.ok(html.includes('data-tool-toggle'), 'toggle');
  assert.ok(html.includes('data-tool-count'), 'count badge');
  assert.ok(html.includes('2/2 enabled'), 'count text');
  assert.ok(html.includes('data-tool-validate'), 'validate button');
});

test('React SSR — FineTuneJobList statuses, progress and cancel', async () => {
  const { default: FineTuneJobList } = await load('FineTuneJobList.tsx');
  const html = renderToStaticMarkup(
    h(FineTuneJobList, {
      jobs: [
        { id: 'job1', model: 'ft:gpt-4.1-mini:support-v2', status: 'training', progress: 62, cost: '$12.40', eta: '23 min', baseModel: 'gpt-4.1-mini' },
        { id: 'job2', model: 'ft:support-v1', status: 'completed' },
        { id: 'job3', model: 'ft:legacy-v0', status: 'failed' },
      ],
    })
  );
  assert.ok(html.includes('data-finetune-list'), 'host hook');
  assert.ok(html.includes('data-finetune-job="job1"'), 'job row');
  assert.ok(html.includes('data-finetune-model'), 'model hook');
  assert.ok(html.includes('ft:gpt-4.1-mini:support-v2'), 'model name');
  assert.ok(html.includes('from gpt-4.1-mini'), 'base model');
  assert.ok(html.includes('data-finetune-status="training"'), 'training chip');
  assert.ok(html.includes('data-finetune-status="completed"'), 'completed chip');
  assert.ok(html.includes('data-finetune-status="failed"'), 'failed chip');
  assert.ok(html.includes('data-finetune-progress'), 'progress bar');
  assert.ok(html.includes('62%'), 'progress value');
  assert.ok(html.includes('$12.40'), 'cost');
  assert.ok(html.includes('ETA 23 min'), 'eta');
  assert.ok(html.includes('data-finetune-cancel'), 'cancel button');
  assert.ok(html.includes('data-finetune-new'), 'new button');
  assert.ok(!html.includes('data-finetune-empty'), 'no empty state');

  const empty = renderToStaticMarkup(h(FineTuneJobList, { jobs: [] }));
  assert.ok(empty.includes('data-finetune-empty'), 'empty state');
});

test('React SSR — PersonaPresetGrid cards, selection ring and temp hint', async () => {
  const { default: PersonaPresetGrid } = await load('PersonaPresetGrid.tsx');
  const html = renderToStaticMarkup(
    h(PersonaPresetGrid, {
      presets: [
        { id: 'concise', name: 'Concise', description: 'Short, factual answers', emoji: '⚡', temperature: 0.2, selected: true },
        { id: 'teacher', name: 'Teacher', description: 'Explains step by step', emoji: '🎓' },
        { id: 'critic', name: 'Critic' },
      ],
    })
  );
  assert.ok(html.includes('data-persona-grid'), 'host hook');
  assert.ok(html.includes('data-persona-card="concise"'), 'card hook');
  assert.ok(html.includes('data-persona-emoji'), 'emoji tile');
  assert.ok(html.includes('⚡'), 'emoji');
  assert.ok(html.includes('data-persona-name'), 'name hook');
  assert.ok(html.includes('Concise'), 'name text');
  assert.ok(html.includes('data-persona-desc'), 'desc hook');
  assert.ok(html.includes('Short, factual answers'), 'desc text');
  assert.ok(html.includes('data-persona-temp'), 'temp hint');
  assert.ok(html.includes('temp 0.2'), 'temp value');
  assert.ok(html.includes('data-persona-check'), 'selected check');
  assert.ok(html.includes('ring-2'), 'selection ring');
});

test('React SSR — AgentBuilderCard node chain, statuses and run CTA', async () => {
  const { default: AgentBuilderCard } = await load('AgentBuilderCard.tsx');
  const html = renderToStaticMarkup(
    h(AgentBuilderCard, {
      agentName: 'Support triage',
      nodes: [
        { id: 'n1', label: 'New ticket received', type: 'trigger', status: 'done' },
        { id: 'n2', label: 'search_docs', type: 'tool', status: 'active' },
        { id: 'n3', label: 'Draft reply', type: 'llm', status: 'idle' },
        { id: 'n4', label: 'Send email', type: 'output' },
      ],
    })
  );
  assert.ok(html.includes('data-agent-builder'), 'host hook');
  assert.ok(html.includes('data-builder-agent-name'), 'agent name hook');
  assert.ok(html.includes('Support triage'), 'agent name');
  assert.ok(html.includes('4 nodes'), 'node count');
  assert.ok(html.includes('data-builder-node="n2"'), 'node hook');
  assert.ok(html.includes('data-builder-status="done"'), 'done dot');
  assert.ok(html.includes('data-builder-status="active"'), 'active dot');
  assert.ok(html.includes('data-builder-status="idle"'), 'idle dot');
  assert.ok(html.includes('animate-pulse'), 'active pulse');
  assert.ok(html.includes('search_docs'), 'node label');
  assert.ok(html.includes('data-builder-edit'), 'edit button');
  assert.ok(html.includes('data-builder-run'), 'run CTA');
  assert.ok(html.includes('Run agent'), 'run text');

  const running = renderToStaticMarkup(h(AgentBuilderCard, { nodes: [], running: true }));
  assert.ok(running.includes('Running…'), 'running state');
});
