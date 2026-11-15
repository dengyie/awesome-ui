<template>
  <footer data-site-footer class="rounded-xl border border-zinc-200 bg-zinc-950 p-6 text-zinc-400 dark:border-zinc-800" :class="className">
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      <nav
        v-for="(column, index) in columns"
        :key="`${column.heading}-${index}`"
        :data-footer-column="index"
        :aria-label="column.heading"
      >
        <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{{ column.heading }}</p>
        <ul class="mt-3 space-y-2">
          <li v-for="(link, linkIndex) in column.links" :key="`${link.label}-${linkIndex}`">
            <a :href="link.href ?? '#'" class="text-xs text-zinc-400 transition-colors hover:text-zinc-100">{{ link.label }}</a>
          </li>
        </ul>
      </nav>
      <div v-if="badges.length" data-footer-badges>
        <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Compliance</p>
        <ul class="mt-3 space-y-3">
          <li v-for="(badge, index) in badges" :key="`${badge.title}-${index}`" class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <UiIcon :name="(badge.icon ?? 'check-circle') as IconName" :size="14" class="text-zinc-300" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-xs font-medium text-zinc-200">{{ badge.title }}</span>
              <span class="block truncate text-[10px]" :class="statusTone[badge.statusTone ?? 'zinc']">{{ badge.status }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
      <p v-if="tagline" class="text-xs text-zinc-500">{{ tagline }}</p>
      <span v-else />
      <p v-if="copyright" class="text-[11px] text-zinc-600">{{ copyright }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export interface SiteFooterColumn {
  heading: string;
  links: { label: string; href?: string }[];
}

export interface ComplianceBadge {
  title: string;
  status: string;
  statusTone?: 'emerald' | 'amber' | 'zinc';
  icon?: IconName;
}

withDefaults(
  defineProps<{
    columns?: SiteFooterColumn[];
    badges?: ComplianceBadge[];
    copyright?: string;
    tagline?: string;
    className?: string;
  }>(),
  { columns: () => [], badges: () => [], copyright: '', tagline: '', className: '' },
);

const statusTone: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  zinc: 'text-zinc-400',
};
</script>
