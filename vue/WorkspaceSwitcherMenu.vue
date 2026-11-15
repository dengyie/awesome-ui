<template>
  <div data-workspace-switcher :class="['w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900', variant === 'page' ? 'max-w-sm p-5' : 'p-3']">
    <div v-if="title" :class="variant === 'page' ? '' : 'px-2 pt-1'">
      <p class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <p v-if="subtitle" class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{{ subtitle }}</p>
    </div>

    <ul :class="variant === 'page' ? 'mt-4 space-y-2' : 'mt-3 space-y-1'">
      <li v-for="workspace in workspaces" :key="workspace.id">
        <button
          type="button"
          :data-workspace-option="workspace.id"
          :class="['flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', workspace.current ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60']"
          @click="emit('select', workspace)"
        >
          <img v-if="workspace.logo" :src="workspace.logo" alt="" class="h-9 w-9 shrink-0 rounded-lg" />
          <span v-else class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">{{ initialsOf(workspace.name) }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{{ workspace.name }}</span>
            <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">{{ roleLine(workspace) }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </li>
    </ul>

    <button
      v-if="createLabel"
      type="button"
      data-workspace-create
      :class="['w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800', variant === 'page' ? 'mt-4' : 'mt-2']"
      @click="emit('create-new')"
    >
      {{ createLabel }}
    </button>

    <div v-if="footerUser" :class="['flex items-center gap-2.5 border-t border-zinc-200 pt-3 dark:border-zinc-800', variant === 'page' ? 'mt-4' : 'mt-3']">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">{{ footerUser.initials || initialsOf(footerUser.name) }}</span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{{ footerUser.name }}</span>
        <span class="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">{{ footerUser.email }}</span>
      </span>
      <button v-if="logoutLabel" type="button" data-workspace-logout class="shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('logout')">
        {{ logoutLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface WorkspaceOption {
  id: string;
  name: string;
  logo?: string;
  memberCount?: number;
  role?: string;
  current?: boolean;
}

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    workspaces?: WorkspaceOption[];
    footerUser?: { name: string; email: string; initials?: string };
    createLabel?: string;
    logoutLabel?: string;
    variant?: 'page' | 'dropdown';
  }>(),
  { title: 'Workspaces', subtitle: 'Choose the workspace you want to access', workspaces: () => [], footerUser: undefined, createLabel: '+ Create new workspace', logoutLabel: 'Log out', variant: 'page' },
);

const emit = defineEmits<{
  (e: 'select', workspace: WorkspaceOption): void;
  (e: 'create-new'): void;
  (e: 'logout'): void;
}>();

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');

const roleLine = (workspace: WorkspaceOption) => {
  const count = workspace.memberCount ?? 1;
  let line = `${count} member${count === 1 ? '' : 's'}`;
  if (workspace.role) {
    const article = workspace.role.startsWith('A') || workspace.role.startsWith('E') ? 'an' : 'a';
    line += ` · You are ${article} ${workspace.role}`;
  }
  return line;
};
</script>
