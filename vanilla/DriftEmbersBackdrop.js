/**
 * DriftEmbersBackdrop - Vanilla Web Component
 * Ambient backdrop inspired by the moment a warm flower valley disperses after
 * login: a cool-to-charcoal vertical field with a warm olive band across the
 * middle, the glow pooled mid-left instead of the bottom, and a cloud of mixed
 * gold + ash motes slowly settling through it. Zero dependencies, Canvas 2D.
 *
 * Usage: <drift-embers-backdrop speed="1" density="120" ember-color="#b9af39" ash-color="#c8c9ca"></drift-embers-backdrop>
 */

const numOr = (value, fallback, min, max) => {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

// Canvas color stops throw on malformed values; only accept hex / rgb() strings
// so a hostile attribute cannot break the render loop (graceful fallback).
const safeColor = (value, fallback) => {
  const s = String(value ?? "").trim();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (/^rgba?\(\s*[\d.%\s,]+\)$/i.test(s)) return s;
  return fallback;
};

const hexToRgb = (hex) => {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

class DriftEmbersBackdropElement extends HTMLElement {
  static get observedAttributes() {
    return ["speed", "density", "base-color", "bloom-color", "ember-color", "ash-color", "interactive", "paused"];
  }

  constructor() {
    super();
    this._cleanup = null;
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.disconnectedCallback();
      this.init();
    }
  }

  init() {
    this.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fixed inset-0 pointer-events-none w-full h-full z-0";
    this.appendChild(canvas);
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;

    const speed = numOr(this.getAttribute("speed"), 1, 0, 4);
    const count = Math.round(numOr(this.getAttribute("density"), 120, 1, 260));
    const baseColor = safeColor(this.getAttribute("base-color"), "#0d1113");
    const bloomColor = safeColor(this.getAttribute("bloom-color"), "#4a4430");
    const emberColor = safeColor(this.getAttribute("ember-color"), "#b9af39");
    const ashColor = safeColor(this.getAttribute("ash-color"), "#c8c9ca");
    const interactive = this.getAttribute("interactive") === "true";
    const paused = this.getAttribute("paused") === "true";

    // One soft sprite per mote family (warm gold + neutral ash). Pre-rendering
    // avoids rebuilding a radial gradient for every particle each frame.
    const makeSprite = (color, coreAlpha) => {
      const c = document.createElement("canvas");
      const SP = 64;
      c.width = SP;
      c.height = SP;
      const sc = c.getContext("2d");
      const [r, g, b] = hexToRgb(color);
      const grd = sc.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
      grd.addColorStop(0, `rgba(${r},${g},${b},${coreAlpha})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${coreAlpha * 0.4})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      sc.fillStyle = grd;
      sc.fillRect(0, 0, SP, SP);
      return c;
    };
    const goldSprite = makeSprite(emberColor, 0.95);
    const ashSprite = makeSprite(ashColor, 0.55);

    // Bias x toward the left, where the dispersed cloud is densest.
    const biasedX = () => Math.pow(Math.random(), 1.45) * 1.06 - 0.03;
    const rand = (a, b) => a + Math.random() * (b - a);
    const motes = Array.from({ length: count }, () => ({
      x: biasedX(),
      y: rand(-0.1, 1.1),
      r: rand(1.6, 6.2),
      fall: rand(0.004, 0.018),
      sway: rand(0.002, 0.01),
      swayAmp: rand(0.006, 0.035),
      phase: rand(0, Math.PI * 2),
      twinkle: rand(0.4, 1.4),
      alpha: rand(0.3, 0.85),
      ash: Math.random() < 0.46,
    }));

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let W = 1;
    let H = 1;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      W = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * dpr));
      H = Math.max(1, Math.round((canvas.clientHeight || window.innerHeight) * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
    };

    // Fine grain, pre-rendered once and tiled. Guarded so a minimal 2D context
    // (e.g. jsdom) simply skips it rather than throwing.
    let grain = null;
    if (typeof ctx.createPattern === "function" && typeof document.createElement("canvas").getContext === "function") {
      const tile = document.createElement("canvas");
      tile.width = 64;
      tile.height = 64;
      const tc = tile.getContext("2d");
      if (tc && typeof tc.createImageData === "function") {
        const img = tc.createImageData(64, 64);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = 120 + Math.floor(Math.random() * 135);
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 14;
        }
        tc.putImageData(img, 0, 0);
        grain = ctx.createPattern(tile, "repeat");
      }
    }

    const drawField = (t) => {
      // vertical field: cool top -> warm olive band -> dark base
      const field = ctx.createLinearGradient(0, 0, 0, H);
      field.addColorStop(0, baseColor);
      field.addColorStop(0.42, "#2a2923");
      field.addColorStop(1, "#090b0a");
      ctx.fillStyle = field;
      ctx.fillRect(0, 0, W, H);

      // horizontal wash: warmer on the left, open dark pocket toward center-right
      const wash = ctx.createLinearGradient(0, 0, W, 0);
      wash.addColorStop(0, "rgba(72,64,42,0.18)");
      wash.addColorStop(0.5, "rgba(0,0,0,0)");
      wash.addColorStop(1, "rgba(0,0,0,0.26)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      // glow pooled mid-left (the warmth migrates up from the bottom after login)
      const bx = (0.13 + (pointer.x - 0.5) * 0.1) * W;
      const by = (0.45 + (pointer.y - 0.5) * 0.05) * H;
      const [br, bg, bb] = hexToRgb(bloomColor);
      const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(W, H) * 0.62);
      bloom.addColorStop(0, `rgba(${br},${bg},${bb},0.42)`);
      bloom.addColorStop(0.5, `rgba(${br},${bg},${bb},0.1)`);
      bloom.addColorStop(1, `rgba(${br},${bg},${bb},0)`);
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      // mixed gold + ash motes settling slowly through the field
      ctx.globalCompositeOperation = "lighter";
      for (const p of motes) {
        const px = (p.x + Math.sin(t * p.sway + p.phase) * p.swayAmp) * W;
        const py = p.y * H;
        const tw = 0.6 + 0.4 * Math.sin(t * p.twinkle + p.phase);
        const size = p.r * dpr * 5;
        ctx.globalAlpha = p.alpha * tw;
        ctx.drawImage(p.ash ? ashSprite : goldSprite, px - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (grain) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // very light vignette — the drift scene is flatter than the valley, so
      // corners stay close to the center brightness.
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.82);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.2)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    const reducedQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

    let raf = 0;
    let last = 0;
    let t = 0;
    let stopped = paused;

    const frame = (now) => {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * speed;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      for (const p of motes) {
        p.y += p.fall * dt * speed;
        if (p.y > 1.1) {
          p.y = -0.1;
          p.x = biasedX();
        }
      }
      drawField(t);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (stopped) return;
      last = performance.now();
      if (reducedQuery.matches) {
        drawField(t);
      } else {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onResize = () => {
      resize();
      if (stopped || reducedQuery.matches) drawField(t);
    };

    const onPointerMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / (rect.width || 1);
      pointer.ty = (e.clientY - rect.top) / (rect.height || 1);
    };

    resize();
    if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    this._cleanup = () => {
      stop();
      if (interactive) window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }
}

if (typeof customElements !== "undefined" && !customElements.get("drift-embers-backdrop")) {
  customElements.define("drift-embers-backdrop", DriftEmbersBackdropElement);
}

export default DriftEmbersBackdropElement;
