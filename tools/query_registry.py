#!/usr/bin/env python3
"""Query the component registry from the command line.

Lets agents (and humans) filter the 260-component library by category, tag,
or free-text name/description without loading the full JSON:

    python -I tools/query_registry.py --category billing
    python -I tools/query_registry.py --tag modal
    python -I tools/query_registry.py --tag streaming,animated
    python -I tools/query_registry.py --search dialog
    python -I tools/query_registry.py --name SeatBillingTable   # full entry detail

Output: one component per line as "NNN Name (category) tag1,tag2,...".
Zero dependencies; reads registry/components.json + registry/taxonomy.json.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = ROOT / "registry" / "components.json"
TAX = ROOT / "registry" / "taxonomy.json"


def main() -> int:
    ap = argparse.ArgumentParser(description="Filter the awesome-ui component registry.")
    ap.add_argument("--category", help="exact category id (e.g. billing)")
    ap.add_argument("--tag", help="comma-separated tag ids; components must carry ALL of them")
    ap.add_argument("--search", help="case-insensitive substring match on component name")
    ap.add_argument("--name", help="exact component name; prints full detail")
    ap.add_argument("--stats", action="store_true", help="print category/tag distribution instead of entries")
    args = ap.parse_args()

    reg = json.loads(REG.read_text(encoding="utf-8"))
    comps = reg["components"]
    tax = json.loads(TAX.read_text(encoding="utf-8"))
    labels = {c["id"]: c["label"] for c in tax["categories"]}

    if args.stats:
        from collections import Counter
        cats = Counter(c["category"] for c in comps)
        print("categories:")
        for cid, n in cats.most_common():
            print(f"  {cid:14s} {labels.get(cid, ''):8s} {n}")
        tags = Counter(t for c in comps for t in c["tags"])
        print(f"tags ({len(tags)} distinct):")
        for tid, n in sorted(tags.items(), key=lambda x: -x[1]):
            print(f"  {tid:16s} {n}")
        return 0

    if args.name:
        for c in comps:
            if c["name"] == args.name:
                print(f"#{c['n']} {c['name']}")
                print(f"  category: {c['category']} ({labels.get(c['category'], '')})")
                print(f"  tags:     {', '.join(c['tags'])}")
                print(f"  files:    react/{c['name']}.tsx · vue/{c['name']}.vue · vanilla/{c['name']}.js")
                return 0
        print(f"not found: {args.name}", file=sys.stderr)
        return 1

    want_tags = {t.strip() for t in args.tag.split(",") if t.strip()} if args.tag else set()
    results = comps
    if args.category:
        results = [c for c in results if c["category"] == args.category]
    if want_tags:
        results = [c for c in results if want_tags <= set(c["tags"])]
    if args.search:
        q = args.search.lower()
        results = [c for c in results if q in c["name"].lower()]

    for c in results:
        print(f"{c['n']:3d} {c['name']} ({c['category']}) {', '.join(c['tags'])}")
    print(f"-- {len(results)} component(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
