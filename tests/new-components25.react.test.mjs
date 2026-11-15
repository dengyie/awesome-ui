/**
 * SSR smoke tests for the v1.25.0 batch
 * (ClarifyQuestionCard, AgentTaskProgress, UsageQuotaCard, WorkspaceSwitcherMenu, AttachmentChip).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n25.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ClarifyQuestionCard question, paging and answered state', async () => {
  const { default: ClarifyQuestionCard } = await load('ClarifyQuestionCard.tsx');
  const html = renderToStaticMarkup(
    h(ClarifyQuestionCard, {
      question: 'What is the primary goal of this project?',
      title: 'Clarification needed',
      index: 2,
      total: 3,
      placeholder: 'Type your answer…',
    })
  );
  assert.ok(html.includes('Clarification needed'), 'title');
  assert.ok(html.includes('What is the primary goal of this project?'), 'question');
  assert.ok(html.includes('2 of 3'), 'paging counter');
  assert.ok(html.includes('data-clarify-prev'), 'prev button');
  assert.ok(html.includes('data-clarify-next'), 'next button');
  assert.ok(html.includes('data-clarify-input'), 'answer input');
  assert.ok(html.includes('Used ask user question'), 'step label');
});

test('React SSR — ClarifyQuestionCard answered pill and single-question no paging', async () => {
  const { default: ClarifyQuestionCard } = await load('ClarifyQuestionCard.tsx');
  const html = renderToStaticMarkup(
    h(ClarifyQuestionCard, { question: 'Target audience?', value: 'Developers learning React', answered: true })
  );
  assert.ok(html.includes('Developers learning React'), 'answered value');
  assert.ok(html.includes('data-clarify-value'), 'answered pill');
  assert.ok(!html.includes('data-clarify-input'), 'no input when answered');
  assert.ok(!html.includes('data-clarify-paging'), 'no paging when total is 1');
});

test('React SSR — AgentTaskProgress steps, substeps and footer actions', async () => {
  const { default: AgentTaskProgress } = await load('AgentTaskProgress.tsx');
  const html = renderToStaticMarkup(
    h(AgentTaskProgress, {
      title: 'Generating your site',
      contextLabel: 'Working on',
      contextText: 'Landing page · Hero + pricing',
      steps: [
        { label: 'Collect requirements', state: 'done' },
        { label: 'Drafting layout', state: 'active', substeps: ['Placing hero section', 'Wiring navigation'] },
        { label: 'Publish', state: 'pending' },
      ],
    })
  );
  assert.ok(html.includes('Generating your site'), 'title');
  assert.ok(html.includes('Landing page · Hero + pricing'), 'context text');
  assert.ok(html.includes('data-task-state="done"'), 'done step');
  assert.ok(html.includes('data-task-state="active"'), 'active step');
  assert.ok(html.includes('data-task-state="pending"'), 'pending step');
  assert.ok(html.includes('data-task-substeps'), 'substeps rail');
  assert.ok(html.includes('Placing hero section'), 'substep content');
  assert.ok(html.includes('come back later'), 'hint');
  assert.ok(html.includes('Send feedback'), 'feedback link');
  assert.ok(html.includes('data-task-refine'), 'refine button');
  assert.ok(html.includes('data-task-next'), 'next button');
});

test('React SSR — UsageQuotaCard card variant with progress bar and CTA', async () => {
  const { default: UsageQuotaCard } = await load('UsageQuotaCard.tsx');
  const html = renderToStaticMarkup(
    h(UsageQuotaCard, {
      label: 'Credits Remaining',
      used: 120,
      total: 500,
      unit: 'credits',
      upgradeLine: 'Upgrade to Pro for more credits',
      ctaLabel: 'Upgrade plan',
    })
  );
  assert.ok(html.includes('Credits Remaining'), 'label');
  assert.ok(html.includes('120 credits of 500 credits'), 'used-of-total summary');
  assert.ok(html.includes('bg-sky-500'), 'progress bar');
  assert.ok(/width:\s*76%/.test(html), 'percent width');
  assert.ok(html.includes('Upgrade to Pro for more credits'), 'upgrade line');
  assert.ok(html.includes('Upgrade plan'), 'cta label');
  assert.ok(html.includes('data-quota-cta'), 'cta hook');
});

test('React SSR — UsageQuotaCard banner variant', async () => {
  const { default: UsageQuotaCard } = await load('UsageQuotaCard.tsx');
  const html = renderToStaticMarkup(
    h(UsageQuotaCard, {
      banner: true,
      summary: "You've used all 100 free credits. Upgrade to keep building.",
      ctaLabel: 'See plans',
    })
  );
  assert.ok(html.includes('data-quota-banner'), 'banner root');
  assert.ok(html.includes('100 free credits'), 'banner summary');
  assert.ok(html.includes('bg-emerald-600'), 'emerald cta');
  assert.ok(html.includes('See plans'), 'cta label');
  assert.ok(!html.includes('data-quota-card'), 'no card chrome');
});

test('React SSR — WorkspaceSwitcherMenu workspaces, roles and footer user', async () => {
  const { default: WorkspaceSwitcherMenu } = await load('WorkspaceSwitcherMenu.tsx');
  const html = renderToStaticMarkup(
    h(WorkspaceSwitcherMenu, {
      workspaces: [
        { id: 'acme', name: 'Acme Inc', memberCount: 12, role: 'Admin', current: true },
        { id: 'northwind', name: 'Northwind Labs', memberCount: 4, role: 'Editor' },
      ],
      footerUser: { name: 'Sam Lee', email: 'sam@acme.dev' },
    })
  );
  assert.ok(html.includes('Workspaces'), 'title');
  assert.ok(html.includes('Choose the workspace you want to access'), 'subtitle');
  assert.ok(html.includes('Acme Inc'), 'workspace 1');
  assert.ok(html.includes('12 members · You are an Admin'), 'member/role line');
  assert.ok(html.includes('Northwind Labs'), 'workspace 2');
  assert.ok(html.includes('4 members · You are an Editor'), 'editor role line');
  assert.ok(html.includes('AI'), 'initials tile');
  assert.ok(html.includes('+ Create new workspace'), 'create button');
  assert.ok(html.includes('Sam Lee'), 'footer name');
  assert.ok(html.includes('sam@acme.dev'), 'footer email');
  assert.ok(html.includes('Log out'), 'logout');
  assert.ok(html.includes('data-workspace-option="acme"'), 'option hook');
});

test('React SSR — AttachmentChip kind tones, meta and remove button', async () => {
  const { default: AttachmentChip } = await load('AttachmentChip.tsx');
  const html = renderToStaticMarkup(
    h(AttachmentChip, { name: 'quarterly-report.pdf', kind: 'pdf', size: '2.4 MB', meta: 'Uploaded just now', onRemove: () => {} })
  );
  assert.ok(html.includes('quarterly-report.pdf'), 'file name');
  assert.ok(html.includes('PDF'), 'kind glyph');
  assert.ok(html.includes('bg-rose-100'), 'pdf tone');
  assert.ok(html.includes('2.4 MB · Uploaded just now'), 'meta line');
  assert.ok(html.includes('data-attachment-remove'), 'remove button');
  assert.ok(html.includes('aria-label="Remove quarterly-report.pdf"'), 'remove aria');
});
