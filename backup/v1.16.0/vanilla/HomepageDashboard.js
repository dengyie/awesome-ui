/**
 * HomepageDashboard — Vanilla Web Component
 * A copy-paste, zero-backbox single-file dashboards with the iconic gethomepage/homepage
 * look: header (title + live clock + search) + responsive grouped service cards with
 * status dots/pills + version footer.
 *
 * This is an ORIGINAL implementation of the visual design language of
 * https://github.com/gethomepage/homepage (GPL-3.0). No GPL source is copied.
 *
 * Usage:
 *   <homepage-dashboard title="Homepage" subtitle="My homelab" status-style="pill"></homepage-dashboard>
 *   <script>
 *     const dash = document.querySelector("homepage-dashboard");
 *     dash.groups = [
 *       { name: "Media", icon: "🎬", services: [
 *         { name: "Jellyfin", description: "Streaming", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/jellyfin.png", href: "https://jellyfin.local", status: "up", pingText: "12ms" },
 *         ...
 *       ]}
 *     ];
 *   </script>
 */
class HomepageDashboardElement extends HTMLElement {
  static get observedAttributes() {
    return [
      "title",
      "subtitle",
      "version",
      "header-style",
      "status-style",
      "search-placeholder",
      "collapsible",
      "show-search",
      "show-clock",
    ];
  }

  constructor() {
    super();
    this._groups = [];
    this._collapsedGroups = new Set();
    this._clockTimer = null;
    this._search = "";
  }

  // ----- public API -----
  get groups() {
    return this._groups;
  }

  set groups(value) {
    this._groups = Array.isArray(value) ? value : [];
    this._collapsedGroups.clear();
    this._render();
  }

  // ----- lifecycle -----
  connectedCallback() {
    this._manageClock();
    this.addEventListener("click", this._handleClick);
    this.addEventListener("input", this._handleInput);
    this._render();
  }

  disconnectedCallback() {
    this._clearClock();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("input", this._handleInput);
  }

  attributeChangedCallback(name) {
    if (name === "show-clock") this._manageClock();
    if (this.isConnected) this._render();
  }

  // ----- clock ✓ toggled dynamically, never leaks -----
  _clearClock() {
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = null;
  }

  _manageClock() {
    this._clearClock();
    if (this._attrBool("show-clock", true) && this.isConnected) {
      this._clockTimer = setInterval(() => this._updateClock(), 1000);
    }
  }

  // convenience reads
  _attr(name, fallback) {
    const v = this.getAttribute(name);
    return v === null ? fallback : v;
  }

  _attrBool(name, fallback) {
    const v = this.getAttribute(name);
    if (v === null) return fallback;
    return v !== "false" && v !== "0";
  }

  _headerStyle() {
    return this._attr("header-style", "underlined");
  }

  _statusStyle() {
    const s = this._attr("status-style", "pill");
    return ["dot", "pill", "none"].includes(s) ? s : "pill";
  }

  _collapsible() {
    return this._attrBool("collapsible", true);
  }

  // ----- helpers -----
  _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Only allow safe URL protocols into <a href>. Blocks javascript:, data:, vbscript:,
   * file: and any other unsupported scheme while allowing http(s), mailto, protocol-
   * relative, root-relative and dot-relative URLs.
   */
  static isSafeHref(href) {
    if (typeof href !== "string") return false;
    const t = href.trim();
    if (t.length === 0) return false;
    // protocol-relative //host, absolute path /x, relative ./ or ../
    if (t.startsWith("//") || t.startsWith("/") || t.startsWith("./") || t.startsWith("../")) return true;
    // intentional helper name
    return /^(https?:\/\/|mailto:)/i.test(t);
  }

  _iconHTML(service) {
    const icon = service?.icon;
    const name = service?.name || "?";
    const letter = this._esc((name || "?").trim().charAt(0).toUpperCase());
    const wrap = `class="shrink-0 my-1.5 ml-1.5 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-zinc-200/70 dark:bg-white/10 service-icon"`;
    if (!icon) {
      return `<div ${wrap}><span class="text-xl font-bold text-zinc-500 dark:text-zinc-300">${letter}</span></div>`;
    }
    if (/^(https?:|data:|\.|\/)/i.test(icon)) {
      return `<div ${wrap}><img src="${this._esc(icon)}" alt="" loading="lazy" width="32" height="32" class="w-8 h-8 object-contain" onerror="this.style.display='none'"/></div>`;
    }
    // emoji or short glyph
    return `<div ${wrap}><span class="text-xl leading-none">${this._esc(icon)}</span></div>`;
  }

