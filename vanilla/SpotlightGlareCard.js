/**
 * SpotlightGlareCard - Vanilla Web Component
 * Usage: <spotlight-glare-card enable-tilt="true" glare-opacity="0.5">...</spotlight-glare-card>
 */

class SpotlightGlareCard extends HTMLElement {
  static get observedAttributes() {
    return ["glare-opacity", "glare-radius", "enable-tilt", "max-tilt"];
  }

  constructor() {
    super();
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
  }

  connectedCallback() {
    this.classList.add(
      "group",
      "relative",
      "block",
      "overflow-hidden",
      "rounded-2xl",
      "bg-[#faf8f1]",
      "dark:bg-[#1a1d24]",
      "border",
      "border-[#d6d2c2]/80",
      "dark:border-[#2b3038]/80",
      "text-[#22262d]",
      "dark:text-[#e9e6db]",
      "shadow-[0_1px_0_rgba(34,38,45,0.07),0_5px_16px_rgba(34,38,45,0.07)]",
      "dark:shadow-[0_1px_0_rgba(0,0,0,0.4),0_8px_22px_rgba(0,0,0,0.42)]",
      "transition-shadow",
      "duration-300",
      "hover:shadow-[0_2px_0_rgba(34,38,45,0.08),0_12px_28px_rgba(34,38,45,0.12)]",
      "select-none"
    );

    if (!this.querySelector(".glare-layer")) {
      const glare = document.createElement("div");
      glare.className = "glare-layer pointer-events-none absolute inset-0 z-10 transition-opacity duration-300";
      glare.setAttribute("aria-hidden", "true");
      glare.style.opacity = "0";
      glare.style.mixBlendMode = "overlay";
      this.prepend(glare);
    }

    this.addEventListener("pointermove", this._onPointerMove);
    this.addEventListener("pointerleave", this._onPointerLeave);
  }

  disconnectedCallback() {
    this.removeEventListener("pointermove", this._onPointerMove);
    this.removeEventListener("pointerleave", this._onPointerLeave);
  }

  _onPointerMove(e) {
    const glare = this.querySelector(".glare-layer");
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gx = ((x / rect.width) * 100).toFixed(1);
    const gy = ((y / rect.height) * 100).toFixed(1);

    const glareOpacity = parseFloat(this.getAttribute("glare-opacity") || "0.45");
    const glareRadius = parseFloat(this.getAttribute("glare-radius") || "55");
    const enableTilt = this.getAttribute("enable-tilt") === "true";
    const maxTilt = parseFloat(this.getAttribute("max-tilt") || "5");

    if (glare) {
      glare.style.opacity = glareOpacity;
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 30%, transparent ${glareRadius}%)`;
    }

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const ry = ((x - centerX) / centerX) * maxTilt;
      const rx = -((y - centerY) / centerY) * maxTilt;
      this.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      this.style.transition = "transform 0.1s ease-out";
    }
  }

  _onPointerLeave() {
    const glare = this.querySelector(".glare-layer");
    if (glare) glare.style.opacity = "0";

    const enableTilt = this.getAttribute("enable-tilt") === "true";
    if (enableTilt) {
      this.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      this.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    }
  }
}

if (typeof customElements !== "undefined" && !customElements.get("spotlight-glare-card")) {
  customElements.define("spotlight-glare-card", SpotlightGlareCard);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SpotlightGlareCard };
}
