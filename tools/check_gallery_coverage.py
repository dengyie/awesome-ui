#!/usr/bin/env python3
"""Gallery coverage gate: every registry component must be reachable on the page.

The Gallery index.html is the second consumer of registry/components.json (the
first being the CLI). Drift between the two is silent — the 2026-11-27 UiIcon
round shipped a section showing 52 of the 58-icon vocabulary, and the earlier
TOC-vs-registry gap (251 sections vs 260 components) was only found by hand.
This gate turns "every component is visible somewhere" into a CI assertion:

  python -I tools/check_gallery_coverage.py

For each registry component, exactly one of the following must hold:
  1. it has its own <section> in index.html (h2 contains the component name);
  2. it is mounted as a kebab-case custom element (<toast-stack> ...), i.e. a
     merged/inline demo inside another section or the page header;
  3. it is listed in EXEMPT (CSS-only / non-visual assets with no markup).

Exit 0 = full coverage, 1 = drift. Zero dependencies (stdlib only).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"

# Components with no <section> and no custom element: pure CSS token/style
# assets meant to be referenced via stylesheet, never rendered as markup.
EXEMPT = {
    "PaperTheme",  # #221 — CSS variables only; no demo markup by design
}


def registry_names() -> dict[str, int]:
    reg = json.loads((ROOT / "registry" / "components.json").read_text(encoding="utf-8"))
    comps = reg if isinstance(reg, list) else reg.get("components")
    return {c["name"]: c["n"] for c in comps}


def main() -> int:
    html = HTML.read_text(encoding="utf-8")

    sections = {int(m.group(1)) for m in re.finditer(r'<section id="section-(\d+)"', html)}
    h2_texts = [re.sub(r"<[^>]+>", "", m.group(1)) for m in re.finditer(r"<h2[^>]*>(.*?)</h2>", html, re.S)]
    custom_elems = {m.group(1) for m in re.finditer(r"<([a-z][a-z-]+)[\s>]", html)}
    # vanilla module script tags (every shipped component is loaded once)
    script_tags = set(re.findall(r"""<script[^>]*src=['"]\./vanilla/(\w+)\.js""", html))

    names = registry_names()
    failures, warnings = [], []
    # UiIcon is a pure function (not a custom element), consumed via inline
    # `import uiIcon from './vanilla/UiIcon.js'` rather than a <script src> tag.
    inline_imports = set(re.findall(r"""import\s+\w+\s+from\s+['"]\./vanilla/(\w+)\.js['"]""", html))

    for name, n in names.items():
        has_section = n in sections
        kebab = re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()
        mounted = kebab in custom_elems
        loaded = name in script_tags or name in inline_imports

        if name in EXEMPT:
            continue

        if not has_section and not mounted:
            failures.append(f"{name} (#{n}) has no <section> and no custom element <{kebab}>")
        if not loaded:
            failures.append(f"{name} (#{n}) has no <script src=./vanilla/{name}.js> tag")

    # page-level invariants
    if len(sections) != len({m.group(1) for m in re.finditer(r'<section id="section-(\d+)"', html)}):
        warnings.append("duplicate section ids detected")
    icon_m = re.search(r"const names = \[([^\]]+)\]", html)
    if icon_m:
        shown = set(re.findall(r"'([^']+)'", icon_m.group(1)))
        ui = (ROOT / "vanilla" / "UiIcon.js").read_text(encoding="utf-8")
        keys = re.search(r"const ICONS = \{(.*?)\n\};", ui, re.S).group(1)
        vocab = {a or b for a, b in re.findall(
            r"(?:^|,)\s*(?:'([^']+)'|([a-zA-Z][\w-]*))\s*:", keys)}
        missing = vocab - shown
        extra = shown - vocab
        if missing:
            failures.append(f"Gallery icon grid missing {len(missing)} vocabulary icons: {sorted(missing)}")
        if extra:
            failures.append(f"Gallery icon grid has {len(extra)} names not in ICONS (empty SVGs): {sorted(extra)}")

    print(f"gallery coverage: {len(names)} components, {len(sections)} sections, "
          f"icons {len(shown) if icon_m else 0}/{len(vocab) if icon_m else '?'}")
    for w in warnings:
        print(f"  WARN: {w}")
    for f in failures:
        print(f"  FAIL: {f}")
    print("OK: every registry component is reachable on the Gallery page"
          if not failures else "FAIL: gallery coverage drift")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
