<template>
  <div
    class="homepage-dashboard relative w-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden"
    :class="className"
    style="font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;"
  >
    <!-- Header -->
    <header :class="headerCls">
      <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div class="min-w-0">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ title }}</h1>
          <p v-if="subtitle" class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ subtitle }}</p>
        </div>
        <div v-if="showSearch || showClock" class="flex flex-wrap items-center gap-4">
          <div v-if="showSearch" class="relative w-full sm:w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l2.328 2.328a.75.75 0 1 1-1.06 1.06l-2.328-2.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd"
              />
            </svg>
            <input
              v-model="query"
              type="search"
              :placeholder="searchPlaceholder"
              aria-label="Search services"
              class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-white/5 px-9 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            />
          </div>
          <div v-if="showClock" class="text-right shrink-0 min-w-28">
            <div class="text-2xl sm:text-3xl font-semibold tabular-nums text-zinc-800 dark:text-zinc-100 leading-tight">
              {{ time }}
            </div>
            <div class="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{{ date }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Groups -->
    <main class="flex flex-wrap items-start px-3 sm:px-5 pb-4">
      <p v-if="filteredGroups.length === 0" class="p-4 text-sm text-zinc-400">{{ emptyMessage }}</p>
      <div
        v-for="group in filteredGroups"
        :key="group.name"
        class="services-group w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-1 pb-0"
      >
        <button
          type="button"
          class="group-header flex w-full select-none items-center gap-1 py-0.5"
          :class="collapsible ? '' : 'cursor-default'"
          :aria-expanded="!collapsed[group.name]"
          @click="toggleGroup(group.name)"
        >
          <span
            v-if="group.icon"
            class="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-white/10 text-sm leading-none"
          >
            {{ group.icon }}
          </span>
          <h2 class="text-xl font-medium text-zinc-800 dark:text-zinc-300">{{ group.name }}</h2>
          <svg
            v-if="collapsible"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="w-5 h-5 ml-auto transition-transform duration-200 text-zinc-700 dark:text-zinc-300"
            :class="{ 'rotate-180': collapsed[group.name] }"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <ul v-if="!collapsed[group.name]" class="mt-2">
          <li
            v-for="(service, i) in group.services"
            :key="service.id ?? `${group.name}-${service.name}-${i}`"
            :data-name="service.name || ''"
            class="service-card relative overflow-clip rounded-md shadow-md shadow-zinc-900/10 dark:shadow-zinc-900/20 bg-white hover:bg-zinc-50 dark:bg-white/5 dark:hover:bg-white/10 transition-all mb-2 p-0.5"
          >
            <component
              :is="serviceHref(service) ? 'a' : 'div'"
              :href="serviceHref(service) || undefined"
              :target="serviceHref(service) ? '_blank' : undefined"
              :rel="serviceHref(service) ? 'noreferrer' : undefined"
              class="flex select-none items-center"
            >
              <div
                class="shrink-0 my-1.5 ml-1.5 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-zinc-200/70 dark:bg-white/10"
              >
                <img
                  v-if="isImageIcon(service.icon)"
                  :src="service.icon"
                  alt=""
                  loading="lazy"
                  width="32"
                  height="32"
                  class="w-8 h-8 object-contain"
                />
                <span v-else-if="service.icon" class="text-xl leading-none">{{ service.icon }}</span>
                <span v-else class="text-xl font-bold text-zinc-500 dark:text-zinc-300">{{ monogram(service.name) }}</span>
              </div>
              <div class="flex-1 min-w-0 px-2 py-2.5 text-sm text-left">
                <div class="truncate font-medium text-zinc-800 dark:text-zinc-200">{{ service.name }}</div>
                <div
                  v-if="service.description"
                  class="truncate mt-0.5 text-xs font-light text-zinc-500 dark:text-zinc-300"
                >
                  {{ service.description }}
                </div>
              </div>
            </component>

            <span
              v-if="statusStyle === 'dot'"
              :title="statusLabel(service)"
              role="img"
              :aria-label="statusLabel(service)"
              class="absolute top-1.5 right-1.5 h-3 w-3 rounded-full"
              :class="statusConfig(service.status).dot"
            />
            <span
              v-else-if="statusStyle === 'pill'"
              role="img"
              :aria-label="statusLabel(service)"
              class="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wide px-1.5 py-1 rounded-md bg-zinc-500/10 dark:bg-zinc-400/10"
              :class="statusConfig(service.status).pill"
            >
              {{ statusLabel(service) }}
            </span>
          </li>
        </ul>
      </div>
    </main>

    <!-- Footer -->
    <footer class="px-5 py-6 text-right">
      <a
        href="https://github.com/gethomepage/homepage"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <span>{{ version }}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/**
 * HomepageDashboard — Vue 3 (SFC)
 * A copy-paste, zero-blackbox single-file homelab dashboard with the iconic
 * gethomepage/homepage look: header (title + live clock + search) + responsive
 * grouped service cards with status dots/pills + version footer.
 *
 * ORIGINAL implementation of the visual design language of
 * https://github.com/gethomepage/homepage (GPL-3.0). No GPL source copied.
 */
