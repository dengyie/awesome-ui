<script setup lang="ts">
export type GuardrailVerdict = 'pending' | 'approved' | 'rejected';

export interface GuardrailItem {
  id: string;
  author: string;
  content: string;
  reasons: string[];
  rule?: string;
  confidence?: number;
  verdict?: GuardrailVerdict;
}

interface Props {
  items?: GuardrailItem[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  title: 'Moderation queue',
});

const emit = defineEmits<{
  (e: 'approve', item: GuardrailItem): void;
  (e: 'reject', item: GuardrailItem): void;
}>();

const pending = props.items.filter((i) => (i.verdict ?? 'pending') === 'pending');
</script>

<template>
  <div
    data-guardrail-queue
    class="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span
        data-guardrail-count
        class="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-red-700 dark:bg-red-950/60 dark:text-red-300"
      >{{ pending.length }} flagged</span>
    </div>

    <div data-guardrail-list class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <template v-for="item in props.items" :key="item.id">
        <div
          v-if="(item.verdict ?? 'pending') !== 'pending'"
          :data-guardrail-resolved="item.id"
          class="flex items-center gap-2 px-4 py-2.5 text-[11px] text-zinc-400 dark:text-zinc-500"
        >
          <span
            class="inline rounded px-1.5 py-0.5 font-medium"
            :class="item.verdict === 'approved'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'"
          >{{ item.verdict === 'approved' ? '✓ Approved' : '✕ Rejected' }}</span>
          <span data-guardrail-resolved-author>{{ item.author }}</span>
          <span class="min-w-0 flex-1 truncate">{{ item.content }}</span>
        </div>
        <div v-else :data-guardrail-card="item.id" class="p-4">
          <div class="flex items-center gap-2">
            <span data-guardrail-author class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ item.author }}</span>
            <span
              v-if="typeof item.confidence === 'number'"
              data-guardrail-confidence
              class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
              :class="item.confidence >= 0.9
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
            >{{ Math.round(item.confidence * 100) }}% confidence</span>
            <span
              v-if="item.rule"
              data-guardrail-rule
              class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >{{ item.rule }}</span>
          </div>
          <p
            data-guardrail-content
            class="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
          >{{ item.content }}</p>
          <div v-if="item.reasons.length > 0" data-guardrail-reasons class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="reason in item.reasons"
              :key="reason"
              data-guardrail-reason
              class="inline rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
            >{{ reason }}</span>
          </div>
          <div class="mt-3 flex gap-2">
            <button
              type="button"
              data-guardrail-approve
              class="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
              @click="emit('approve', item)"
            >Approve</button>
            <button
              type="button"
              data-guardrail-reject
              class="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
              @click="emit('reject', item)"
            >Reject</button>
          </div>
        </div>
      </template>
      <p v-if="props.items.length === 0" data-guardrail-empty class="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        No flagged content in the queue.
      </p>
    </div>
  </div>
</template>
