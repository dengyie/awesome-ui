<script setup lang="ts">
export type CompareStatus = "done" | "streaming" | "error";
interface Props {
  prompt?: string;
  modelA?: string;
  modelB?: string;
  outputA?: string;
  outputB?: string;
  statusA?: CompareStatus;
  statusB?: CompareStatus;
  voteLabelA?: string;
  voteLabelB?: string;
  voteLabelTie?: string;
}
const props = withDefaults(defineProps<Props>(), {
  prompt: "",
  modelA: "Model A",
  modelB: "Model B",
  outputA: "",
  outputB: "",
  statusA: "done",
  statusB: "done",
  voteLabelA: "A is better",
  voteLabelB: "B is better",
  voteLabelTie: "Tie",
});
const emit = defineEmits<{ (e: "vote", choice: "A" | "B" | "tie"): void }>();

const ERROR_TEXT = "Generation failed — try again.";
</script>

<template>
  <div data-model-compare class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p v-if="props.prompt" data-compare-prompt class="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-zinc-800 dark:bg-indigo-950/40 dark:text-zinc-100">
      <span class="mr-1.5 font-semibold text-indigo-700 dark:text-indigo-300">Prompt</span>{{ props.prompt }}
    </p>
    <div class="grid gap-3 md:grid-cols-2">
      <div
        v-for="side in ['a', 'b'] as const"
        :key="side"
        :data-compare-col="side"
        class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/60"
      >
        <div class="flex items-center justify-between">
          <span :data-compare-model="side" class="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">{{ side === 'a' ? props.modelA : props.modelB }}</span>
          <span
            v-if="(side === 'a' ? props.statusA : props.statusB) !== 'done'"
            :data-compare-status="side"
            class="text-[11px] font-medium"
            :class="(side === 'a' ? props.statusA : props.statusB) === 'error' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'"
          >
            {{ (side === 'a' ? props.statusA : props.statusB) === 'error' ? 'error' : 'streaming' }}
            <span v-if="(side === 'a' ? props.statusA : props.statusB) === 'streaming'" class="ml-0.5 inline-flex gap-0.5" aria-hidden="true">
              <span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
              <span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
              <span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
            </span>
          </span>
        </div>
        <p
          :data-compare-output="side"
          class="mt-2 min-h-16 whitespace-pre-wrap text-sm leading-relaxed"
          :class="(side === 'a' ? props.statusA : props.statusB) === 'error' ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-100'"
        >
          {{ (side === 'a' ? props.statusA : props.statusB) === 'error' ? ERROR_TEXT : (side === 'a' ? props.outputA : props.outputB) }}
        </p>
      </div>
    </div>
    <div data-compare-votebar class="mt-3 grid grid-cols-3 gap-2">
      <button type="button" data-compare-vote="A" @click="emit('vote', 'A')" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">👈 {{ props.voteLabelA }}</button>
      <button type="button" data-compare-vote="tie" @click="emit('vote', 'tie')" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200">🤝 {{ props.voteLabelTie }}</button>
      <button type="button" data-compare-vote="B" @click="emit('vote', 'B')" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">👉 {{ props.voteLabelB }}</button>
    </div>
  </div>
</template>
