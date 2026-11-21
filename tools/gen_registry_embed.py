#!/usr/bin/env python3
"""Regenerate the registry JSON embedded in index.html (#gallery-registry-data).

Single source of truth is registry/taxonomy.json + registry/components.json;
this script re-renders the compact payload the Gallery TOC consumes and
replaces the previous payload in place. Run after every registry change:

    python -I tools/gen_registry_embed.py

Zero dependencies. Exits 1 if index.html has no embed marker.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
COMPONENTS = ROOT / "registry" / "components.json"
TAXONOMY = ROOT / "registry" / "taxonomy.json"

MARKER = re.compile(r'(id="gallery-registry-data">)(\{.*?\})(</script>)', re.S)


def main() -> int:
    if not MARKER.search(INDEX.read_text(encoding="utf-8")):
        print("FAIL: #gallery-registry-data marker not found in index.html")
        return 1
    tax = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    reg = json.loads(COMPONENTS.read_text(encoding="utf-8"))
    labels = {c["id"]: c["label"] for c in tax["categories"]}
    comps = {c["name"]: [c["category"], "|".join(c["tags"])] for c in reg["components"]}
    payload = json.dumps({"cats": labels, "comps": comps}, ensure_ascii=False, separators=(",", ":"))
    html = INDEX.read_text(encoding="utf-8")
    m = MARKER.search(html)
    html = html[: m.start(2)] + payload + html[m.end(2):]
    INDEX.write_text(html, encoding="utf-8", newline="\n")
    print(f"OK: embedded registry data regenerated ({len(payload)} chars, {len(comps)} components)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
