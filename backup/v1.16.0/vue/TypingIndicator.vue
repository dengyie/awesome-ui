<template>
  <div
    class="inline-flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400"
    :class="className"
    role="status"
    :aria-label="label || 'Loading'"
  >
    <span class="inline-flex items-center" :class="gapClass">
      <span
        v-for="i in 3"
        :key="i"
        class="rounded-full bg-current"
        :class="[dotClass, variant === 'pulse' ? 'animate-pulse' : 'animate-bounce']"
        :style="{ animationDelay: `${(i - 1) * 160}ms` }"
      ></span>
    </span>
    <span v-if="label" class="text-xs font-sans">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    variant?: "dots" | "pulse";
    size?: "sm" | "md" | "lg";
    className?: string;
  }>(),
  {
    variant: "dots",
    size: "md",
    className: "",
  }
);

const dotClass = computed(() =>
  props.size === "sm" ? "w-1.5 h-1.5" : props.size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2"
);
const gapClass = computed(() =>
  props.size === "sm" ? "gap-1" : props.size === "lg" ? "gap-2" : "gap-1.5"
);
</script>
