import React, { useState } from "react";

export interface ProfileSocialLink {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
}

export interface ProfileEditFormProps {
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
  onSave?: (profile: {
    handle: string;
    country: string;
    city: string;
    bio: string;
    showEmail: boolean;
    socials: Record<string, string>;
  }) => void;
  onCancel?: () => void;
  className?: string;
}

const DEFAULT_COUNTRIES = ["United States", "Singapore", "United Kingdom", "Germany", "Japan"];

export default function ProfileEditForm({
  title = "Personal info",
  handle = "@alexsmith",
  countries = DEFAULT_COUNTRIES,
  defaultCountry,
  defaultCity = "",
  bio = "",
  bioLimit = 750,
  socials = [],
  showEmailLabel = "Display your account email",
  defaultShowEmail = false,
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
  onSave,
  onCancel,
  className = "",
}: ProfileEditFormProps) {
  const [country, setCountry] = useState(defaultCountry ?? countries[0] ?? "");
  const [city, setCity] = useState(defaultCity);
  const [bioValue, setBioValue] = useState(bio.slice(0, bioLimit));
  const [socialValues, setSocialValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(socials.map((s) => [s.id, s.value ?? ""])),
  );
  const [showEmail, setShowEmail] = useState(defaultShowEmail);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave?.({
      handle,
      country,
      city,
      bio: bioValue,
      showEmail,
      socials: { ...socialValues },
    });
  };

  return (
    <div data-profile-edit-form className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p data-profile-edit-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-profile-edit-handle className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {handle}
          <span aria-hidden="true" className="text-[10px]">✏️</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
          <select
            data-profile-edit-country
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">City</span>
          <input
            data-profile-edit-city
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
          />
        </label>
      </div>

      <label className="mt-2 block">
        <span className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          Bio
          <span data-profile-edit-bio-count className="tabular-nums text-zinc-400 dark:text-zinc-500">
            {bioValue.length}/{bioLimit}
          </span>
        </span>
        <textarea
          data-profile-edit-bio
          rows={3}
          maxLength={bioLimit}
          value={bioValue}
          onChange={(e) => {
            setBioValue(e.target.value);
            setSaved(false);
          }}
          placeholder="Write a short bio about yourself…"
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
        />
      </label>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          data-profile-edit-email-toggle
          role="switch"
          aria-checked={showEmail}
          onClick={() => {
            setShowEmail(!showEmail);
            setSaved(false);
          }}
          className={`relative h-4 w-7 rounded-full transition-colors ${showEmail ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${showEmail ? "left-3.5" : "left-0.5"}`}
          />
        </button>
        <span className="text-[11px] text-zinc-600 dark:text-zinc-300">{showEmailLabel}</span>
      </div>

      {socials.length > 0 ? (
        <div data-profile-edit-socials className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {socials.map((s) => (
            <label key={s.id} className="mt-2 block first:mt-0" data-profile-edit-social={s.id}>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{s.label}</span>
              <input
                data-profile-edit-social-input={s.id}
                type="text"
                value={socialValues[s.id] ?? ""}
                onChange={(e) => {
                  setSocialValues({ ...socialValues, [s.id]: e.target.value });
                  setSaved(false);
                }}
                placeholder={s.placeholder ?? `Your ${s.label}`}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
              />
            </label>
          ))}
        </div>
      ) : null}

      {saved ? (
        <p data-profile-edit-saved role="status" className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          data-profile-edit-cancel
          onClick={onCancel}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          data-profile-edit-save
          onClick={handleSave}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
