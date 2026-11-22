#!/usr/bin/env python3
"""Compile searchable metadata (desc + aliases) into registry/components.json.

Retrieval reinforcement: agents search by need ("popup", "login", "弹窗"),
not by component name. This tool:

  1. desc    — copies each component's ledger description from llms.txt
               (the human-authored source of truth) into the registry so the
               search CLI and the Gallery embed can match on it. check_registry
               enforces desc == ledger description, so the two can never drift.
  2. aliases — curated synonym + CJK aliases per component from the GROUPS
               table below (concept -> name pattern), plus an automatic
               spaced-camelCase variant of the name ("ChatPromptInput" ->
               "chat prompt input") so multi-word queries hit.

Idempotent: safe to re-run after registry or ledger changes.

    python -I tools/gen_registry_aliases.py

Zero dependencies.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "llms.txt"
COMPONENTS = ROOT / "registry" / "components.json"

ENTRY_RE = re.compile(r"^(\d+)\. ([A-Za-z0-9]+): (.+)$")

# Curated alias groups: (english aliases, cjk aliases, name-match regex).
# A component inherits a group's aliases when its NAME matches the pattern.
# Keep entries concept-level (what a user would type), not name echoes.
GROUPS = [
    (["popup"], ["弹窗", "对话框"], r"Modal|Dialog|Popover"),
    (["command menu"], ["命令面板"], r"CommandPalette"),
    (["login", "signin", "log in"], ["登录", "认证"], r"Auth"),
    (["upload"], ["上传"], r"Dropzone"),
    (["upload", "crop", "cropper"], ["裁剪", "剪裁"], r"AvatarCropDialog"),
    (["reasoning", "chain of thought"], ["推理", "思维链"], r"ThinkingBlock"),
    (["chart", "graph"], ["图表"], r"Chart|Gauge|Donut|Bars$|MetricStrip|StatsBand|Breakdown"),
    (["gauge"], ["仪表盘"], r"Gauge|Donut"),
    (["spinner", "loading"], ["加载", "加载中"], r"TypingIndicator|StreamingProgressBar|AnimatedCounter"),
    (["sidebar"], ["侧边栏"], r"SideNav|SideDrawer"),
    (["drawer"], ["抽屉"], r"Drawer"),
    (["tabs"], ["标签页", "选项卡"], r"Tabs$|StatusCountTabs"),
    (["navbar", "navigation bar"], ["导航栏"], r"Navbar|BottomTabBar"),
    (["accordion", "collapsible panel"], ["手风琴", "折叠面板"], r"Accordion"),
    (["tag", "chip"], ["标签"], r"Tag$|AttachmentChip"),
    (["page header"], ["页头"], r"PageHeader"),
    (["tool palette"], ["工具面板", "工具栏"], r"EditorToolPalette|RichToolbar"),
    (["switch"], ["开关"], r"ToggleSwitch"),
    (["stepper", "wizard"], ["步骤", "向导"], r"Stepper|Wizard|Steps"),
    (["tooltip"], ["工具提示", "悬浮提示"], r"Tooltip"),
    (["toast"], ["提示条", "通知条"], r"Toast"),
    (["notification"], ["通知"], r"Notification"),
    (["breadcrumb"], ["面包屑"], r"Breadcrumb"),
    (["pagination", "pager"], ["分页"], r"Pagination"),
    (["table"], ["表格"], r"Table$"),
    (["card"], ["卡片"], r"Card$"),
    (["form"], ["表单"], r"Form$|FormField"),
    (["list"], ["列表"], r"List$|Feed$|Inbox"),
    (["timeline"], ["时间线"], r"Timeline"),
    (["kanban"], ["看板"], r"Kanban"),
    (["gantt"], ["甘特图"], r"Gantt"),
    (["calendar"], ["日历"], r"Calendar|SchedulerSlots|TimeSlotPicker"),
    (["picker", "selector"], ["选择器"], r"Picker$|Selector$|ComboBox|ColorPicker"),
    (["dropdown", "select"], ["下拉"], r"Dropdown|ComboBox|EntityMultiSelectPicker|ModelSelector|AccountSwitcher|WorkspaceSwitcher|ColumnVisibility|ZoomControl"),
    (["icon"], ["图标"], r"UiIcon"),
    (["search"], ["搜索"], r"Search"),
    (["filter"], ["筛选", "过滤器"], r"Filter"),
    (["dashboard"], ["仪表盘", "看板"], r"Dashboard"),
    (["panel"], ["面板"], r"Panel$"),
    (["badge"], ["徽标", "角标"], r"Badge$"),
    (["avatar"], ["头像"], r"AvatarGroup|ProfileHeader"),
    (["empty state"], ["空状态"], r"EmptyState|NoResultsState|PermissionDeniedState|AgentErrorRecovery"),
    (["onboarding", "tour"], ["引导", "新手引导"], r"Onboarding|Tour"),
    (["theme", "dark mode"], ["主题", "暗色模式", "深色模式"], r"ThemeToggle|PaperTheme"),
    (["backdrop", "background"], ["背景", "背景特效"], r"Backdrop|LiquidGlass|SpotlightGlare|PointerRipples"),
    (["glassmorphism"], ["玻璃拟态"], r"LiquidGlass"),
    (["chat"], ["聊天", "对话"], r"Chat|PromptChips|AiRewriteMenu|AiSuggestionCard|AiNoteAnswer"),
    (["prompt"], ["提示词"], r"Prompt"),
    (["voice", "speech"], ["语音"], r"Voice|Audio"),
    (["image"], ["图片", "图像"], r"Image"),
    (["video"], ["视频"], r"Video"),
    (["map"], ["地图"], r"Map"),
    (["pricing"], ["定价", "价格"], r"Pricing|Paywall|PlanComparison"),
    (["billing"], ["计费", "账单"], r"Billing|Invoice|Usage|TokenCost|Credit|Spend|TopUp|Seat|Upgrade|Trial|Membership|Addon"),
    (["payment"], ["支付"], r"Payment|Checkout"),
    (["invoice"], ["发票"], r"Invoice"),
    (["order"], ["订单"], r"Order"),
    (["checkout"], ["结算"], r"Checkout"),
    (["permission", "rbac"], ["权限"], r"Permission|Approval|Guardrail|AuthGate"),
    (["security"], ["安全"], r"Security|ApiKey|Otp"),
    (["otp", "verification code"], ["验证码"], r"Otp"),
    (["diff"], ["差异对比"], r"Diff|VariantDiff"),
    (["code"], ["代码"], r"CodeBlock|CodeReview"),
    (["log"], ["日志"], r"Log|EventStream|LiveTail"),
    (["deploy"], ["部署"], r"Deploy|Pipeline|Release"),
    (["agent", "tool call"], ["智能体", "工具调用"], r"Agent|ToolCall|ToolApproval|ToolSchema|Mcp"),
    (["eval", "evaluation"], ["评测"], r"Eval"),
    (["ticket", "support"], ["工单", "客服"], r"HelpCenter|HelpResources|Zendesk|Appeal|Knowledge"),
    (["marketing", "landing"], ["营销", "落地页"], r"Hero|Testimonial|Bento|LogoCloud|Marquee|Quote|Footer|Roadmap|Changelog|Blog"),
    (["docs"], ["文档"], r"Docs|ApiReference|WriterStyleGuide"),
    (["citation", "sources"], ["引用来源"], r"SourcesCitation"),
]

# Capability aliases: functional VERBS ("能排序的表格", "可拖拽的看板") are
# behavior, not identity — GROUPS' name-pattern matching can never express
# them, and the ledger desc is English-only, so Chinese verb queries had 23
# zero-hit blind spots (86-word audit, 2026-11-23). A component earns a verb
# alias when its ledger DESC (human-authored semantic summary) matches the
# signal pattern; props/events are deliberately NOT scanned (generic words
# like `show`/`visibility`/`paused` pollute precision). Patterns are tight
# (word-bounded, multiword phrases) and VERB_EXCLUDE filters desc hits that
# are false friends ("muted rows" ≠ 静音, "skeleton" form layout ≠ 骨架屏,
# "timer reset" ≠ 重置). Same derived-data contract as GROUPS: regenerated,
# check_registry enforces sync, CI diff gate blocks drift.
CAPABILITY_ALIASES = [
    ("排序", r"\bsort(?:able|ing|ed)?\b", []),
    ("拖拽", r"\bdrag(?:gable|ging|ged)?\b", []),
    ("拖放", r"\bdrag(?:gable|ging|ged)?\b", []),
    ("进度", r"\bprogress\b", []),
    ("复制", r"\bcopy(?:ing|ied)?\b", []),
    ("撤销", r"\b(?:undo|redo)\b", []),
    ("收藏", r"\b(?:favorite|bookmark)(?:d|s)?\b", []),
    ("缩放", r"\bzoom\b", ["GammaImageDetail", "DeliveryTrackingPanel"]),  # zoom = crop/scale imagery, not viewport zoom
    ("放大", r"\bzoom in\b", []),
    ("预览", r"\bpreview(?:ing|ed)?\b", []),
    ("确认", r"\bconfirm(?:ation|ing|ed)?\b", ["SuccessToast"]),  # "timer reset"/visual confirmation, not confirm action
    ("删除", r"\b(?:delet(?:e|ed|ion)|remov(?:e|ed|al))\b", []),
    ("编辑", r"\bedit(?:able|ed|ing|or)?\b", []),
    ("批量", r"\b(?:batch|bulk)\b", []),
    ("批处理", r"\b(?:batch|bulk)\b", []),
    ("重置", r"\breset\b", ["SuccessToast"]),  # auto-dismiss timer reset
    ("清空", r"\bclear(?:ed|ing)?\b", []),
    ("折叠", r"\bcollaps(?:e|ed|ible|ing)\b", ["Breadcrumb"]),  # maxItems overflow collapse ≠ collapsible panel
    ("展开", r"\bexpand(?:ed|ing|able)?\b", []),
    ("跳转", r"\b(?:anchor|jump|scroll[\s-]?to)\b", []),
    ("锚点", r"\banchor\b", []),
    ("播放", r"\bplay(?:ing|back)?\b", ["AgentTaskProgress"]),  # "playing state" of a stepper, not media playback
    ("暂停", r"\bpaus(?:e|ed|ing)\b", ["MarqueeWall"]),  # hover-pause marquee ≠ media pause control
    ("静音", r"\bmut(?:e|ed|ing)\b", ["EventLogTable"]),  # "muted rows" styling
    ("骨架屏", r"\bskeleton\b", ["FormField"]),  # field placeholder layout, not loading skeleton
]


def spaced(name: str) -> str:
    """camelCase -> spaced lowercase ('ChatPromptInput' -> 'chat prompt input')."""
    return re.sub(r"(?<!^)([A-Z])", r" \1", name).lower()


def main() -> int:
    # 1. ledger descriptions (source of truth)
    desc: dict[str, str] = {}
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        m = ENTRY_RE.match(line)
        if m:
            desc[m.group(2)] = m.group(3).strip()

    reg = json.loads(COMPONENTS.read_text(encoding="utf-8"))
    comps = reg["components"]
    names_lower = {c["name"].lower() for c in comps}

    stats = {"desc": 0, "alias_total": 0, "group_hits": 0, "cap_hits": 0, "missing_desc": []}
    for c in comps:
        # desc: exact ledger text, enforced by check_registry
        d = desc.get(c["name"])
        if d:
            c["desc"] = d
            stats["desc"] += 1
        else:
            stats["missing_desc"].append(c["name"])

        # aliases: curated groups + spaced name
        al: list[str] = []
        spaced_name = spaced(c["name"])
        if spaced_name != c["name"].lower():
            al.append(spaced_name)
        for en, cjk, pat in GROUPS:
            if re.search(pat, c["name"]):
                stats["group_hits"] += 1
                for a in en + cjk:
                    if a == c["name"].lower() or a in c["name"].lower():
                        continue  # own-name substring: name search already covers it
                    if a.lower() in names_lower and a != c["name"]:
                        continue  # would shadow another component's name
                    if a not in al:
                        al.append(a)
        # capability verbs: desc-driven (behavior, not identity) — see
        # CAPABILITY_ALIASES docstring for the false-friend exclusion policy
        d_lower = (d or "").lower()
        for zh, sig, exclude in CAPABILITY_ALIASES:
            if c["name"] not in exclude and sig and re.search(sig, d_lower) and zh not in al:
                al.append(zh)
                stats["cap_hits"] += 1
        c["aliases"] = al
        stats["alias_total"] += len(al)

    reg["version"] = "1.1.0"
    COMPONENTS.write_text(
        json.dumps(reg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"desc compiled: {stats['desc']}/{len(comps)}")
    if stats["missing_desc"]:
        print(f"MISSING desc: {stats['missing_desc']}")
    print(f"aliases: {stats['alias_total']} total ({stats['alias_total']/len(comps):.1f}/comp), "
          f"group hits {stats['group_hits']}, capability hits {stats['cap_hits']}")
    return 1 if stats["missing_desc"] else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
