<template>
  <div :class="$attrs.class" data-workspace-survey
    class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
      <h4 data-workspace-survey-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</h4>
      <p v-if="stepLabel" data-workspace-survey-step class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        {{ stepLabel }}
      </p>
      <div data-workspace-survey-dots class="mt-3 flex items-center gap-1.5">
        <span v-for="q in questions" :key="q.id" :title="q.label"
          :class="['h-1.5 w-6 rounded-full transition-colors', isFilled(q) ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700']" />
        <span class="ml-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {{ answeredCount }}/{{ questions.length }}
        </span>
      </div>
    </div>

    <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="q in questions" :key="q.id" :data-workspace-survey-question="q.id" class="px-5 py-4">
        <div class="text-xs font-medium text-zinc-800 dark:text-zinc-200">{{ q.label }}</div>
        <p v-if="q.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{{ q.description }}</p>
        <div :data-workspace-survey-options="q.id" :role="q.multi ? 'group' : 'radiogroup'" :aria-label="q.label"
          class="mt-2.5 flex flex-wrap gap-1.5">
          <button v-for="opt in q.options" :key="opt.id" type="button" :data-workspace-survey-option="opt.id"
            :aria-pressed="q.multi ? selectedIds(q).includes(opt.id) : undefined"
            :aria-checked="q.multi ? undefined : selectedIds(q).includes(opt.id)"
            :class="['rounded-full border px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              selectedIds(q).includes(opt.id)
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400']"
            @click="emit('answer', q.id, opt.id)">
            {{ opt.label }}
          </button>
        </div>
        <input v-if="q.placeholder" type="text" :data-workspace-survey-input="q.id" :placeholder="q.placeholder"
          class="mt-2.5 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          @input="emit('text', q.id, ($event.target)?.value ?? '')" />
      </div>
    </div>

    <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
      <button type="button" data-workspace-survey-next :disabled="!allAnswered"
        :class="['w-full rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          allAnswered
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500']"
        @click="emit('next')">
        {{ nextLabel }}
      </button>
      <p v-if="!allAnswered" class="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Answer all {{ questions.length }} questions to continue.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SurveyQuestion {
  id: string;
  label: string;
  description?: string;
  options: { id: string; label: string }[];
  multi?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<{
  title?: string;
  stepLabel?: string;
  questions: SurveyQuestion[];
  answers?: Record<string, string | string[]>;
  nextLabel?: string;
}>(), {
  title: 'Tell us about your workspace',
  stepLabel: '',
  answers: () => ({}),
  nextLabel: 'Continue',
});

const emit = defineEmits<{
  (e: 'answer', questionId: string, optionId: string): void;
  (e: 'text', questionId: string, text: string): void;
  (e: 'next'): void;
}>();

const selectedIds = (q: SurveyQuestion): string[] => {
  const a = props.answers[q.id];
  if (Array.isArray(a)) return a;
  return typeof a === 'string' && a.length > 0 ? [a] : [];
};

const isFilled = (q: SurveyQuestion): boolean => selectedIds(q).length > 0;

const answeredCount = computed(() => props.questions.filter((q) => isFilled(q)).length);
const allAnswered = computed(() => props.questions.length > 0 && answeredCount.value === props.questions.length);
</script>
