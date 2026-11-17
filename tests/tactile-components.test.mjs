import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { JSDOM } from "jsdom";
import { parse, compileScript } from "@vue/compiler-sfc";
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const cacheDir = path.join(__dirname, "node_modules", ".cache-tactile");
fs.mkdirSync(cacheDir, { recursive: true });

function loadTranspiledTsx(filename) {
  const srcPath = path.join(projectRoot, "react", filename);
  const src = fs.readFileSync(srcPath, "utf-8");
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const outPath = path.join(cacheDir, filename.replace(".tsx", ".mjs"));
  fs.writeFileSync(outPath, out, "utf-8");
  return outPath;
}

test("Vanilla: Web Components define and render safely in DOM", async () => {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.customElements = dom.window.customElements;

  // Import vanilla modules (pathToFileURL: Windows absolute paths are not valid ESM specifiers)
  await import(pathToFileURL(path.join(projectRoot, "vanilla/AnimatedCounter.js")));
  await import(pathToFileURL(path.join(projectRoot, "vanilla/SpotlightGlareCard.js")));
  await import(pathToFileURL(path.join(projectRoot, "vanilla/PointerRipples.js")));
  await import(pathToFileURL(path.join(projectRoot, "vanilla/LiquidGlass.js")));
  await import(pathToFileURL(path.join(projectRoot, "vanilla/FluidContourBackdrop.js")));

  assert.ok(dom.window.customElements.get("animated-counter"));
  assert.ok(dom.window.customElements.get("spotlight-glare-card"));
  assert.ok(dom.window.customElements.get("pointer-ripples"));
  assert.ok(dom.window.customElements.get("liquid-glass"));

  const counter = dom.window.document.createElement("animated-counter");
  counter.setAttribute("target", "270");
  counter.setAttribute("prefix", "$");
  counter.setAttribute("suffix", "+");
  dom.window.document.body.appendChild(counter);

  assert.equal(counter.textContent, "$270+");

  const card = dom.window.document.createElement("spotlight-glare-card");
  card.setAttribute("enable-tilt", "true");
  card.innerHTML = "<span>Card Content</span>";
  dom.window.document.body.appendChild(card);

  assert.ok(card.classList.contains("rounded-2xl"));
  assert.ok(card.querySelector(".glare-layer"));

  // PointerRipples: canvas shell renders even though WebGL is unavailable in jsdom
  const ripples = dom.window.document.createElement("pointer-ripples");
  ripples.setAttribute("curl", "18");
  ripples.setAttribute("opacity", "0.8");
  dom.window.document.body.appendChild(ripples);

  const ripplesCanvas = ripples.querySelector("canvas");
  assert.ok(ripplesCanvas, "PointerRipples should render a canvas element");
  assert.ok(ripplesCanvas.getAttribute("aria-hidden") === "true");
  assert.ok(ripplesCanvas.className.includes("pointer-events-none"));
  assert.ok(ripplesCanvas.className.includes("fixed"));
  assert.equal(ripplesCanvas.style.opacity, "0.8");

  // LiquidGlass vanilla assertions
  const glassCapsule = dom.window.document.createElement("liquid-glass");
  glassCapsule.setAttribute("variant", "capsule");
  glassCapsule.setAttribute("intensity", "regular");
  glassCapsule.innerHTML = "<span>Action Pill</span>";
  dom.window.document.body.appendChild(glassCapsule);

  assert.ok(glassCapsule.classList.contains("rounded-full"));
  assert.ok(glassCapsule.classList.contains("liquid-glass-pane"));
  assert.ok(glassCapsule.querySelector(".liquid-glass-glare"));
  assert.ok(glassCapsule.querySelector(".liquid-glass-ring"));

  const glassCard = dom.window.document.createElement("liquid-glass");
  glassCard.setAttribute("variant", "card");
  glassCard.setAttribute("intensity", "thick");
  glassCard.innerHTML = "<h3>Glass Card</h3>";
  dom.window.document.body.appendChild(glassCard);

  assert.ok(glassCard.classList.contains("rounded-2xl"));
  assert.ok(glassCard.classList.contains("backdrop-blur-2xl"));
  assert.ok(glassCard.classList.contains("contrast-more:bg-white"));
  assert.ok(glassCard.classList.contains("motion-reduce:transform-none"));

  // Verify interactive pointermove / pointerleave
  glassCard.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
  });
  glassCard.setAttribute("enable-tilt", "true");

  const glareEl = glassCard.querySelector(".liquid-glass-glare");
  assert.equal(glareEl.style.opacity, "0");

  const moveEvent = new dom.window.Event("pointermove");
  moveEvent.clientX = 50;
  moveEvent.clientY = 25;
  glassCard.dispatchEvent(moveEvent);

  assert.equal(glareEl.style.opacity, "0.35");
  assert.ok(glareEl.style.background.includes("25.0% 25.0%"));
  assert.ok(glassCard.style.transform.includes("perspective(1000px)"));

  const leaveEvent = new dom.window.Event("pointerleave");
  glassCard.dispatchEvent(leaveEvent);
  assert.equal(glareEl.style.opacity, "0");
  assert.equal(glassCard.style.transform, "");

  // FluidContourBackdrop vanilla: canvas shell + WebGL-unavailable fallback path
  // (jsdom has no WebGL: init() must fail gracefully inside try/catch, and the
  // matchMedia typeof guard must keep it from throwing on listeners setup).
  const contour = dom.window.document.createElement("fluid-contour-backdrop");
  contour.setAttribute("speed", "0.05");
  contour.setAttribute("ink-color", "0.1,0.2,0.3");
  contour.setAttribute("paper-color", "not-a-color");
  dom.window.document.body.appendChild(contour);
  const contourCanvas = contour.querySelector("canvas");
  assert.ok(contourCanvas, "FluidContourBackdrop should render a canvas element");
  assert.equal(contourCanvas.getAttribute("aria-hidden"), "true");
  assert.ok(contourCanvas.className.includes("pointer-events-none"));
  // Removing from DOM (disconnect) and re-adding must not throw in fallback mode
  contour.remove();
  dom.window.document.body.appendChild(contour);
  contour.remove();
});

