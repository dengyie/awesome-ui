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
  interactive?: boolean;
  paused?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 1,
  density: 72,
  baseColor: "#0d0d0d",
  bloomColor: "#6b5947",
  emberColor: "#e6b745",
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

type Ember = {
  x: number; y: number; r: number; rise: number; sway: number;
  swayAmp: number; phase: number; twinkle: number; alpha: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

let cleanup: (() => void) | null = null;

function mount() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const spd = numOr(props.speed, 1, 0, 4);
  const count = Math.round(numOr(props.density, 72, 1, 220));
  const base = safeColor(props.baseColor, "#0d0d0d");
  const bloom = safeColor(props.bloomColor, "#6b5947");
  const ember = safeColor(props.emberColor, "#e6b745");

  const sprite = document.createElement("canvas");
  const SP = 64;
  sprite.width = SP;
  sprite.height = SP;
  const sctx = sprite.getContext("2d");
  if (!sctx) return;
  const [er, eg, eb] = hexToRgb(ember);
  const sg = sctx.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
  sg.addColorStop(0, `rgba(${er},${eg},${eb},1)`);
  sg.addColorStop(0.35, `rgba(${er},${eg},${eb},0.55)`);
  sg.addColorStop(1, `rgba(${er},${eg},${eb},0)`);
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, SP, SP);

  const embers: Ember[] = Array.from({ length: count }, () => ({
    x: rand(0, 1), y: rand(-0.1, 1.1), r: rand(1.5, 6.5),
    rise: rand(0.008, 0.032), sway: rand(0.002, 0.012),
    swayAmp: rand(0.004, 0.03), phase: rand(0, Math.PI * 2),
    twinkle: rand(0.5, 1.8), alpha: rand(0.35, 0.95),
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

  const drawField = (t: number) => {
    const field = ctx.createLinearGradient(0, 0, 0, H);
    field.addColorStop(0, base);
    field.addColorStop(0.55, "#23241b");
    field.addColorStop(1, bloom);
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, W, H);

    const bx = (0.5 + (pointer.x - 0.5) * 0.12) * W;
    const by = (0.92 + (pointer.y - 0.5) * 0.06) * H;
    const [br, bg, bb] = hexToRgb(bloom);
    const glow = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(W, H) * 0.8);
    glow.addColorStop(0, `rgba(${br},${bg},${bb},0.55)`);
    glow.addColorStop(0.45, `rgba(${br},${bg},${bb},0.18)`);
    glow.addColorStop(1, `rgba(${br},${bg},${bb},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

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

    const vg = ctx.createRadialGradient(
      W / 2, H * 0.45, Math.min(W, H) * 0.2,
      W / 2, H * 0.45, Math.max(W, H) * 0.78,
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.62)");
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
    for (const e of embers) {
      e.y -= e.rise * dt * spd;
      if (e.y < -0.1) { e.y = 1.1; e.x = Math.random(); }
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
  () => [props.speed, props.density, props.baseColor, props.bloomColor, props.emberColor, props.interactive, props.paused],
  () => { if (cleanup) cleanup(); cleanup = null; mount(); },
);
</script>
