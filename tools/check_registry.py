#!/usr/bin/env python3
"""registry consistency check (CI + local).

Verifies the component registry (registry/) matches the ledger and taxonomy:
  1. Alignment: registry component names exactly match llms.txt ledger names
     (no missing, no extra, no duplicates), in the same order.
  2. Category validity: every category id exists in taxonomy.json categories.
  3. Tag validity: every tag id exists in taxonomy.json tags.
  4. Non-empty: every component has at least one tag.
  5. Facet coverage: every taxonomy tag is used by at least one component
     (guards against dead vocabulary).

Exit code 0 = consistent, 1 = drift detected. Zero dependencies.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "llms.txt"
TAXONOMY = ROOT / "registry" / "taxonomy.json"
COMPONENTS = ROOT / "registry" / "components.json"

ENTRY_RE = re.compile(r"^(\d+)\. ([A-Za-z0-9]+):")


def main() -> int:
    errors: list[str] = []

    for f in (TAXONOMY, COMPONENTS):
        if not f.exists():
            print(f"FAIL: {f} not found")
            return 1

    tax = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    reg = json.loads(COMPONENTS.read_text(encoding="utf-8"))
    valid_cats = {c["id"] for c in tax["categories"]}
    valid_tags = {t["id"] for t in tax["tags"]}

    ledger_names: list[str] = []
    if LEDGER.exists():
        for line in LEDGER.read_text(encoding="utf-8").splitlines():
            m = ENTRY_RE.match(line)
            if m:
                ledger_names.append(m.group(2))
    else:
        errors.append("llms.txt not found; cannot align registry against ledger")

    # 0. taxonomy internal consistency: $facets must exactly cover the tag vocabulary
    facet_tags = {t for group in tax.get("$facets", {}).values() for t in group}
    if facet_tags != valid_tags:
        errors.append(
            f"$facets != tags vocabulary: missing in facets {sorted(valid_tags - facet_tags)}, "
            f"unknown in facets {sorted(facet_tags - valid_tags)}"
        )
    # metadata sanity
    comps = reg.get("components", [])
    if not reg.get("version"):
        errors.append("registry/components.json missing 'version'")
    if reg.get("count") != len(comps):
        errors.append(f"registry 'count' field ({reg.get('count')}) != actual components ({len(comps)})")
    reg_names = [c.get("name", "") for c in comps]

    # 1. alignment with ledger
    if ledger_names and reg_names != ledger_names:
        ledger_set, reg_set = set(ledger_names), set(reg_names)
        for i, (ln, rn) in enumerate(zip(ledger_names, reg_names)):
            if ln != rn:
                errors.append(f"entry {i}: ledger has {ln!r}, registry has {rn!r}")
        for name in ledger_set - reg_set:
            errors.append(f"missing from registry: {name}")
        for name in reg_set - ledger_set:
            errors.append(f"not in ledger: {name}")

    dupes = sorted({n for n in reg_names if reg_names.count(n) > 1})
    if dupes:
        errors.append(f"duplicate registry names: {dupes}")
    nums = [c.get("n") for c in comps]
    if nums and nums != sorted(nums):
        errors.append("registry numbering out of order")
    if nums and nums != list(range(nums[0], nums[0] + len(nums))):
        errors.append("registry numbering has gaps")

    # 2-4. per-component validity
    used_tags: set[str] = set()
    for c in comps:
        name = c.get("name", "?")
        if c.get("category") not in valid_cats:
            errors.append(f"{name}: invalid category {c.get('category')!r}")
        tags = c.get("tags")
        if not isinstance(tags, list) or not tags:
            errors.append(f"{name}: missing or empty tags")
            continue
        for t in tags:
            if t not in valid_tags:
                errors.append(f"{name}: invalid tag {t!r}")
            used_tags.add(t)

    # 8. retrieval metadata: desc must exist and match the ledger verbatim
    #    (the search CLI and Gallery embed match on it; drift = stale retrieval),
    #    aliases must be a list of unique non-empty strings.
    ledger_desc = {}
    if LEDGER.exists():
        desc_re = re.compile(r"^\d+\. ([A-Za-z0-9]+): (.+)$")
        for line in LEDGER.read_text(encoding="utf-8").splitlines():
            m = desc_re.match(line)
            if m:
                ledger_desc[m.group(1)] = m.group(2).strip()
        for c in comps:
            name = c.get("name", "?")
            want = ledger_desc.get(name)
            got = c.get("desc")
            if got is None:
                errors.append(f"{name}: missing desc (run tools/gen_registry_aliases.py)")
            elif want is not None and got != want:
                errors.append(f"{name}: desc out of sync with llms.txt ledger (run tools/gen_registry_aliases.py)")
            aliases = c.get("aliases")
            if not isinstance(aliases, list):
                errors.append(f"{name}: missing aliases list (run tools/gen_registry_aliases.py)")
            else:
                if len(aliases) != len(set(aliases)):
                    errors.append(f"{name}: duplicate aliases")
                bad = [a for a in aliases if not isinstance(a, str) or not a.strip()]
                if bad:
                    errors.append(f"{name}: empty/non-string aliases {bad[:4]}")
            api = c.get("api")
            if not isinstance(api, dict) or "props" not in api or "events" not in api:
                errors.append(f"{name}: missing api {{props, events}} (run tools/gen_registry_api.py)")
            else:
                for k in ("props", "events"):
                    v = api[k]
                    if not isinstance(v, list) or any(not isinstance(x, str) or not x.strip() for x in v):
                        errors.append(f"{name}: api.{k} must be a list of non-empty strings")
                    elif len(v) != len(set(v)):
                        errors.append(f"{name}: duplicate entries in api.{k}")
                # callback props (onX) must surface as events for cross-stack parity
                orphan_cbs = [
                    p for p in api["props"]
                    if re.fullmatch(r"on[A-Z]\w*", p) and p[2:].lower() not in api["events"]
                ]
                if orphan_cbs:
                    errors.append(
                        f"{name}: callback props without matching events "
                        f"(run tools/gen_registry_api.py): {orphan_cbs[:6]}"
                    )

    # 5. dead vocabulary guard
    dead = sorted(valid_tags - used_tags)
    if dead:
        errors.append(f"unused tags in taxonomy (dead vocabulary): {dead}")

    # 6. Gallery embed sync: #gallery-registry-data payload must match the registry
    index = ROOT / "index.html"
    if index.exists():
        html = index.read_text(encoding="utf-8")
        m = re.search(r'id="gallery-registry-data">(\{.*?\})</script>', html, re.S)
        if not m:
            errors.append("index.html: #gallery-registry-data marker missing")
        else:
            try:
                payload = json.loads(m.group(1))
                labels = {c["id"]: c["label"] for c in tax["categories"]}
                expected = {
                    c["name"]: [
                        c["category"],
                        "|".join(c["tags"]),
                        c.get("desc", ""),
                        "|".join(c.get("aliases", [])),
                        "|".join(c.get("api", {}).get("props", [])),
                        "|".join(c.get("api", {}).get("events", [])),
                    ]
                    for c in comps
                }
                if payload.get("cats") != labels:
                    errors.append("index.html embed: category labels out of sync with taxonomy.json")
                if payload.get("comps") != expected:
                    drifted = sorted(
                        set(payload.get("comps", {})) ^ set(expected)
                    )
                    errors.append(
                        f"index.html embed: component data out of sync with registry/components.json "
                        f"(run tools/gen_registry_embed.py; differing/missing: {drifted[:8]})"
                    )
            except json.JSONDecodeError as e:
                errors.append(f"index.html embed: invalid JSON ({e})")

        # 7. Gallery section-id integrity: every <section id="section-N"> must use the
        #    component's ledger number (n) — never a display number or placeholder.
        #    Anchored by the component NAME in the nearby <h2>, not the h2 number
        #    (h2 numbers are display numbers and have drifted before).
        sec_ids: list[int] = []
        name_of_n = {c["n"]: c["name"] for c in comps}
        for sm in re.finditer(r'<section id="section-(\d+)"', html):
            n = int(sm.group(1))
            sec_ids.append(n)
            seg = html[sm.start():sm.start() + 1500]
            h2 = re.search(r'>\s*\d+\s*[·.]\s*([A-Za-z0-9]+)', seg)
            if not h2:
                errors.append(f"index.html section-{n}: no component <h2> found nearby")
                continue
            true_n = next((c["n"] for c in comps if c["name"] == h2.group(1)), None)
            if true_n is None:
                errors.append(f"index.html section-{n}: h2 name {h2.group(1)!r} not in registry")
            elif true_n != n:
                errors.append(
                    f"index.html section-{n}: id mismatch — h2 component {h2.group(1)!r} "
                    f"has ledger #{true_n} (rename id to section-{true_n})"
                )
        dup = sorted({n for n in sec_ids if sec_ids.count(n) > 1})
        if dup:
            errors.append(f"index.html: duplicate section ids: {[f'section-{n}' for n in dup]}")
        orphan = sorted(n for n in sec_ids if n not in name_of_n)
        if orphan:
            errors.append(f"index.html: section ids outside ledger range: {orphan}")

    if errors:
        print(f"FAIL: {len(errors)} registry drift issue(s):")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(
        f"OK: {len(comps)} components aligned with ledger, "
        f"{len(valid_cats)} categories + {len(valid_tags)} tags valid, full tag coverage"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
