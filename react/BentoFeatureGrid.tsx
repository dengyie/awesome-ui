/**
 * BentoFeatureGrid - Marketing bento grid: mixed-span feature tiles with
 * icon / title / description and optional embedded media slot, laid out
 * with CSS grid (Krea AI / Magnific bento pattern).
 */
import React from "react";

export interface BentoTile {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  span?: 1 | 2 | 3;
  media?: string;
}

export interface BentoFeatureGridProps {
  title?: string;
  description?: string;
  tiles?: BentoTile[];
  className?: string;
  onTileClick?: (tile: BentoTile) => void;
}

const DEFAULT_TILES: BentoTile[] = [
  { id: "t1", title: "Ship faster", description: "Generate production-ready components in one prompt.", icon: "⚡", span: 2 },
  { id: "t2", title: "Zero blackbox", description: "Every component is a single readable file.", icon: "📄", span: 1 },
  { id: "t3", title: "Three stacks", description: "React, Vue 3 and Vanilla with aligned APIs.", icon: "🧩", span: 1 },
  { id: "t4", title: "Mobbin-grade patterns", description: "Visual language borrowed from the best products.", icon: "🎯", span: 2 },
];

const SPAN_CLASS: Record<number, string> = { 2: "sm:col-span-2", 3: "sm:col-span-3" };

export const BentoFeatureGrid: React.FC<BentoFeatureGridProps> = ({
  title = "Built for the AI era",
  description = "A curated atomic library assembled from real product patterns.",
  tiles = DEFAULT_TILES,
  className = "",
  onTileClick,
}) => {
  const list = Array.isArray(tiles) ? tiles : [];

  return (
    <div data-bento-grid className={`w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`}>
      <div data-bento-header className="mb-5 text-center">
        <p data-bento-heading className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-bento-subtitle className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div data-bento-tiles className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {list.map((tile) => (
          <div
            key={tile.id}
            data-bento-tile={tile.id}
            onClick={() => onTileClick?.(tile)}
            className={`group cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700 ${SPAN_CLASS[tile.span ?? 1] ?? ""}`}
          >
            {tile.icon ? <div data-bento-icon={tile.id} aria-hidden="true" className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-lg dark:bg-violet-950/50">{tile.icon}</div> : null}
            <p data-bento-title={tile.title} className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{tile.title}</p>
            <p data-bento-description={tile.id} className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{tile.description || ""}</p>
            {tile.media ? (
              <div data-bento-media={tile.id} className="mt-3 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
                <img src={tile.media} alt="" loading="lazy" className="h-28 w-full object-cover" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BentoFeatureGrid;
