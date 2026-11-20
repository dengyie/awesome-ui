/**
 * v3.9.0 batch — React SSR smoke tests
 * WorkspaceSurveyCard, WorkspaceSetupPanel, InviteTeammatesCard.
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

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n63.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — WorkspaceSurveyCard questions, pills and gated Continue', async () => {
  const { default: WorkspaceSurveyCard } = await load('WorkspaceSurveyCard.tsx');
  const html = renderToStaticMarkup(
    h(WorkspaceSurveyCard, {
      title: 'Tell us about your workspace',
      stepLabel: 'Step 1 of 2',
      questions: [
        {
          id: 'role',
          label: 'What best describes your role?',
          options: [
            { id: 'founder', label: 'Founder' },
            { id: 'dev', label: 'Developer' },
            { id: 'ops', label: 'Operations' },
          ],
        },
        {
          id: 'goals',
          label: 'What are you hoping to accomplish?',
          multi: true,
          options: [
            { id: 'automate', label: 'Automate workflows' },
            { id: 'report', label: 'Reporting' },
          ],
        },
        {
          id: 'source',
          label: 'How did you hear about us?',
          options: [{ id: 'search', label: 'Search' }],
          placeholder: 'Type anything else…',
        },
      ],
      answers: { role: 'dev', goals: ['automate'] },
    })
  );
  assert.ok(html.includes('data-workspace-survey'));
  assert.ok(html.includes('Tell us about your workspace'));
  assert.ok(html.includes('data-workspace-survey-step'));
  assert.ok(html.includes('Step 1 of 2'));
  assert.ok(html.includes('data-workspace-survey-question="role"'));
  assert.ok(html.includes('data-workspace-survey-question="goals"'));
  assert.ok(html.includes('data-workspace-survey-option="dev"'));
  assert.ok(html.includes('aria-checked="true"'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('data-workspace-survey-input="source"'));
  assert.ok(html.includes('Type anything else…'));
  assert.ok(html.includes('data-workspace-survey-next'));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('Answer all 3 questions to continue.'));
  assert.ok(html.includes('2/3'));
});

test('React SSR — WorkspaceSurveyCard all answered unlocks Continue', async () => {
  const { default: WorkspaceSurveyCard } = await load('WorkspaceSurveyCard.tsx');
  const html = renderToStaticMarkup(
    h(WorkspaceSurveyCard, {
      questions: [
        { id: 'a', label: 'Question A', options: [{ id: 'x', label: 'X' }] },
        { id: 'b', label: 'Question B', options: [{ id: 'y', label: 'Y' }] },
      ],
      answers: { a: 'x', b: 'y' },
    })
  );
  assert.ok(html.includes('bg-indigo-600'));
  assert.ok(!html.includes('cursor-not-allowed'));
});

test('React SSR — WorkspaceSetupPanel sections, counts and up-next grid', async () => {
  const { default: WorkspaceSetupPanel } = await load('WorkspaceSetupPanel.tsx');
  const html = renderToStaticMarkup(
    h(WorkspaceSetupPanel, {
      sections: [
        {
          id: 'channels',
          title: 'Set up your channels',
          tasks: [
            { id: 'email', label: 'Connect email channel', done: true },
            { id: 'sms', label: 'Connect SMS channel', done: false },
          ],
        },
        {
          id: 'data',
          title: 'Integrate your data',
          tasks: [
            { id: 'warehouse', label: 'Connect warehouse', done: true },
            { id: 'api', label: 'Generate API keys', done: true },
          ],
        },
      ],
      upNext: [
        { id: 'invite', title: 'Invite team members' },
        { id: 'import', title: 'Import contacts' },
        { id: 'tour', title: 'Take a product tour' },
      ],
    })
  );
  assert.ok(html.includes('data-workspace-setup'));
  assert.ok(html.includes('Workspace setup'));
  assert.ok(html.includes('data-workspace-setup-section="channels"'));
  assert.ok(html.includes('data-workspace-setup-section-count="channels"'));
  assert.ok(html.includes('1/2'));
  assert.ok(html.includes('2/2'));
  assert.ok(html.includes('Connect email channel'));
  assert.ok(html.includes('line-through'));
  assert.ok(html.includes('data-workspace-setup-up-next'));
  assert.ok(html.includes('data-workspace-setup-next-card="invite"'));
  assert.ok(html.includes('Invite team members'));
  assert.ok(html.includes('3 of 4 steps complete'));
});

test('React SSR — WorkspaceSetupPanel all-done caption', async () => {
  const { default: WorkspaceSetupPanel } = await load('WorkspaceSetupPanel.tsx');
  const html = renderToStaticMarkup(
    h(WorkspaceSetupPanel, {
      sections: [{ id: 's', title: 'Solo section', tasks: [{ id: 't', label: 'Only task', done: true }] }],
    })
  );
  assert.ok(html.includes('All steps complete — your workspace is ready.'));
  assert.ok(!html.includes('data-workspace-setup-up-next'));
});

test('React SSR — InviteTeammatesCard composer, pending rows and counts', async () => {
  const { default: InviteTeammatesCard } = await load('InviteTeammatesCard.tsx');
  const html = renderToStaticMarkup(
    h(InviteTeammatesCard, {
      pending: [
        { email: 'ada@lovelace.dev', role: 'Admin' },
        { email: 'grace@hopper.io', role: 'Editor' },
      ],
    })
  );
  assert.ok(html.includes('data-invite-teammates'));
  assert.ok(html.includes('Invite your teammates'));
  assert.ok(html.includes('data-invite-teammates-input'));
  assert.ok(html.includes('teammate@company.com'));
  assert.ok(html.includes('data-invite-teammates-role'));
  assert.ok(html.includes('data-invite-teammates-row="ada@lovelace.dev"'));
  assert.ok(html.includes('grace@hopper.io'));
  assert.ok(html.includes('data-invite-teammates-remove'));
  assert.ok(html.includes('Send invites'));
  assert.ok(html.includes('Skip for now'));
  assert.ok(html.includes('2 pending'));
  assert.ok(!html.includes('data-invite-teammates-error'));
});

test('React SSR — InviteTeammatesCard empty pending disables Send', async () => {
  const { default: InviteTeammatesCard } = await load('InviteTeammatesCard.tsx');
  const html = renderToStaticMarkup(h(InviteTeammatesCard, {}));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('0 pending'));
  assert.ok(!html.includes('data-invite-teammates-list'));
});
