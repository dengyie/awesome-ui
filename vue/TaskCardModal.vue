<script setup lang="ts">
import { ref } from "vue";

export interface TaskCardMember {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
}

export interface TaskCardLabel {
  id: string;
  label: string;
  color: string;
}

export interface TaskCardChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskCardAttachment {
  id: string;
  name: string;
  meta: string;
  kind?: "link" | "file";
}

export interface TaskCardComment {
  id: string;
  author: string;
  initials?: string;
  text: string;
  time: string;
}

export interface TaskCardModalProps {
  title?: string;
  completed?: boolean;
  members?: TaskCardMember[];
  labels?: TaskCardLabel[];
  dates?: string;
  description?: string;
  attachments?: TaskCardAttachment[];
  checklist?: TaskCardChecklistItem[];
  comments?: TaskCardComment[];
  commentPlaceholder?: string;
  class?: string;
}

const props = withDefaults(defineProps<TaskCardModalProps>(), {
  title: "Design landing page hero",
  completed: false,
  members: () => [
    { id: "m1", name: "Jane Smith", initials: "JS" },
    { id: "m2", name: "Omar Diallo", initials: "OD" },
  ],
  labels: () => [
    { id: "l1", label: "Design", color: "bg-violet-500" },
    { id: "l2", label: "Web", color: "bg-emerald-500" },
  ],
  dates: "Nov 10 – Nov 24",
  description: "Hero section with headline, product screenshot and a primary CTA. Keep it consistent with the brand palette.",
  attachments: () => [
    { id: "a1", name: "Brand guidelines", meta: "notion.so/brand", kind: "link" },
    { id: "a2", name: "hero-spec.pdf", meta: "1.2 MB · added Nov 12", kind: "file" },
  ],
  checklist: () => [
    { id: "c1", text: "Collect references", done: true },
    { id: "c2", text: "Wireframe variants", done: true },
    { id: "c3", text: "High-fidelity mockup", done: false },
    { id: "c4", text: "Dev handoff notes", done: false },
  ],
  comments: () => [
    { id: "k1", author: "Jane Smith", initials: "JS", text: "Draft uploaded, take a look at the spacing pass.", time: "2 hours ago" },
    { id: "k2", author: "Omar Diallo", initials: "OD", text: "Looks great — let's swap the CTA copy before handoff.", time: "1 hour ago" },
  ],
  commentPlaceholder: "Write a comment…",
  class: "",
});

const emit = defineEmits(["card-close", "complete-toggle", "checklist-toggle", "comment-submit"]);

const isCompleted = ref(props.completed);
const items = ref<TaskCardChecklistItem[]>([...props.checklist]);
const draft = ref("");

const doneCount = items.value.filter((i) => i.done).length;
const pct = items.value.length === 0 ? 0 : Math.round((doneCount / items.value.length) * 100);

const submitComment = () => {
  const text = draft.value.trim();
  if (!text) return;
  emit("comment-submit", text);
  draft.value = "";
};
</script>

<template>
  <div data-taskcard class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/60 p-4 sm:p-8" :class="props.class">
    <div data-taskcard-dialog role="dialog" aria-modal="true" :aria-label="props.title" class="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
      <div class="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div class="flex min-w-0 items-center gap-3">
          <button
            data-taskcard-complete
            type="button"
            :aria-pressed="isCompleted"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors"
            :class="isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-transparent hover:border-zinc-400 dark:border-zinc-600'"
            @click="isCompleted = !isCompleted; emit('complete-toggle', isCompleted)"
          >
            ✓
          </button>
          <h2 data-taskcard-title class="truncate text-lg font-bold" :class="isCompleted ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-50'">{{ props.title }}</h2>
        </div>
        <button data-taskcard-close type="button" aria-label="Close" class="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="emit('card-close')">✕</button>
      </div>

      <div class="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_240px]">
        <div class="min-w-0 space-y-5">
          <div data-taskcard-attrs class="flex flex-wrap gap-6">
            <div data-taskcard-members>
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Members</p>
              <div class="mt-1.5 flex gap-1.5">
                <span v-for="m in props.members" :key="m.id" :data-taskcard-member="m.id" :title="m.name" class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                  <img v-if="m.avatarUrl" :src="m.avatarUrl" :alt="m.name" class="h-8 w-8 rounded-full object-cover" />
                  <template v-else>{{ m.initials ?? m.name.slice(0, 2).toUpperCase() }}</template>
                </span>
              </div>
            </div>
            <div v-if="props.labels.length > 0" data-taskcard-labels>
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Labels</p>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <span v-for="l in props.labels" :key="l.id" :data-taskcard-label="l.id" class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold text-white" :class="l.color">{{ l.label }}</span>
              </div>
            </div>
            <div v-if="props.dates" data-taskcard-dates>
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Dates</p>
              <p class="mt-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{{ props.dates }}</p>
            </div>
          </div>

          <div data-taskcard-description>
            <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Description</p>
            <p class="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ props.description }}</p>
          </div>

          <div v-if="props.attachments.length > 0" data-taskcard-attachments>
            <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Attachments</p>
            <div class="mt-1.5 space-y-1.5">
              <div v-for="a in props.attachments" :key="a.id" :data-taskcard-attachment="a.id" class="flex items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <span aria-hidden="true" class="text-sm">{{ a.kind === 'file' ? '📄' : '🔗' }}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ a.name }}</p>
                  <p class="truncate text-xs text-zinc-400 dark:text-zinc-500">{{ a.meta }}</p>
                </div>
              </div>
            </div>
          </div>

          <div data-taskcard-checklist>
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Checklist</p>
              <span data-taskcard-checklist-count class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ pct }}%</span>
            </div>
            <div data-taskcard-checklist-bar class="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: pct + '%' }" />
            </div>
            <div class="mt-2 space-y-1">
              <button
                v-for="item in items"
                :key="item.id"
                :data-taskcard-checkitem="item.id"
                :data-taskcard-checkitem-done="item.done ? 'true' : 'false'"
                type="button"
                class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                @click="item.done = !item.done; emit('checklist-toggle', item)"
              >
                <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold" :class="item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-transparent dark:border-zinc-600'">✓</span>
                <span class="text-sm" :class="item.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'">{{ item.text }}</span>
              </button>
            </div>
          </div>
        </div>

        <aside data-taskcard-activity class="md:border-l md:border-zinc-200 md:pl-6 dark:md:border-zinc-800">
          <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Comments &amp; activity</p>
          <form data-taskcard-composer class="mt-3" @submit.prevent="submitComment">
            <textarea data-taskcard-input v-model="draft" :placeholder="props.commentPlaceholder" rows="3" class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            <button data-taskcard-send type="submit" class="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-40" :disabled="draft.trim() === ''">Comment</button>
          </form>
          <div data-taskcard-feed class="mt-4 space-y-3">
            <div v-for="c in props.comments" :key="c.id" :data-taskcard-comment="c.id" class="flex gap-2">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{{ c.initials ?? c.author.slice(0, 2).toUpperCase() }}</span>
              <div class="min-w-0">
                <p class="text-xs"><span class="font-semibold text-zinc-800 dark:text-zinc-100">{{ c.author }}</span> <span class="text-zinc-400 dark:text-zinc-500">{{ c.time }}</span></p>
                <p class="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{{ c.text }}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
