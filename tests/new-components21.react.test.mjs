/**
 * SSR smoke tests for the v1.21.0 batch
 * (WizardSteps, FormField, GanttTimeline, ApprovalCard, ResourceList).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n21.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — WizardSteps vertical states and optional tag', async () => {
  const { WizardSteps } = await load('WizardSteps.tsx');
  const html = renderToStaticMarkup(
    h(WizardSteps, {
      steps: [
        { label: 'Policy details' },
        { label: 'Submission method' },
        { label: 'Geofencing settings', optional: true },
        { label: 'Submission frequency' },
      ],
      current: 1,
      onStepClick: () => {},
    })
  );
  assert.ok(html.includes('Policy details'), 'step label');
  assert.ok(html.includes('(Optional)'), 'optional tag');
  assert.ok(html.includes('aria-current="step"'), 'active step marked');
  assert.ok(html.includes('border-emerald-500 bg-emerald-500'), 'done state tone');
  assert.ok(html.includes('bg-zinc-900'), 'active circle tone');
  assert.ok(html.includes('bg-emerald-500') && html.includes('d="m5 12 4 4L19 6"'), 'done check icon');
  assert.ok((html.match(/aria-current="step"/g) || []).length === 1, 'exactly one active step');
});

test('React SSR — WizardSteps bar variant progress', async () => {
  const { WizardSteps } = await load('WizardSteps.tsx');
  const html = renderToStaticMarkup(
    h(WizardSteps, {
      steps: [{ label: 'A' }, { label: 'B' }, { label: 'C' }],
      current: 1,
      variant: 'bar',
    })
  );
  assert.ok(html.includes('2 of 3 steps'), 'step counter');
  assert.ok(html.includes('Next: C'), 'next hint');
  assert.ok(html.includes('role="progressbar"'), 'progressbar role');
  assert.ok(html.includes('aria-valuenow="2"'), 'progress value');
  assert.ok(html.includes('bg-violet-600'), 'progress fill');
  assert.ok(!html.includes('aria-current'), 'no vertical markers in bar mode');
});

test('React SSR — FormField label, required star, counter and error', async () => {
  const { FormField } = await load('FormField.tsx');
  const html = renderToStaticMarkup(
    h(FormField, {
      label: 'Policy name',
      htmlFor: 'policy-name',
      required: true,
      counter: { value: 19, max: 70 },
      error: 'Name is required',
    }, h('input', { id: 'policy-name', defaultValue: 'Work Hours Tracking' }))
  );
  assert.ok(html.includes('Policy name'), 'label');
  assert.ok(html.includes('text-rose-500'), 'required star');
  assert.ok(html.includes('19/70'), 'counter');
  assert.ok(html.includes('Name is required'), 'error message');
  assert.ok(html.includes('alert-triangle') || html.includes('aria-hidden'), 'error icon rendered');
  assert.ok(html.includes('aria-invalid="true"'), 'invalid flag');
  assert.ok(html.includes('Work Hours Tracking'), 'slotted control');
});

test('React SSR — FormField optional and hint variants', async () => {
  const { FormField } = await load('FormField.tsx');
  const html = renderToStaticMarkup(
    h(FormField, { label: 'Description', optional: true, hint: 'Max 140 characters' })
  );
  assert.ok(html.includes('(Optional)'), 'optional tag');
  assert.ok(html.includes('Max 140 characters'), 'hint');
  assert.ok(!html.includes('text-rose-500'), 'no required star');
});

test('React SSR — GanttTimeline bars, today line and depth indent', async () => {
  const { GanttTimeline } = await load('GanttTimeline.tsx');
  const html = renderToStaticMarkup(
    h(GanttTimeline, {
      tasks: [
        { label: 'Research', start: 0, span: 4, progress: 55, tone: 'emerald' },
        { label: 'User Research', start: 2, span: 5, depth: 1 },
        { label: 'Prototype', start: 6, span: 3, tone: 'amber' },
      ],
      columns: 10,
      today: 4,
      rowLabel: 'Name',
      onTaskClick: () => {},
    })
  );
  assert.ok(html.includes('Research'), 'task label');
  assert.ok(html.includes('55%'), 'progress label');
  assert.ok(html.includes('bg-emerald-500'), 'emerald tone');
  assert.ok(html.includes('bg-amber-400'), 'amber tone');
  assert.ok(html.includes('bg-rose-400'), 'today line');
  assert.ok(html.includes('padding-left:2.25rem'), 'depth indent');
  assert.ok(html.includes('role="table"'), 'table role');
  assert.ok(html.includes('cursor-pointer'), 'clickable rows');
});

test('React SSR — GanttTimeline empty state', async () => {
  const { GanttTimeline } = await load('GanttTimeline.tsx');
  const html = renderToStaticMarkup(h(GanttTimeline, { tasks: [], emptyText: 'Nothing scheduled' }));
  assert.ok(html.includes('Nothing scheduled'), 'empty text');
});

test('React SSR — ApprovalCard approvers, decision and buttons', async () => {
  const { ApprovalCard } = await load('ApprovalCard.tsx');
  const html = renderToStaticMarkup(
    h(ApprovalCard, {
      title: 'A project needs approval',
      approvers: [
        { initials: 'JS', tone: 'indigo' },
        { initials: 'SL', tone: 'rose' },
      ],
      approvedCount: 1,
      dueDate: '3 Jun',
      decision: 'pending',
      note: 'Research section is to be completed in order of list.',
      onApprove: () => {},
      onReject: () => {},
      onRequestChange: () => {},
    })
  );
  assert.ok(html.includes('A project needs approval'), 'title');
  assert.ok(html.includes('1/2'), 'approval counter');
  assert.ok(html.includes('JS'), 'approver initials');
  assert.ok(html.includes('bg-rose-600'), 'rose avatar tone');
  assert.ok(html.includes('3 Jun'), 'due date');
  assert.ok(html.includes('pending'), 'decision text');
  assert.ok(html.includes('text-zinc-400'), 'pending tone');
  assert.ok(html.includes('Approve'), 'approve button');
  assert.ok(html.includes('Request change'), 'reject button');
  assert.ok(html.includes('Research section'), 'note');
});

test('React SSR — ApprovalCard decision tones', async () => {
  const { ApprovalCard } = await load('ApprovalCard.tsx');
  const approved = renderToStaticMarkup(
    h(ApprovalCard, { title: 'T', approvers: [{ initials: 'A' }], decision: 'approved' })
  );
  assert.ok(approved.includes('text-emerald-600'), 'approved tone');
  const rejected = renderToStaticMarkup(
    h(ApprovalCard, { title: 'T', approvers: [{ initials: 'A' }], decision: 'rejected' })
  );
  assert.ok(rejected.includes('text-rose-600'), 'rejected tone');
});

test('React SSR — ResourceList rows, kinds and selection', async () => {
  const { ResourceList } = await load('ResourceList.tsx');
  const html = renderToStaticMarkup(
    h(ResourceList, {
      title: 'Recents',
      items: [
        { name: 'Retail Job', kind: 'Job', kindTone: 'indigo', timeLabel: '13 minutes ago' },
        { name: 'mobbin_retail_sales', path: 'workspace.dataset', kind: 'Table', timeLabel: '14 minutes ago' },
        { name: 'Transaction Trigger', kind: 'Alert', kindTone: 'amber', icon: 'bell' },
      ],
      onSelect: () => {},
    })
  );
  assert.ok(html.includes('Recents'), 'title');
  assert.ok(html.includes('Retail Job'), 'item name');
  assert.ok(html.includes('workspace.dataset'), 'mono path');
  assert.ok(html.includes('Job'), 'kind badge');
  assert.ok(html.includes('bg-indigo-100'), 'indigo kind tone');
  assert.ok(html.includes('13 minutes ago'), 'time label');
  assert.ok(html.includes('role="button"'), 'selectable rows');
});

test('React SSR — ResourceList maxItems and empty', async () => {
  const { ResourceList } = await load('ResourceList.tsx');
  const html = renderToStaticMarkup(
    h(ResourceList, {
      items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      maxItems: 2,
      title: '',
    })
  );
  assert.ok(html.includes('>a<'), 'first kept');
  assert.ok(!html.includes('>c<'), 'third cut');
  const empty = renderToStaticMarkup(h(ResourceList, { items: [], emptyText: 'Nothing here' }));
  assert.ok(empty.includes('Nothing here'), 'empty text');
});
