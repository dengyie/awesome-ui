/**
 * v1.39.0 — Vue regression tests
 * Compiles each SFC with @vue/compiler-sfc (+ TypeScript transpile),
 * evaluates the real component and SSR-renders it through
 * @vue/server-renderer, checking structure markers.
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
  const script = compileScript(descriptor, { id: 'n39' });
  const template = compileTemplate({
    id: 'n39',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);

  // Transpile the compiled script (ESM w/ vue import + TS types) to CJS,
  // then evaluate it with `vue` and the render fn provided.
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
    // script-setup re-exports types (type-only) — strip leftover ESM exports
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

test('vue SSR — AiResearchPanel template cards and footer CTA', async () => {
  const html = await renderSfc('AiResearchPanel.vue', {
    title: 'Research with AI',
    templates: [
      { id: 'r1', title: 'Research and evaluate a company for fit', description: 'Research a company to determine if their needs align with your offering.' },
      { id: 'r2', title: 'Confirm decision-maker', description: 'Determine if a contact is a valid decision-maker.' },
    ],
  });
  assert.ok(html.includes('data-ai-research-panel'), 'host hook');
  assert.ok(html.includes('Research with AI'), 'title text');
  assert.ok(html.includes('data-ai-research-close'), 'close button');
  assert.ok(html.includes('data-research-card="r1"'), 'card hook');
  assert.ok(html.includes('Research and evaluate a company for fit'), 'card title');
  assert.ok(html.includes('data-research-run'), 'try CTA');
  assert.ok(html.includes('Try it'), 'try label');
  assert.ok(html.includes('data-ai-research-custom'), 'custom CTA');
  assert.ok(html.includes('Run custom AI prompt'), 'custom label');
});

test('vue SSR — ApiKeyTable rows, status badges and actions', async () => {
  const html = await renderSfc('ApiKeyTable.vue', {
    keys: [
      { id: 'k1', name: 'Production key', preview: 'sk-proj-••••••••••••4x8f', created: 'Nov 12, 2026', status: 'active' },
      { id: 'k2', name: 'Legacy key', preview: 'sk-proj-••••••••••••9q2m', status: 'revoked' },
    ],
  });
  assert.ok(html.includes('data-api-key-table'), 'host hook');
  assert.ok(html.includes('1 active'), 'active count excludes revoked');
  assert.ok(html.includes('data-api-key-create'), 'create CTA');
  assert.ok(html.includes('data-api-key-row="k1"'), 'row hook');
  assert.ok(html.includes('Production key'), 'key name');
  assert.ok(html.includes('data-api-key-status'), 'status hook');
  assert.ok(html.includes('Revoked'), 'revoked badge');
  assert.ok(html.includes('sk-proj-••••••••••••4x8f'), 'preview text');
  assert.ok(html.includes('created Nov 12, 2026'), 'created date');
  assert.ok(html.includes('data-api-key-copy'), 'copy action');
  assert.ok(html.includes('data-api-key-revoke'), 'revoke action');
});

test('vue SSR — VoiceSessionHistory rows, statuses and play buttons', async () => {
  const html = await renderSfc('VoiceSessionHistory.vue', {
    sessions: [
      { id: 's1', title: 'Homepage walkthrough', date: 'Today', duration: '04:12', status: 'completed' },
      { id: 's2', title: 'Weekly sync notes', date: 'Yesterday', duration: '11:38', status: 'in-progress' },
      { id: 's3', title: 'Broken recording', duration: '00:00', status: 'failed' },
    ],
  });
  assert.ok(html.includes('data-voice-history'), 'host hook');
  assert.ok(html.includes('data-voice-history-count'), 'count hook');
  assert.ok(html.includes('data-voice-session="s1"'), 'session hook');
  assert.ok(html.includes('Homepage walkthrough'), 'session title');
  assert.ok(html.includes('Today · 04:12'), 'meta text');
  assert.ok(html.includes('data-voice-session-status'), 'status hook');
  assert.ok(html.includes('Completed'), 'completed label');
  assert.ok(html.includes('Running'), 'running label');
  assert.ok(html.includes('Failed'), 'failed label');
  assert.ok(html.includes('data-voice-session-play'), 'play button');
});
