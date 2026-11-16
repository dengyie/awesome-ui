/**
 * LiquidGlass - Vanilla Web Component
 * Apple-grade Liquid Glass material container with backdrop blur, specular rim reflection, and optional pointer refraction caustics.
 *
 * Usage:
 * <liquid-glass variant="capsule" intensity="regular" enable-tilt="true">
 *   <span>Action</span>
 * </liquid-glass>
 */

class LiquidGlass extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "intensity", "interactive", "enable-tilt", "max-tilt", "glare-opacity"];
  }

  constructor() {
    super();
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
  }

  connectedCallback() {
    this._updateClasses();

    if (!this._glareEl) {
      let glare = this.querySelector(":scope > .liquid-glass-glare");
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "liquid-glass-glare pointer-events-none absolute inset-0 z-10 transition-opacity duration-300";
        glare.setAttribute("aria-hidden", "true");
        glare.style.opacity = "0";
        glare.style.mixBlendMode = "overlay";
        this.prepend(glare);
      }
      this._glareEl = glare;
    }

    if (!this._ringEl) {
      let ring = this.querySelector(":scope > .liquid-glass-ring");
      if (!ring) {
        ring = document.createElement("div");
        ring.className = "liquid-glass-ring pointer-events-none absolute inset-0 z-10 rounded-[inherit] ring-1 ring-inset ring-white/30 dark:ring-white/10";
        ring.setAttribute("aria-hidden", "true");
        this.prepend(ring);
      }
      this._ringEl = ring;
    }

    this.addEventListener("pointermove", this._onPointerMove);
    this.addEventListener("pointerleave", this._onPointerLeave);
  }

  disconnectedCallback() {
    this.removeEventListener("pointermove", this._onPointerMove);
    this.removeEventListener("pointerleave", this._onPointerLeave);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateClasses();
    }
  }

  _updateClasses() {
    const variant = this.getAttribute("variant") || "card";
    const intensity = this.getAttribute("intensity") || "regular";

    this.classList.add(
      "liquid-glass-pane",
      "group",
      "relative",
      "overflow-hidden",
      "text-[#1d1d1f]",
      "dark:text-[#f5f5f7]",
      "select-none",
      "transition-all",
      "duration-300",
      "bg-white/65",
      "dark:bg-[#16181d]/65",
      "contrast-more:bg-white",
      "contrast-more:dark:bg-[#16181d]",
      "contrast-more:backdrop-blur-none",
      "motion-reduce:transform-none",
      "motion-reduce:transition-none",
      "border",
      "border-white/50",
      "dark:border-white/10",
      "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)]",
      "dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_0_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.35)]",
      "hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),inset_0_-1px_1px_0_rgba(0,0,0,0.08),0_14px_44px_rgba(0,0,0,0.1)]",
      "dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_-1px_1px_0_rgba(0,0,0,0.45),0_16px_48px_rgba(0,0,0,0.45)]"
    );

    // Clean past variant / intensity classes
    this.classList.remove(
      "rounded-full",
      "px-5",
      "py-2.5",
      "inline-flex",
      "items-center",
      "rounded-2xl",
      "sm:rounded-3xl",
      "p-6",
      "block",
      "rounded-none",
      "border-r",
      "h-full",
      "backdrop-blur-md",
      "backdrop-saturate-150",
      "backdrop-blur-xl",
      "backdrop-saturate-[180%]",
      "backdrop-blur-2xl",
      "backdrop-saturate-[200%]"
    );

    // Apply variant
    if (variant === "capsule") {
      this.classList.add("rounded-full", "px-5", "py-2.5", "inline-flex", "items-center");
    } else if (variant === "sidebar") {
      this.classList.add("rounded-none", "border-r", "h-full", "block");
    } else {
      this.classList.add("rounded-2xl", "sm:rounded-3xl", "p-6", "block");
    }

    // Apply intensity
    if (intensity === "light") {
      this.classList.add("backdrop-blur-md", "backdrop-saturate-150");
    } else if (intensity === "thick") {
      this.classList.add("backdrop-blur-2xl", "backdrop-saturate-[200%]");
    } else {
      this.classList.add("backdrop-blur-xl", "backdrop-saturate-[180%]");
    }
  }

  _onPointerMove(e) {
    const isInteractive = this.getAttribute("interactive") !== "false";
    const enableTilt = this.getAttribute("enable-tilt") === "true";
    const variant = this.getAttribute("variant") || "card";

    if (!isInteractive && !enableTilt) return;

    const rect = this.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gx = ((x / rect.width) * 100).toFixed(1);
    const gy = ((y / rect.height) * 100).toFixed(1);

    const glareOpacity = parseFloat(this.getAttribute("glare-opacity") || "0.35");
    const maxTilt = parseFloat(this.getAttribute("max-tilt") || "4");

    const glare = this._glareEl || this.querySelector(":scope > .liquid-glass-glare");
    if (glare && isInteractive) {
      glare.style.opacity = glareOpacity.toString();
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 35%, transparent 65%)`;
    }

    if (enableTilt && variant !== "sidebar") {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const ry = ((x - centerX) / centerX) * maxTilt;
      const rx = -((y - centerY) / centerY) * maxTilt;
      this.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-1px)`;
      this.style.transition = "transform 0.1s ease-out";
    }
  }

  _onPointerLeave() {
    const glare = this._glareEl || this.querySelector(":scope > .liquid-glass-glare");
    if (glare) {
      glare.style.opacity = "0";
    }
    this.style.transform = "";
    this.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
  }
}

if (typeof window !== "undefined" && !customElements.get("liquid-glass")) {
  customElements.define("liquid-glass", LiquidGlass);
}

export { LiquidGlass };
