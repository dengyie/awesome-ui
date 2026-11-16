<script setup lang="ts">
import { ref } from "vue";

export interface DocsNavItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
}

export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export interface DocsCard {
  title: string;
  description: string;
  icon?: string;
  href?: string;
}

export interface DocsCodeExample {
  filename: string;
  language: string;
  code: string;
}

export type DocsBlock =
  | { type: "paragraph"; text: string }
  | { type: "callout"; tone?: "info" | "success" | "warning"; title?: string; text: string }
  | { type: "heading"; text: string; anchor: string }
  | { type: "cards"; cards: DocsCard[] }
  | { type: "code"; example: DocsCodeExample };

export interface DocsTocItem {
  id: string;
  label: string;
}

export interface DocsPageLayoutProps {
  topLinks?: DocsNavItem[];
  navGroups?: DocsNavGroup[];
  title?: string;
  copyLabel?: string;
  blocks?: DocsBlock[];
  toc?: DocsTocItem[];
  activeTocId?: string;
  class?: string;
}

const props = withDefaults(defineProps<DocsPageLayoutProps>(), {
  topLinks: () => [
    { id: "documentation", label: "Documentation", icon: "📘" },
    { id: "blog", label: "Blog", icon: "📰" },
  ],
  navGroups: () => [
    {
      label: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction" },
        { id: "quickstart", label: "Quickstart", badge: "Start here" },
        { id: "development", label: "Development" },
      ],
    },
    {
      label: "Essentials",
      items: [
        { id: "routing", label: "Routing" },
        { id: "metadata", label: "Metadata" },
        { id: "images", label: "Images" },
      ],
    },
  ],
  title: "Quickstart",
  copyLabel: "Copy page",
  blocks: () => [
    { type: "callout", tone: "info", title: "New to Mintlify?", text: "Start here to learn how to build, preview and deploy your documentation." },
    { type: "paragraph", text: "This guide walks you through setting up a local development environment, writing your first page and deploying to production." },
    { type: "heading", text: "Create a new project", anchor: "create-a-new-project" },
    { type: "code", example: { filename: "Terminal", language: "bash", code: "npx mintlify init && npx mintlify dev" } },
    { type: "heading", text: "Cards", anchor: "cards" },
    {
      type: "cards",
      cards: [
        { title: "Quickstart", description: "Get your docs running in minutes.", icon: "🚀", href: "/quickstart" },
        { title: "Theming", description: "Customize colors, fonts and layout.", icon: "🎨", href: "/theming" },
      ],
    },
  ] as DocsBlock[],
  toc: () => [
    { id: "create-a-new-project", label: "Create a new project" },
    { id: "cards", label: "Cards" },
  ],
  activeTocId: "",
  class: "",
});

const emit = defineEmits(["nav-click", "toc-click", "copy-page"]);

const activeId = ref(props.activeTocId || props.toc[0]?.id || "");
const copied = ref(false);

const copyPage = () => {
  copied.value = true;
  emit("copy-page");
  window.setTimeout(() => (copied.value = false), 1500);
};

const calloutCls = (tone?: string) =>
  tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
    : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
      : "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200";

const calloutIcon = (tone?: string) =>
  tone === "success" ? "✅" : tone === "warning" ? "⚠️" : "ℹ️";

const tocCls = (item: DocsTocItem) =>
  item.id === activeId.value
    ? "border-zinc-900 font-semibold text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200";
</script>

<template>
  <div data-docspage class="grid w-full gap-8 lg:grid-cols-[220px_minmax(0,1fr)_200px]" :class="props.class">
    <!-- left nav -->
    <nav data-docspage-nav class="hidden lg:block">
      <div class="space-y-1">
        <button
          v-for="link in props.topLinks"
          :key="link.id"
          :data-docspage-toplink="link.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
          @click="emit('nav-click', link)"
        >
          <span v-if="link.icon" aria-hidden="true">{{ link.icon }}</span>
          {{ link.label }}
        </button>
      </div>
      <div v-for="group in props.navGroups" :key="group.label" :data-docspage-group="group.label" class="mt-5">
        <p class="px-3 text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ group.label }}</p>
        <div class="mt-1.5 space-y-0.5">
          <button
            v-for="item in group.items"
            :key="item.id"
            :data-docspage-navitem="item.id"
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            @click="emit('nav-click', item)"
          >
            <span class="truncate">{{ item.label }}</span>
            <span v-if="item.badge" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{{ item.badge }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- center article -->
    <article data-docspage-article class="min-w-0">
      <div class="flex items-center justify-between gap-4">
        <h1 data-docspage-title class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.title }}</h1>
        <button
          data-docspage-copy
          type="button"
          class="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          @click="copyPage"
        >
          {{ copied ? "✓ Copied" : `⧉ ${props.copyLabel}` }}
        </button>
      </div>
      <div data-docspage-content class="mt-6 space-y-4">
        <template v-for="(block, i) in props.blocks" :key="i">
          <p v-if="block.type === 'paragraph'" class="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ block.text }}</p>
          <div v-else-if="block.type === 'callout'" data-docspage-callout class="rounded-xl border p-4" :class="calloutCls(block.tone)">
            <p class="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden="true">{{ calloutIcon(block.tone) }}</span>
              {{ block.title }}
            </p>
            <p class="mt-1 text-sm leading-6 opacity-90">{{ block.text }}</p>
          </div>
          <h2 v-else-if="block.type === 'heading'" :id="block.anchor" :data-docspage-heading="block.anchor" class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ block.text }}</h2>
          <div v-else-if="block.type === 'cards'" data-docspage-cards class="grid gap-3 sm:grid-cols-2">
            <a
              v-for="card in block.cards"
              :key="card.title"
              :data-docspage-card="card.title"
              :href="card.href ?? '#'"
              class="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <p class="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                <span v-if="card.icon" aria-hidden="true">{{ card.icon }}</span>
                {{ card.title }}
              </p>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ card.description }}</p>
            </a>
          </div>
          <div v-else data-docspage-code class="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
            <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span class="text-xs font-medium text-zinc-400">{{ block.example.filename }}</span>
              <span class="text-[10px] uppercase tracking-wide text-zinc-500">{{ block.example.language }}</span>
            </div>
            <pre class="overflow-x-auto px-4 py-3 text-xs leading-5 text-zinc-200"><code>{{ block.example.code }}</code></pre>
          </div>
        </template>
      </div>
    </article>

    <!-- right toc -->
    <aside data-docspage-toc class="hidden lg:block">
      <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">On this page</p>
      <div class="mt-3 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
        <button
          v-for="item in props.toc"
          :key="item.id"
          :data-docspage-tocitem="item.id"
          :data-docspage-toc-active="item.id === activeId ? 'true' : 'false'"
          type="button"
          class="-ml-px block w-full border-l-2 px-3 py-1 text-left text-xs transition-colors"
          :class="tocCls(item)"
          @click="activeId = item.id; emit('toc-click', item)"
        >
          {{ item.label }}
        </button>
      </div>
    </aside>
  </div>
</template>
