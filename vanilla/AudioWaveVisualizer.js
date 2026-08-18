/**
 * AudioWaveVisualizer - Vanilla Web Component
 * Usage: <audio-wave-visualizer is-active bar-count="16"></audio-wave-visualizer>
 */
class AudioWaveVisualizer extends HTMLElement {
  static get observedAttributes() {
    return ["is-active", "bar-count", "color"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const isActive = this.hasAttribute("is-active");
    const barCount = parseInt(this.getAttribute("bar-count") || "16", 10);
    const color = this.getAttribute("color") || "bg-amber-500";

    const bars = [];
    for (let idx = 0; idx < barCount; idx++) {
      const delay = ((idx * 0.08) % 0.8).toFixed(2);
      const duration = (0.6 + ((idx % 4) * 0.15)).toFixed(2);
      bars.push(`
        <span style="animation-delay:${delay}s; animation-duration:${duration}s;" class="w-1 rounded-full transition-all duration-300 ${color} ${isActive ? 'h-full animate-[audio-pulse_0.8s_ease-in-out_infinite_alternate]' : 'h-1.5 opacity-40'}"></span>
      `);
    }

    this.innerHTML = `
      <div class="inline-flex items-center justify-center gap-1 h-8 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 select-none" role="status" aria-label="${isActive ? 'Audio active' : 'Audio idle'}">
        ${bars.join("")}
      </div>
    `;
  }
}

if (!customElements.get("audio-wave-visualizer")) {
  customElements.define("audio-wave-visualizer", AudioWaveVisualizer);
}
export default AudioWaveVisualizer;
