<script setup lang="ts">
export interface SharedChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
interface Props {
  appName?: string;
  title?: string;
  meta?: string;
  messages: SharedChatMessage[];
  ctaText?: string;
  ctaNote?: string;
}
const props = withDefaults(defineProps<Props>(), {
  appName: "ChatApp",
  title: "Shared conversation",
  ctaText: "Try it yourself",
});
const emit = defineEmits<{ (e: "cta"): void }>();
</script>

<template>
  <div data-shared-chat class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div data-shared-header class="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white" aria-hidden="true">{{ props.appName.slice(0, 1) }}</span>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
        <p v-if="meta" data-shared-meta class="text-xs text-zinc-500 dark:text-zinc-400">{{ props.appName }} · {{ meta }}</p>
      </div>
    </div>
    <div class="space-y-3 px-4 py-4">
      <div v-for="msg in messages" :key="msg.id" :data-shared-msg="msg.id" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <p
          :data-shared-role="msg.role"
          class="max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
          :class="msg.role === 'user'
            ? 'rounded-br-sm bg-indigo-600 text-white'
            : 'rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'"
        >
          {{ msg.text }}
        </p>
      </div>
    </div>
    <div class="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
      <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ ctaNote || 'This conversation is read-only.' }}</p>
      <button
        type="button"
        data-shared-cta
        @click="emit('cta')"
        class="shrink-0 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {{ ctaText }}
      </button>
    </div>
  </div>
</template>
