<template>
  <div :class="['flex items-center -space-x-2', $attrs.class]">
    <button v-for="member in visible" :key="member.id" type="button" :title="member.name" :aria-label="member.name"
      class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 font-semibold text-zinc-600 ring-2 ring-white transition-transform hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900"
      :class="sizeClass" @click="$emit('member-click', member)">
      <img v-if="member.src" :src="member.src" alt="" class="h-full w-full object-cover" />
      <span v-else-if="member.name.trim()" aria-hidden="true">{{ initials(member.name) }}</span>
      <UiIcon v-else name="user" :size="iconSize" />
      <span v-if="member.status" aria-hidden="true"
        :class="['absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900', DOT_CLASS[member.status]]" />
    </button>
    <span v-if="overflow > 0" :title="`${overflow} more`"
      :class="['relative inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold tabular-nums text-zinc-500 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-900', sizeClass]">
      +{{ overflow }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export type AvatarStatus = 'online' | 'away' | 'offline';

export interface AvatarMember {
  id: string;
  name: string;
  src?: string;
  status?: AvatarStatus;
}

const props = withDefaults(
  defineProps<{
    members: AvatarMember[];
    max?: number;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { max: 4, size: 'md' }
);
defineEmits<{ (e: 'member-click', member: AvatarMember): void }>();

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

const DOT_CLASS: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-zinc-400',
};

const visible = computed(() => props.members.slice(0, Math.max(0, props.max)));
const overflow = computed(() => props.members.length - visible.value.length);
const sizeClass = computed(() => SIZE_CLASS[props.size]);
const iconSize = computed(() => (props.size === 'sm' ? 12 : props.size === 'lg' ? 18 : 14));

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
</script>
