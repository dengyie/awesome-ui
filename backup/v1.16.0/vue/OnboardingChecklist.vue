<template>
  <div :class="$attrs.class" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{{ title }}</span>
        <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{{ doneCount }}/{{ total }}</span>
      </div>

      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div class="h-full rounded-full bg-indigo-600 transition-all duration-300" :style="{ width: `${percent}%` }" />
      </div>

      <div class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <template v-if="allDone">
          <UiIcon name="check-circle" :size="12" class="text-emerald-500" />
          <span class="text-emerald-600 dark:text-emerald-400">All set — nothing left to do.</span>
        </template>
        <span v-else>{{ percent }}% complete · {{ total - doneCount }} left</span>
      </div>
    </div>

    <ul class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <li v-for="task in tasks" :key="task.id" class="flex items-start gap-3 px-4 py-3">
        <button type="button" :aria-pressed="task.done"
          :aria-label="task.done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`"
          :class="['mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            task.done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-500']"
          @click="emit('toggle', task)">
          <UiIcon name="check" :size="10" />
        </button>

        <div class="min-w-0 flex-1">
          <div :class="['text-xs', task.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200']">
            {{ task.title }}
          </div>
          <div v-if="task.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {{ task.description }}
          </div>
        </div>

        <button v-if="!task.done && task.actionText" type="button"
          class="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="emit('action', task)">
          {{ task.actionText }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export interface OnboardingTask {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  actionText?: string;
}

const props = withDefaults(defineProps<{
  tasks: OnboardingTask[];
  title?: string;
}>(), { title: 'Get started' });

const emit = defineEmits<{
  (e: 'toggle', task: OnboardingTask): void;
  (e: 'action', task: OnboardingTask): void;
}>();

const total = computed(() => props.tasks.length);
const doneCount = computed(() => props.tasks.filter((task) => task.done).length);
const percent = computed(() => (total.value === 0 ? 0 : Math.round((doneCount.value / total.value) * 100)));
const allDone = computed(() => total.value > 0 && doneCount.value === total.value);
</script>
