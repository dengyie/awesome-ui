#!/usr/bin/env python3
"""Query the component registry from the command line.

Lets agents (and humans) filter the 260-component library by category, tag,
or free-text keywords without loading the full JSON:

    python -I tools/query_registry.py --category billing
    python -I tools/query_registry.py --tag modal
    python -I tools/query_registry.py --tag streaming,animated
    python -I tools/query_registry.py --search popup            # alias/desc aware
    python -I tools/query_registry.py --search 弹窗             # CJK aliases
    python -I tools/query_registry.py --search chat streaming   # multi-word AND
    python -I tools/query_registry.py --name SeatBillingTable   # full entry detail

Output: one component per line, ranked (exact name > alias > tag > description),
as "NNN Name (category) tag1,tag2,...". Zero dependencies; reads
registry/components.json + registry/taxonomy.json.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = ROOT / "registry" / "components.json"
TAX = ROOT / "registry" / "taxonomy.json"


def main() -> int:
    ap = argparse.ArgumentParser(description="Filter the awesome-ui component registry.")
    ap.add_argument("--category", help="exact category id (e.g. billing)")
    ap.add_argument("--tag", help="comma-separated tag ids; components must carry ALL of them")
    ap.add_argument("--search", help="space-separated keywords, all must match; searches "
                                     "name, aliases (incl. CJK), tags, description and "
                                     "category label; results ranked")
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
                print(f"  aliases:  {', '.join(c.get('aliases', [])) or '(none)'}")
                print(f"  desc:     {c.get('desc', '(not compiled — run tools/gen_registry_aliases.py)')}")
                # Files follow kebab-case of the name, except shared-CSS theme
                # assets (e.g. PaperTheme) which live at their own lowercase path.
                kebab = re.sub(r'(?<!^)(?=[A-Z])', '_', c["name"]).lower().replace('_', '-')
                guesses = [f"react/{kebab}.ts", f"react/{kebab}.tsx", f"react/{c['name']}.tsx",
                           f"vue/{kebab}.ts", f"vue/{kebab}.vue", f"vue/{c['name']}.vue",
                           f"vanilla/{kebab}.js", f"vanilla/{c['name']}.js"]
                found = [g for g in guesses if (ROOT / g).exists()]
                print(f"  files:    {' · '.join(found) if found else 'not found — check ledger entry'}")
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
        # Every keyword must hit in at least one searchable field.
        # Rank: exact name hit (3) > alias hit (2) > tag/desc/category hit (1).
        def fields(c):
            name = c["name"].lower()
            return (
                name,
                [a.lower() for a in c.get("aliases", [])],
                " ".join(c["tags"]).lower(),
                c.get("desc", "").lower(),
                labels.get(c["category"], "").lower(),
            )

        ranked = []
        for c in results:
            f = fields(c)
            score = 0
            matched_all = True
            for kw in args.search.lower().split():
                hit = 0
                if kw in f[0]:
                    hit = max(hit, 3)
                elif any(kw in a for a in f[1]):
                    hit = max(hit, 2)
                elif kw in f[2] or kw in f[3] or kw in f[4]:
                    hit = max(hit, 1)
                if not hit:
                    matched_all = False
                    break
                score += hit
            if matched_all:
                ranked.append((score, c))
        ranked.sort(key=lambda t: (-t[0], t[1]["n"]))
        results = [c for _, c in ranked]

    for c in results:
        print(f"{c['n']:3d} {c['name']} ({c['category']}) {', '.join(c['tags'])}")
    print(f"-- {len(results)} component(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
