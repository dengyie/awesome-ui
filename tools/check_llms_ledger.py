#!/usr/bin/env python3
"""llms.txt ledger consistency check (CI + local).

Verifies the component index ledger matches reality:
  1. Entry numbering: 0..N contiguous, no gaps / duplicates / order regressions.
  2. Structure: every numbered entry is followed by exactly three "   - " lines
     (React / Vue 3 / Vanilla).
  3. Files exist: every sub-line path points to a real file in the repo.
  4. Coverage: every react/*.tsx, vue/*.vue, vanilla/*.js component file is
     referenced by at least one entry (counting shared assets like UiIcon).

Exit code 0 = consistent, 1 = drift detected. Zero dependencies.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "llms.txt"

SUB_RE = re.compile(r"^   - (React|Vue 3|Vanilla): (\S+?)(?: \(|$)")
ENTRY_RE = re.compile(r"^(\d+)\. [A-Za-z0-9]+:")


def main() -> int:
    if not LEDGER.exists():
        print(f"FAIL: {LEDGER} not found")
        return 1
    lines = LEDGER.read_text(encoding="utf-8").splitlines()

    errors: list[str] = []
    nums: list[int] = []
    referenced: set[str] = set()

    for i, line in enumerate(lines):
        m = ENTRY_RE.match(line)
        if not m:
            continue
        num = int(m.group(1))
        nums.append(num)
        kids = lines[i + 1 : i + 4]
        if len(kids) < 3 or not all(k.startswith("   - ") for k in kids):
            errors.append(f"entry {num}: expected 3 sub-lines, got {sum(1 for k in kids if k.startswith('   - '))}")
            continue
        for k in kids:
            sm = SUB_RE.match(k)
            if not sm:
                errors.append(f"entry {num}: malformed sub-line: {k.strip()[:60]}")
                continue
            path = ROOT / sm.group(2)
            referenced.add(sm.group(2))
            if not path.exists():
                errors.append(f"entry {num}: missing file {sm.group(2)}")

    # 1. numbering
    if nums != sorted(nums):
        errors.append("numbering is out of order")
    dupes = sorted({n for n in nums if nums.count(n) > 1})
    if dupes:
        errors.append(f"duplicate entry numbers: {dupes}")
    if nums and nums != list(range(nums[0], nums[0] + len(nums))):
        missing = sorted(set(range(nums[0], nums[-1] + 1)) - set(nums))
        errors.append(f"gap in numbering, missing: {missing}")

    # 4. coverage (component files must be referenced; shared assets exempt)
    referenced_names = {p.split("/", 1)[1] for p in referenced if "/" in p}
    for d in ("react", "vue", "vanilla"):
        for f in (ROOT / d).iterdir():
            if f.name.startswith("paper-theme"):
                continue  # shared theme asset, registered separately in ledger
            if f.suffix in (".tsx", ".vue", ".js") and f.name not in referenced_names:
                errors.append(f"unreferenced component: {d}/{f.name}")

    if errors:
        print(f"FAIL: {len(errors)} ledger drift issue(s):")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"OK: {len(nums)} entries (numbered {nums[0]}..{nums[-1]}), all sub-lines valid, all files present, full coverage")
    return 0


if __name__ == "__main__":
    sys.exit(main())
