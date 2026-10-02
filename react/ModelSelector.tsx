import React, { useState, useRef, useEffect, useMemo } from "react";
import { UiIcon } from "./UiIcon";

export interface ModelOption {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  contextLength?: string;
  tags?: string[];
  isDefault?: boolean;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selectedId: string;
  onSelect?: (model: ModelOption) => void;
  placeholder?: string;
  showSearch?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models = [],
  selectedId,
  onSelect,
  placeholder = "Select model...",
  showSearch = true,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedId) || null,
    [models, selectedId]
  );

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const q = searchQuery.toLowerCase();
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.provider && m.provider.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [models, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (model: ModelOption) => {
    onSelect?.(model);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-xs font-sans text-zinc-900 dark:text-zinc-100 ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-sm ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
            <UiIcon name="sparkles" size={14} />
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {selectedModel ? selectedModel.name : placeholder}
            </span>
            {selectedModel?.provider && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {selectedModel.provider}
                {selectedModel.contextLength ? ` · ${selectedModel.contextLength}` : ""}
              </span>
            )}
          </div>
        </div>

        <UiIcon
          name="chevron-down"
          size={14}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 max-h-80 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-40 flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {showSearch && (
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80">
                <UiIcon name="search" size={13} className="text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className="w-full bg-transparent border-none text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto p-1.5 space-y-1 max-h-60" role="listbox">
            {filteredModels.length === 0 ? (
              <div className="p-3 text-center text-zinc-400 text-xs">No models found</div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === selectedId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelect(model)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-start justify-between gap-2 p-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {model.name}
                        </span>
                        {model.contextLength && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-300 font-mono">
                            {model.contextLength}
                          </span>
                        )}
                        {model.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {model.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {model.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <UiIcon
                        name="check"
                        size={14}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ModelSelector;
