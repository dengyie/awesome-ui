import React, { useRef } from "react";

export interface LiquidGlassProps {
  children?: React.ReactNode;
  /**
   * Visual preset variant:
   * - 'capsule': Rounded-full floating pill / toolbar dock
   * - 'card': Rounded-2xl / rounded-3xl content card / modal pane
   * - 'sidebar': Edge-anchored translucent navigation panel
   */
  variant?: "capsule" | "card" | "sidebar";
  /**
   * Material density / blur intensity:
   * - 'light': Subtle sheer frosting (backdrop-blur-md)
   * - 'regular': Apple standard Liquid Glass (backdrop-blur-xl, saturate-180%)
   * - 'thick': Heavy frosted glass for high-contrast backdrops (backdrop-blur-2xl)
   */
  intensity?: "light" | "regular" | "thick";
  /**
   * Enable dynamic pointer-tracking refractive specular highlight
   */
  interactive?: boolean;
  /**
   * Enable subtle 3D tilt transformation on pointer move
   */
  enableTilt?: boolean;
  /**
   * Max tilt degrees (default 4)
   */
  maxTilt?: number;
  /**
   * Custom specular glare opacity (0 - 1, default 0.35)
   */
  glareOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  variant = "card",
  intensity = "regular",
  interactive = true,
  enableTilt = false,
  maxTilt = 4,
  glareOpacity = 0.35,
  className = "",
  style,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive && !enableTilt) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gxPercent = ((x / rect.width) * 100).toFixed(1);
    const gyPercent = ((y / rect.height) * 100).toFixed(1);

    if (interactive && glareRef.current) {
      glareRef.current.style.opacity = glareOpacity.toString();
      glareRef.current.style.background = `radial-gradient(circle at ${gxPercent}% ${gyPercent}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 35%, transparent 65%)`;
    }

    if (enableTilt && variant !== "sidebar") {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const ry = ((x - centerX) / centerX) * maxTilt;
      const rx = -((y - centerY) / centerY) * maxTilt;
      el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-1px)`;
      el.style.transition = "transform 0.1s ease-out";
    }
  };

  const handlePointerLeave = () => {
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
    const el = containerRef.current;
    if (el) {
      el.style.transform = "";
      el.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    }
  };

  // Variant geometry
  const variantClasses = {
    capsule: "rounded-full px-5 py-2.5 inline-flex items-center",
    card: "rounded-2xl sm:rounded-3xl p-6 block",
    sidebar: "rounded-none border-r h-full block",
  }[variant];

  // Material blur & vibrancy density
  const intensityClasses = {
    light: "backdrop-blur-md backdrop-saturate-150",
    regular: "backdrop-blur-xl backdrop-saturate-[180%]",
    thick: "backdrop-blur-2xl backdrop-saturate-[200%]",
  }[intensity];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={style}
      className={`liquid-glass-pane group relative overflow-hidden text-[#1d1d1f] dark:text-[#f5f5f7] select-none transition-all duration-300 ${variantClasses} ${intensityClasses}
        bg-white/65 dark:bg-[#16181d]/65
        contrast-more:bg-white contrast-more:dark:bg-[#16181d] contrast-more:backdrop-blur-none
        motion-reduce:transform-none motion-reduce:transition-none
        border border-white/50 dark:border-white/10
        shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)]
        dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_0_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.35)]
        hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),inset_0_-1px_1px_0_rgba(0,0,0,0.08),0_14px_44px_rgba(0,0,0,0.1)]
        dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_-1px_1px_0_rgba(0,0,0,0.45),0_16px_48px_rgba(0,0,0,0.45)]
        ${className}`}
    >
      {/* Specular refractive rim caustics sheen layer */}
      {interactive && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="liquid-glass-glare pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
          style={{
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Micro-frost edge reflection ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] ring-1 ring-inset ring-white/30 dark:ring-white/10"
      />

      {/* Content wrapper */}
      <div className="relative z-0 h-full w-full">{children}</div>
    </div>
  );
};
