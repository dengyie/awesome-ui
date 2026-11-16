<template>
  <div
    ref="containerRef"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    :style="computedStyle"
    :class="[
      'liquid-glass-pane group relative overflow-hidden text-[#1d1d1f] dark:text-[#f5f5f7] select-none transition-all duration-300',
      variantClass,
      intensityClass,
      'bg-white/65 dark:bg-[#16181d]/65',
      'contrast-more:bg-white contrast-more:dark:bg-[#16181d] contrast-more:backdrop-blur-none',
      'motion-reduce:transform-none motion-reduce:transition-none',
      'border border-white/50 dark:border-white/10',
      'shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)]',
      'dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_0_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.35)]',
      'hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),inset_0_-1px_1px_0_rgba(0,0,0,0.08),0_14px_44px_rgba(0,0,0,0.1)]',
      'dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_-1px_1px_0_rgba(0,0,0,0.45),0_16px_48px_rgba(0,0,0,0.45)]',
      className
    ]"
  >
    <!-- Specular refractive rim caustics sheen layer -->
    <div
      v-if="interactive"
      aria-hidden="true"
      class="liquid-glass-glare pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
      :style="glareStyle"
    />

    <!-- Micro-frost edge reflection ring -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-10 rounded-[inherit] ring-1 ring-inset ring-white/30 dark:ring-white/10"
    />

    <!-- Content slot -->
    <div class="relative z-0 h-full w-full">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  variant?: "capsule" | "card" | "sidebar";
  intensity?: "light" | "regular" | "thick";
  interactive?: boolean;
  enableTilt?: boolean;
  maxTilt?: number;
  glareOpacity?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "card",
  intensity: "regular",
  interactive: true,
  enableTilt: false,
  maxTilt: 4,
  glareOpacity: 0.35,
  className: "",
});

const containerRef = ref<HTMLDivElement | null>(null);
const gx = ref("50%");
const gy = ref("50%");
const rx = ref(0);
const ry = ref(0);
const isHovered = ref(false);

const handlePointerMove = (e: PointerEvent) => {
  if (!props.interactive && !props.enableTilt) return;
  const el = containerRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  gx.value = `${((x / rect.width) * 100).toFixed(1)}%`;
  gy.value = `${((y / rect.height) * 100).toFixed(1)}%`;

  if (props.enableTilt && props.variant !== "sidebar") {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    ry.value = ((x - centerX) / centerX) * props.maxTilt;
    rx.value = -((y - centerY) / centerY) * props.maxTilt;
  }
  isHovered.value = true;
};

const handlePointerLeave = () => {
  rx.value = 0;
  ry.value = 0;
  isHovered.value = false;
};

const variantClass = computed(() => {
  switch (props.variant) {
    case "capsule":
      return "rounded-full px-5 py-2.5 inline-flex items-center";
    case "sidebar":
      return "rounded-none border-r h-full block";
    case "card":
    default:
      return "rounded-2xl sm:rounded-3xl p-6 block";
  }
});

const intensityClass = computed(() => {
  switch (props.intensity) {
    case "light":
      return "backdrop-blur-md backdrop-saturate-150";
    case "thick":
      return "backdrop-blur-2xl backdrop-saturate-[200%]";
    case "regular":
    default:
      return "backdrop-blur-xl backdrop-saturate-[180%]";
  }
});

const computedStyle = computed(() => {
  return {
    transform:
      props.enableTilt && isHovered.value && props.variant !== "sidebar"
        ? `perspective(1000px) rotateX(${rx.value}deg) rotateY(${ry.value}deg) translateY(-1px)`
        : undefined,
    transition: isHovered.value
      ? "transform 0.1s ease-out"
      : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
  };
});

const glareStyle = computed(() => {
  return {
    opacity: isHovered.value ? props.glareOpacity : 0,
    background: `radial-gradient(circle at ${gx.value} ${gy.value}, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 35%, transparent 65%)`,
    mixBlendMode: "overlay" as const,
  };
});
</script>
