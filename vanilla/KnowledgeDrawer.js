/**
 * Vanilla Web Component: <knowledge-drawer>
 */
export class KnowledgeDrawerElement extends HTMLElement {
  constructor() {
    super();
    this._data = {
      isOpen: false,
      index: "01",
      title: "",
      subtitle: "",
      themeColor: "#c2410c",
      conceptText: "",
      dependencies: [],
      actionLabel: "开始该阶段练习",
    };
  }

  set data(val) {
    this._data = { ...this._data, ...val };
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._data.isOpen) {
      this.innerHTML = "";
      return;
    }

    const { index, title, subtitle, themeColor, conceptText, dependencies, actionLabel } = this._data;

    this.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
        <div class="drawer-backdrop fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"></div>

        <div
          style="border-left-color: ${themeColor};"
          class="relative z-10 w-full max-w-md bg-[#faf8f1] dark:bg-[#1b1f26] h-full shadow-2xl border-l-4 flex flex-col transform transition-transform duration-300 ease-out"
        >
          <div class="p-5 border-b border-[#d6d2c2] dark:border-[#2b3038] flex items-start justify-between gap-4 bg-[#f1efe7]/50 dark:bg-[#14171c]/50">
            <div class="flex items-start gap-3 min-w-0">
              <span class="font-mono text-2xl font-black leading-none" style="color: ${themeColor};">${index}</span>
              <div class="min-w-0">
                <h3 class="font-serif text-lg font-bold text-[#22262d] dark:text-[#e9e6db] leading-snug truncate">${title}</h3>
                ${subtitle ? `<p class="text-xs text-[#545b64] dark:text-[#a9a89c] mt-0.5">${subtitle}</p>` : ""}
              </div>
            </div>

            <button type="button" class="drawer-close p-1.5 rounded-sm hover:bg-[#e7e4d7] dark:hover:bg-[#0f1216] text-[#545b64] dark:text-[#a9a89c] transition-colors">
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-6">
            ${
              conceptText
                ? `
              <div>
                <div class="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#8d9298] dark:text-[#6f7268] uppercase mb-2">
                  <span>核心要点与认知</span>
                </div>
                <p class="text-sm leading-relaxed text-[#22262d] dark:text-[#e9e6db] bg-[#f1efe7]/60 dark:bg-[#14171c]/60 p-3.5 rounded-sm border border-[#d6d2c2]/80 dark:border-[#2b3038]">
                  ${conceptText}
                </p>
              </div>
            `
                : ""
            }

            ${
              dependencies && dependencies.length > 0
                ? `
              <div>
                <div class="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#8d9298] dark:text-[#6f7268] uppercase mb-2">
                  <span>拓扑前置与分支关系</span>
                </div>
                <div class="space-y-2">
                  ${dependencies
                    .map(
                      (dep) => `
                    <div class="flex items-center gap-2.5 text-xs p-2 rounded border border-[#d6d2c2] dark:border-[#2b3038] bg-white/50 dark:bg-black/20">
                      <span class="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border tracking-wider" style="border-color: ${
                        dep.type === "dependency" ? "#8d9298" : dep.type === "branch" ? "#1d4ed8" : themeColor
                      }; color: ${dep.type === "dependency" ? "#545b64" : dep.type === "branch" ? "#1d4ed8" : themeColor};">${dep.type}</span>
                      <span class="text-[#545b64] dark:text-[#a9a89c] font-medium">${dep.label}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>

          <div class="p-4 border-t border-[#d6d2c2] dark:border-[#2b3038] bg-[#f1efe7]/30 dark:bg-[#14171c]/30">
            <button
              type="button"
              class="drawer-action w-full py-2.5 px-4 text-white font-serif font-bold text-sm rounded-sm shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              style="background-color: ${themeColor}; border-color: ${themeColor};"
            >
              <span>${actionLabel}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelector(".drawer-backdrop")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("close"));
    });
    this.querySelector(".drawer-close")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("close"));
    });
    this.querySelector(".drawer-action")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("action"));
    });
  }
}

if (typeof customElements !== "undefined" && !customElements.get("knowledge-drawer")) {
  customElements.define("knowledge-drawer", KnowledgeDrawerElement);
}
