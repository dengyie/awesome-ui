/**
 * v1.41.0 — Vue regression tests
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
  const script = compileScript(descriptor, { id: 'n41' });
  const template = compileTemplate({
    id: 'n41',
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

test('vue SSR — AiNoteAnswer waveform, sources and copy', async () => {
  const html = await renderSfc('AiNoteAnswer.vue', {
    question: 'What improvements should I prioritize for Homepage?',
    answer: 'Consider simplifying navigation and reducing friction in finding key information.',
    sources: ['Product design sync: shorten onboarding', 'UX review highlights'],
  });
  assert.ok(html.includes('data-note-answer-card'), 'card hook');
  assert.ok(html.includes('data-note-answer-play'), 'play button');
  assert.ok(html.includes('data-note-answer-waveform'), 'waveform hook');
  assert.ok(html.includes('What improvements should I prioritize'), 'question text');
  assert.ok(html.includes('data-note-answer-text'), 'answer hook');
  assert.ok(html.includes('simplifying navigation'), 'answer text');
  assert.ok(html.includes('data-note-answer-sources'), 'sources hook');
  assert.ok(html.includes('Other sources'), 'sources label');
  assert.ok(html.includes('data-note-answer-source'), 'source link');
  assert.ok(html.includes('Product design sync'), 'source text');
  assert.ok(html.includes('data-note-answer-copy'), 'copy CTA');
  assert.ok(html.includes('Copy'), 'copy label');

  const noSources = await renderSfc('AiNoteAnswer.vue', { sources: [] });
  assert.ok(!noSources.includes('data-note-answer-sources'), 'sources hidden when empty');
});

test('vue SSR — AudioNotePlayer waveform, duration and playing state', async () => {
  const html = await renderSfc('AudioNotePlayer.vue', {
    title: 'Homepage walkthrough notes',
    duration: '02:35',
    playing: true,
    waveform: [40, 70, 55, 90, 30],
  });
  assert.ok(html.includes('data-audio-note-player'), 'host hook');
  assert.ok(html.includes('data-audio-note-toggle'), 'toggle button');
  assert.ok(html.includes('aria-label="Pause note"'), 'pause label when playing');
  assert.ok(html.includes('❚❚'), 'pause glyph');
  assert.ok(html.includes('data-audio-note-waveform'), 'waveform hook');
  assert.ok(html.includes('02:35'), 'duration text');
  assert.ok(html.includes('bg-emerald-500'), 'played bars highlighted');
  assert.ok(html.includes('Homepage walkthrough notes'), 'title text');

  const idle = await renderSfc('AudioNotePlayer.vue', {});
  assert.ok(idle.includes('aria-label="Play note"'), 'play label when idle');
  assert.ok(idle.includes('▶'), 'play glyph');
  assert.ok(!idle.includes('bg-emerald-500'), 'no played bars when idle');
});

test('vue SSR — ImageActionMenu actions, divider and closed state', async () => {
  const html = await renderSfc('ImageActionMenu.vue', {
    open: true,
    actions: [
      { id: 'fullscreen', label: 'Fullscreen' },
      { id: 'upscale', label: 'Upscale & enhance' },
      { id: 'download', label: 'Download' },
    ],
  });
  assert.ok(html.includes('data-image-action-menu'), 'menu hook');
  assert.ok(html.includes('data-image-action="fullscreen"'), 'fullscreen action');
  assert.ok(html.includes('data-image-action="upscale"'), 'upscale action');
  assert.ok(html.includes('Upscale &amp; enhance'), 'upscale label escaped');
  assert.ok(html.includes('data-image-action="download"'), 'download action');
  assert.ok(html.includes('data-image-action-label'), 'label hook');
  assert.ok(html.includes('bg-zinc-100'), 'divider before download');

  const empty = await renderSfc('ImageActionMenu.vue', { open: true, actions: [] });
  assert.ok(empty.includes('data-image-action-empty'), 'empty state');

  const closed = await renderSfc('ImageActionMenu.vue', { open: false });
  assert.ok(!closed.includes('data-image-action-menu'), 'not rendered when closed');
});