  _statusHTML(service) {
    const style = this._statusStyle();
    const s = (service?.status || "unknown").toLowerCase();
    const map = {
      up: { dot: "bg-emerald-500", pill: "text-emerald-500/90", label: "UP" },
      online: { dot: "bg-emerald-500", pill: "text-emerald-500/90", label: "ONLINE" },
      down: { dot: "bg-rose-500", pill: "text-rose-500/90", label: "DOWN" },
      offline: { dot: "bg-rose-500", pill: "text-rose-500/90", label: "OFFLINE" },
      warn: { dot: "bg-amber-500", pill: "text-amber-500", label: "WARN" },
      error: { dot: "bg-orange-500", pill: "text-orange-500", label: "ERROR" },
      unknown: { dot: "bg-zinc-400/60 dark:bg-zinc-500/60", pill: "text-zinc-500 dark:text-zinc-400", label: "—" },
    };
    const cfg = map[s] || map.unknown;

    if (style === "none") return "";

    if (style === "dot") {
      return `<span title="${this._esc(service.pingText || cfg.label)}" role="img" aria-label="${this._esc(service.pingText || cfg.label)}" class="absolute top-1.5 right-1.5 h-3 w-3 rounded-full ${cfg.dot} service-status-dot"></span>`;
    }

    const text = this._esc(service.pingText || cfg.label);
    return `<span class="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wide px-1.5 py-1 rounded-md bg-zinc-500/10 dark:bg-zinc-400/10 ${cfg.pill} service-status-pill" role="img" aria-label="${text}">${text}</span>`;
  }

  _serviceHTML(service) {
    const query = this._search.trim().toLowerCase();
    const matched =
      !query ||
      (service.name || "").toLowerCase().includes(query) ||
      (service.description || "").toLowerCase().includes(query);
    const outer = [
      "service-card",
      "relative overflow-clip rounded-md shadow-md shadow-zinc-900/10 dark:shadow-zinc-900/20",
      "bg-white hover:bg-zinc-50 dark:bg-white/5 dark:hover:bg-white/10 transition-all mb-2 p-0.5",
      matched ? "" : "hidden",
    ]
      .filter(Boolean)
      .join(" ");

    const safeHref = HomepageDashboardElement.isSafeHref(service.href) ? service.href : "";
    const linkAttrs = safeHref ? `href="${this._esc(safeHref)}" target="_blank" rel="noreferrer"` : "";

    return `
      <li class="${outer}" data-name="${this._esc(service.name || "")}">
        <div class="flex select-none items-center service-title">
          <a ${linkAttrs} class="shrink-0 flex items-center justify-center">${this._iconHTML(service)}</a>
          <div class="flex-1 min-w-0 px-2 py-2.5 text-sm text-left z-10">
            <div class="truncate font-medium text-zinc-800 dark:text-zinc-200 service-name">${this._esc(service.name || "")}</div>
            ${service.description ? `<div class="truncate mt-0.5 text-xs font-light text-zinc-500 dark:text-zinc-300 service-description">${this._esc(service.description)}</div>` : ""}
          </div>
        </div>
        ${this._statusHTML(service)}
      </li>
    `;
  }

