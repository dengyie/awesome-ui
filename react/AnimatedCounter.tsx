import React, { useEffect, useRef, useState } from "react";

export interface AnimatedCounterProps {
  /** Target final value to count up to */
  target: number;
  /** Initial starting value, default 0 */
  start?: number;
  /** Duration in milliseconds, default 1500 */
  duration?: number;
  /** Delay in milliseconds before animation starts, default 0 */
  delay?: number;
  /** Suffix string attached to the number (e.g. "+", "%", "k") */
  suffix?: string;
  /** Prefix string attached to the number (e.g. "$", "¥") */
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  start = 0,
  duration = 1500,
  delay = 0,
  suffix = "",
  prefix = "",
  className = "",
  style,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(start);
  const elRef = useRef<HTMLSpanElement | null>(null);
  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el || animatedRef.current) return;

    if (typeof IntersectionObserver === "undefined") {
      setDisplayValue(target);
      animatedRef.current = true;
      return;
    }

    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || animatedRef.current) return;
          animatedRef.current = true;
          observer.unobserve(entry.target);

          timeoutId = setTimeout(() => {
            const startTime = performance.now();
            const range = target - start;

            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(1, Math.max(0, elapsed / duration));
              const current = Math.round(start + easeOutCubic(progress) * range);
              setDisplayValue(current);

              if (progress < 1) {
                rafId = requestAnimationFrame(tick);
              } else {
                setDisplayValue(target);
              }
            };

            rafId = requestAnimationFrame(tick);
          }, delay);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, start, duration, delay]);

  return (
    <span
      ref={elRef}
      className={`font-mono tabular-nums select-none ${className}`}
      style={style}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
