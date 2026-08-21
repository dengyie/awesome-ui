/**
 * Vanilla Web Component: <roadmap-timeline>
 */
export class RoadmapTimelineElement extends HTMLElement {
  constructor() {
    super();
    this._nodes = [];
    this._activeId = null;
  }

  set data({ nodes = [], activeId = null }) {
    this._nodes = nodes;
    this._activeId = activeId;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="w-full max-w-4xl mx-auto py-8 font-sans">
        <div class="relative flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-2">
          <div class="hidden md:block absolute top-6 left-[4%] right-[4%] h-[2px] bg-[#b3ac97] dark:bg-[#3e444e] -z-0"></div>
          <div class="md:hidden absolute top-4 bottom-4 left-6 w-[2px] bg-[#b3ac97] dark:bg-[#3e444e] -z-0"></div>

          ${this._nodes
            .map((node) => {
              const isActive = this._activeId === node.id || node.status === "active";
              const isDone = node.status === "completed";
              const color = node.stageColor || "#c2410c";

              return `
              <div
                data-id="${node.id}"
                class="roadmap-node-item relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group flex-1 ${
                  isActive
                    ? "bg-[#faf8f1] dark:bg-[#1b1f26] shadow-sm border border-[#b3ac97]/60 dark:border-[#3e444e]"
                    : "hover:bg-[#faf8f1]/50 dark:hover:bg-[#1b1f26]/50"
                }"
              >
                <div
                  style="border-color: ${isActive || isDone ? color : ""}; background-color: ${isDone ? color : isActive ? "#faf8f1" : ""};"
                  class="w-11 h-11 flex-shrink-0 flex items-center justify-center rotate-45 border-2 rounded-xs transition-transform duration-200 group-hover:scale-105 ${
                    isDone
                      ? "text-white"
                      : isActive
                      ? "border-2 shadow-xs"
                      : "border-[#b3ac97] dark:border-[#3e444e] bg-[#f1efe7] dark:bg-[#14171c] text-[#8d9298] dark:text-[#6f7268]"
                  }"
                >
                  <div class="-rotate-45 font-mono text-xs font-bold flex items-center justify-center">
                    ${isDone ? "✓" : node.status === "locked" ? "🔒" : `<span style="color: ${isActive ? color : ""}">${node.index}</span>`}
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs tracking-wider uppercase font-semibold" style="color: ${color};">
                      STEP ${node.index}
                    </span>
                    ${
                      node.tags && node.tags.length > 0
                        ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded-xs border border-[#d6d2c2] dark:border-[#2b3038] text-[#545b64] dark:text-[#a9a89c]">${node.tags[0]}</span>`
                        : ""
                    }
                  </div>

                  <h4 class="mt-1 font-serif text-sm md:text-base font-bold truncate leading-tight ${
                    isActive
                      ? "text-[#22262d] dark:text-[#e9e6db]"
                      : "text-[#22262d]/80 dark:text-[#e9e6db]/80 group-hover:text-[#22262d] dark:group-hover:text-[#e9e6db]"
                  }">
                    ${node.title}
                  </h4>

                  ${
                    node.subtitle
                      ? `<p class="mt-0.5 text-xs text-[#545b64] dark:text-[#a9a89c] truncate">${node.subtitle}</p>`
                      : ""
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    this.querySelectorAll(".roadmap-node-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const node = this._nodes.find((n) => String(n.id) === id);
        if (node) {
          this.dispatchEvent(new CustomEvent("node-click", { detail: node }));
        }
      });
    });
  }
}

if (typeof customElements !== "undefined" && !customElements.get("roadmap-timeline")) {
  customElements.define("roadmap-timeline", RoadmapTimelineElement);
}
