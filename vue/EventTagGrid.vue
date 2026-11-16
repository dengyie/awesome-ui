<script setup lang="ts">
export interface EventTag {
  key: string;
  value: string;
  link?: boolean;
}
export interface EventTagGroup {
  id: string;
  title: string;
  tags: EventTag[];
}
export interface EventTagGridProps {
  title?: string;
  scopes?: string[];
  activeScope?: string;
  groups?: EventTagGroup[];
  class?: string;
}
const props = withDefaults(defineProps<EventTagGridProps>(), {
  title: "Tags",
  scopes: () => ["All", "Custom", "Application", "Client", "Other"],
  activeScope: "All",
  groups: () => [
    {
      id: "left",
      title: "left",
      tags: [
        { key: "browser", value: "Chrome 141.0.0", link: true },
        { key: "browser.name", value: "Chrome" },
        { key: "device", value: "Mac", link: true },
        { key: "device.family", value: "Mac" },
        { key: "environment", value: "development", link: true },
        { key: "handled", value: "no" },
        { key: "level", value: "error" },
      ],
    },
    {
      id: "right",
      title: "right",
      tags: [
        { key: "mechanism", value: "auto.browser.global_handlers.onunhandledrejection" },
        { key: "os", value: "Mac OS X >=10.15.7", link: true },
        { key: "os.name", value: "Mac OS X" },
        { key: "release", value: "b95a49d8d5b3", link: true },
        { key: "transaction", value: "/sentry-example-page", link: true },
        { key: "turbopack", value: "True" },
        { key: "url", value: "http://localhost:3000/sentry-example-page", link: true },
      ],
    },
  ],
  class: "",
});
const emit = defineEmits(["tag-click"]);
</script>

<template>
  <div data-tag-grid class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-tag-grid-header class="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <p data-tag-grid-title class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ props.title }}</p>
      <div data-tag-grid-scopes class="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
        <button
          v-for="scope in props.scopes"
          :key="scope"
          type="button"
          :data-tag-scope="scope"
          :aria-pressed="scope === props.activeScope"
          :class="scope === props.activeScope
            ? 'rounded bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
            : 'rounded px-2 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
          @click="emit('tag-click', { key: scope, value: scope }, { id: 'scope', title: scope, tags: [] })"
        >
          {{ scope }}
        </button>
      </div>
    </div>
    <div data-tag-grid-body class="grid grid-cols-1 gap-x-6 px-4 py-3 md:grid-cols-2">
      <dl v-for="group in props.groups" :key="group.id" :data-tag-group="group.id" class="flex flex-col gap-1.5">
        <div v-for="tag in group.tags" :key="tag.key" data-tag-row class="grid grid-cols-[9rem_1fr] items-baseline gap-2 text-xs">
          <dt data-tag-key class="truncate font-mono text-zinc-500 dark:text-zinc-400" :title="tag.key">{{ tag.key }}</dt>
          <dd class="min-w-0">
            <button
              type="button"
              :data-tag-value="tag.value"
              :class="tag.link
                ? 'block max-w-full truncate rounded bg-zinc-50 px-1 py-0.5 text-left text-zinc-800 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800'
                : 'block max-w-full truncate rounded px-1 py-0.5 text-left text-zinc-800 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60'"
              :title="tag.value"
              @click="emit('tag-click', tag, group)"
            >
              {{ tag.value }}
            </button>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
