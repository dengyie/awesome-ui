/**
 * AmberEmbersBackdrop - Vanilla Web Component
 * Ambient backdrop inspired by a dark golden-hour valley: a warm olive/charcoal
 * vertical gradient, a soft amber bloom pooling toward the bottom-center, an
 * edge vignette and a field of sparse glowing embers that drift upward and
 * gently twinkle. Zero dependencies, Canvas 2D (works without WebGL).
 *
 * Usage: <amber-embers-backdrop speed="1" density="72" ember-color="#e6b745"></amber-embers-backdrop>
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

class AmberEmbersBackdropElement extends HTMLElement {
  static get observedAttributes() {
    return ["speed", "density", "base-color", "bloom-color", "ember-color", "interactive", "paused"];
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
    const count = Math.round(numOr(this.getAttribute("density"), 72, 1, 220));
    const baseColor = safeColor(this.getAttribute("base-color"), "#0d0d0d");
    const bloomColor = safeColor(this.getAttribute("bloom-color"), "#6b5947");
    const emberColor = safeColor(this.getAttribute("ember-color"), "#e6b745");
    const interactive = this.getAttribute("interactive") === "true";
    const paused = this.getAttribute("paused") === "true";

    // Pre-render one soft ember sprite; drawImage-scaled per particle is far
    // cheaper than a radial gradient built from scratch every frame.
    const sprite = document.createElement("canvas");
    const SP = 64;
    sprite.width = SP;
    sprite.height = SP;
    const sctx = sprite.getContext("2d");
    const [er, eg, eb] = hexToRgb(emberColor);
    const sg = sctx.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
    sg.addColorStop(0, `rgba(${er},${eg},${eb},1)`);
    sg.addColorStop(0.35, `rgba(${er},${eg},${eb},0.55)`);
    sg.addColorStop(1, `rgba(${er},${eg},${eb},0)`);
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, SP, SP);

    const rand = (a, b) => a + Math.random() * (b - a);
    const embers = Array.from({ length: count }, () => ({
      x: rand(0, 1),
      y: rand(-0.1, 1.1),
      r: rand(1.5, 6.5),
      rise: rand(0.008, 0.032),
      sway: rand(0.002, 0.012),
      swayAmp: rand(0.004, 0.03),
      phase: rand(0, Math.PI * 2),
      twinkle: rand(0.5, 1.8),
      alpha: rand(0.35, 0.95),
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

    const drawField = (t) => {
      // base: darkest at top, warm olive toward the lower field
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, baseColor);
      bg.addColorStop(0.55, "#23241b");
      bg.addColorStop(1, bloomColor);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // warm bloom pooling at the bottom-center, nudged by pointer parallax
      const bx = (0.5 + (pointer.x - 0.5) * 0.12) * W;
      const by = (0.92 + (pointer.y - 0.5) * 0.06) * H;
      const [br, bg2, bb] = hexToRgb(bloomColor);
      const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(W, H) * 0.8);
      bloom.addColorStop(0, `rgba(${br},${bg2},${bb},0.55)`);
      bloom.addColorStop(0.45, `rgba(${br},${bg2},${bb},0.18)`);
      bloom.addColorStop(1, `rgba(${br},${bg2},${bb},0)`);
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      // embers — soft additive-looking glow over the warm field
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        const ex = (e.x + Math.sin(t * e.sway + e.phase) * e.swayAmp) * W;
        const ey = e.y * H;
        const tw = 0.65 + 0.35 * Math.sin(t * e.twinkle + e.phase);
        const size = e.r * dpr * 6;
        ctx.globalAlpha = e.alpha * tw;
        ctx.drawImage(sprite, ex - size / 2, ey - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // vignette: darker edges focus the glow toward the center
      const vg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.2, W / 2, H * 0.45, Math.max(W, H) * 0.78);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.62)");
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
      for (const e of embers) {
        e.y -= e.rise * dt * speed;
        if (e.y < -0.1) {
          e.y = 1.1;
          e.x = Math.random();
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

if (typeof customElements !== "undefined" && !customElements.get("amber-embers-backdrop")) {
  customElements.define("amber-embers-backdrop", AmberEmbersBackdropElement);
}

export default AmberEmbersBackdropElement;
