/**
 * SSR smoke tests for the v1.26.0 batch
 * (DeploymentCard, LiveTailLogConsole, PipelineStageList, ChangedFilesList, ServiceStatusList).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n26.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — DeploymentCard status tones, commit info and actions', async () => {
  const { default: DeploymentCard } = await load('DeploymentCard.tsx');
  const building = renderToStaticMarkup(
    h(DeploymentCard, {
      deployId: 'Deploy #128',
      status: 'building',
      commit: { sha: '2d300ac', message: 'Add files via upload' },
      createdAt: 'Just now · 4s',
      source: 'Initial commit by Laravel Cloud',
      onCancel: () => {},
    })
  );
  assert.ok(building.includes('Deploy #128'), 'deploy id');
  assert.ok(building.includes('Building'), 'building label');
  assert.ok(building.includes('bg-sky-500 animate-pulse'), 'building dot');
  assert.ok(building.includes('2d300ac'), 'commit sha');
  assert.ok(building.includes('Add files via upload'), 'commit message');
  assert.ok(building.includes('Initial commit by Laravel Cloud · Just now · 4s'), 'source + time');
  assert.ok(building.includes('Cancel deploy'), 'cancel button');
  assert.ok(!building.includes('data-deploy-visit'), 'no visit while building');

  const live = renderToStaticMarkup(
    h(DeploymentCard, {
      deployId: 'Deploy #127',
      status: 'live',
      commit: { sha: 'a1b2c3d', message: 'Fix login flow' },
      createdAt: '2 hours ago',
      url: 'https://app.example.com',
      onVisit: () => {},
    })
  );
  assert.ok(live.includes('Live'), 'live label');
  assert.ok(live.includes('bg-emerald-500'), 'live dot');
  assert.ok(live.includes('data-deploy-visit'), 'visit button');
  assert.ok(!live.includes('data-deploy-cancel'), 'no cancel when live');
});

test('React SSR — LiveTailLogConsole toolbar, lines and severity dots', async () => {
  const { default: LiveTailLogConsole } = await load('LiveTailLogConsole.tsx');
  const html = renderToStaticMarkup(
    h(LiveTailLogConsole, {
      lines: [
        { ts: '14:02:11', level: 'info', message: '=> Cloning from https://github.com/acme/repo', source: 'build' },
        { ts: '14:02:15', level: 'success', message: 'Dependencies installed (68 packages)' },
        { ts: '14:02:18', level: 'error', message: 'Typecheck failed in src/app.ts' },
        { ts: '14:02:20', level: 'warn', message: 'Deprecated API usage detected' },
      ],
      sources: ['build', 'runtime'],
      timezone: 'GMT+7',
    })
  );
  assert.ok(html.includes('bg-neutral-950'), 'dark terminal surface');
  assert.ok(html.includes('All sources'), 'source filter');
  assert.ok(html.includes('build') && html.includes('runtime'), 'source options');
  assert.ok(html.includes('data-tail-search'), 'search input');
  assert.ok(html.includes('Live tail'), 'live tail toggle');
  assert.ok(html.includes('GMT+7'), 'timezone chip');
  assert.ok(html.includes('Cloning from https://github.com/acme/repo'), 'log line message');
  assert.ok(html.includes('bg-sky-500'), 'info dot');
  assert.ok(html.includes('bg-emerald-500'), 'success dot');
  assert.ok(html.includes('bg-rose-500'), 'error dot');
  assert.ok(html.includes('bg-amber-500'), 'warn dot');
  assert.ok(html.includes('data-tail-line'), 'line rows');
});

test('React SSR — PipelineStageList grouped stages, durations and expansion', async () => {
  const { default: PipelineStageList } = await load('PipelineStageList.tsx');
  const html = renderToStaticMarkup(
    h(PipelineStageList, {
      groups: [
        {
          id: 'build',
          title: 'Build logs',
          currentStep: 'Cloning application source control repository',
          stages: [
            { id: 'clone', label: 'Clone repository', status: 'success', durationMs: 4200 },
            { id: 'install', label: 'Install dependencies', status: 'running', durationMs: 800 },
            { id: 'typecheck', label: 'Typecheck', status: 'pending' },
          ],
        },
        { id: 'deploy', title: 'Deploy', stages: [{ id: 'ship', label: 'Ship to production', status: 'failed', durationMs: 15300 }] },
      ],
      defaultExpanded: ['build', 'deploy'],
    })
  );
  assert.ok(html.includes('Build logs'), 'group title');
  assert.ok(html.includes('Cloning application source control repository'), 'current step');
  assert.ok(html.includes('data-pipeline-group="build"'), 'group id');
  assert.ok(html.includes('data-pipeline-stage="clone"'), 'stage id');
  assert.ok(html.includes('data-stage-status="success"'), 'success status');
  assert.ok(html.includes('data-stage-status="running"'), 'running status');
  assert.ok(html.includes('data-stage-status="pending"'), 'pending status');
  assert.ok(html.includes('data-stage-status="failed"'), 'failed status');
  assert.ok(html.includes('Completed'), 'success label');
  assert.ok(html.includes('4.2s'), 'stage duration');
  assert.ok(html.includes('15.3s'), 'failed duration');
  assert.ok(html.includes('animate-spin'), 'running spinner');
});

test('React SSR — ChangedFilesList diffstats, status tags and grouping', async () => {
  const { default: ChangedFilesList } = await load('ChangedFilesList.tsx');
  const flat = renderToStaticMarkup(
    h(ChangedFilesList, {
      title: '3 Files Changed',
      files: [
        { path: 'src/app.ts', additions: 89, deletions: 53, status: 'modified' },
        { path: 'src/new-route.ts', additions: 24, deletions: 0, status: 'new' },
        { path: 'README.md', additions: 2, deletions: 9 },
      ],
    })
  );
  assert.ok(flat.includes('3 Files Changed'), 'title');
  assert.ok(flat.includes('+115'), 'total additions');
  assert.ok(flat.includes('−62'), 'total deletions');
  assert.ok(flat.includes('src/app.ts'), 'file path');
  assert.ok(flat.includes('data-changed-file="src/app.ts"'), 'file hook');
  assert.ok(flat.includes('modified'), 'status tag');
  assert.ok(flat.includes('new'), 'new tag');
  assert.ok(flat.includes('bg-emerald-50'), 'new tag tone');

  const grouped = renderToStaticMarkup(
    h(ChangedFilesList, {
      files: [
        { path: 'backend/server.py', additions: 10, deletions: 2 },
        { path: 'frontend/src/App.tsx', additions: 30, deletions: 4 },
      ],
      grouped: true,
    })
  );
  assert.ok(grouped.includes('backend/'), 'folder header');
  assert.ok(grouped.includes('frontend/'), 'second folder');
  assert.ok(grouped.includes('server.py'), 'file name within group');
});

test('React SSR — ServiceStatusList services, commands and checks', async () => {
  const { default: ServiceStatusList } = await load('ServiceStatusList.tsx');
  const html = renderToStaticMarkup(
    h(ServiceStatusList, {
      services: [
        { name: 'Web', command: 'npm start', status: 'running', url: 'http://localhost:3000' },
        { name: 'API', command: 'uvicorn main:app', status: 'starting' },
        { name: 'Worker', command: 'celery worker', status: 'stopped' },
      ],
      checks: [
        { label: 'npm install', passed: true, detail: '68 packages installed, 0 vulnerabilities' },
        { label: 'curl http://localhost:3000', passed: true, detail: 'static assets served correctly' },
        { label: 'docker compose', passed: false, detail: 'not available in this environment' },
      ],
      durationLabel: 'Worked for 37s',
    })
  );
  assert.ok(html.includes('Services'), 'heading');
  assert.ok(html.includes('data-service-row="Web"'), 'service row');
  assert.ok(html.includes('npm start'), 'command chip');
  assert.ok(html.includes('Running on'), 'running text');
  assert.ok(html.includes('http://localhost:3000'), 'url chip');
  assert.ok(html.includes('bg-zinc-900'), 'dark url chip');
  assert.ok(html.includes('Starting…'), 'starting text');
  assert.ok(html.includes('Stopped'), 'stopped text');
  assert.ok(html.includes('data-check-row'), 'check rows');
  assert.ok(html.includes('68 packages installed, 0 vulnerabilities'), 'check detail');
  assert.ok(html.includes('Worked for 37s'), 'duration label');
});
