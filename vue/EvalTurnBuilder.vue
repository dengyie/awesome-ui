<script setup lang="ts">
export type EvalTurnRole = "system" | "user" | "assistant" | "tool";
export interface EvalTurn {
  id: string;
  role: EvalTurnRole;
  turn: number;
  content: string;
  mock?: boolean;
}
export interface EvalTurnBuilderProps {
  turns?: EvalTurn[];
  class?: string;
}
const props = withDefaults(defineProps<EvalTurnBuilderProps>(), {
  turns: () => [
    {
      id: "t1",
      role: "system",
      turn: 0,
      content: "# Appointment Scheduling Agent Prompt\n\nYou are Riley, an appointment scheduling voice assistant for Wellness Partners, a multi-specialty health clinic.",
      mock: false,
    },
    { id: "t2", role: "user", turn: 1, content: "Hi, can I reschedule my appointment to another time this week?", mock: true },
    { id: "t3", role: "assistant", turn: 2, content: "Sure, I can help with that. What day and time would you like to reschedule your appointment to?", mock: true },
    { id: "t4", role: "tool", turn: 3, content: 'reschedule_appointment \u2192 { "status": "success", "new_time": "Thursday at 2 PM" }', mock: true },
  ],
  class: "",
});
const emit = defineEmits(["turn-remove", "add-turn"]);

const roleStyles: Record<EvalTurnRole, { label: string; badge: string; icon: string }> = {
  system: { label: "SYSTEM", badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", icon: ">" },
  user: { label: "USER", badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", icon: "?" },
  assistant: { label: "ASSISTANT", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", icon: "A" },
  tool: { label: "TOOL RESPONSE", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", icon: "T" },
};
const addRoles: EvalTurnRole[] = ["user", "assistant", "tool"];
const addLabel = (role: EvalTurnRole) =>
  role === "tool" ? "Tool Response" : role.charAt(0).toUpperCase() + role.slice(1);
</script>

<template>
  <div data-eval-turn-builder class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-eval-turns class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="t in props.turns" :key="t.id" :data-eval-turn="t.id" :data-eval-role="t.role" class="p-4">
        <div class="mb-2 flex items-center justify-between gap-2">
          <span class="flex items-center gap-2">
            <span :data-eval-turn-badge="t.role" class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider" :class="roleStyles[t.role].badge">
              <span aria-hidden="true">{{ roleStyles[t.role].icon }}</span> {{ roleStyles[t.role].label }}
            </span>
            <span v-if="t.mock" data-eval-turn-mock class="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Mock</span>
          </span>
          <span class="flex items-center gap-2">
            <span v-if="t.turn > 0" data-eval-turn-number class="text-[10px] text-zinc-400 dark:text-zinc-500">Turn {{ t.turn }}</span>
            <button
              type="button"
              data-eval-turn-remove
              :aria-label="'Remove ' + roleStyles[t.role].label.toLowerCase() + ' turn'"
              class="text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
              @click="emit('turn-remove', t)"
            >
              ✕
            </button>
          </span>
        </div>
        <pre data-eval-turn-content class="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">{{ t.content }}</pre>
      </div>
    </div>
    <div data-eval-turn-add class="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
      <button
        v-for="role in addRoles"
        :key="role"
        type="button"
        :data-eval-add-turn="role"
        class="py-2.5 text-center text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        @click="emit('add-turn', role)"
      >
        + Add {{ addLabel(role) }}
      </button>
    </div>
  </div>
</template>
