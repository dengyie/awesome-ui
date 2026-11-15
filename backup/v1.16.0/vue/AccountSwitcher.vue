<template>
  <div ref="rootRef" :class="className" class="relative inline-block text-left">
    <button
      v-if="current"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="open"
      class="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      @click="setOpen(!open)"
    >
      <span
        class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
      >
        <img v-if="current.avatar" :src="current.avatar" alt="" class="h-full w-full object-cover" />
        <template v-else>{{ initials(current.name) }}</template>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{{ current.name }}</span>
        <span v-if="current.email" class="block truncate text-[10px] text-zinc-400">{{ current.email }}</span>
      </span>
      <UiIcon name="chevron-down" :size="12" class="shrink-0 text-zinc-400" />
    </button>

    <div
      v-if="open && current"
      role="menu"
      aria-label="Switch account"
      class="absolute left-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      <ul class="max-h-64 overflow-y-auto py-1">
        <li v-for="account in accounts" :key="account.id">
          <button
            type="button"
            role="menuitemradio"
            :aria-checked="account.id === current.id"
            class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60"
            @click="choose(account)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <img v-if="account.avatar" :src="account.avatar" alt="" class="h-full w-full object-cover" />
              <template v-else>{{ initials(account.name) }}</template>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{{ account.name }}</span>
              <span class="block truncate text-[10px] text-zinc-400">
                {{ [account.role, account.plan].filter(Boolean).join(' · ') || account.email }}
              </span>
            </span>
            <UiIcon
              v-if="account.id === current.id"
              name="check"
              :size="12"
              class="shrink-0 text-indigo-600 dark:text-indigo-400"
            />
          </button>
        </li>
      </ul>

      <div class="border-t border-zinc-100 py-1 dark:border-zinc-800">
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
          @click="addAccount"
        >
          <UiIcon name="plus" :size="12" class="text-zinc-400" />
          Add account
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          @click="signOut"
        >
          <UiIcon name="arrow-right" :size="12" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import UiIcon from './UiIcon.vue';

export interface Account {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  plan?: string;
}

const props = withDefaults(
  defineProps<{
    accounts?: Account[];
    currentId?: string;
    className?: string;
  }>(),
  { accounts: () => [], currentId: '', className: '' }
);

const emit = defineEmits<{
  (e: 'switch', account: Account): void;
  (e: 'add-account'): void;
  (e: 'sign-out'): void;
  (e: 'open-change', open: boolean): void;
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const current = computed(() => props.accounts.find((account) => account.id === props.currentId) || props.accounts[0]);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function setOpen(next: boolean) {
  open.value = next;
  emit('open-change', next);
}

function choose(account: Account) {
  emit('switch', account);
  setOpen(false);
}

function addAccount() {
  emit('add-account');
  setOpen(false);
}

function signOut() {
  emit('sign-out');
  setOpen(false);
}

function onPointerDown(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) setOpen(false);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') setOpen(false);
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
  } else {
    document.removeEventListener('mousedown', onPointerDown);
    document.removeEventListener('keydown', onKeyDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointerDown);
  document.removeEventListener('keydown', onKeyDown);
});
</script>
