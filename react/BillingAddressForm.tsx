import React, { useState } from "react";

export interface BillingAddress {
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
}

export interface BillingAddressFormProps {
  title?: string;
  countries?: string[];
  labels?: { address1?: string; address2?: string; city?: string; state?: string; zip?: string };
  /** initial values (all optional; controlled-ish via defaultValue) */
  defaultValue?: Partial<BillingAddress>;
  submitLabel?: string;
  showOptional?: boolean;
  onSubmit?: (address: BillingAddress) => void;
  className?: string;
}

const DEFAULT_COUNTRIES = ["United States", "Singapore", "United Kingdom", "Germany", "Japan"];

export default function BillingAddressForm({
  title = "Billing details",
  countries = DEFAULT_COUNTRIES,
  labels = {},
  defaultValue = {},
  submitLabel = "Continue to next step",
  showOptional = true,
  onSubmit,
  className = "",
}: BillingAddressFormProps) {
  const [country, setCountry] = useState(defaultValue.country ?? countries[0] ?? "");
  const [address1, setAddress1] = useState(defaultValue.address1 ?? "");
  const [address2, setAddress2] = useState(defaultValue.address2 ?? "");
  const [city, setCity] = useState(defaultValue.city ?? "");
  const [state, setState] = useState(defaultValue.state ?? "");
  const [zip, setZip] = useState(defaultValue.zip ?? "");
  const [submitted, setSubmitted] = useState<BillingAddress | null>(null);

  const valid = address1.trim() !== "" && city.trim() !== "" && zip.trim() !== "";

  const handleSubmit = () => {
    if (!valid) return;
    const address: BillingAddress = { country, address1, address2: address2 || undefined, city, state: state || undefined, zip };
    setSubmitted(address);
    onSubmit?.(address);
  };

  return (
    <div data-billing-address-form className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-billing-address-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>

      <label data-billing-country-wrap className="mt-3 flex items-center gap-2">
        <span className="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
        <select
          data-billing-country
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label data-billing-field-wrap className="mt-2 flex items-center gap-2">
        <span className="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{labels.address1 ?? "Address line 1"}</span>
        <input
          data-billing-address1
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          placeholder="Street address"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </label>

      {showOptional ? (
        <label data-billing-field-wrap className="mt-2 flex items-center gap-2">
          <span className="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{labels.address2 ?? "Address line 2"}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">optional</span>
          <input
            data-billing-address2
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Apt, suite, unit"
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
      ) : null}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label data-billing-city-wrap className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{labels.city ?? "City"}</span>
          <input
            data-billing-city
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
        <label data-billing-zip-wrap className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{labels.zip ?? "ZIP"}</span>
          <input
            data-billing-zip
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
      </div>

      {showOptional ? (
        <label data-billing-state-wrap className="mt-2 flex items-center gap-2">
          <span className="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{labels.state ?? "State"}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">optional</span>
          <input
            data-billing-state
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        {submitted ? (
          <span data-billing-address-saved className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Saved {submitted.city}, {submitted.country}
          </span>
        ) : (
          <span data-billing-address-hint className="text-[11px] text-zinc-400 dark:text-zinc-500">Address, city and ZIP are required.</span>
        )}
        <button
          type="button"
          data-billing-address-submit
          disabled={!valid}
          onClick={handleSubmit}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
