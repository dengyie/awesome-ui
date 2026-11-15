<template>
  <div v-if="!messages.length"
    :class="`rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 ${className}`">
    {{ emptyText }}
  </div>
  <div v-else
    :class="`divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 ${className}`">
    <div v-for="message in messages" :key="message.id" role="button" tabindex="0"
      :aria-current="String(message.id) === String(activeId) ? 'true' : undefined"
      @click="emit('select', message)"
      @keydown.enter.prevent="emit('select', message)"
      @keydown.space.prevent="emit('select', message)"
      :class="`flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors ${
        String(message.id) === String(activeId)
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
      }`">
      <span class="flex w-2 shrink-0 pt-1.5">
        <span v-if="message.unread" class="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-label="Unread"></span>
      </span>
      <span class="w-36 shrink-0 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        {{ message.sender }}<span v-if="message.count" class="ml-1 font-normal text-zinc-400">{{ message.count }}</span>
      </span>
      <span class="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
        <span v-if="message.tag"
          :class="`mr-1.5 inline-block rounded px-1.5 py-px align-middle font-mono text-[9.5px] font-medium ${TAG_TONE[message.tagTone || 'rose']}`">
          {{ message.tag }}
        </span>
        <span :class="`font-medium text-zinc-800 dark:text-zinc-200 ${message.unread ? '' : 'font-normal'}`">
          {{ message.subject }}
        </span>
        <span v-if="message.snippet" class="text-zinc-400"> — {{ message.snippet }}</span>
      </span>
      <span class="shrink-0 pt-px font-mono text-[10px] uppercase text-zinc-400">{{ message.dateLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface InboxMessage {
  id: string | number;
  sender: string;
  count?: number;
  subject: string;
  snippet?: string;
  dateLabel: string;
  unread?: boolean;
  tag?: string;
  tagTone?: 'rose' | 'emerald' | 'indigo';
}

withDefaults(
  defineProps<{
    messages?: InboxMessage[];
    activeId?: string | number | null;
    emptyText?: string;
    className?: string;
  }>(),
  { messages: () => [], activeId: null, emptyText: 'Inbox zero — enjoy your day' }
);

const emit = defineEmits<{
  (e: 'select', message: InboxMessage): void;
}>();

const TAG_TONE: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
};
</script>
