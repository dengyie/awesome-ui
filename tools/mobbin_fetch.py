#!/usr/bin/env python3
"""Batch-fetch Mobbin reference material for awesome-ui.

Usage: python mobbin_fetch.py [category ...]
Categories are defined in CATEGORIES below. Each run:
  1. searches MCP for screens/flows/sections per query
  2. saves JSON metadata to references/<category>.json
  3. downloads screen images to references/<category>/<idx>_<app>.png
Rate-limit friendly: 1s between MCP calls, 0.3s between image downloads.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(HERE, "mobbin_token.json")
REF_DIR = os.path.normpath(os.path.join(HERE, "..", "references"))
MCP_URL = "https://api.mobbin.com/mcp"

CATEGORIES = {
    # AI chat & streaming
    "ai-chat": [
        ("screens", "AI chat assistant conversation with streaming markdown response", "web"),
        ("screens", "chat prompt input box with attachments and model selector", "web"),
        ("screens", "reasoning thinking chain collapsible panel", "web"),
        ("screens", "AI answer message action toolbar copy regenerate", "web"),
        ("screens", "AI chat sidebar conversation list new chat", "web"),
        ("screens", "deep research sources cited report generation", "web"),
        ("screens", "chat artifact canvas code preview side panel", "web"),
        ("screens", "voice input waveform listening chat", "web"),
        ("screens", "chat message feedback thumbs rating survey", "web"),
        ("screens", "AI chat stop generation streaming interrupt button", "web"),
        ("screens", "chat file context retrieval document preview", "web"),
        ("screens", "AI chat welcome screen suggested prompts cards", "web"),
    ],
    # Agent / tools
    "agent": [
        ("screens", "agent tool call execution status card", "web"),
        ("screens", "agent task list steps timeline progress", "web"),
        ("screens", "code diff review changes view", "web"),
        ("screens", "terminal command output console panel", "web"),
        ("screens", "browser preview screenshot agent computer use", "web"),
        ("screens", "agent plan approval confirm steps", "web"),
        ("screens", "agent memory knowledge base management", "web"),
        ("screens", "multi agent orchestration workflow status", "web"),
        ("screens", "agent schedule trigger cron automation", "web"),
    ],
    # Onboarding & auth
    "onboarding": [
        ("flows", "welcome onboarding carousel walkthrough", "web"),
        ("screens", "sign up login form with social auth buttons", "web"),
        ("screens", "empty state placeholder illustration CTA", "web"),
        ("screens", "progressive profile setup personalize questions", "web"),
        ("screens", "workspace creation setup wizard steps", "web"),
        ("screens", "email verification confirm code screen", "web"),
        ("screens", "invite teammates referral onboarding step", "web"),
        ("screens", "role selection use case picker onboarding", "web"),
        ("screens", "integration connect onboarding checklist", "web"),
    ],
    # Monetization
    "paywall": [
        ("sections", "SaaS pricing section with feature comparison table", "web"),
        ("screens", "subscription upgrade paywall plan selection", "web"),
        ("screens", "free trial conversion banner upgrade prompt", "web"),
        ("screens", "annual monthly billing toggle discount", "web"),
        ("screens", "feature gated upsell modal locked", "web"),
        ("screens", "enterprise contact sales plan card", "web"),
        ("screens", "limited seats quota scarcity upgrade banner", "web"),
        ("screens", "student nonprofit discount eligibility form", "web"),
    ],
    # Dashboard & settings
    "dashboard": [
        ("screens", "analytics dashboard with charts and stat cards", "web"),
        ("screens", "settings page with sidebar navigation", "web"),
        ("screens", "workspace sidebar navigation with search", "web"),
        ("screens", "KPI metric cards row with trends sparkline", "web"),
        ("screens", "admin user management table roles", "web"),
        ("screens", "activity log recent events dashboard widget", "web"),
        ("screens", "overview homepage widgets customizable grid", "web"),
        ("screens", "onboarding progress checklist dashboard card", "web"),
    ],
    # Base interactions
    "basics": [
        ("screens", "command palette quick action search modal", "web"),
        ("screens", "toast notification stack alerts", "web"),
        ("screens", "data table with filters and pagination", "web"),
        ("screens", "dropdown select menu with search", "web"),
        ("screens", "context menu right click actions list", "web"),
        ("screens", "slider range input value adjustment", "web"),
        ("screens", "accordion collapsible sections FAQ", "web"),
        ("screens", "stepper wizard progress indicator", "web"),
        ("screens", "avatar group overflow stack presence", "web"),
    ],
    # --- Extended coverage ---
    # Forms & inputs
    "forms": [
        ("screens", "multi step form wizard progress", "web"),
        ("screens", "search input with autocomplete suggestions dropdown", "web"),
        ("screens", "date picker calendar selector", "web"),
        ("screens", "file upload dropzone drag and drop", "web"),
        ("screens", "form validation error states inline", "web"),
        ("screens", "rich input tags chips multi select", "web"),
        ("screens", "survey questionnaire rating scale nps", "web"),
        ("screens", "conditional form fields dynamic reveal", "web"),
        ("screens", "inline editable table cell click edit", "web"),
    ],
    # Navigation & layout
    "navigation": [
        ("screens", "marketing website hero section headline CTA", "web"),
        ("sections", "footer with columns links social", "web"),
        ("sections", "testimonial section customer quotes cards", "web"),
        ("screens", "responsive navbar with mega menu dropdown", "web"),
        ("screens", "tabs and segmented control switching", "web"),
        ("screens", "breadcrumb hierarchy navigation", "web"),
        ("screens", "split view master detail two pane layout", "web"),
        ("screens", "collapsible sidebar section groups tree menu", "web"),
    ],
    # Overlays
    "overlays": [
        ("screens", "confirmation dialog destructive action warning", "web"),
        ("screens", "side drawer panel slide out settings", "web"),
        ("screens", "modal wizard with steps overlay", "web"),
        ("screens", "tooltip popover contextual info", "web"),
        ("screens", "cookie consent banner preferences", "web"),
        ("screens", "bottom sheet mobile style overlay web", "web"),
        ("screens", "full screen takeover modal marketing promo", "web"),
        ("screens", "banner announcement dismissible top bar", "web"),
        ("screens", "hover card preview link rich preview", "web"),
    ],
    # Lists & feeds
    "lists": [
        ("screens", "kanban board drag and drop columns", "web"),
        ("screens", "activity feed timeline notifications", "web"),
        ("screens", "inbox email list with unread badges", "web"),
        ("screens", "search results grid cards pagination", "web"),
        ("screens", "comment thread with replies avatars", "web"),
        ("screens", "list virtualization infinite scroll feed", "web"),
        ("screens", "grouped list sections alphabetical index", "web"),
        ("screens", "saved favorites bookmark collection grid", "web"),
    ],
    # Charts & data viz
    "charts": [
        ("screens", "line chart analytics trends visualization", "web"),
        ("screens", "bar chart comparison dashboard widget", "web"),
        ("screens", "usage meter quota progress ring", "web"),
        ("screens", "area chart with time range selector granularity", "web"),
        ("screens", "funnel conversion steps visualization", "web"),
        ("screens", "heatmap calendar activity contributions", "web"),
        ("screens", "scatter bubble plot correlation chart", "web"),
        ("screens", "gauge KPI dial target progress", "web"),
    ],
    # User & profile
    "profile": [
        ("screens", "user profile page avatar cover photo", "web"),
        ("screens", "team member list roles permissions", "web"),
        ("screens", "account switcher workspace selector dropdown", "web"),
        ("screens", "notification center list mark read", "web"),
        ("screens", "user preferences settings toggles checkboxes", "web"),
        ("screens", "organization settings workspace configuration", "web"),
        ("screens", "public profile portfolio showcase grid", "web"),
        ("screens", "profile edit modal crop avatar upload", "web"),
    ],
    # Scheduling & commerce
    "commerce": [
        ("screens", "calendar booking scheduler time slots", "web"),
        ("screens", "shopping cart checkout order summary", "web"),
        ("screens", "order history list status tracking", "web"),
        ("screens", "product detail page gallery buy box", "web"),
        ("screens", "order confirmation success receipt", "web"),
        ("screens", "pricing add-ons configurator options", "web"),
        ("screens", "product variants selector size color swatches", "web"),
        ("screens", "wishlist saved items price tracking", "web"),
        ("screens", "coupon promo code redeem input", "web"),
    ],
    # Editor & canvas
    "editor": [
        ("screens", "rich text editor toolbar formatting", "web"),
        ("screens", "whiteboard canvas nodes connections", "web"),
        ("screens", "color picker palette selection", "web"),
        ("screens", "image gallery lightbox viewer", "web"),
        ("screens", "code editor syntax highlighting tabs split view", "web"),
        ("screens", "node based workflow builder drag canvas", "web"),
        ("screens", "design canvas layers panel inspect", "web"),
        ("screens", "presentation slide editor outline sidebar", "web"),
    ],
    # AI-native extras
    "ai-native": [
        ("screens", "AI voice mode interface listening speaking animation", "web"),
        ("screens", "AI image generation gallery prompts", "web"),
        ("screens", "prompt library template gallery AI", "web"),
        ("screens", "chat conversation history list sidebar", "web"),
        ("screens", "share chat conversation public page", "web"),
        ("screens", "keyboard shortcuts help overlay cheatsheet", "web"),
        ("screens", "AI writing editor rewrite improve text suggestions", "web"),
        ("screens", "chat model settings temperature system prompt config", "web"),
        ("screens", "AI avatar digital human talking video", "web"),
        ("screens", "AI meeting transcription summary notes", "web"),
    ],
    # AI observability & evaluation
    "ai-monitor": [
        ("screens", "AI agent trace span timeline waterfall view", "web"),
        ("screens", "LLM evaluation scoring rubric results table", "web"),
        ("screens", "AI model playground compare side by side outputs", "web"),
        ("screens", "token usage cost breakdown dashboard AI", "web"),
        ("screens", "prompt versioning diff A B test variants", "web"),
        ("screens", "AI guardrail moderation flagged content review", "web"),
        ("screens", "model provider configuration API keys routing", "web"),
        ("screens", "AI dataset annotation labeling review queue", "web"),
    ],
    # Docs & help center
    "docs-help": [
        ("screens", "documentation page sidebar table of contents", "web"),
        ("screens", "help center search results articles", "web"),
        ("screens", "changelog release notes timeline", "web"),
        ("screens", "API reference endpoint documentation code sample", "web"),
        ("screens", "interactive tutorial guided steps tooltip", "web"),
        ("screens", "knowledge base article feedback helpful vote", "web"),
        ("screens", "docs version switcher multi language tabs", "web"),
        ("screens", "support ticket contact form submission", "web"),
    ],
    # Media & creative tools
    "media": [
        ("screens", "video player with controls and chapters", "web"),
        ("screens", "audio podcast player waveform episodes", "web"),
        ("screens", "photo gallery masonry grid lightbox", "web"),
        ("screens", "music playlist track list player", "web"),
        ("screens", "video editing timeline clips preview", "web"),
        ("screens", "streaming catalog browse hero carousel", "web"),
        ("screens", "live streaming chat overlay view", "web"),
        ("screens", "asset library stock footage search filters", "web"),
    ],
    # Workflow & project management
    "workflow": [
        ("screens", "project timeline gantt roadmap view", "web"),
        ("screens", "task detail panel checklist assignee", "web"),
        ("screens", "calendar week schedule events grid", "web"),
        ("screens", "approval review workflow status steps", "web"),
        ("screens", "automation rules builder triggers conditions", "web"),
        ("screens", "version history compare restore changes", "web"),
        ("screens", "sprint backlog planning poker estimation", "web"),
        ("screens", "OKR goals progress key results tree", "web"),
    ],
    # Maps & location
    "maps": [
        ("screens", "map view with location pins sidebar list", "web"),
        ("screens", "delivery tracking map route status", "web"),
        ("screens", "location address picker autocomplete", "web"),
        ("screens", "geofencing zones draw area map", "web"),
        ("screens", "route planning directions steps", "web"),
        ("screens", "nearby places radius search results", "web"),
        ("screens", "delivery ETA live map courier position", "web"),
        ("screens", "store locator map list filter", "web"),
    ],
    # Security & trust
    "security": [
        ("screens", "two factor authentication otp verification code", "web"),
        ("screens", "security settings sessions devices list", "web"),
        ("screens", "audit log activity history events table", "web"),
        ("screens", "permissions roles matrix access control", "web"),
        ("screens", "privacy consent gdpr data export delete account", "web"),
        ("screens", "SSO SAML identity provider configuration", "web"),
        ("screens", "danger zone delete workspace confirm typing", "web"),
        ("screens", "recovery codes backup download show", "web"),
        ("screens", "suspicious login alert email security", "web"),
    ],
    # Marketing landing pages
    "landing": [
        ("sections", "hero section with product screenshot and headline", "web"),
        ("sections", "feature grid cards with icons benefits", "web"),
        ("sections", "logo cloud trusted by companies social proof", "web"),
        ("sections", "call to action banner gradient background", "web"),
        ("sections", "pricing plan cards three tier", "web"),
        ("sections", "FAQ accordion expandable questions", "web"),
        ("sections", "integrations partner logos grid", "web"),
        ("sections", "bento grid feature showcase mixed tiles", "web"),
        ("sections", "testimonials wall of love quotes avatars", "web"),
        ("sections", "stats band metrics big numbers", "web"),
    ],
    # Empty / error / status states
    "empty-error": [
        ("screens", "404 page not found illustration", "web"),
        ("screens", "empty state no data illustration CTA", "web"),
        ("screens", "error page something went wrong retry", "web"),
        ("screens", "loading skeleton shimmer placeholder", "web"),
        ("screens", "server maintenance status page incidents", "web"),
        ("screens", "offline mode no connection banner", "web"),
        ("screens", "permission denied access restricted screen", "web"),
        ("screens", "search no results suggestions empty", "web"),
    ],
    # Billing & account management
    "billing": [
        ("screens", "billing history invoices table download", "web"),
        ("screens", "payment method credit card management", "web"),
        ("screens", "subscription plan usage limit upgrade", "web"),
        ("screens", "team seats billing members invite", "web"),
        ("screens", "checkout payment form fields card", "web"),
        ("screens", "plan downgrade cancel retention flow", "web"),
        ("screens", "credits top up prepaid balance", "web"),
        ("screens", "tax address region billing details form", "web"),
        ("screens", "usage based metered pricing breakdown", "web"),
    ],
    # Notification & email design
    "notifications": [
        ("screens", "notification center dropdown list unread", "web"),
        ("screens", "email digest newsletter design layout", "web"),
        ("screens", "transactional email verification welcome", "web"),
        ("screens", "in-app notification preferences toggles matrix", "web"),
        ("screens", "mentions activity notifications panel", "web"),
        ("screens", "email notification settings digest frequency", "web"),
        ("screens", "push notification permission prompt banner", "web"),
        ("screens", "notification empty state all caught up", "web"),
    ],
    # Mobile form factor (web responsive / app mirrors)
    "mobile": [
        ("screens", "mobile web navigation bottom tab bar", "web"),
        ("screens", "mobile responsive hero landing page", "web"),
        ("screens", "mobile chat conversation bubbles input", "web"),
        ("screens", "mobile settings list rows toggles", "web"),
        ("screens", "mobile onboarding carousel progress dots", "web"),
        ("screens", "mobile bottom sheet actions menu", "web"),
        ("screens", "mobile swipeable cards deck gestures", "web"),
        ("screens", "mobile floating action button compose", "web"),
    ],
    # Advanced tables & dense data UI
    "tables": [
        ("screens", "spreadsheet style table inline editing cells", "web"),
        ("screens", "data table column resize sort multi select", "web"),
        ("screens", "table grouping rows expandable details", "web"),
        ("screens", "airtable style grid base views", "web"),
        ("screens", "financial transactions table reconciled status", "web"),
        ("screens", "leaderboard ranking table with avatars", "web"),
        ("screens", "table bulk actions toolbar selection", "web"),
        ("screens", "table saved views filters tabs", "web"),
    ],
    # Settings center & preferences
    "settings": [
        ("screens", "account settings center anchors sections", "web"),
        ("screens", "workspace preferences general configuration", "web"),
        ("screens", "integration settings connect service cards", "web"),
        ("screens", "API keys tokens management regenerate", "web"),
        ("screens", "webhooks endpoint configuration events", "web"),
        ("screens", "appearance theme display preferences", "web"),
        ("screens", "domain custom URL configuration verify", "web"),
        ("screens", "danger zone account deletion transfer", "web"),
    ],
}


def load_token():
    with open(TOKEN_FILE, encoding="utf-8") as f:
        return json.load(f)["access_token"]


def mcp_call(token, payload, retries=3):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }
    for attempt in range(retries):
        req = urllib.request.Request(MCP_URL, data=json.dumps(payload).encode(), headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("Retry-After", "5"))
                print(f"  429 rate-limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            raise
        m = re.search(r"data: (.*)", raw)
        return json.loads(m.group(1))
    raise RuntimeError("MCP call failed after retries")


def search(token, kind, query, platform, limit=8):
    tool = {"screens": "search_screens", "flows": "search_flows", "sections": "search_sections"}[kind]
    args = {"query": query, "limit": limit}
    if platform:
        args["platform"] = platform
    last_err = None
    for attempt in range(3):
        try:
            res = mcp_call(token, {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                                   "params": {"name": tool, "arguments": args}})
            break
        except Exception as ex:  # network/SSL hiccups: retry with backoff
            last_err = ex
            wait = 3 * (attempt + 1)
            print(f"  network error ({type(ex).__name__}), retry in {wait}s...")
            time.sleep(wait)
    else:
        print(f"  query failed after retries: {last_err}")
        return {}
    content = res.get("result", {}).get("content", [])
    # The MCP response may prepend a non-JSON notice (e.g. AI usage banner);
    # skip text items that don't parse and use the first JSON payload instead.
    fallback = None
    for item in content:
        if item.get("type") == "text":
            try:
                return json.loads(item["text"])
            except json.JSONDecodeError:
                if fallback is None:
                    fallback = {"raw": item["text"]}
    return fallback or {}


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp, open(path, "wb") as f:
        f.write(resp.read())


def fetch_category(token, cat, queries):
    cat_dir = os.path.join(REF_DIR, cat)
    os.makedirs(cat_dir, exist_ok=True)
    all_results = []
    img_i = 0
    for kind, query, platform in queries:
        print(f"[{cat}] {kind}: {query[:60]}...")
        data = search(token, kind, query, platform)
        entries = data.get("screens") or data.get("flows") or data.get("sections") or []
        all_results.append({"kind": kind, "query": query, "results": data})
        for e in entries:
            img_url = e.get("image_url")
            if not img_url:
                continue
            app = re.sub(r"[^A-Za-z0-9_-]+", "_", e.get("app_name", "unknown"))
            ext = ".png"
            img_i += 1
            dest = os.path.join(cat_dir, f"{img_i:02d}_{app}{ext}")
            try:
                download(img_url, dest)
                print(f"  saved {os.path.basename(dest)}")
            except Exception as ex:
                print(f"  download failed: {ex}")
            time.sleep(0.3)
        time.sleep(1.0)
    with open(os.path.join(REF_DIR, f"{cat}.json"), "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"[{cat}] done: {img_i} images")


def main():
    cats = sys.argv[1:] or list(CATEGORIES)
    token = load_token()
    os.makedirs(REF_DIR, exist_ok=True)
    for cat in cats:
        if cat not in CATEGORIES:
            print(f"unknown category: {cat}; available: {list(CATEGORIES)}")
            sys.exit(1)
        fetch_category(token, cat, CATEGORIES[cat])


if __name__ == "__main__":
    main()
