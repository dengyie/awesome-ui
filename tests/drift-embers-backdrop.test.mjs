/**
 * DriftEmbersBackdrop — tri-stack regression (vanilla jsdom + React SSR + Vue SSR).
 * Vanilla suite stubs a Canvas 2D context so the draw/lifecycle logic is exercised
 * even though jsdom has no real canvas implementation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const require = createRequire(import.meta.url);
const vueModule = require("vue");
const cacheDir = join(here, "node_modules", ".cache-drift");
mkdirSync(cacheDir, { recursive: true });

// ---- Canvas 2D stub shared by the vanilla suite ----
function makeGradient() {
  const stops = [];
  return {
    stops,
    addColorStop(pos, color) { stops.push([pos, color]); },
  };
}
function make2dContext() {
  return {
    canvas: null,
    fillStyle: "",
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    drawCalls: 0,
    gradients: [],
    createLinearGradient(...a) { const g = makeGradient(); this.gradients.push(["linear", a, g]); return g; },
    createRadialGradient(...a) { const g = makeGradient(); this.gradients.push(["radial", a, g]); return g; },
    fillRect() { this.drawCalls++; },
    drawImage() { this.drawCalls++; },
  };
}

function bootDom() {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "https://localhost/", pretendToBeVisual: true });
  const { window } = dom;
  const contexts = [];
  window.HTMLCanvasElement.prototype.getContext = function () {
    const ctx = make2dContext();
    ctx.canvas = this;
    contexts.push(ctx);
    return ctx;
  };
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.customElements = window.customElements;
  // Never reassign globalThis.performance: jsdom's Performance.now() reads the
  // global, which would recurse into itself. Use a plain stub + manual RAF queue.
  const perf = { now: () => 1000 };
  let seq = 0;
  const queue = new Map();
  const raf = { queue, perf,
    request: (cb) => { const id = ++seq; queue.set(id, cb); return id; },
    cancel: (id) => { queue.delete(id); },
    flush: (t = 1016) => { const items = [...queue.entries()]; queue.clear(); for (const [, cb] of items) cb(t); },
  };
  return { dom, window, contexts, raf };
}

const stripComponent = (file, className) =>
  readFileSync(join(root, "vanilla", file), "utf8")
    .replace(new RegExp(`^export default ${className};\\s*$`, "m"), "");

function makeKlass(source, ctx) {
  const { window, raf } = ctx;
  const factory = new Function("customElements", "HTMLElement", "document", "window", "performance",
    "requestAnimationFrame", "cancelAnimationFrame", `${source}\nreturn DriftEmbersBackdropElement;`);
  return factory(window.customElements, window.HTMLElement, window.document, window,
    raf.perf, raf.request, raf.cancel);
}

function mount(source) {
  const ctx = bootDom();
  const el = new (makeKlass(source, ctx))();
  ctx.window.document.body.appendChild(el);
  // Drive one animation frame synchronously so drawField actually paints.
  ctx.raf.flush();
  return { el, ...ctx };
}

test("Vanilla: custom element registers and mounts a canvas", () => {
  const source = stripComponent("DriftEmbersBackdrop.js", "DriftEmbersBackdropElement");
  const { window } = bootDom();
  new Function("customElements", "HTMLElement", source)(window.customElements, window.HTMLElement);
  assert.ok(window.customElements.get("drift-embers-backdrop"));
});

test("Vanilla: renders a cool field + mixed motes and recycles off-screen particles", async () => {
  const source = stripComponent("DriftEmbersBackdrop.js", "DriftEmbersBackdropElement");
  const { el, contexts, window } = mount(source);
  const canvas = el.querySelector("canvas");
  assert.ok(canvas, "canvas appended");
  assert.equal(canvas.getAttribute("aria-hidden"), "true");
  // main + two sprite contexts created; main has run at least one frame
  assert.ok(contexts.length >= 3, "main + gold/ash sprite contexts");
  const main = contexts[0];
  assert.ok(main.drawCalls > 0, "drawField painted the frame");
  assert.ok(main.gradients.some(([k]) => k === "linear"), "base + wash vertical/horizontal gradients");
  assert.ok(main.gradients.some(([k]) => k === "radial"), "mid-left bloom + vignette radial gradients");
  el.remove();
  assert.ok(true, "disconnect cleanup does not throw");
  window.close();
});

test("Vanilla: hostile attributes fall back safely, no throw", () => {
  const source = stripComponent("DriftEmbersBackdrop.js", "DriftEmbersBackdropElement");
  const { el, window } = mount(source);
  el.setAttribute("speed", "not-a-number");
  el.setAttribute("density", "-999");
  el.setAttribute("ember-color", "url(javascript:alert(1))");
  el.setAttribute("ash-color", "red; background-image:url(x)");
  el.setAttribute("base-color", "expression(alert(1))");
  // attributeChangedCallback re-inits; safeColor/numOr must not throw
  assert.ok(el.querySelector("canvas"));
  el.remove();
  window.close();
});

test("Vanilla: paused renders a single frame without a running loop", () => {
  const source = stripComponent("DriftEmbersBackdrop.js", "DriftEmbersBackdropElement");
  const ctx = bootDom();
  const el = new (makeKlass(source, ctx))();
  el.setAttribute("paused", "true");
  ctx.window.document.body.appendChild(el);
  const window = ctx.window;
  assert.ok(el.querySelector("canvas"));
  el.remove();
  window.close();
});

// ---- React SSR ----
test("React SSR: renders an aria-hidden backdrop canvas", async () => {
  const src = readFileSync(join(root, "react", "DriftEmbersBackdrop.tsx"), "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const target = join(cacheDir, "DriftEmbersBackdrop.react.mjs");
  writeFileSync(target, out, "utf8");
  const { default: DriftEmbersBackdrop } = await import(pathToFileURL(target).href + "?t=" + Date.now());
  const html = renderToStaticMarkup(React.createElement(DriftEmbersBackdrop, { className: "hero" }));
  assert.ok(html.includes("<canvas"));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes("hero"), "className merged");
});

// ---- Vue SSR ----
test("Vue SSR: renders an aria-hidden backdrop canvas", async () => {
  const source = readFileSync(join(root, "vue", "DriftEmbersBackdrop.vue"), "utf8");
  const { descriptor, errors } = parse(source, { filename: "DriftEmbersBackdrop.vue" });
  assert.equal(errors.length, 0);
  const script = compileScript(descriptor, { id: "drift" });
  const template = compileTemplate({
    id: "drift", filename: "DriftEmbersBackdrop.vue", source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0);
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText.replace(/^export\s+\{[^}]*\};?\s*$/gm, "");
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, b) => {
      const destructure = b.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, " $1: $2 ");
      return `const {${destructure}} = vueMod;`;
    })
    .replace(/^export function render\(/m, "function render(");
  const factory = new Function("vueMod", "exports", "requireShim", `
    const require = (name) => (name === 'vue' ? vueMod : requireShim(name));
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const exportsShim = {};
  const { default: component, render } = factory(vueModule, exportsShim, require);
  component.render = render;
  const html = await renderToString(vueModule.createSSRApp(component, { className: "hero" }));
  assert.ok(html.includes("<canvas"));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes("hero"));
});
