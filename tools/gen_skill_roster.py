#!/usr/bin/env python3
"""Regenerate the per-category roster block in SKILL.md from the registry.

The "## API 速查导航" block (15 category rosters with counts) is derived
data — hand-maintained copies drifted twice (UiIcon, PaperTheme dropped).
This tool makes the registry the single source of truth: it rewrites the
roster lines between the section heading and the trailing `---` marker,
ordering categories by descending component count (the established layout)
and components by ledger n within each category.

    python -I tools/gen_skill_roster.py

Idempotent; exits 1 if the SKILL.md markers are missing. Zero dependencies.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "SKILL.md"
COMPONENTS = ROOT / "registry" / "components.json"
TAXONOMY = ROOT / "registry" / "taxonomy.json"

HEADING = "## API 速查导航"
END_MARK = "\n---\n"


def main() -> int:
    text = SKILL.read_text(encoding="utf-8")
    start = text.find(HEADING)
    if start < 0:
        print("FAIL: roster heading not found in SKILL.md")
        return 1
    body_start = text.find("\n", start) + 1
    end = text.find(END_MARK, body_start)
    if end < 0:
        print("FAIL: roster end marker (---) not found in SKILL.md")
        return 1

    reg = json.loads(COMPONENTS.read_text(encoding="utf-8"))
    tax = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    # taxonomy order = display order fallback; group by category
    cat_order = [c["id"] for c in tax["categories"]]
    groups: dict[str, list] = {}
    for c in reg["components"]:  # registry is ledger-ordered (n ascending)
        groups.setdefault(c["category"], []).append(c["name"])

    lines = []
    for cat in sorted(groups, key=lambda k: (-len(groups[k]), cat_order.index(k))):
        names = " ".join(f"`{n}`" for n in groups[cat])
        lines.append(f"- **{cat}** ({len(groups[cat])}): {names}")
    block = "\n".join(lines) + "\n\n"

    new_text = text[:body_start] + block + text[end + 1:]
    if new_text != text:
        SKILL.write_text(new_text, encoding="utf-8", newline="\n")
        print(f"OK: roster regenerated ({len(lines)} categories, "
              f"{len(reg['components'])} components)")
    else:
        print(f"OK: roster already in sync ({len(lines)} categories)")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
