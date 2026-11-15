<script setup lang="ts">
export interface AccessPerson {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ShareAccessDialogProps {
  open?: boolean;
  title?: string;
  description?: string;
  url?: string;
  copyLabel?: string;
  people?: AccessPerson[];
  class?: string;
}

const props = withDefaults(defineProps<ShareAccessDialogProps>(), {
  open: true,
  title: 'Share Conversation',
  description:
    'Invite teammates to view this conversation. Everyone with access will see future replies.',
  url: 'https://example.com/share/abc123',
  copyLabel: 'COPY LINK',
  people: () => [],
});

const emit = defineEmits<{
  (e: 'copy-link'): void;
  (e: 'close'): void;
  (e: 'remove-person', person: AccessPerson): void;
}>();

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
</script>

<template>
  <div
    v-if="props.open"
    data-share-access-backdrop
    class="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4"
    :class="props.class"
  >
    <div
      data-share-access-dialog
      class="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 data-share-access-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h4>
          <p data-share-access-description class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {{ props.description }}
          </p>
        </div>
        <button
          type="button"
          data-share-access-close
          aria-label="Close share dialog"
          class="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div data-share-access-invite class="mt-4">
        <input
          type="email"
          data-share-access-input
          placeholder="Add people by name or email"
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
        />
      </div>

      <div
        data-share-access-people
        class="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700"
      >
        <p
          v-if="props.people.length === 0"
          data-share-access-empty
          class="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500"
        >
          No people have access yet.
        </p>
        <template v-else>
          <div
            v-for="person in props.people"
            :key="person.id"
            :data-access-person="person.id"
            class="flex items-center gap-3 px-3 py-2.5"
          >
          <span
            aria-hidden="true"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
          >
            {{ initials(person.name) }}
          </span>
          <div class="min-w-0 flex-1">
            <p data-access-person-name class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ person.name }}</p>
            <p data-access-person-email class="truncate text-[11px] text-zinc-400 dark:text-zinc-500">{{ person.email }}</p>
          </div>
          <span
            v-if="person.role"
            data-access-person-role
            class="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {{ person.role }}
          </span>
          <button
            type="button"
            data-access-person-remove
            :aria-label="`Remove ${person.name}`"
            class="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
            @click="emit('remove-person', person)"
          >
            ✕
          </button>
          </div>
        </template>
      </div>

      <div
        data-share-access-url
        class="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60"
      >
        <span data-share-access-url-text class="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          {{ props.url }}
        </span>
        <button
          type="button"
          data-share-access-copy
          class="shrink-0 rounded bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          @click="emit('copy-link')"
        >
          {{ props.copyLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
