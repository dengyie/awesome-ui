<template>
  <div :class="className">
    <p v-if="comments.length === 0" class="py-4 text-center text-[11px] text-zinc-400">{{ emptyText }}</p>
    <ul v-else class="space-y-2.5">
      <li
        v-for="row in rows"
        :key="row.comment.id"
        :class="row.depth > 0 ? 'border-l border-zinc-200 pl-3 dark:border-zinc-700' : ''"
      >
        <div class="flex items-start gap-2">
          <span
            :class="[
              'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200',
              row.depth > 0 ? 'h-5 w-5' : 'h-6 w-6',
            ]"
          >
            <img v-if="row.comment.avatar" :src="row.comment.avatar" alt="" class="h-full w-full object-cover" />
            <template v-else>{{ initials(row.comment.author) }}</template>
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span class="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{{ row.comment.author }}</span>
              <span v-if="row.comment.time" class="text-[10px] text-zinc-400">{{ row.comment.time }}</span>
              <span
                v-if="row.comment.resolved"
                class="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <UiIcon name="check" :size="9" />
                Resolved
              </span>
            </div>
            <p class="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {{ row.comment.text }}
            </p>

            <div class="mt-1 flex items-center gap-3 text-[10px] text-zinc-400">
              <button
                type="button"
                :aria-label="`Like comment by ${row.comment.author}`"
                class="inline-flex items-center gap-1 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                @click="emit('like', row.comment)"
              >
                <UiIcon name="thumbs-up" :size="11" />
                <span class="tabular-nums">{{ row.comment.likes || 0 }}</span>
              </button>
              <button
                type="button"
                :aria-expanded="replyTo === row.comment.id"
                class="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                @click="toggleReply(row.comment.id)"
              >
                Reply
              </button>
              <button
                type="button"
                class="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                @click="emit('resolve', row.comment)"
              >
                {{ row.comment.resolved ? 'Reopen' : 'Resolve' }}
              </button>
            </div>

            <div v-if="replyTo === row.comment.id" class="mt-2 flex items-end gap-1.5">
              <textarea
                v-model="replyDraft"
                rows="2"
                :placeholder="`Reply to ${row.comment.author}...`"
                :aria-label="`Reply to ${row.comment.author}`"
                class="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />
              <button
                type="button"
                :disabled="!replyDraft.trim()"
                class="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                @click="submitReply(row.comment.id)"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="allowComment" class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <textarea
        v-model="draft"
        rows="2"
        :placeholder="placeholder"
        :aria-label="placeholder"
        class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
      />
      <div class="mt-1.5 flex justify-end">
        <button
          type="button"
          :disabled="!draft.trim()"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          @click="submitRoot"
        >
          {{ submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

export interface CommentItem {
  id: string | number;
  /** Parent comment id; omit or null for a root comment. */
  parentId?: string | number | null;
  author: string;
  /** Image URL; falls back to initials. */
  avatar?: string;
  text: string;
  time?: string;
  likes?: number;
  resolved?: boolean;
}

const props = withDefaults(
  defineProps<{
    comments?: CommentItem[];
    placeholder?: string;
    submitText?: string;
    allowComment?: boolean;
    emptyText?: string;
    className?: string;
  }>(),
  {
    comments: () => [],
    placeholder: 'Write a comment...',
    submitText: 'Comment',
    allowComment: true,
    emptyText: 'No comments yet. Start the conversation.',
    className: '',
  }
);

const emit = defineEmits<{
  (e: 'submit', text: string, parentId: string | number | null): void;
  (e: 'like', comment: CommentItem): void;
  (e: 'resolve', comment: CommentItem): void;
}>();

const draft = ref('');
const replyTo = ref<string | number | null>(null);
const replyDraft = ref('');

/** Flat comments + parentId → depth-tagged render order (parents before children). */
const rows = computed(() => {
  const children = new Map<string, CommentItem[]>();
  const roots: CommentItem[] = [];
  props.comments.forEach((comment) => {
    if (comment.parentId == null) {
      roots.push(comment);
      return;
    }
    const key = String(comment.parentId);
    children.set(key, [...(children.get(key) || []), comment]);
  });

  const out: Array<{ comment: CommentItem; depth: number }> = [];
  const walk = (list: CommentItem[], depth: number) => {
    list.forEach((comment) => {
      out.push({ comment, depth });
      // Cap nesting at 3 levels so deep threads never break the layout.
      if (depth < 2) walk(children.get(String(comment.id)) || [], depth + 1);
      else (children.get(String(comment.id)) || []).forEach((child) => out.push({ comment: child, depth: depth + 1 }));
    });
  };
  walk(roots, 0);
  return out;
});

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

function toggleReply(id: string | number) {
  replyTo.value = replyTo.value === id ? null : id;
  replyDraft.value = '';
}

function submitRoot() {
  const text = draft.value.trim();
  if (!text) return;
  emit('submit', text, null);
  draft.value = '';
}

function submitReply(parentId: string | number) {
  const text = replyDraft.value.trim();
  if (!text) return;
  emit('submit', text, parentId);
  replyDraft.value = '';
  replyTo.value = null;
}
</script>
