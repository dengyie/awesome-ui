<script setup lang="ts">
import { ref } from "vue";

export type PermissionCellState = "edit" | "view" | "none" | "na";

export interface PermissionRow {
  id: string;
  label: string;
  cells: PermissionCellState[];
}

export interface PermissionGroup {
  id: string;
  title: string;
  rows: PermissionRow[];
}

export interface PermissionMatrixProps {
  title?: string;
  description?: string;
  roles?: string[];
  groups?: PermissionGroup[];
  class?: string;
}

const props = withDefaults(defineProps<PermissionMatrixProps>(), {
  title: "Roles",
  description: "Roles are bundles of permissions related to managing your security and compliance program. They ensure that team members have access to only what they need to complete their work.",
  roles: () => ["Editor", "Auditor", "View only admin", "Sales admin"],
  groups: () => [
    {
      id: "employee",
      title: "Employee Experience",
      rows: [
        { id: "onboarding", label: "Can complete new hire onboarding tasks", cells: ["edit", "na", "edit", "edit"] },
        { id: "personal", label: "Can update personal settings", cells: ["edit", "edit", "edit", "edit"] },
      ],
    },
    {
      id: "apps",
      title: "Connected apps",
      rows: [
        { id: "integrations", label: "Integrations", cells: ["edit", "none", "view", "none"] },
        { id: "tokens", label: "API Tokens", cells: ["none", "none", "view", "none"] },
      ],
    },
    {
      id: "compliance",
      title: "Compliance pages",
      rows: [
        { id: "tests", label: "Tests & Documents", cells: ["edit", "view", "view", "none"] },
        { id: "frameworks", label: "Frameworks & Controls", cells: ["edit", "view", "view", "none"] },
        { id: "policies", label: "Policies", cells: ["edit", "view", "view", "none"] },
      ],
    },
  ],
  class: "",
});

const emit = defineEmits(["cell-click"]);

const tab = ref<"overview" | "details">("details");

const STATE_META: Record<string, { label: string; icon: string; cls: string }> = {
  edit: { label: "Edit", icon: "✔", cls: "text-emerald-600 dark:text-emerald-400" },
  view: { label: "View only", icon: "👁", cls: "text-zinc-600 dark:text-zinc-300" },
  none: { label: "No access", icon: "✖", cls: "text-rose-600 dark:text-rose-400" },
  na: { label: "N / A", icon: "", cls: "text-zinc-400 dark:text-zinc-500" },
};

const pickCell = (row: PermissionRow, role: string, state: PermissionCellState, roleIndex: number) => {
  emit("cell-click", { row, role, state, roleIndex });
};
</script>

<template>
  <div data-permmtx class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6" :class="props.class">
    <h2 data-permmtx-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
    <p data-permmtx-description class="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div data-permmtx-tabs class="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
      <button
        v-for="t in ['overview', 'details']"
        :key="t"
        :data-permmtx-tab="t"
        type="button"
        class="-mb-px border-b-2 pb-2 text-sm font-medium transition-colors"
        :class="tab === t ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
        @click="tab = t"
      >
        {{ t === 'overview' ? 'Overview' : 'Permission details' }}
      </button>
    </div>

    <div v-if="tab === 'details'" data-permmtx-table class="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th class="px-4 py-3 font-semibold">Actions</th>
            <th v-for="r in props.roles" :key="r" :data-permmtx-role="r" class="whitespace-nowrap px-4 py-3 text-center font-semibold">{{ r }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="g in props.groups" :key="g.id">
            <tr :data-permmtx-group="g.id" class="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <td :colspan="props.roles.length + 1" class="px-4 py-2.5 text-sm font-bold text-zinc-800 dark:text-zinc-100">{{ g.title }}</td>
            </tr>
            <tr v-for="row in g.rows" :key="row.id" :data-permmtx-row="row.id" class="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
              <td class="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-200">{{ row.label }}</td>
              <td v-for="(state, i) in row.cells" :key="props.roles[i] ?? i" class="px-4 py-3 text-center">
                <button
                  type="button"
                  :data-permmtx-cell="row.id + ':' + props.roles[i]"
                  :data-permmtx-state="state"
                  class="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                  :class="STATE_META[state]?.cls"
                  @click="pickCell(row, props.roles[i] ?? '', state, i)"
                >
                  <span v-if="STATE_META[state]?.icon" aria-hidden="true">{{ STATE_META[state]?.icon }}</span>
                  <span>{{ STATE_META[state]?.label }}</span>
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-else data-permmtx-overview class="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {{ props.roles.length }} roles · {{ props.groups.reduce((n, g) => n + g.rows.length, 0) }} permission rules configured.
      </p>
    </div>
  </div>
</template>
