#!/usr/bin/env python3
"""Retrieval-quality gate: expected-recall fixtures (CI + local).

Locks in the retrieval behavior built by gen_registry_aliases.py /
gen_registry_api.py so quality cannot silently regress. Each fixture is a
(query, must-appear component) pair reflecting how agents really ask:

  python -I tools/check_retrieval.py

Exit 0 = all fixtures recall their expected component, 1 = drift.
Zero dependencies (invokes tools/query_registry.py as a subprocess so the
exact CLI contract is exercised, not a reimplementation).
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (query, expected component name). Multi-word queries exercise the AND path;
# CJK fixtures exercise alias coverage; typo fixtures exercise autocorrect.
FIXTURES = [
    # core primitives / layouts
    ("icon", "UiIcon"),
    ("tabs", "Tabs"),
    ("accordion", "Accordion"),
    ("手风琴", "Accordion"),
    ("导航栏", "Navbar"),
    ("breadcrumb nav", "Breadcrumb"),
    ("sidebar nav", "SideNav"),
    ("pagination", "Pagination"),
    ("command menu", "CommandPalette"),
    # overlays & feedback
    ("modal", "Modal"),
    ("popup", "ConfirmDialog"),
    ("弹窗", "ConfirmDialog"),
    ("toast", "ToastStack"),
    ("tooltip", "Tooltip"),
    ("empty placeholder", "EmptyState"),
    # forms
    ("date picker", "DatePicker"),
    ("color picker", "ColorPickerPopover"),
    ("otp code", "OtpInput"),
    ("登录", "AuthForm"),
    ("wizard steps", "WizardSteps"),
    # data display & charts
    ("data table", "DataTable"),
    ("dashboard", "HomepageDashboard"),
    ("kanban board", "KanbanBoard"),
    ("gantt chart", "GanttTimeline"),
    ("chart trend", "ForecastTrendChart"),
    ("图表", "MetricStrip"),
    # AI chat / artifacts
    ("reasoning", "ThinkingBlock"),
    ("推理", "ThinkingBlock"),
    ("streaming markdown", "StreamMarkdown"),
    ("citation sources", "SourcesCitation"),
    ("chat streaming", "ChatPromptInput"),
    # agent ops
    ("tool call", "ToolCallBadge"),
    ("log stream", "LiveTailLogConsole"),
    ("deploy status", "DeploymentCard"),
    ("智能体", "AgentBuilderCard"),
    # billing / commerce
    ("billing invoice", "InvoiceHistoryTable"),
    ("计费", "UsageMeter"),
    ("pricing", "PricingTable"),
    ("order tracking", "OrderTracker"),
    # media / theming
    ("voice", "VoiceModePanel"),
    ("image gallery", "ImageGenGallery"),
    ("dark mode", "ThemeToggle"),
    ("玻璃拟态", "LiquidGlass"),
    # contract-level retrieval (api surface)
    ("cropper", "AvatarCropDialog"),
    # typo tolerance
    ("poup", "Modal"),
    ("ConfimDialog", "ConfirmDialog"),
    # --event / --prop / --similar flags
    ("@event:select", "@event:select"),
    ("@prop:rows", "@prop:rows"),
    ("@similar:DataTable", "@similar:DataTable"),
]


def run_cli(args: list[str]) -> tuple[int, str]:
    r = subprocess.run(
        [sys.executable, "-I", str(ROOT / "tools" / "query_registry.py")] + args,
        capture_output=True, text=True, encoding="utf-8", cwd=ROOT,
    )
    return r.returncode, r.stdout


def names_in_output(out: str) -> set[str]:
    names = set()
    for line in out.splitlines():
        parts = line.split()
        # " 71 Modal (overlays) modal,..." — parts[0]=n, parts[1]=name
        if len(parts) > 1 and parts[0].isdigit():
            names.add(parts[1])
    return names


def main() -> int:
    failures: list[str] = []

    for fx in FIXTURES:
        if fx[0].startswith("@"):  # flag fixture: "@event:select" -> [--event, select]
            flag, _, val = fx[0].partition(":")
            rc, out = run_cli([f"--{flag[1:]}", val])
            ok = rc == 0 and fx[1] != "" and "-- 0 component(s)" not in out
            expected_desc = f"--{flag[1:]} {val} non-empty"
        else:
            rc, out = run_cli(["--search", fx[0]])
            got = names_in_output(out)
            ok = fx[1] in got
            expected_desc = f"{fx[0]!r} recalls {fx[1]!r}"
        if not ok:
            top = [l for l in out.splitlines() if l and l[:1].isdigit()][:3]
            failures.append(f"{expected_desc}\n      got: {top or '(no results)'}")

    print(f"retrieval fixtures: {len(FIXTURES) - len(failures)}/{len(FIXTURES)} pass")
    for f in failures:
        print(f"  FAIL: {f}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
