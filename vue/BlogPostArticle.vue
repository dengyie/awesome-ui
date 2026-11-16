<script setup lang="ts">
import { ref } from "vue";

export interface ArticleHeading {
  id: string;
  text: string;
  level?: 2 | 3;
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string; level?: 2 | 3 }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string };

export interface BlogPostArticleProps {
  siteName?: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  blocks?: ArticleBlock[];
  toc?: ArticleHeading[];
  activeHeadingId?: string;
  codeLabel?: string;
  copiedLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<BlogPostArticleProps>(), {
  siteName: "SLMobbin",
  title: "Introduction to Front-End Development: A Beginner's Guide",
  subtitle: "What is Front-End Development?",
  meta: "8 min read · Nov 14, 2026",
  blocks: () => [
    {
      type: "paragraph",
      text: "Front-end development is the process of designing and building the part of a website or web application that users interact with directly. It involves creating the structure, layout, and interactive features of a webpage, ensuring a seamless user experience.",
    },
    { type: "heading", text: "Key Technologies in Front-End Development", id: "key-technologies", level: 2 },
    { type: "paragraph", text: "Front-end development primarily relies on three core technologies: HTML, CSS and JavaScript." },
    { type: "list", items: ["HTML provides the basic structure of a webpage.", "CSS controls the presentation and layout.", "JavaScript adds interactivity and dynamic behavior."] },
    { type: "heading", text: "1. HTML (HyperText Markup Language)", id: "html", level: 3 },
    { type: "paragraph", text: "HTML provides the basic structure of a webpage. It defines elements such as headings, paragraphs, images, links, and forms." },
    {
      type: "code",
      language: "html",
      code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Web Page</title>\n  </head>\n  <body>\n    <h1>Welcome to Front-End Development</h1>\n    <p>This is an example of HTML structure.</p>\n  </body>\n</html>',
    },
  ] as ArticleBlock[],
  toc: () => [
    { id: "key-technologies", text: "Key Technologies in Front-End Development", level: 2 as const },
    { id: "html", text: "1. HTML (HyperText Markup Language)", level: 3 as const },
  ] as ArticleHeading[],
  activeHeadingId: "",
  codeLabel: "Copy",
  copiedLabel: "Copied!",
  class: "",
});

const emit = defineEmits(["heading-click", "copy-code"]);

const activeId = ref(props.activeHeadingId || props.toc[0]?.id || "");
const copied = ref(false);

const copyCode = () => {
  copied.value = true;
  emit("copy-code");
  window.setTimeout(() => (copied.value = false), 1500);
};
</script>

<template>
  <div data-blogpost class="w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" :class="props.class">
    <header data-blogpost-topbar class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
      <p data-blogpost-site class="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.siteName }}</p>
      <div class="hidden min-w-0 flex-1 justify-center sm:flex">
        <div class="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-400 dark:border-zinc-800">
          <span aria-hidden="true">⌕</span>
          <span class="flex-1">Search</span>
          <kbd class="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ K</kbd>
        </div>
      </div>
      <button type="button" aria-label="Toggle theme" class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">☾</button>
    </header>

    <div class="grid lg:grid-cols-[200px_minmax(0,1fr)]">
      <nav data-blogpost-toc class="hidden border-r border-zinc-200 p-5 lg:block dark:border-zinc-800">
        <div class="space-y-1">
          <button
            v-for="h in props.toc"
            :key="h.id"
            :data-blogpost-tocitem="h.id"
            :data-blogpost-toc-active="h.id === activeId ? 'true' : 'false'"
            type="button"
            class="block w-full rounded-lg px-3 py-1.5 text-left text-xs leading-5 transition-colors"
            :class="[
              h.level === 3 ? 'pl-6' : '',
              h.id === activeId ? 'bg-sky-50 font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
            ]"
            @click="activeId = h.id; emit('heading-click', h)"
          >
            {{ h.text }}
          </button>
        </div>
        <p class="mt-6 flex items-center gap-2 text-xs text-zinc-400">
          <span aria-hidden="true">⇥</span> Collapse
          <kbd class="ml-auto rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ \</kbd>
        </p>
      </nav>

      <article data-blogpost-article class="min-w-0 px-6 py-8 sm:px-10">
        <h1 data-blogpost-title class="text-3xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">{{ props.title }}</h1>
        <p v-if="props.subtitle" class="mt-3 text-base text-zinc-600 dark:text-zinc-300">{{ props.subtitle }}</p>
        <p v-if="props.meta" data-blogpost-meta class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{{ props.meta }}</p>

        <div data-blogpost-content class="mt-6 space-y-4">
          <template v-for="(block, i) in props.blocks" :key="i">
            <p v-if="block.type === 'paragraph'" class="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{{ block.text }}</p>
            <h2 v-else-if="block.type === 'heading' && block.level === 3" :id="block.id" :data-blogpost-heading="block.id" class="mt-8 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ block.text }}</h2>
            <h2 v-else-if="block.type === 'heading'" :id="block.id" :data-blogpost-heading="block.id" class="mt-10 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ block.text }}</h2>
            <ul v-else-if="block.type === 'list'" class="list-disc space-y-1.5 pl-6 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ul>
            <div v-else data-blogpost-code class="overflow-hidden rounded-xl bg-zinc-950 dark:bg-black">
              <div class="flex items-center justify-between px-4 pt-3">
                <span class="text-[10px] uppercase tracking-wide text-zinc-500">{{ block.language }}</span>
                <button data-blogpost-code-copy type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white" @click="copyCode">
                  <span aria-hidden="true">⧉</span> {{ copied ? props.copiedLabel : props.codeLabel }}
                </button>
              </div>
              <pre class="overflow-x-auto px-4 pb-4 pt-1 text-xs leading-5 text-zinc-200"><code>{{ block.code }}</code></pre>
            </div>
          </template>
        </div>
      </article>
    </div>
  </div>
</template>
