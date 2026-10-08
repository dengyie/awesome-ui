<template>
  <div v-if="role === 'system'" class="flex justify-center py-2" :class="className">
    <span class="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 rounded-full">
      <slot>{{ content }}</slot>
    </span>
  </div>

  <div v-else class="flex gap-3 py-3" :class="[isUser ? 'flex-row-reverse' : '', className]">
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name || role"
      class="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
    />
    <div
      v-else
      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      :class="isUser
        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'"
    >
      <UiIcon :name="isUser ? 'user' : 'sparkles'" :size="16" />
    </div>

    <div class="flex flex-col min-w-0 max-w-[85%]" :class="isUser ? 'items-end' : 'items-start'">
      <div v-if="name || timestamp" class="flex items-center gap-2 mb-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        <span v-if="name" class="font-medium">{{ name }}</span>
        <span v-if="timestamp" class="font-mono">{{ timestamp }}</span>
      </div>
      <div
        class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap"
        :class="isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'"
      >
        <slot>{{ content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiIcon from "./UiIcon.vue";

const props = withDefaults(
  defineProps<{
    role: "user" | "assistant" | "system";
    content?: string;
    name?: string;
    avatar?: string;
    timestamp?: string;
    className?: string;
  }>(),
  { className: "" }
);

const isUser = computed(() => props.role === "user");
</script>
