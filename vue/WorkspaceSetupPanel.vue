<template>
  <div :class="$attrs.class" data-workspace-setup
    class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
      <h4 data-workspace-setup-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</h4>
      <p data-workspace-setup-count class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        {{ allDone ? 'All steps complete — your workspace is ready.' : `${doneCount} of ${totalCount} steps complete` }}
      </p>
    </div>

    <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="section in sections" :key="section.id" :data-workspace-setup-section="section.id" class="px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{{ section.title }}</span>
          <span :data-workspace-setup-section-count="section.id"
            :class="['rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
              sectionDone(section) === section.tasks.length
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400']">
            {{ sectionDone(section) }}/{{ section.tasks.length }}
          </span>
        </div>
        <ul class="mt-2 space-y-1.5">
          <li v-for="task in section.tasks" :key="task.id" :data-workspace-setup-task="task.id">
            <button type="button"
              class="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              @click="emit('task-click', section, task)">
              <span
                :class="['flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                  task.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600']">
                <UiIcon v-if="task.done" name="check" :size="8" />
              </span>
              <span
                :class="['min-w-0 flex-1 truncate text-xs',
                  task.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-700 dark:text-zinc-200']">
                {{ task.label }}
              </span>
              <UiIcon v-if="!task.done" name="arrow-right" :size="12" class="shrink-0 text-zinc-300 dark:text-zinc-600" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="upNext.length > 0" class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
      <div class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Up next</div>
      <div data-workspace-setup-up-next class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button v-for="card in upNext" :key="card.id" type="button" :data-workspace-setup-next-card="card.id"
          class="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="emit('up-next', card)">
          <div class="text-xs font-medium text-zinc-800 dark:text-zinc-200">{{ card.title }}</div>
          <div v-if="card.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {{ card.description }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export interface SetupSection {
  id: string;
  title: string;
  tasks: { id: string; label: string; done: boolean; href?: string }[];
}

export interface UpNextCard {
  id: string;
  title: string;
  description?: string;
}

const props = withDefaults(defineProps<{
  title?: string;
  sections: SetupSection[];
  upNext?: UpNextCard[];
}>(), {
  title: 'Workspace setup',
  upNext: () => [],
});

const emit = defineEmits<{
  (e: 'task-click', section: SetupSection, task: SetupSection['tasks'][number]): void;
  (e: 'up-next', card: UpNextCard): void;
}>();

const sectionDone = (section: SetupSection): number =>
  section.tasks.filter((t) => t.done).length;

const totalCount = computed(() => props.sections.reduce((sum, s) => sum + s.tasks.length, 0));
const doneCount = computed(() => props.sections.reduce((sum, s) => sum + sectionDone(s), 0));
const allDone = computed(() => totalCount.value > 0 && doneCount.value === totalCount.value);
</script>
