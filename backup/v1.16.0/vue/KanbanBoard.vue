<template>
  <div :class="className" class="flex gap-3 overflow-x-auto pb-2">
    <section
      v-for="column in columns"
      :key="column.id"
      :aria-label="column.title"
      :class="[
        'flex w-64 shrink-0 flex-col rounded-xl border p-2 transition-colors dark:bg-zinc-900/40',
        overColumn === column.id
          ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/20'
          : 'border-zinc-200 bg-zinc-50/60 dark:border-zinc-800',
      ]"
      @dragover.prevent="overColumn = column.id"
      @dragleave="overColumn = overColumn === column.id ? null : overColumn"
      @drop.prevent="drop(column.id)"
    >
      <header class="mb-2 flex items-center gap-1.5 px-1">
        <span :class="['h-2 w-2 shrink-0 rounded-full', column.accent || 'bg-zinc-400']" aria-hidden="true" />
        <h3 class="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          {{ column.title }}
        </h3>
        <span
          class="ml-auto shrink-0 rounded-full bg-zinc-200/70 px-1.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ column.limit ? `${cardsIn(column.id).length}/${column.limit}` : cardsIn(column.id).length }}
        </span>
        <button
          type="button"
          :aria-label="`Add card to ${column.title}`"
          class="shrink-0 rounded-md p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          @click="emit('add-card', column.id)"
        >
          <UiIcon name="plus" :size="12" />
        </button>
      </header>

      <div class="flex min-h-[3rem] flex-1 flex-col gap-2">
        <p
          v-if="cardsIn(column.id).length === 0"
          class="rounded-lg border border-dashed border-zinc-200 px-2 py-4 text-center text-[10px] text-zinc-400 dark:border-zinc-700"
        >
          Drop cards here
        </p>
        <div
          v-for="card in cardsIn(column.id)"
          :key="card.id"
          role="button"
          tabindex="0"
          draggable="true"
          :class="[
            'cursor-grab rounded-lg border border-zinc-200 bg-white p-2.5 text-left shadow-sm transition-all hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600',
            draggingId === card.id ? 'opacity-40' : '',
          ]"
          @dragstart="startDrag($event, card.id)"
          @dragend="resetDrag"
          @click="emit('card-click', card)"
          @keydown="onKeydown($event, card)"
        >
          <div class="flex items-start gap-1.5">
            <p class="min-w-0 flex-1 text-[11px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">
              {{ card.title }}
            </p>
            <span
              v-if="card.priority"
              :class="['shrink-0 rounded px-1 py-0.5 text-[9px] font-medium', PRIORITY_META[card.priority].cls]"
            >
              {{ PRIORITY_META[card.priority].label }}
            </span>
          </div>
          <p v-if="card.description" class="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
            {{ card.description }}
          </p>
          <div v-if="card.tags?.length || card.assignee" class="mt-1.5 flex items-center gap-1">
            <span
              v-for="tag in (card.tags || []).slice(0, 2)"
              :key="tag"
              class="rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
            >
              {{ tag }}
            </span>
            <span
              v-if="card.assignee"
              :title="card.assignee"
              class="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[8px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
            >
              {{ initials(card.assignee) }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiIcon from './UiIcon.vue';

export interface KanbanColumn {
  id: string;
  title: string;
  accent?: string;
  limit?: number;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags?: string[];
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

const PRIORITY_META: Record<NonNullable<KanbanCard['priority']>, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  high: { label: 'High', cls: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
};

const props = withDefaults(
  defineProps<{
    columns?: KanbanColumn[];
    cards?: KanbanCard[];
    className?: string;
  }>(),
  { columns: () => [], cards: () => [], className: '' }
);

const emit = defineEmits<{
  (e: 'move-card', cardId: string, toColumnId: string): void;
  (e: 'card-click', card: KanbanCard): void;
  (e: 'add-card', columnId: string): void;
}>();

const draggingId = ref<string | null>(null);
const overColumn = ref<string | null>(null);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const cardsIn = (columnId: string) => props.cards.filter((card) => card.columnId === columnId);

function move(cardId: string, toColumnId: string) {
  const card = props.cards.find((entry) => entry.id === cardId);
  if (!card || card.columnId === toColumnId) return;
  emit('move-card', cardId, toColumnId);
}

function startDrag(event: DragEvent, cardId: string) {
  event.dataTransfer?.setData('text/plain', cardId);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  draggingId.value = cardId;
}

function resetDrag() {
  draggingId.value = null;
  overColumn.value = null;
}

function drop(columnId: string) {
  const cardId = draggingId.value;
  if (cardId) move(cardId, columnId);
  resetDrag();
}

function onKeydown(event: KeyboardEvent, card: KanbanCard) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('card-click', card);
    return;
  }
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const index = props.columns.findIndex((column) => column.id === card.columnId);
  const next = props.columns[index + (event.key === 'ArrowRight' ? 1 : -1)];
  if (!next) return;
  event.preventDefault();
  move(card.id, next.id);
}
</script>
