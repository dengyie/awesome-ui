<template>
  <section
    data-approval-card
    :class="`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        <UiIcon name="check-circle" :size="14" class="shrink-0 text-zinc-400" />
        <span class="truncate">{{ title }}</span>
      </h3>
      <span class="shrink-0 font-mono text-[10px] font-medium text-zinc-400">
        {{ approvedCount }}/{{ approvers.length }}
      </span>
    </div>

    <dl class="mt-3 space-y-2 text-xs">
      <div class="flex items-center gap-2">
        <dt class="w-20 shrink-0 text-zinc-400">Approvers</dt>
        <dd class="flex items-center -space-x-1">
          <span
            v-for="(approver, index) in approvers"
            :key="`${approver.initials}-${index}`"
            :title="approver.initials"
            :class="`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white ring-2 ring-white dark:border-zinc-900 dark:ring-zinc-900 ${avatarTone(approver.tone)}`"
          >
            {{ approver.initials }}
          </span>
          <button
            v-if="onRequestChange"
            type="button"
            aria-label="Add approver"
            @click="handleRequestChange"
            class="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600"
          >
            <UiIcon name="plus" :size="11" />
          </button>
        </dd>
      </div>
      <div v-if="dueDate" class="flex items-center gap-2">
        <dt class="w-20 shrink-0 text-zinc-400">Due date</dt>
        <dd class="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-200">
          <UiIcon name="calendar" :size="12" class="text-zinc-400" />
          {{ dueDate }}
        </dd>
      </div>
      <div class="flex items-center gap-2">
        <dt class="w-20 shrink-0 text-zinc-400">Decision</dt>
        <dd
          data-approval-decision
          :class="`flex items-center gap-1 font-medium capitalize ${decisionTone.className}`"
        >
          <UiIcon :name="decisionTone.icon" :size="12" />
          {{ decision }}
        </dd>
      </div>
    </dl>

    <p
      v-if="note"
      class="mt-3 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
    >
      {{ note }}
    </p>

    <div v-if="onApprove || onReject" class="mt-3 flex items-center gap-2">
      <button
        v-if="onReject"
        type="button"
        data-approval-reject
        @click="handleReject"
        class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Request change
      </button>
      <button
        v-if="onApprove"
        type="button"
        data-approval-approve
        @click="handleApprove"
        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        Approve
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface ApprovalApprover {
  initials: string;
  tone?: 'indigo' | 'emerald' | 'rose' | 'amber';
}

const props = withDefaults(
  defineProps<{
    title: string;
    approvers: ApprovalApprover[];
    approvedCount?: number;
    dueDate?: string;
    decision?: 'approved' | 'rejected' | 'pending';
    note?: string;
    onRequestChange?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    className?: string;
  }>(),
  { approvedCount: 0, decision: 'pending', className: '' }
);

const emit = defineEmits<{
  (e: 'request-change'): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
}>();

const DECISION_TONE: Record<string, { icon: IconName; className: string }> = {
  approved: { icon: 'check-circle', className: 'text-emerald-600' },
  rejected: { icon: 'circle-x', className: 'text-rose-600' },
  pending: { icon: 'clock', className: 'text-zinc-400' },
};

const decisionTone = computed(() => DECISION_TONE[props.decision] || DECISION_TONE.pending);

const avatarTone = (tone?: string) => {
  if (tone === 'emerald') return 'bg-emerald-600';
  if (tone === 'rose') return 'bg-rose-600';
  if (tone === 'amber') return 'bg-amber-500';
  return 'bg-indigo-600';
};

const handleRequestChange = () => {
  props.onRequestChange?.();
  emit('request-change');
};
const handleApprove = () => {
  props.onApprove?.();
  emit('approve');
};
const handleReject = () => {
  props.onReject?.();
  emit('reject');
};
</script>