export type HomepageStatus = 'online' | 'up' | 'down' | 'offline' | 'warn' | 'error' | 'unknown';

export interface HomepageService {
  /** Optional stable key — used for v-for reconciliation; falls back to name+index */
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  /** Only http(s), mailto, protocol-relative, root-relative and dot-relative URLs are rendered as a link */
  href?: string;
  pingText?: string;
  status?: HomepageStatus;
}

export interface HomepageGroup {
  name: string;
  icon?: string;
  services: HomepageService[];
}

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    version?: string;
    groups?: HomepageGroup[];
    headerStyle?: 'underlined' | 'boxed' | 'clean';
    statusStyle?: 'pill' | 'dot' | 'none';
    showClock?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    collapsible?: boolean;
    className?: string;
  }>(),
  {
    title: 'Homepage',
    subtitle: 'A highly customizable homelab dashboard',
    version: 'Homepage · awesome-ui',
    groups: () => [],
    headerStyle: 'underlined',
    statusStyle: 'pill',
    showClock: true,
    showSearch: false,
    searchPlaceholder: 'Search services…',
    collapsible: true,
    className: '',
  }
);

const emit = defineEmits<{ 'group-toggle': [group: string, collapsed: boolean] }>();

/* ---------- clock: starts/stops when showClock toggles, always cleaned up ---------- */
const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

const stopClock = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
const startClock = () => {
  if (props.showClock && !timer) {
    timer = setInterval(() => (now.value = new Date()), 1000);
  }
};

watch(() => props.showClock, (v) => (v ? startClock() : stopClock()));
onMounted(startClock);
onBeforeUnmount(stopClock);

const time = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
const date = computed(() =>
  now.value.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
);

/* ---------- search & collapse ---------- */
const query = ref('');

const trimmedQuery = computed(() => query.value.trim().toLowerCase());

const filteredGroups = computed<HomepageGroup[]>(() => {
  const q = trimmedQuery.value;
  if (!q) return props.groups;
  return props.groups
    .map((g) => ({
      ...g,
      services: (g.services || []).filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.services.length > 0);
});

const collapsed = ref<Record<string, boolean>>({});

const emptyMessage = computed(() => {
  if (props.groups.length === 0) return 'No services configured yet.';
  if (trimmedQuery.value) return `No matching services for “${trimmedQuery.value}”.`;
  return 'No services configured yet.';
});

const toggleGroup = (name: string) => {
  if (!props.collapsible) return;
  collapsed.value = { ...collapsed.value, [name]: !collapsed.value[name] };
  emit('group-toggle', name, collapsed.value[name]);
};

/* ---------- helpers ---------- */
const headerCls = computed(() =>
  props.headerStyle === 'boxed'
    ? 'm-3 sm:m-5 mb-0 rounded-lg bg-white dark:bg-white/5 shadow-md shadow-zinc-900/10 p-4'
    : props.headerStyle === 'clean'
      ? 'm-3 sm:m-5 mb-0'
      : 'm-3 sm:m-5 mb-1 border-b-2 border-zinc-300/70 dark:border-zinc-700 pb-4'
);

const statusConfig = (status: HomepageStatus = 'unknown') => {
  switch (status) {
    case 'online':
    case 'up':
      return { dot: 'bg-emerald-500', pill: 'text-emerald-500/90', label: 'UP' };
    case 'down':
    case 'offline':
      return { dot: 'bg-rose-500', pill: 'text-rose-500/90', label: 'DOWN' };
    case 'warn':
      return { dot: 'bg-amber-500', pill: 'text-amber-500', label: 'WARN' };
    case 'error':
      return { dot: 'bg-orange-500', pill: 'text-orange-500', label: 'ERROR' };
    default:
      return { dot: 'bg-zinc-400/60 dark:bg-zinc-500/60', pill: 'text-zinc-500 dark:text-zinc-400', label: '—' };
  }
};

/** Only allow safe URL protocols into the anchor. Blocks javascript:, data:, vbscript:, file: … */
const isSafeHref = (href?: string): boolean => {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  if (t.length === 0) return false;
  if (t.startsWith('//') || t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^(https?:\/\/|mailto:)/i.test(t);
};

const serviceHref = (service: HomepageService) => (isSafeHref(service.href) ? service.href : undefined);

const isImageIcon = (icon?: string) => !!icon && /^(https?:|data:|\.|\/)/i.test(icon);

const monogram = (name?: string) => (name || '?').trim().charAt(0).toUpperCase();

const statusLabel = (service: HomepageService) => service.pingText || statusConfig(service.status).label;
</script>