  _groupHTML(group, groupIndex) {
    const isCollapsed = this._collapsedGroups.has(group.name);
    const services = (group.services || []).map((s) => this._serviceHTML(s)).join("");
    const chevron = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-5 h-5 transition-transform duration-200 text-zinc-700 dark:text-zinc-300 ml-auto ${isCollapsed ? "rotate-180" : ""}">
        <path d="m6 9 6 6 6-6"/>
      </svg>`;
    const groupName = this._esc(group.name || `Group ${groupIndex + 1}`);
    const groupIcon = group.icon
      ? `<span class="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-white/10 text-sm leading-none">${this._esc(group.icon)}</span>`
      : "";

    return `
      <div class="services-group w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-1 pb-0" data-group="${this._esc(group.name)}">
        <button type="button" class="group-header flex w-full select-none items-center gap-1 py-0.5 ${!this._collapsible() ? "cursor-default" : ""}" data-toggle-group="${this._esc(group.name)}" aria-expanded="${isCollapsed ? "false" : "true"}">
          ${groupIcon}
          <h2 class="text-xl font-medium text-zinc-800 dark:text-zinc-300 service-group-name">${groupName}</h2>
          ${this._collapsible() ? chevron : ""}
        </button>
        ${isCollapsed ? "" : `<ul class="mt-2">${services}</ul>`}
      </div>
    `;
  }

  _clockHTML() {
    if (!this._attrBool("show-clock", true)) return "";
    return `
      <div class="text-right shrink-0 block min-w-28" data-el="clock">
        <div class="text-2xl sm:text-3xl font-semibold tabular-nums text-zinc-800 dark:text-zinc-100 leading-tight" data-el="clock-time"></div>
        <div class="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400" data-el="clock-date"></div>
      </div>
    `;
  }

  _headerHTML() {
    const title = this._esc(this._attr("title", "Homepage"));
    const subtitle = this._esc(this._attr("subtitle", "A highly customizable homelab dashboard"));
    const style = this._headerStyle();
    const headerCls =
      style === "boxed"
        ? "m-3 sm:m-5 mb-0 rounded-lg bg-white dark:bg-white/5 shadow-md shadow-zinc-900/10 p-4"
        : style === "clean"
          ? "m-3 sm:m-5 mb-0"
          : "m-3 sm:m-5 mb-1 border-b-2 border-zinc-300/70 dark:border-zinc-700 pb-4";

    const search = this._attrBool("show-search", false)
      ? `
        <div class="relative w-full sm:w-64">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l2.328 2.328a.75.75 0 1 1-1.06 1.06l-2.328-2.328A7 7 0 0 1 2 9Z" clip-rule="evenodd"/>
          </svg>
          <input type="search" data-el="search" value="${this._esc(this._search)}" placeholder="${this._esc(this._attr("search-placeholder", "Search services…"))}" aria-label="Search services"
            class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-white/5 px-9 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"/>
        </div>`
      : "";

    return `
      <header class="${headerCls} homepage-header">
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div class="min-w-0">
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 homepage-title">${title}</h1>
            ${subtitle ? `<p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400 homepage-subtitle">${subtitle}</p>` : ""}
          </div>
          <div class="flex flex-wrap items-center gap-4">
            ${search}
            ${this._clockHTML()}
          </div>
        </div>
      </header>
    `;
  }

  _footerHTML() {
    const version = this._esc(this._attr("version", "Homepage · awesome-ui"));
    return `
      <footer class="px-5 py-6 text-right">
        <a href="https://github.com/gethomepage/homepage" target="_blank" rel="noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <span>${version}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </footer>
    `;
  }

  _render() {
    if (!this.isConnected) return;
    const emptyNote =
      this._search.trim()
        ? `<p class="p-4 text-sm text-zinc-400">No matching services for “${this._esc(this._search.trim())}”.</p>`
        : `<p class="p-4 text-sm text-zinc-400">No groups configured — assign <code>dash.groups = […]</code>.</p>`;
    const hasGroups = this._groups.length > 0;
    const mainContent =
      !hasGroups
        ? emptyNote
        : this._groups.map((g, i) => this._groupHTML(g, i)).join("");
    // persistent no-match note (shown only while a live search matches nothing)
    const noMatchNote = hasGroups
      ? `<p data-el='empty-search-note' class="px-3.5 pt-1 pb-2 text-sm text-zinc-400 hidden">No matching services for \u201c${this._esc(this._search.trim())}\u201d.</p>`
      : "";

    this.innerHTML = `
      <div class="homepage-dashboard relative w-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden"
        style="font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
        ${this._headerHTML()}
        <main class="flex flex-wrap items-start px-3 sm:px-5 pb-4">
          ${mainContent}
          ${noMatchNote}
        </main>
        ${this._footerHTML()}
      </div>
    `;

    this._updateClock();
    this._applySearchFiltering();
  }

  _updateClock() {
    const timeEl = this.querySelector("[data-el='clock-time']");
    if (!timeEl || !this._attrBool("show-clock", true)) return;
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateEl = this.querySelector("[data-el='clock-date']");
    if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  // Hide non-matching cards AND sync group visibility so a no-match search leaves
  // no empty group headers behind (parity with React/Vue filtering). ClassList-only;
  // never rebuilds the DOM on keystroke.
  _applySearchFiltering() {
    const q = this._search.trim().toLowerCase();
    this.querySelectorAll(".service-card").forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const desc = (card.querySelector(".service-description")?.textContent || "").toLowerCase();
      const matched = q.length === 0 || name.includes(q) || desc.includes(q);
      card.classList.toggle("hidden", !matched);
    });
    this.querySelectorAll(".services-group").forEach((group) => {
      const cards = [...group.querySelectorAll(".service-card")];
      const anyVisible = cards.some((c) => !c.classList.contains("hidden"));
      group.hidden = q.length > 0 && !anyVisible;
    });
    const note = this.querySelector("[data-el='empty-search-note']");
    if (note) {
      const cards = [...this.querySelectorAll(".service-card")];
      const everythingHidden = cards.length > 0 && cards.every((c) => c.classList.contains("hidden"));
      const show = q.length > 0 && everythingHidden;
      note.classList.toggle("hidden", !show);
      if (show) note.textContent = `No matching services for \u201c${this._search.trim()}\u201d.`;
    }
  }

  // ----- interactions (event delegation on root) -----
  _handleClick = (event) => {
    const groupBtn = event.target.closest("[data-toggle-group]");
    if (!groupBtn) return;
    const name = groupBtn.dataset.toggleGroup;
    if (!name || !this._collapsible()) return;
    const was = this._collapsedGroups.has(name);
    if (was) this._collapsedGroups.delete(name);
    else this._collapsedGroups.add(name);
    this._render();
    this.dispatchEvent(
      new CustomEvent("group-toggle", { detail: { group: name, collapsed: !was } })
    );
  };

  _handleInput = (event) => {
    if (event.target.dataset?.el !== "search") return;
    this._search = event.target.value;
    this._applySearchFiltering();
  };
}

if (typeof customElements !== "undefined" && !customElements.get("homepage-dashboard")) {
  customElements.define("homepage-dashboard", HomepageDashboardElement);
}
export default HomepageDashboardElement;