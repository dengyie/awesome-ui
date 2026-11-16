<script setup lang="ts">
import { ref } from "vue";

export interface AccountSession {
  id: string;
  device: string;
  detail: string;
}

export interface AccountSecurityPanelProps {
  tabs?: string[];
  passwordValue?: string;
  sessionsTitle?: string;
  sessionsDescription?: string;
  sessions?: AccountSession[];
  class?: string;
}

const props = withDefaults(defineProps<AccountSecurityPanelProps>(), {
  tabs: () => ["Personal", "Notifications", "Security", "Billing"],
  passwordValue: "••••••••",
  sessionsTitle: "Manage verified sessions",
  sessionsDescription:
    "Each time you login to your account, a verification code is emailed to you to proceed. You may have up to 5 login sessions verified at any given time, each of which expire after 30 days.",
  sessions: () => [
    { id: "s1", device: "Chrome on Mac 10.15.7", detail: "Nov 12 at 4:52 AM EST" },
    { id: "s2", device: "Firefox on Windows 11", detail: "Nov 8 at 9:18 AM EST" },
  ],
  class: "",
});

const emit = defineEmits(["tab-click", "edit-password", "remove-session"]);

const tab = ref("Security");

const pickTab = (t: string) => {
  tab.value = t;
  emit("tab-click", t);
};

const removeSession = (s: AccountSession) => {
  emit("remove-session", s);
};
</script>

<template>
  <div data-acctsec class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8" :class="props.class">
    <h2 data-acctsec-heading class="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Account</h2>

    <div data-acctsec-tabs class="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
      <button
        v-for="t in props.tabs"
        :key="t"
        type="button"
        :data-acctsec-tab="t"
        class="-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors"
        :class="tab === t ? 'border-zinc-800 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
        @click="pickTab(t)"
      >
        {{ t }}
      </button>
    </div>

    <div v-if="tab === 'Security'" data-acctsec-panel class="mt-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <p data-acctsec-panel-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">Security</p>

      <div data-acctsec-password class="mt-5 flex items-center justify-between gap-4">
        <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200">Password</span>
        <span data-acctsec-password-value class="font-mono text-sm tracking-widest text-zinc-700 dark:text-zinc-200">{{ props.passwordValue }}</span>
        <button
          type="button"
          data-acctsec-edit-password
          class="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          @click="emit('edit-password')"
        >
          Edit
        </button>
      </div>

      <div data-acctsec-sessions class="mt-6 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <p data-acctsec-sessions-title class="font-bold text-zinc-900 dark:text-zinc-50">{{ props.sessionsTitle }}</p>
        <p data-acctsec-sessions-desc class="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{{ props.sessionsDescription }}</p>
        <div data-acctsec-session-list class="mt-4 space-y-2">
          <div v-for="s in props.sessions" :key="s.id" :data-acctsec-session="s.id" class="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <p class="text-sm text-zinc-700 dark:text-zinc-200">
              <span data-acctsec-session-device class="font-semibold">{{ s.device }}</span>
              <span class="text-zinc-400 dark:text-zinc-500"> • {{ s.detail }}</span>
            </p>
            <button
              type="button"
              :data-acctsec-remove="s.id"
              :aria-label="'Remove ' + s.device"
              class="text-zinc-400 transition-colors hover:text-rose-500 dark:hover:text-rose-400"
              @click="removeSession(s)"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button type="button" data-acctsec-done class="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Done
          </button>
        </div>
      </div>
    </div>

    <p v-else data-acctsec-placeholder class="mt-5 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
      {{ tab }} settings are not part of this demo.
    </p>
  </div>
</template>
