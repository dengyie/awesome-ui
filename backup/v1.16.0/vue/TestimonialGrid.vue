<template>
  <div v-if="testimonials.length === 0"
    :class="['rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500', $attrs.class]">
    No testimonials yet.
  </div>
  <div v-else :class="['grid gap-4', columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3', $attrs.class]">
    <figure v-for="testimonial in testimonials" :key="testimonial.id" @click="$emit('select', testimonial)"
      class="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div v-if="ratingOf(testimonial) > 0" class="flex items-center gap-0.5" :aria-label="`${ratingOf(testimonial)} out of 5 stars`">
        <UiIcon v-for="index in 5" :key="index" name="star" :size="13"
          :class="index <= ratingOf(testimonial) ? 'text-amber-500' : 'text-zinc-200 dark:text-zinc-700'" />
      </div>

      <blockquote class="mt-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">“{{ testimonial.quote }}”</blockquote>

      <figcaption class="mt-4 flex items-center gap-2">
        <img v-if="testimonial.avatar" :src="testimonial.avatar" alt="" class="h-7 w-7 shrink-0 rounded-full object-cover" />
        <span v-else
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
          {{ initials(testimonial.name) }}
        </span>
        <span class="min-w-0">
          <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{{ testimonial.name }}</span>
          <span v-if="testimonial.role || testimonial.company" class="block truncate text-[10px] text-zinc-400">
            {{ [testimonial.role, testimonial.company].filter(Boolean).join(', ') }}
          </span>
        </span>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

withDefaults(defineProps<{ testimonials?: Testimonial[]; columns?: 2 | 3 }>(), {
  testimonials: () => [],
  columns: 3,
});
defineEmits<{ (e: 'select', testimonial: Testimonial): void }>();

const ratingOf = (testimonial: Testimonial) => Math.max(0, Math.min(5, Math.round(testimonial.rating ?? 0)));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
</script>
