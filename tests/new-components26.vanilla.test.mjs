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
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const deploySource = stripComponent('DeploymentCard.js', 'DeploymentCardElement');
const tailSource = stripComponent('LiveTailLogConsole.js', 'LiveTailLogConsoleElement');
const pipelineSource = stripComponent('PipelineStageList.js', 'PipelineStageListElement');
const filesSource = stripComponent('ChangedFilesList.js', 'ChangedFilesListElement');
const servicesSource = stripComponent('ServiceStatusList.js', 'ServiceStatusListElement');

function mount(source, exportName, tag, attrs = {}) {
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
    'FormData',
    `${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('DeploymentCard — status tones, commit line, cancel and visit events', () => {
  const { el } = mount(deploySource, 'DeploymentCardElement', 'deployment-card', {
    'deploy-id': 'Deploy #128',
    status: 'building',
    sha: '2d300ac',
    'commit-message': 'Add files via upload',
    'created-at': 'Just now · 4s',
    source: 'Initial commit by Laravel Cloud',
  });
  const cancels = collect(el, 'cancel');
  const visits = collect(el, 'visit');

  assert.ok(el.textContent.includes('Deploy #128'), 'deploy id');
  assert.ok(el.textContent.includes('Building'), 'building label');
  assert.ok(el.innerHTML.includes('bg-sky-500 animate-pulse'), 'building dot');
  assert.ok(el.textContent.includes('2d300ac'), 'sha');
  assert.ok(el.textContent.includes('Add files via upload'), 'commit message');
  assert.ok(el.textContent.includes('Initial commit by Laravel Cloud · Just now · 4s'), 'source + time');
  assert.ok(el.querySelector('[data-deploy-cancel]'), 'cancel button');
  assert.ok(!el.querySelector('[data-deploy-visit]'), 'no visit while building');

  el.querySelector('[data-deploy-cancel]').click();
  assert.equal(cancels.length, 1, 'cancel fired');

  el.setAttribute('status', 'live');
  el.setAttribute('url', 'https://app.example.com');
  assert.ok(el.textContent.includes('Live'), 'live label');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'live dot');
  assert.ok(el.querySelector('[data-deploy-visit]'), 'visit button');
  assert.ok(!el.querySelector('[data-deploy-cancel]'), 'no cancel when live');

  el.querySelector('[data-deploy-visit]').click();
  assert.equal(visits.length, 1, 'visit fired');
  assert.equal(visits[0].url, 'https://app.example.com', 'visit detail');
});

test('LiveTailLogConsole — lines render, search filters, follow toggles', () => {
  const { el, window } = mount(tailSource, 'LiveTailLogConsoleElement', 'live-tail-log-console', {
    timezone: 'GMT+7',
    sources: '["build","runtime"]',
  });
  const searches = collect(el, 'search');
  const toggles = collect(el, 'live-tail-change');
  el.lines = [
    { ts: '14:02:11', level: 'info', message: '=> Cloning from https://github.com/acme/repo', source: 'build' },
    { ts: '14:02:15', level: 'success', message: 'Dependencies installed (68 packages)' },
    { ts: '14:02:18', level: 'error', message: 'Typecheck failed in src/app.ts' },
    { ts: '14:02:20', level: 'warn', message: 'Deprecated API usage detected' },
  ];

  assert.ok(el.querySelector('[data-tail-source]'), 'source select');
  assert.ok(el.querySelector('[data-tail-search]'), 'search input');
  assert.ok(el.textContent.includes('Live tail'), 'follow button');
  assert.ok(el.textContent.includes('GMT+7'), 'timezone chip');
  assert.equal(el.querySelectorAll('[data-tail-line]').length, 4, 'four lines');
  assert.ok(el.textContent.includes('Cloning from https://github.com/acme/repo'), 'message rendered');
  assert.ok(el.innerHTML.includes('bg-rose-500'), 'error dot');

  const search = el.querySelector('[data-tail-search]');
  search.value = 'typecheck';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(searches.length, 1, 'search event');
  assert.equal(el.querySelectorAll('[data-tail-line]').length, 1, 'filtered to one line');
  assert.ok(el.textContent.includes('Typecheck failed'), 'filtered content');

  search.value = '';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-tail-line]').length, 4, 'filter cleared');

  el.querySelector('[data-tail-follow]').click();
  assert.equal(toggles.length, 1, 'toggle event');
  assert.equal(toggles[0].enabled, false, 'toggled off');
});

test('PipelineStageList — groups expand, stage-click fires', () => {
  const { el } = mount(pipelineSource, 'PipelineStageListElement', 'pipeline-stage-list', {
    expanded: '["build"]',
  });
  const clicks = collect(el, 'stage-click');
  const toggles = collect(el, 'group-toggle');
  el.groups = [
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
  ];

  assert.ok(el.textContent.includes('Build logs'), 'group title');
  assert.ok(el.textContent.includes('Cloning application source control repository'), 'current step');
  assert.equal(el.querySelectorAll('[data-stage-status="success"]').length, 1, 'success stage');
  assert.equal(el.querySelectorAll('[data-stage-status="running"]').length, 1, 'running stage');
  assert.equal(el.querySelectorAll('[data-stage-status="pending"]').length, 1, 'pending stage');
  assert.ok(el.textContent.includes('4.2s'), 'duration label');
  assert.ok(!el.querySelector('[data-pipeline-stage="ship"]'), 'deploy group collapsed');

  el.querySelector('[data-pipeline-stage="clone"]').click();
  assert.equal(clicks.length, 1, 'stage-click fired');
  assert.equal(clicks[0].stage.id, 'clone', 'stage detail');

  // expand deploy group
  const headers = el.querySelectorAll('[data-pipeline-group-header]');
  headers[1].click();
  assert.equal(toggles.length, 1, 'group-toggle fired');
  assert.equal(toggles[0].id, 'deploy', 'toggled group');
  assert.equal(toggles[0].open, true, 'now open');
  assert.ok(el.querySelector('[data-pipeline-stage="ship"]'), 'deploy stage visible');
});

test('ChangedFilesList — diffstats, toggle, grouping and file-click', () => {
  const { el } = mount(filesSource, 'ChangedFilesListElement', 'changed-files-list', {
    title: '3 Files Changed',
  });
  const clicks = collect(el, 'file-click');
  const toggles = collect(el, 'toggle');
  el.files = [
    { path: 'src/app.ts', additions: 89, deletions: 53, status: 'modified' },
    { path: 'src/new-route.ts', additions: 24, deletions: 0, status: 'new' },
    { path: 'README.md', additions: 2, deletions: 9 },
  ];

  assert.ok(el.textContent.includes('3 Files Changed'), 'title');
  assert.ok(el.textContent.includes('+115'), 'total additions');
  assert.ok(el.textContent.includes('−62'), 'total deletions');
  assert.ok(el.querySelector('[data-changed-file="src/app.ts"]'), 'file hook');
  assert.ok(el.textContent.includes('modified'), 'status tag');
  assert.ok(el.innerHTML.includes('bg-emerald-50'), 'new tag tone');

  el.querySelector('[data-changed-file="src/new-route.ts"]').click();
  assert.equal(clicks.length, 1, 'file-click fired');
  assert.equal(clicks[0].file.path, 'src/new-route.ts', 'file detail');

  el.querySelector('[data-changed-files-toggle]').click();
  assert.equal(toggles.length, 1, 'toggle fired');
  assert.equal(toggles[0].open, false, 'now closed');
  assert.ok(!el.querySelector('[data-changed-file]'), 'rows hidden');

  el.querySelector('[data-changed-files-toggle]').click();
  assert.ok(el.querySelector('[data-changed-file]'), 'rows visible again');
});

test('ServiceStatusList — services, commands, checks and click event', () => {
  const { el } = mount(servicesSource, 'ServiceStatusListElement', 'service-status-list', {
    'duration-label': 'Worked for 37s',
  });
  const clicks = collect(el, 'service-click');
  el.services = [
    { name: 'Web', command: 'npm start', status: 'running', url: 'http://localhost:3000' },
    { name: 'API', command: 'uvicorn main:app', status: 'starting' },
    { name: 'Worker', command: 'celery worker', status: 'stopped' },
  ];
  el.checks = [
    { label: 'npm install', passed: true, detail: '68 packages installed, 0 vulnerabilities' },
    { label: 'curl http://localhost:3000', passed: true, detail: 'static assets served correctly' },
    { label: 'docker compose', passed: false, detail: 'not available in this environment' },
  ];

  assert.ok(el.textContent.includes('Services'), 'heading');
  assert.ok(el.querySelector('[data-service-row="Web"]'), 'service row hook');
  assert.ok(el.textContent.includes('npm start'), 'command chip');
  assert.ok(el.textContent.includes('Running on'), 'running text');
  assert.ok(el.textContent.includes('http://localhost:3000'), 'url chip');
  assert.ok(el.textContent.includes('Starting…'), 'starting text');
  assert.ok(el.textContent.includes('Stopped'), 'stopped text');
  assert.ok(el.textContent.includes('68 packages installed, 0 vulnerabilities'), 'check detail');
  assert.ok(el.textContent.includes('Worked for 37s'), 'duration');

  el.querySelector('[data-service-row="Web"] button').click();
  assert.equal(clicks.length, 1, 'service-click fired');
  assert.equal(clicks[0].service.name, 'Web', 'service detail');
});
