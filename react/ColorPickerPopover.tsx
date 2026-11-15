import React from "react";

export interface ColorPickerPopoverProps {
  value?: string;
  swatches?: string[];
  documentColors?: string[];
  customColors?: string[];
  showEyedropper?: boolean;
  showRgbInputs?: boolean;
  showHexInput?: boolean;
  onChange?: (hex: string) => void;
  onEyedropperClick?: () => void;
  onAddCustom?: (hex: string) => void;
  className?: string;
}

const DEFAULT_SWATCH_ROWS: string[][] = [
  ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"],
  ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"],
  ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"],
  ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"],
  ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
];

const CHECK_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EYEDROPPER_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M12.7 3.3a2.1 2.1 0 0 1 3 3l-1.2 1.2 1.1 1.1-1.5 1.5-1.1-1.1-6.3 6.3c-.3.3-.6.4-1 .4H4v-2.7c0-.4.1-.7.4-1l6.3-6.3-1.1-1.1L10.1 4l1.1 1.1 1.5-1.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const normalizeHex = (input: string): string | null => {
  const rgb = hexToRgb(input);
  return rgb ? `#${input.trim().replace(/^#/, "").toLowerCase()}` : null;
};

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;

/**
 * ColorPickerPopover - solid color picker with shade grid, hex/RGB inputs, eyedropper and custom swatch management.
 */
export default function ColorPickerPopover({
  value = "#2563eb",
  swatches,
  documentColors = [],
  customColors = [],
  showEyedropper = false,
  showRgbInputs = false,
  showHexInput = true,
  onChange,
  onEyedropperClick,
  onAddCustom,
  className = "",
}: ColorPickerPopoverProps) {
  const rows = swatches && swatches.length ? [swatches] : DEFAULT_SWATCH_ROWS;
  const [hex, setHex] = React.useState(normalizeHex(value) || "#2563eb");
  const [draft, setDraft] = React.useState(hex);

  React.useEffect(() => {
    const next = normalizeHex(value);
    if (next) {
      setHex(next);
      setDraft(next);
    }
  }, [value]);

  const rgb = hexToRgb(hex) || { r: 37, g: 99, b: 235 };

  const apply = (next: string) => {
    setHex(next);
    setDraft(next);
    onChange?.(next);
  };

  const onHexInput = (raw: string) => {
    setDraft(raw);
    const parsed = normalizeHex(raw);
    if (parsed) {
      setHex(parsed);
      onChange?.(parsed);
    }
  };

  const onChannel = (channel: "r" | "g" | "b", raw: string) => {
    const num = parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    const next = rgbToHex(channel === "r" ? num : rgb.r, channel === "g" ? num : rgb.g, channel === "b" ? num : rgb.b);
    apply(next);
  };

  const swatchButton = (color: string, extra: string = "") => {
    const selected = color.toLowerCase() === hex;
    return (
      <button
        key={color + extra}
        type="button"
        data-color-swatch={color}
        title={color}
        onClick={() => apply(color.toLowerCase())}
        className={`relative flex h-6 w-6 items-center justify-center rounded-md border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          selected ? "border-indigo-600 ring-2 ring-indigo-200" : "border-zinc-200 hover:ring-2 hover:ring-zinc-200"
        }`}
        style={{ backgroundColor: color }}
      >
        {selected ? <span className={color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#f3f4f6" ? "text-zinc-500" : "text-white"}>{CHECK_SVG}</span> : null}
      </button>
    );
  };

  return (
    <div
      data-color-picker
      className={`w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-6 w-6 shrink-0 rounded-md border border-zinc-200" style={{ backgroundColor: hex }} />
        {showHexInput ? (
          <input
            data-color-hex-input
            type="text"
            value={draft}
            onChange={(e) => onHexInput(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            placeholder="#2563eb"
            aria-label="Hex color"
          />
        ) : null}
        {showEyedropper ? (
          <button
            type="button"
            data-color-eyedropper
            title="Pick color from page"
            onClick={() => onEyedropperClick?.()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
          >
            {EYEDROPPER_SVG}
          </button>
        ) : null}
      </div>

      {showRgbInputs ? (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(["r", "g", "b"] as const).map((channel) => (
            <label key={channel} className="flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-1 dark:border-zinc-700">
              <span className="text-[10px] font-semibold uppercase text-zinc-400">{channel}</span>
              <input
                data-color-channel={channel}
                type="number"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) => onChannel(channel, e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-zinc-700 focus:outline-none dark:text-zinc-200"
              />
            </label>
          ))}
        </div>
      ) : null}

      <div data-color-grid className="mt-3 space-y-1.5">
        {rows.map((row, index) => (
          <div key={index} className="flex justify-between">
            {row.map((color) => swatchButton(color))}
          </div>
        ))}
      </div>

      {documentColors.length ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Document colors</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {documentColors.map((color) => swatchButton(color, " doc"))}
          </div>
        </div>
      ) : null}

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Custom colors</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {customColors.map((color) => swatchButton(color, " custom"))}
          <button
            type="button"
            data-color-custom-add
            title={`Add ${hex}`}
            onClick={() => onAddCustom?.(hex)}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-400 hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
