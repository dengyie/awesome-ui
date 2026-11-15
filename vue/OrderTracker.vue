<template>
  <div data-order-tracker class="w-full">
    <template v-if="variant === 'bar'">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div :data-tracker-fill="'true'" :class="['h-full rounded-full transition-all', canceled ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-emerald-600']" :style="{ width: `${progress}%` }" />
      </div>
      <div class="mt-2 flex justify-between">
        <span
          v-for="(stage, index) in stages"
          :key="stage.id"
          :data-tracker-stage="stage.id"
          :class="['text-[10px] font-medium', isCurrent(index) ? 'font-bold text-zinc-900 dark:text-zinc-50' : reached(index) ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600']"
        >{{ stage.label }}</span>
      </div>
      <p v-if="canceled && canceledReason" class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{{ canceledReason }}</p>
    </template>
    <template v-else>
      <p v-if="eta && !canceled" class="mb-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
        {{ eta }}<span v-if="trackingNumber" class="ml-2 font-normal text-zinc-400">· {{ trackingNumber }}</span>
      </p>
      <p v-if="canceled" class="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">Canceled<template v-if="canceledReason"> — {{ canceledReason }}</template></p>
      <ol class="flex items-start">
        <li v-for="(stage, index) in stages" :key="stage.id" :data-tracker-stage="stage.id" class="flex min-w-0 flex-1 items-start">
          <span class="flex flex-col items-center">
            <span :class="['flex h-4 w-4 shrink-0 items-center justify-center rounded-full', isCurrent(index) ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-900' : '', reached(index) ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700']">
              <svg v-if="reached(index)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <span :class="['mt-1 whitespace-nowrap text-[10px] font-medium', isCurrent(index) ? 'text-zinc-900 dark:text-zinc-50' : reached(index) ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600']">{{ stage.label }}</span>
            <span v-if="stage.timestamp" class="text-[9px] text-zinc-400 dark:text-zinc-600">{{ stage.timestamp }}</span>
          </span>
          <span v-if="index < stages.length - 1" :class="['mx-1 mt-2 h-0.5 flex-1', reached(index) && index < currentIndex ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700']" />
        </li>
      </ol>
      <button v-if="trackingUrl" type="button" data-tracker-track class="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400" @click="emit('track')">Track shipment &gt;</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface TrackerStage {
  id: string;
  label: string;
  timestamp?: string;
}

const props = withDefaults(
  defineProps<{
    stages: TrackerStage[];
    current: number | 'canceled';
    variant?: 'dots' | 'bar';
    eta?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    canceledReason?: string;
  }>(),
  { variant: 'dots' },
);

const emit = defineEmits<{ (e: 'track'): void }>();

const canceled = computed(() => props.current === 'canceled');
const currentIndex = computed(() => (canceled.value ? -1 : (props.current as number)));
const progress = computed(() => Math.round(((currentIndex.value + 1) / props.stages.length) * 100));

const reached = (index: number) => !canceled.value && index <= currentIndex.value;
const isCurrent = (index: number) => !canceled.value && index === currentIndex.value;
</script>