// Same JSDOM instance on purpose: ESM module cache means the vanilla modules
// register their custom elements on the FIRST jsdom's customElements only.
test("Vanilla: tactile components lifecycle & payload hardening", async () => {
  // Malformed numeric payloads must not throw (parseFloat whitelist + NaN guard)
  for (const [tag, attrs] of [
    ["animated-counter", { target: "NaN", duration: "0;url(javascript:x)", start: "1e999" }],
    ["spotlight-glare-card", { "glare-opacity": "0;url(javascript:x)", "glare-radius": "NaN", "max-tilt": "Infinity" }],
    ["liquid-glass", { "glare-opacity": "<script>", "max-tilt": "NaN", "enable-tilt": "true" }],
    ["pointer-ripples", { curl: "NaN", "sim-resolution": "1e999", opacity: "0.9;url(javascript:x)" }],
    ["fluid-contour-backdrop", { speed: "NaN", "ink-color": "1,2", "paper-color": "a,b,c,d" }],
  ]) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    assert.ok(customElements.get(tag), `${tag} should be defined`);
    el.remove();
  }

  // Disconnect cleanliness: removing elements must not throw (engine teardown)
  const ripples = document.createElement("pointer-ripples");
  document.body.appendChild(ripples);
  ripples.remove();
  ripples.remove();

  // Reduced-motion short-circuit: tilt must NOT write inline transform
  window.matchMedia = (query) => ({ matches: query.includes("reduce"), media: query, addListener() {}, removeListener() {} });
  const glass = document.createElement("liquid-glass");
  glass.setAttribute("variant", "card");
  glass.setAttribute("enable-tilt", "true");
  glass.innerHTML = "<span>x</span>";
  document.body.appendChild(glass);
  glass.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 });
  const move = new window.Event("pointermove");
  move.clientX = 40;
  move.clientY = 20;
  glass.dispatchEvent(move);
  assert.equal(glass.style.transform, "", "tilt must be suppressed under prefers-reduced-motion");

  // AnimatedCounter under reduced motion: jump straight to the final value
  // (needs an IntersectionObserver stub so the counter reaches its motion branch)
  class IOStub {
    constructor(cb) { this._cb = cb; }
    observe(el) { this._cb([{ isIntersecting: true, target: el }]); }
    unobserve() {}
    disconnect() {}
  }
  const RealIO = window.IntersectionObserver;
  window.IntersectionObserver = IOStub;
  const counter = document.createElement("animated-counter");
  counter.setAttribute("target", "999");
  counter.setAttribute("prefix", "#");
  document.body.appendChild(counter);
  assert.equal(counter.textContent, "#999", "reduced motion must render the final value immediately");
  window.IntersectionObserver = RealIO;
});

