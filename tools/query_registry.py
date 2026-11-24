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


def levenshtein(a: str, b: str) -> int:
    """Plain DP edit distance (no deps). Inputs are short words, O(len^2) fine."""
    if a == b:
        return 0
    if not a or not b:
        return max(len(a), len(b))
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def stem(w: str) -> str:
    """Crude suffix stripper for retrieval ('sorting'->'sort', 'confirmation'->'confirm').

    Deliberately conservative: only strips when >=3 chars remain, so short
    words and roots are never mangled. Agents write inflected English
    ('a table with sorting and filtering'); the registry vocabulary is
    citation-form ('sort', 'filter'). Substring matching already tolerates
    prefixes, but suffix variation ('sorting' contains neither 'sort' hits
    break) needs this fold. The '-ation|-ion' arm handles noun forms
    ('confirmation'->'confirm', 'validation'->'valid') — good enough for
    retrieval because the registry vocabulary is citation-form and the
    match is substring-based ('confirm' still hits 'confirmation' descs).
    """
    for suf in ("ation", "ition", "ution", "ion"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            return w[: -len(suf)]
    for suf in ("ing", "ies", "ed", "es", "s"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            return w[: -len(suf)]
    return w


def typo_fix(kw: str, vocab: list[str]) -> str | None:
    """Map a mistyped keyword to the closest known vocabulary word.

    Only fires when the keyword found nothing by itself, so it can never
    override an exact/substring hit. Threshold scales with word length.
    """
    best, best_d = None, 99
    for w in vocab:
        d = levenshtein(kw, w)
        if d < best_d:
            best, best_d = w, d
    limit = 1 if len(kw) <= 4 else (2 if len(kw) <= 8 else 3)
    return best if best_d <= limit else None


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows GBK console
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Filter the awesome-ui component registry.")
    ap.add_argument("--category", help="exact category id (e.g. billing)")
    ap.add_argument("--tag", help="comma-separated tag ids; components must carry ALL of them")
    ap.add_argument("--search", help="space-separated keywords, all must match; searches "
                                     "name, aliases (incl. CJK), tags, description, "
                                     "category label, props and events; results ranked; "
                                     "typos auto-corrected against the registry vocabulary")
    ap.add_argument("--event", help="exact custom-event name (e.g. select); "
                                    "components that emit it")
    ap.add_argument("--prop", help="exact prop name (e.g. rows); components accepting it")
    ap.add_argument("--similar", help="component name; nearest components ranked by "
                                      "shared tags/category/API overlap (composition helper)")
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
                api = c.get("api", {})
                print(f"  props:    {', '.join(api.get('props', [])) or '(none)'}")
                print(f"  events:   {', '.join(api.get('events', [])) or '(none)'}")
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

    if args.similar:
        base = next((c for c in comps if c["name"].lower() == args.similar.lower()), None)
        if base is None:
            print(f"not found: {args.similar}", file=sys.stderr)
            return 1
        bset = set(base["tags"]) | {base["category"]}
        bapi = set(base.get("api", {}).get("props", [])) | set(base.get("api", {}).get("events", []))
        ranked = []
        for c in comps:
            if c["name"] == base["name"]:
                continue
            cset = set(c["tags"]) | {c["category"]}
            capi = set(c.get("api", {}).get("props", [])) | set(c.get("api", {}).get("events", []))
            jaccard = len(bset & cset) / len(bset | cset)
            api_overlap = len(bapi & capi) / max(len(bapi | capi), 1)
            ranked.append((jaccard + 0.5 * api_overlap, c))
        ranked.sort(key=lambda t: (-t[0], t[1]["n"]))
        print(f"components similar to {base['name']} (tags+category+API overlap):")
        results = [c for _, c in ranked[:15]]
        for score, c in ranked[:15]:
            print(f"{c['n']:3d} {c['name']} ({c['category']}) {', '.join(c['tags'])}  [{score:.2f}]")
        print(f"-- {len(results)} component(s)")
        return 0

    if args.event or args.prop:
        if args.event:
            results = [c for c in results if args.event in c.get("api", {}).get("events", [])]
        if args.prop:
            results = [c for c in results if args.prop in c.get("api", {}).get("props", [])]

    if args.search:
        # Every keyword must hit in at least one searchable field.
        # Rank: exact name hit (3) > alias hit (2) > tag/desc/category/props/events hit (1).
        def fields(c):
            api = c.get("api", {})
            return (
                c["name"].lower(),
                [a.lower() for a in c.get("aliases", [])],
                " ".join(c["tags"]).lower(),
                c.get("desc", "").lower(),
                labels.get(c["category"], "").lower(),
                " ".join(api.get("props", [])).lower(),
                " ".join(api.get("events", [])).lower(),
            )

        notes = []
        keywords = args.search.lower().split()
        # English function words carry no component semantics and never co-occur
        # on one component's fields, so natural-language phrases like
        # "a modal for destructive confirmation" died on the AND path. Drop
        # them before matching (CJK queries are unaffected — 中文分词后本就无此类虚词).
        STOPWORDS = {
            "a", "an", "the", "and", "or", "for", "of", "to", "in", "on",
            "with", "that", "this", "from", "by", "is", "are", "can",
            "component", "components", "ui", "please", "show", "find", "need",
        }
        keywords = [k for k in keywords if k not in STOPWORDS] or args.search.lower().split()
        # Typo correction is keyword-level, not per-component: resolve each
        # keyword against the vocabulary ONCE before matching (a naive
        # per-component call would run the full edit-distance sweep 260x).
        vocab = sorted({
            w
            for c in comps
            for w in fields(c)[0].split() + fields(c)[1] + fields(c)[2].split()
                       + fields(c)[3].split() + fields(c)[5].split() + fields(c)[6].split()
        })
        resolved = []
        for kw in keywords:
            if any(
                kw in f[0] or kw in f[2] or kw in f[3] or kw in f[4] or kw in f[5] or kw in f[6]
                or any(kw in a for a in f[1])
                for f in (fields(c) for c in comps)
            ):
                resolved.append(kw)
            elif re.search(r"[\u4e00-\u9fff]", kw) and " " not in kw:
                # CJK compound fallback, three tiers:
                #   1. longest matching suffix (文件上传 -> 上传): users prepend
                #      classifiers ("文件/图片") to a known alias word;
                #   2. longest matching prefix (弹窗组件 -> 弹窗): users append
                #      generic nouns;
                #   3. longest matching prefix across all fields (previous
                #      behaviour, kept as the last resort).
                # Both folds require >=2 chars: single-CJK-char folds are pure
                # noise ("件" hits 44 descs via 附件/条件/组件, "文" hits 3 via
                # 文档/文案), so "弹窗组件" used to fold to suffix "件" (44 junk
                # hits) instead of the correct prefix "弹窗".
                suffix = next(
                    (kw[i:] for i in range(1, len(kw) - 1)
                     if any(
                         kw[i:] in f[0] or kw[i:] in f[2] or kw[i:] in f[3] or kw[i:] in f[4]
                         or kw[i:] in f[5] or kw[i:] in f[6]
                         or any(kw[i:] in a for a in f[1])
                         for f in (fields(c) for c in comps)
                     )),
                    None,
                )
                prefix = next(
                    (kw[:i] for i in range(len(kw) - 1, 0, -1)
                     if any(
                         kw[:i] in f[0] or kw[:i] in f[2] or kw[:i] in f[3] or kw[:i] in f[4]
                         or kw[:i] in f[5] or kw[:i] in f[6]
                         or any(kw[:i] in a for a in f[1])
                         for f in (fields(c) for c in comps)
                     )),
                    None,
                )
                fold = suffix or prefix
                if fold:
                    notes.append(f"'{kw}' -> '{fold}'")
                    resolved.append(fold)
                else:
                    resolved.append(kw)  # matches nothing; reported as 0 results
            else:
                # Inflection fold before typo correction: 'sorting' ->
                # 'sort'. Only reached when the raw keyword matched nothing
                # anywhere, so exact/substring hits are never overridden.
                sk = stem(kw)
                if sk != kw and any(
                    sk in f[0] or sk in f[2] or sk in f[3] or sk in f[4] or sk in f[5] or sk in f[6]
                    or any(sk in a for a in f[1])
                    for f in (fields(c) for c in comps)
                ):
                    notes.append(f"'{kw}' -> '{sk}'")
                    resolved.append(sk)
                    continue
                fix = typo_fix(kw, vocab)
                if fix is None:
                    resolved.append(kw)  # keep as-is; it will simply match nothing
                else:
                    notes.append(f"'{kw}' -> '{fix}'")
                    resolved.append(fix)
        for n in dict.fromkeys(notes):
            print(f"(typo-corrected: {n})", file=sys.stderr)

        ranked = []
        for c in results:
            f = fields(c)
            scores = []
            for kw in resolved:
                hit = 0
                for cand in dict.fromkeys([kw, stem(kw)]):  # raw first, then inflection fold
                    if cand in f[0]:
                        hit = max(hit, 3)
                    elif any(cand in a for a in f[1]):
                        hit = max(hit, 2)
                    elif cand in f[2] or cand in f[3] or cand in f[4] or cand in f[5] or cand in f[6]:
                        hit = max(hit, 1)
                    if hit:
                        break
                if not hit:
                    break
                scores.append(hit)
            if len(scores) == len(resolved):
                # Weakest-link ranking: the LOWEST per-keyword score dominates
                # (a component matching every keyword by name outranks one
                # matching one by name and the rest only in descriptions).
                # Sum acts as tiebreak; n gives stable output order.
                ranked.append((min(scores) * 100 + sum(scores), c))
        ranked.sort(key=lambda t: (-t[0], t[1]["n"]))
        results = [c for _, c in ranked]

    for c in results:
        print(f"{c['n']:3d} {c['name']} ({c['category']}) {', '.join(c['tags'])}")
    print(f"-- {len(results)} component(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())