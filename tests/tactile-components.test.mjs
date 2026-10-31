import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { JSDOM } from "jsdom";
import { parse, compileScript } from "@vue/compiler-sfc";
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

  // Import vanilla modules
  await import(path.join(projectRoot, "vanilla/AnimatedCounter.js"));
  await import(path.join(projectRoot, "vanilla/SpotlightGlareCard.js"));
  await import(path.join(projectRoot, "vanilla/PointerRipples.js"));
  await import(path.join(projectRoot, "vanilla/LiquidGlass.js"));

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
});

test("React: Components SSR render without throwing", async () => {
  const animatedCounterPath = loadTranspiledTsx("AnimatedCounter.tsx");
  const spotlightGlareCardPath = loadTranspiledTsx("SpotlightGlareCard.tsx");
  const fluidContourBackdropPath = loadTranspiledTsx("FluidContourBackdrop.tsx");
  const pointerRipplesPath = loadTranspiledTsx("PointerRipples.tsx");
  const liquidGlassPath = loadTranspiledTsx("LiquidGlass.tsx");

  const { AnimatedCounter } = await import(animatedCounterPath);
  const { SpotlightGlareCard } = await import(spotlightGlareCardPath);
  const { FluidContourBackdrop } = await import(fluidContourBackdropPath);
  const { PointerRipples } = await import(pointerRipplesPath);
  const { LiquidGlass } = await import(liquidGlassPath);

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
