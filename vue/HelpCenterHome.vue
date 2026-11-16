<script setup lang="ts">
import { ref } from "vue";

export interface HelpTopic {
  id: string;
  label: string;
  articles?: string[];
}

export interface HelpCenterHomeProps {
  title?: string;
  searchPlaceholder?: string;
  topics?: HelpTopic[];
  class?: string;
}

const props = withDefaults(defineProps<HelpCenterHomeProps>(), {
  title: "Welcome to the Help Center",
  searchPlaceholder: "Cancellation, meeting point, etc.",
  topics: () => [
    { id: "plan", label: "Plan, search and book" },
    { id: "activity", label: "Activity information" },
    { id: "voucher", label: "Booking confirmation, voucher and tickets" },
    { id: "pickup", label: "Meeting point and pickup" },
    { id: "day", label: "On the day of the activity" },
    { id: "management", label: "Booking management", articles: ["Change the date or time", "Cancel your booking", "Refund policy"] },
    { id: "cancellation", label: "Cancellation" },
    { id: "payment", label: "Payment and refunds" },
  ],
  class: "",
});

const emit = defineEmits(["search-submit", "topic-click", "article-click"]);

const query = ref("");
const openId = ref<string | null>("management");

const submit = () => {
  emit("search-submit", query.value);
};

const toggleTopic = (topic: HelpTopic) => {
  const expandable = Array.isArray(topic.articles) && topic.articles.length > 0;
  if (expandable) {
    openId.value = openId.value === topic.id ? null : topic.id;
  }
  emit("topic-click", topic);
};
</script>

<template>
  <div data-helpct class="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-900 sm:px-8" :class="props.class">
    <div class="mx-auto max-w-2xl text-center">
      <h2 data-helpct-title class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
      <p data-helpct-label class="mt-6 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Search for a topic</p>
      <form
        data-helpct-form
        class="mt-2 flex overflow-hidden rounded-lg border border-zinc-300 focus-within:border-indigo-500 dark:border-zinc-700"
        @submit.prevent="submit"
      >
        <input
          type="search"
          data-helpct-input
          v-model="query"
          :placeholder="props.searchPlaceholder"
          class="min-w-0 flex-1 px-4 py-2.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-200"
        />
        <button type="submit" data-helpct-submit aria-label="Search" class="bg-indigo-600 px-5 text-white transition-colors hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
          🔍
        </button>
      </form>

      <p data-helpct-browse class="mt-8 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Or browse by topic</p>
      <div data-helpct-topics class="mt-2 text-left">
        <div v-for="topic in props.topics" :key="topic.id" :data-helpct-topic="topic.id" class="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
          <button
            type="button"
            :data-helpct-topic-btn="topic.id"
            class="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-300"
            @click="toggleTopic(topic)"
          >
            <span>{{ topic.label }}</span>
            <span aria-hidden="true" class="text-xs text-zinc-400">{{ topic.articles && topic.articles.length ? (openId === topic.id ? '▾' : '›') : '›' }}</span>
          </button>
          <div v-if="topic.articles && topic.articles.length && openId === topic.id" :data-helpct-articles="topic.id" class="pb-4">
            <button
              v-for="a in topic.articles"
              :key="a"
              type="button"
              :data-helpct-article="a"
              class="block py-1.5 text-left text-sm text-indigo-600 transition-colors hover:underline dark:text-indigo-300"
              @click="emit('article-click', topic, a)"
            >
              {{ a }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
