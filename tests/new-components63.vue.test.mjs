/**
 * v3.9.0 — Vue SSR regression tests
 * WorkspaceSurveyCard, WorkspaceSetupPanel, InviteTeammatesCard.
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

// Compile UiIcon.vue once so child-importing components can resolve it via requireShim.
const compileChildSfc = (file) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n63-child' });
  const template = compileTemplate({
    id: 'n63-child',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, bindings) => {
      const destructuring = bindings.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, ' $1: $2 ');
      return `const {${destructuring}} = vueMod;`;
    })
    .replace(/^export function render\(/m, 'function render(');
  const factory = new Function('vueMod', 'exports', `
    const require = (name) => (name === 'vue' ? vueMod : null);
    ${cjs}
    ${templateCode}
    return exports.default;
  `);
  const childExports = {};
  return factory(vueModule, childExports);
};

const UiIconComponent = compileChildSfc('UiIcon.vue');

const renderSfc = async (file, props) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n63' });
  const template = compileTemplate({
    id: 'n63',
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

  const factory = new Function('vueMod', 'exports', 'uiIconComponent', `
    const require = (name) => (name === 'vue' ? vueMod : name.endsWith('UiIcon.vue') ? { default: uiIconComponent } : null);
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const exportsShim = {};
  const { default: component, render } = factory(vueModule, exportsShim, UiIconComponent);
  component.render = render;

  const app = vueModule.createSSRApp(component, props);
  return renderToString(app);
};

test('vue SSR — WorkspaceSurveyCard questions, pills and gated Continue', async () => {
  const html = await renderSfc('WorkspaceSurveyCard.vue', {
    title: 'Tell us about your workspace',
    stepLabel: 'Step 1 of 2',
    questions: [
      {
        id: 'role',
        label: 'What best describes your role?',
        options: [
          { id: 'founder', label: 'Founder' },
          { id: 'dev', label: 'Developer' },
        ],
      },
      {
        id: 'goals',
        label: 'What are you hoping to accomplish?',
        multi: true,
        options: [{ id: 'automate', label: 'Automate workflows' }],
      },
    ],
    answers: { role: 'dev', goals: ['automate'] },
  });
  assert.ok(html.includes('data-workspace-survey'));
  assert.ok(html.includes('Tell us about your workspace'));
  assert.ok(html.includes('Step 1 of 2'));
  assert.ok(html.includes('data-workspace-survey-question="role"'));
  assert.ok(html.includes('data-workspace-survey-option="dev"'));
  assert.ok(html.includes('aria-checked="true"'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('data-workspace-survey-next'));
  assert.ok(html.includes('2/2'));
});

test('vue SSR — WorkspaceSurveyCard text input renders with placeholder', async () => {
  const html = await renderSfc('WorkspaceSurveyCard.vue', {
    questions: [
      {
        id: 'source',
        label: 'How did you hear about us?',
        options: [{ id: 'search', label: 'Search' }],
        placeholder: 'Type anything else…',
      },
    ],
  });
  assert.ok(html.includes('data-workspace-survey-input="source"'));
  assert.ok(html.includes('Type anything else…'));
  assert.ok(html.includes('Answer all 1 questions to continue.'));
});

test('vue SSR — WorkspaceSetupPanel sections, counts and up-next grid', async () => {
  const html = await renderSfc('WorkspaceSetupPanel.vue', {
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
        tasks: [{ id: 'warehouse', label: 'Connect warehouse', done: true }],
      },
    ],
    upNext: [
      { id: 'invite', title: 'Invite team members' },
      { id: 'import', title: 'Import contacts' },
      { id: 'tour', title: 'Take a product tour' },
    ],
  });
  assert.ok(html.includes('data-workspace-setup'));
  assert.ok(html.includes('data-workspace-setup-section="channels"'));
  assert.ok(html.includes('1/2'));
  assert.ok(html.includes('Connect email channel'));
  assert.ok(html.includes('line-through'));
  assert.ok(html.includes('data-workspace-setup-up-next'));
  assert.ok(html.includes('data-workspace-setup-next-card="invite"'));
  assert.ok(html.includes('2 of 3 steps complete'));
});

test('vue SSR — WorkspaceSetupPanel all-done caption hides up-next', async () => {
  const html = await renderSfc('WorkspaceSetupPanel.vue', {
    sections: [{ id: 's', title: 'Solo section', tasks: [{ id: 't', label: 'Only task', done: true }] }],
  });
  assert.ok(html.includes('All steps complete — your workspace is ready.'));
  assert.ok(!html.includes('data-workspace-setup-up-next'));
});

test('vue SSR — InviteTeammatesCard composer, pending rows and footer', async () => {
  const html = await renderSfc('InviteTeammatesCard.vue', {
    pending: [
      { email: 'ada@lovelace.dev', role: 'Admin' },
      { email: 'grace@hopper.io', role: 'Editor' },
    ],
  });
  assert.ok(html.includes('data-invite-teammates'));
  assert.ok(html.includes('Invite your teammates'));
  assert.ok(html.includes('data-invite-teammates-input'));
  assert.ok(html.includes('data-invite-teammates-row="ada@lovelace.dev"'));
  assert.ok(html.includes('grace@hopper.io'));
  assert.ok(html.includes('Send invites'));
  assert.ok(html.includes('Skip for now'));
  assert.ok(html.includes('2 pending'));
  assert.ok(!html.includes('data-invite-teammates-error'));
});

test('vue SSR — InviteTeammatesCard empty pending disables Send', async () => {
  const html = await renderSfc('InviteTeammatesCard.vue', {});
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('0 pending'));
  assert.ok(!html.includes('data-invite-teammates-list'));
});
