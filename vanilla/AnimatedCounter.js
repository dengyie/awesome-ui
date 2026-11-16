/**
 * AnimatedCounter - Vanilla Web Component
 * Usage: <animated-counter target="270" suffix="+" duration="1500"></animated-counter>
 */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

class AnimatedCounter extends HTMLElement {
  static get observedAttributes() {
    return ["target", "start", "duration", "delay", "suffix", "prefix"];
  }

  constructor() {
    super();
    this._animated = false;
    this._rafId = 0;
    this._timeoutId = null;
    this._observer = null;
  }

  connectedCallback() {
    this.classList.add("font-mono", "tabular-nums", "select-none");
    this.renderInitial();
    this.initObserver();
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._timeoutId) clearTimeout(this._timeoutId);
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  attributeChangedCallback() {
    if (this.isConnected && !this._animated) {
      this.renderInitial();
    }
  }

  renderInitial() {
    const start = parseFloat(this.getAttribute("start") || "0");
    const prefix = this.getAttribute("prefix") || "";
    const suffix = this.getAttribute("suffix") || "";
    this.textContent = `${prefix}${start}${suffix}`;
  }

  initObserver() {
    if (this._animated) return;

    const target = parseFloat(this.getAttribute("target") || "0");
    const start = parseFloat(this.getAttribute("start") || "0");
    const duration = parseFloat(this.getAttribute("duration") || "1500");
    const delay = parseFloat(this.getAttribute("delay") || "0");
    const prefix = this.getAttribute("prefix") || "";
    const suffix = this.getAttribute("suffix") || "";

    if (typeof IntersectionObserver === "undefined") {
      this.textContent = `${prefix}${target}${suffix}`;
      this._animated = true;
      return;
    }

    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || this._animated) return;
          this._animated = true;
          if (this._observer) this._observer.unobserve(entry.target);

          this._timeoutId = setTimeout(() => {
            const startTime = performance.now();
            const range = target - start;

            const tick = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(1, Math.max(0, elapsed / duration));
              const current = Math.round(start + easeOutCubic(progress) * range);
              this.textContent = `${prefix}${current}${suffix}`;

              if (progress < 1) {
                this._rafId = requestAnimationFrame(tick);
              } else {
                this.textContent = `${prefix}${target}${suffix}`;
              }
            };

            this._rafId = requestAnimationFrame(tick);
          }, delay);
        });
      },
      { threshold: 0.2 }
    );

    this._observer.observe(this);
  }
}

if (typeof customElements !== "undefined" && !customElements.get("animated-counter")) {
  customElements.define("animated-counter", AnimatedCounter);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AnimatedCounter };
}
