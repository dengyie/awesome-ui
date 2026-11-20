<script setup lang="ts">
import { ref } from "vue";

export interface ProfileSocialLink {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
}

interface Props {
  title?: string;
  handle?: string;
  countries?: string[];
  defaultCountry?: string;
  defaultCity?: string;
  bio?: string;
  bioLimit?: number;
  socials?: ProfileSocialLink[];
  showEmailLabel?: string;
  defaultShowEmail?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Personal info",
  handle: "@alexsmith",
  countries: () => ["United States", "Singapore", "United Kingdom", "Germany", "Japan"],
  defaultCountry: undefined,
  defaultCity: "",
  bio: "",
  bioLimit: 750,
  socials: () => [],
  showEmailLabel: "Display your account email",
  defaultShowEmail: false,
  saveLabel: "Save changes",
  cancelLabel: "Cancel",
});

const emit = defineEmits<{
  (e: "save", detail: {
    handle: string;
    country: string;
    city: string;
    bio: string;
    showEmail: boolean;
    socials: Record<string, string>;
  }): void;
  (e: "cancel"): void;
}>();

const country = ref(props.defaultCountry ?? props.countries[0] ?? "");
const city = ref(props.defaultCity);
const bioValue = ref(props.bio.slice(0, props.bioLimit));
const socialValues = ref<Record<string, string>>(
  Object.fromEntries(props.socials.map((s) => [s.id, s.value ?? ""])),
);
const showEmail = ref(props.defaultShowEmail);
const saved = ref(false);

const handleSave = () => {
  saved.value = true;
  emit("save", {
    handle: props.handle,
    country: country.value,
    city: city.value,
    bio: bioValue.value,
    showEmail: showEmail.value,
    socials: { ...socialValues.value },
  });
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <div data-profile-edit-form class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p data-profile-edit-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span data-profile-edit-handle class="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {{ props.handle }}
        <span aria-hidden="true" class="text-[10px]">✏️</span>
      </span>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <label class="block">
        <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
        <select
          v-model="country"
          data-profile-edit-country
          class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <option v-for="c in props.countries" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">City</span>
        <input
          v-model="city"
          data-profile-edit-city
          type="text"
          placeholder="e.g. San Francisco"
          class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
        />
      </label>
    </div>

    <label class="mt-2 block">
      <span class="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        Bio
        <span data-profile-edit-bio-count class="tabular-nums text-zinc-400 dark:text-zinc-500">
          {{ bioValue.length }}/{{ props.bioLimit }}
        </span>
      </span>
      <textarea
        v-model="bioValue"
        data-profile-edit-bio
        rows="3"
        :maxlength="props.bioLimit"
        placeholder="Write a short bio about yourself…"
        class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
        @input="saved = false"
      />
    </label>

    <div class="mt-2 flex items-center gap-2">
      <button
        type="button"
        data-profile-edit-email-toggle
        role="switch"
        :aria-checked="showEmail"
        :class="['relative h-4 w-7 rounded-full transition-colors', showEmail ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700']"
        @click="showEmail = !showEmail; saved = false"
      >
        <span
          :class="['absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all', showEmail ? 'left-3.5' : 'left-0.5']"
        />
      </button>
      <span class="text-[11px] text-zinc-600 dark:text-zinc-300">{{ props.showEmailLabel }}</span>
    </div>

    <div v-if="props.socials.length > 0" data-profile-edit-socials class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <label
        v-for="s in props.socials"
        :key="s.id"
        class="mt-2 block first:mt-0"
        :data-profile-edit-social="s.id"
      >
        <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ s.label }}</span>
        <input
          :value="socialValues[s.id] ?? ''"
          :data-profile-edit-social-input="s.id"
          type="text"
          :placeholder="s.placeholder ?? `Your ${s.label}`"
          class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
          @input="socialValues[s.id] = ($event.target)?.value ?? ''; saved = false"
        />
      </label>
    </div>

    <p
      v-if="saved"
      data-profile-edit-saved
      role="status"
      class="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
    >
      Profile saved.
    </p>

    <div class="mt-3 flex items-center justify-end gap-2">
      <button
        type="button"
        data-profile-edit-cancel
        class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="handleCancel"
      >
        {{ props.cancelLabel }}
      </button>
      <button
        type="button"
        data-profile-edit-save
        class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        @click="handleSave"
      >
        {{ props.saveLabel }}
      </button>
    </div>
  </div>
</template>
