<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    :class="['fixed inset-0 pointer-events-none w-full h-full z-0', className]"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

interface Props {
  speed?: number;
  density?: number;
  baseColor?: string;
  bloomColor?: string;
  emberColor?: string;
  ashColor?: string;
  interactive?: boolean;
  paused?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 1,
  density: 120,
  baseColor: "#0d1113",
  bloomColor: "#4a4430",
  emberColor: "#b9af39",
  ashColor: "#c8c9ca",
  interactive: false,
  paused: false,
  className: "",
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

const numOr = (v: number | undefined, fallback: number, min: number, max: number) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, v as number)) : fallback;

const safeColor = (v: string | undefined, fallback: string) => {
  const s = (v ?? "").trim();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) || /^rgba?\(\s*[\d.%\s,]+\)$/i.test(s)) return s;
  return fallback;
};

const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

type Mote = {
  x: number; y: number; r: number; fall: number; sway: number;
  swayAmp: number; phase: number; twinkle: number; alpha: number; ash: boolean;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const biasedX = () => Math.pow(Math.random(), 1.45) * 1.06 - 0.03;

const makeSprite = (color: string, coreAlpha: number): HTMLCanvasElement | null => {
  const c = document.createElement("canvas");
  const SP = 64;
  c.width = SP;
  c.height = SP;
  const sc = c.getContext("2d");
  if (!sc) return null;
  const [r, g, b] = hexToRgb(color);
  const grd = sc.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},${coreAlpha})`);
  grd.addColorStop(0.4, `rgba(${r},${g},${b},${coreAlpha * 0.4})`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  sc.fillStyle = grd;
  sc.fillRect(0, 0, SP, SP);
  return c;
};

let cleanup: (() => void) | null = null;

function mount() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const spd = numOr(props.speed, 1, 0, 4);
  const count = Math.round(numOr(props.density, 120, 1, 260));
  const base = safeColor(props.baseColor, "#0d1113");
  const bloom = safeColor(props.bloomColor, "#4a4430");
  const ember = safeColor(props.emberColor, "#b9af39");
  const ash = safeColor(props.ashColor, "#c8c9ca");

  const goldSprite = makeSprite(ember, 0.95);
  const ashSprite = makeSprite(ash, 0.55);
  if (!goldSprite || !ashSprite) return;

  const motes: Mote[] = Array.from({ length: count }, () => ({
    x: biasedX(), y: rand(-0.1, 1.1), r: rand(1.6, 6.2),
    fall: rand(0.004, 0.018), sway: rand(0.002, 0.01),
    swayAmp: rand(0.006, 0.035), phase: rand(0, Math.PI * 2),
    twinkle: rand(0.4, 1.4), alpha: rand(0.3, 0.85),
    ash: Math.random() < 0.46,
  }));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  let grain: CanvasPattern | null = null;
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

  const drawField = (t: number) => {
    const field = ctx.createLinearGradient(0, 0, 0, H);
    field.addColorStop(0, base);
    field.addColorStop(0.42, "#2a2923");
    field.addColorStop(1, "#090b0a");
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, W, H);

    const wash = ctx.createLinearGradient(0, 0, W, 0);
    wash.addColorStop(0, "rgba(72,64,42,0.18)");
    wash.addColorStop(0.5, "rgba(0,0,0,0)");
    wash.addColorStop(1, "rgba(0,0,0,0.26)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    const bx = (0.13 + (pointer.x - 0.5) * 0.1) * W;
    const by = (0.45 + (pointer.y - 0.5) * 0.05) * H;
    const [br, bg, bb] = hexToRgb(bloom);
    const glow = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(W, H) * 0.62);
    glow.addColorStop(0, `rgba(${br},${bg},${bb},0.42)`);
    glow.addColorStop(0.5, `rgba(${br},${bg},${bb},0.1)`);
    glow.addColorStop(1, `rgba(${br},${bg},${bb},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

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

    const vg = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.3,
      W / 2, H / 2, Math.max(W, H) * 0.82,
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  };

  const reduced =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  let raf = 0;
  let last = 0;
  let t = 0;
  let stopped = props.paused;

  const frame = (now: number) => {
    if (stopped) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt * spd;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    for (const p of motes) {
      p.y += p.fall * dt * spd;
      if (p.y > 1.1) { p.y = -0.1; p.x = biasedX(); }
    }
    drawField(t);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (stopped) return;
    last = performance.now();
    if (reduced) drawField(t);
    else { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  const onResize = () => { resize(); if (stopped || reduced) drawField(t); };
  const onPointerMove = (e: PointerEvent) => {
    if (!props.interactive) return;
    const rect = canvas.getBoundingClientRect();
    pointer.tx = (e.clientX - rect.left) / (rect.width || 1);
    pointer.ty = (e.clientY - rect.top) / (rect.height || 1);
  };

  resize();
  if (props.interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  start();

  cleanup = () => {
    stop();
    if (props.interactive) window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

onMounted(mount);
onUnmounted(() => { if (cleanup) cleanup(); });
watch(
  () => [props.speed, props.density, props.baseColor, props.bloomColor, props.emberColor, props.ashColor, props.interactive, props.paused],
  () => { if (cleanup) cleanup(); cleanup = null; mount(); },
);
</script>