test("React: Components SSR render without throwing", async () => {
  const animatedCounterPath = loadTranspiledTsx("AnimatedCounter.tsx");
  const spotlightGlareCardPath = loadTranspiledTsx("SpotlightGlareCard.tsx");
  const fluidContourBackdropPath = loadTranspiledTsx("FluidContourBackdrop.tsx");
  const pointerRipplesPath = loadTranspiledTsx("PointerRipples.tsx");
  const liquidGlassPath = loadTranspiledTsx("LiquidGlass.tsx");

  const { AnimatedCounter } = await import(pathToFileURL(animatedCounterPath));
  const { SpotlightGlareCard } = await import(pathToFileURL(spotlightGlareCardPath));
  const { FluidContourBackdrop } = await import(pathToFileURL(fluidContourBackdropPath));
  const { PointerRipples } = await import(pathToFileURL(pointerRipplesPath));
  const { LiquidGlass } = await import(pathToFileURL(liquidGlassPath));

  const counterHtml = ReactDOMServer.renderToString(
    React.createElement(AnimatedCounter, { target: 100, prefix: "#", suffix: "%" })
  );
  assert.ok(counterHtml.includes("font-mono"));
  assert.ok(counterHtml.includes("#") && counterHtml.includes("0") && counterHtml.includes("%"));

  const cardHtml = ReactDOMServer.renderToString(
    React.createElement(SpotlightGlareCard, { glareOpacity: 0.5 }, React.createElement("h2", null, "Title"))
  );
  assert.ok(cardHtml.includes("Title"));
  assert.ok(cardHtml.includes("rounded-2xl"));

  const backdropHtml = ReactDOMServer.renderToString(
    React.createElement(FluidContourBackdrop, { speed: 0.05 })
  );
  assert.ok(backdropHtml.includes("<canvas"));
  assert.ok(backdropHtml.includes("fixed inset-0"));

  const ripplesHtml = ReactDOMServer.renderToString(
    React.createElement(PointerRipples, { curl: 18, idleMs: 4000 })
  );
  assert.ok(ripplesHtml.includes("<canvas"));
  assert.ok(ripplesHtml.includes("fixed inset-0"));
  assert.ok(ripplesHtml.includes('aria-hidden="true"'));
  assert.ok(ripplesHtml.includes("opacity:0.58"));

  const glassHtml = ReactDOMServer.renderToString(
    React.createElement(
      LiquidGlass,
      { variant: "capsule", intensity: "regular" },
      React.createElement("span", null, "Capsule Toolbar")
    )
  );
  assert.ok(glassHtml.includes("liquid-glass-pane"));
  assert.ok(glassHtml.includes("rounded-full"));
  assert.ok(glassHtml.includes("Capsule Toolbar"));
  assert.ok(glassHtml.includes("liquid-glass-glare"));
});

test("Vue: SFC template and script compile without syntax errors", () => {
  const vueFiles = [
    "AnimatedCounter.vue",
    "SpotlightGlareCard.vue",
    "FluidContourBackdrop.vue",
    "PointerRipples.vue",
    "LiquidGlass.vue"
  ];

  for (const file of vueFiles) {
    const filePath = path.join(projectRoot, "vue", file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { descriptor, errors } = parse(content);
    assert.equal(errors.length, 0, `Parse error in ${file}`);
    assert.ok(descriptor.template, `Missing template in ${file}`);
    assert.ok(descriptor.scriptSetup, `Missing scriptSetup in ${file}`);

    const compiled = compileScript(descriptor, { id: file, isProd: true });
    assert.ok(compiled.content.length > 0, `Failed to compile script in ${file}`);
  }
});
