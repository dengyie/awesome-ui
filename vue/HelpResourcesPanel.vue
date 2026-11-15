<script setup lang="ts">
export interface HelpResource {
  id: string;
  badge: string;
  title: string;
  description: string;
  minutes?: number;
}

export interface HelpResourcesPanelProps {
  resources?: HelpResource[];
  links?: string[];
  class?: string;
}

const props = withDefaults(defineProps<HelpResourcesPanelProps>(), {
  resources: () => [
    { id: "r1", badge: "Reference", title: "Get started", description: "Learn how to use Graphite for fast, simple code review." },
    { id: "r2", badge: "Reference", title: "Cheatsheet", description: "A bookmarkable reference for common commands & workflows." },
    { id: "r3", badge: "Tutorial", title: "CLI quick start", description: "Learn to author pull requests and stacks with the Graphite CLI.", minutes: 10 },
  ],
  links: () => ["Send feedback", "Docs"],
  class: "",
});
defineEmits(["resource-click", "link-click"]);

const badgeTone = (badge: string) =>
  badge.toLowerCase() === "tutorial"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300";
</script>

<template>
  <div data-help-resources-panel class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-help-resources-header class="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">Help</div>
    <div class="p-4">
      <p data-help-resources-section class="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Tutorials &amp; resources</p>
      <div class="mt-3 space-y-3">
        <button
          v-for="resource in props.resources"
          :key="resource.id"
          type="button"
          :data-help-resource="resource.id"
          class="block w-full rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
          @click="$emit('resource-click', resource)"
        >
          <span class="flex items-center justify-between gap-2">
            <span data-help-resource-badge class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="badgeTone(resource.badge)">{{ resource.badge }}</span>
            <span v-if="typeof resource.minutes === 'number'" data-help-resource-minutes class="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{{ resource.minutes }} minutes</span>
          </span>
          <span data-help-resource-title class="mt-1.5 block text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ resource.title }}</span>
          <span data-help-resource-desc class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ resource.description }}</span>
        </button>
      </div>
      <div v-if="props.links.length" data-help-resources-links class="mt-4 space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <button
          v-for="link in props.links"
          :key="link"
          type="button"
          data-help-resources-link
          class="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          @click="$emit('link-click', link)"
        >
          {{ link }}
        </button>
      </div>
    </div>
  </div>
</template>
