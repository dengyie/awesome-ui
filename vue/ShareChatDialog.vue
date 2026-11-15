<script setup lang="ts">
interface Props {
  open?: boolean;
  title?: string;
  description?: string;
  link?: string;
  shared?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  open: true,
  title: "Share chat",
  description: "Anyone with the link can view this conversation. Future messages aren't included.",
  link: "",
  shared: false,
});
const emit = defineEmits<{
  (e: "create-link"): void;
  (e: "copy-link"): void;
  (e: "toggle-shared", shared: boolean): void;
  (e: "close"): void;
}>();
</script>

<template>
  <div
    v-if="props.open"
    data-share-chat
    role="dialog"
    aria-modal="true"
    class="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-start justify-between">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h3>
      <button
        type="button"
        data-share-close
        aria-label="Close"
        @click="emit('close')"
        class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        ✕
      </button>
    </div>
    <p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div class="mt-3 space-y-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
      <button
        type="button"
        data-share-private
        @click="emit('toggle-shared', false)"
        :class="!props.shared ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'"
        class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors"
      >
        <span aria-hidden="true">🔒</span>
        <span class="min-w-0 flex-1">
          <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Keep private</span>
          <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">Only you have access</span>
        </span>
        <span v-if="!props.shared" class="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>
      </button>
      <button
        type="button"
        data-share-public
        @click="emit('toggle-shared', true)"
        :class="props.shared ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'"
        class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors"
      >
        <span aria-hidden="true">🌐</span>
        <span class="min-w-0 flex-1">
          <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Create public link</span>
          <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">Anyone with the link can view</span>
        </span>
        <span v-if="props.shared" class="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>
      </button>
    </div>

    <div v-if="props.shared" class="mt-3 flex items-center gap-2">
      <template v-if="props.link">
        <code
          data-share-link
          class="min-w-0 flex-1 truncate rounded-md bg-zinc-100 px-2.5 py-2 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >{{ props.link }}</code>
        <button
          type="button"
          data-share-copy
          @click="emit('copy-link')"
          class="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Copy link
        </button>
      </template>
      <button
        v-else
        type="button"
        data-share-create
        @click="emit('create-link')"
        class="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Create link
      </button>
    </div>
  </div>
</template>
