<template>
  <div
    ref="cardRef"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    :style="cardStyle"
    :class="[
      'group relative overflow-hidden rounded-2xl bg-[#faf8f1] dark:bg-[#1a1d24] border border-[#d6d2c2]/80 dark:border-[#2b3038]/80 text-[#22262d] dark:text-[#e9e6db] shadow-[0_1px_0_rgba(34,38,45,0.07),0_5px_16px_rgba(34,38,45,0.07)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4),0_8px_22px_rgba(0,0,0,0.42)] transition-shadow duration-300 hover:shadow-[0_2px_0_rgba(34,38,45,0.08),0_12px_28px_rgba(34,38,45,0.12)] select-none',
      className
    ]"
  >
    <!-- Specular glare reflection layer -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
      :style="glareStyle"
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
  glareOpacity?: number;
  glareRadius?: number;
  enableTilt?: boolean;
  maxTilt?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  glareOpacity: 0.45,
  glareRadius: 55,
  enableTilt: false,
  maxTilt: 5,
  className: "",
});

const cardRef = ref<HTMLDivElement | null>(null);
const gx = ref("50%");
const gy = ref("50%");
const rx = ref(0);
const ry = ref(0);
const isHovered = ref(false);

const handlePointerMove = (e: PointerEvent) => {
  const card = cardRef.value;
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  gx.value = `${((x / rect.width) * 100).toFixed(1)}%`;
  gy.value = `${((y / rect.height) * 100).toFixed(1)}%`;

  if (props.enableTilt) {
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

const cardStyle = computed(() => {
  if (props.enableTilt && isHovered.value) {
    return {
      transform: `perspective(1000px) rotateX(${rx.value}deg) rotateY(${ry.value}deg) translateY(-2px)`,
      transition: "transform 0.1s ease-out",
    };
  }
  return {
    transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
  };
});

const glareStyle = computed(() => ({
  opacity: isHovered.value ? props.glareOpacity : 0,
  background: `radial-gradient(circle at ${gx.value} ${gy.value}, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 30%, transparent ${props.glareRadius}%)`,
  mixBlendMode: "overlay" as const,
}));
</script>
