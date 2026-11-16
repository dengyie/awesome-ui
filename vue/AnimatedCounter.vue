<template>
  <span
    ref="elRef"
    :class="['font-mono tabular-nums select-none', className]"
  >
    {{ prefix }}{{ displayValue }}{{ suffix }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  target: number;
  start?: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  start: 0,
  duration: 1500,
  delay: 0,
  suffix: "",
  prefix: "",
  className: "",
});

const elRef = ref<HTMLSpanElement | null>(null);
const displayValue = ref<number>(props.start);
let animated = false;
let rafId = 0;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let observer: IntersectionObserver | null = null;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

onMounted(() => {
  const el = elRef.value;
  if (!el || animated) return;

  if (typeof IntersectionObserver === "undefined") {
    displayValue.value = props.target;
    animated = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || animated) return;
        animated = true;
        if (observer) observer.unobserve(entry.target);

        timeoutId = setTimeout(() => {
          const startTime = performance.now();
          const range = props.target - props.start;

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, Math.max(0, elapsed / props.duration));
            displayValue.value = Math.round(props.start + easeOutCubic(progress) * range);

            if (progress < 1) {
              rafId = requestAnimationFrame(tick);
            } else {
              displayValue.value = props.target;
            }
          };

          rafId = requestAnimationFrame(tick);
        }, props.delay);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(el);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  if (timeoutId) clearTimeout(timeoutId);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
