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
    (["upload", "crop"], ["裁剪"], r"AvatarCropDialog"),
    (["reasoning", "chain of thought"], ["推理", "思维链"], r"ThinkingBlock"),
    (["chart", "graph"], ["图表"], r"Chart|Gauge|Donut|Bars$|MetricStrip|StatsBand|Breakdown"),
    (["gauge"], ["仪表盘"], r"Gauge|Donut"),
    (["spinner", "loading"], ["加载", "加载中"], r"TypingIndicator|StreamingProgressBar|AnimatedCounter"),
    (["sidebar"], ["侧边栏"], r"SideNav|SideDrawer"),
    (["drawer"], ["抽屉"], r"Drawer"),
    (["tabs"], ["标签页", "选项卡"], r"Tabs$|StatusCountTabs"),
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

    stats = {"desc": 0, "alias_total": 0, "group_hits": 0, "missing_desc": []}
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
          f"group hits {stats['group_hits']}")
    return 1 if stats["missing_desc"] else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
