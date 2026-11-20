<template>
  <div :class="$attrs.class" data-invite-teammates
    class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
      <h4 data-invite-teammates-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</h4>
      <p data-invite-teammates-description class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {{ description }}
      </p>
    </div>

    <div class="px-5 py-4">
      <div data-invite-teammates-composer
        class="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900">
        <input ref="inputEl" type="email" data-invite-teammates-input v-model="draft" :placeholder="emailPlaceholder"
          class="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder-zinc-500"
          @keydown.enter.prevent="submit()" />
        <select data-invite-teammates-role v-model="selectedRole" aria-label="Invite role"
          class="shrink-0 rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none">
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
        <button type="button" data-invite-teammates-add aria-label="Add teammate" @click="submit()"
          class="shrink-0 rounded bg-zinc-900 p-1 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <UiIcon name="plus" :size="12" />
        </button>
      </div>
      <p v-if="error" data-invite-teammates-error role="alert" class="mt-1.5 text-[11px] text-red-500">{{ error }}</p>

      <ul v-if="pending.length > 0" data-invite-teammates-list class="mt-3 space-y-1.5">
        <li v-for="invitee in pending" :key="invitee.email" :data-invite-teammates-row="invitee.email"
          class="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60">
          <UiIcon name="mail" :size="13" class="shrink-0 text-zinc-400 dark:text-zinc-500" />
          <span class="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">{{ invitee.email }}</span>
          <span class="shrink-0 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {{ invitee.role }}
          </span>
          <button type="button" data-invite-teammates-remove :aria-label="`Remove ${invitee.email}`"
            class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            @click="emit('remove', invitee)">
            <UiIcon name="x" :size="11" />
          </button>
        </li>
      </ul>
    </div>

    <div class="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
      <button type="button" data-invite-teammates-send :disabled="pending.length === 0"
        :class="['rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          pending.length > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500']"
        @click="pending.length > 0 && emit('send', pending)">
        {{ sendLabel }}
      </button>
      <button type="button" data-invite-teammates-skip
        class="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="emit('skip')">
        {{ skipLabel }}
      </button>
      <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{{ pending.length }} pending</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface Invitee {
  email: string;
  role: string;
}

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  roles?: string[];
  defaultRole?: string;
  pending?: Invitee[];
  emailPlaceholder?: string;
  sendLabel?: string;
  skipLabel?: string;
}>(), {
  title: 'Invite your teammates',
  description: 'Collaboration is better together. Add teammates by email to get started.',
  roles: () => ['Admin', 'Editor', 'Viewer'],
  defaultRole: '',
  pending: () => [],
  emailPlaceholder: 'teammate@company.com',
  sendLabel: 'Send invites',
  skipLabel: 'Skip for now',
});

const emit = defineEmits<{
  (e: 'invite', invitee: Invitee): void;
  (e: 'remove', invitee: Invitee): void;
  (e: 'send', invitees: Invitee[]): void;
  (e: 'skip'): void;
}>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputEl = ref<HTMLInputElement | null>(null);

const draft = ref('');
const error = ref('');
const selectedRole = ref(props.defaultRole || props.roles[0] || 'Viewer');

const submit = () => {
  const email = draft.value.trim();
  if (!email) return;
  if (!EMAIL_RE.test(email)) {
    error.value = 'Enter a valid email address.';
    return;
  }
  if (props.pending.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
    error.value = 'That teammate is already on the list.';
    return;
  }
  error.value = '';
  draft.value = '';
  emit('invite', { email, role: selectedRole.value });
};
</script>
