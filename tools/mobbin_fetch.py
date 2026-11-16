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
    ],
    # Agent / tools
    "agent": [
        ("screens", "agent tool call execution status card", "web"),
        ("screens", "agent task list steps timeline progress", "web"),
        ("screens", "code diff review changes view", "web"),
    ],
    # Onboarding & auth
    "onboarding": [
        ("flows", "welcome onboarding carousel walkthrough", "web"),
        ("screens", "sign up login form with social auth buttons", "web"),
        ("screens", "empty state placeholder illustration CTA", "web"),
    ],
    # Monetization
    "paywall": [
        ("sections", "SaaS pricing section with feature comparison table", "web"),
        ("screens", "subscription upgrade paywall plan selection", "web"),
    ],
    # Dashboard & settings
    "dashboard": [
        ("screens", "analytics dashboard with charts and stat cards", "web"),
        ("screens", "settings page with sidebar navigation", "web"),
        ("screens", "workspace sidebar navigation with search", "web"),
    ],
    # Base interactions
    "basics": [
        ("screens", "command palette quick action search modal", "web"),
        ("screens", "toast notification stack alerts", "web"),
        ("screens", "data table with filters and pagination", "web"),
        ("screens", "dropdown select menu with search", "web"),
    ],
    # --- Extended coverage ---
    # Forms & inputs
    "forms": [
        ("screens", "multi step form wizard progress", "web"),
        ("screens", "search input with autocomplete suggestions dropdown", "web"),
        ("screens", "date picker calendar selector", "web"),
        ("screens", "file upload dropzone drag and drop", "web"),
        ("screens", "form validation error states inline", "web"),
    ],
    # Navigation & layout
    "navigation": [
        ("screens", "marketing website hero section headline CTA", "web"),
        ("sections", "footer with columns links social", "web"),
        ("sections", "testimonial section customer quotes cards", "web"),
        ("screens", "responsive navbar with mega menu dropdown", "web"),
        ("screens", "tabs and segmented control switching", "web"),
        ("screens", "breadcrumb hierarchy navigation", "web"),
    ],
    # Modals & overlays
    "overlays": [
        ("screens", "confirmation dialog destructive action warning", "web"),
        ("screens", "side drawer panel slide out settings", "web"),
        ("screens", "modal wizard with steps overlay", "web"),
        ("screens", "tooltip popover contextual info", "web"),
        ("screens", "cookie consent banner preferences", "web"),
    ],
    # Lists & feeds
    "lists": [
        ("screens", "kanban board drag and drop columns", "web"),
        ("screens", "activity feed timeline notifications", "web"),
        ("screens", "inbox email list with unread badges", "web"),
        ("screens", "search results grid cards pagination", "web"),
        ("screens", "comment thread with replies avatars", "web"),
    ],
    # Charts & data viz
    "charts": [
        ("screens", "line chart analytics trends visualization", "web"),
        ("screens", "bar chart comparison dashboard widget", "web"),
        ("screens", "usage meter quota progress ring", "web"),
    ],
    # User & profile
    "profile": [
        ("screens", "user profile page avatar cover photo", "web"),
        ("screens", "team member list roles permissions", "web"),
        ("screens", "account switcher workspace selector dropdown", "web"),
        ("screens", "notification center list mark read", "web"),
    ],
    # Scheduling & commerce
    "commerce": [
        ("screens", "calendar booking scheduler time slots", "web"),
        ("screens", "shopping cart checkout order summary", "web"),
        ("screens", "order history list status tracking", "web"),
    ],
    # Editor & canvas
    "editor": [
        ("screens", "rich text editor toolbar formatting", "web"),
        ("screens", "whiteboard canvas nodes connections", "web"),
        ("screens", "color picker palette selection", "web"),
        ("screens", "image gallery lightbox viewer", "web"),
    ],
    # AI-native extras
    "ai-native": [
        ("screens", "AI voice mode interface listening speaking animation", "web"),
        ("screens", "AI image generation gallery prompts", "web"),
        ("screens", "prompt library template gallery AI", "web"),
        ("screens", "chat conversation history list sidebar", "web"),
        ("screens", "share chat conversation public page", "web"),
        ("screens", "keyboard shortcuts help overlay cheatsheet", "web"),
    ],
    # AI observability & evaluation
    "ai-monitor": [
        ("screens", "AI agent trace span timeline waterfall view", "web"),
        ("screens", "LLM evaluation scoring rubric results table", "web"),
        ("screens", "AI model playground compare side by side outputs", "web"),
        ("screens", "token usage cost breakdown dashboard AI", "web"),
        ("screens", "prompt versioning diff A B test variants", "web"),
        ("screens", "AI guardrail moderation flagged content review", "web"),
    ],
    # Docs & help center
    "docs-help": [
        ("screens", "documentation page sidebar table of contents", "web"),
        ("screens", "help center search results articles", "web"),
        ("screens", "changelog release notes timeline", "web"),
        ("screens", "API reference endpoint documentation code sample", "web"),
    ],
    # Media & creative tools
    "media": [
        ("screens", "video player with controls and chapters", "web"),
        ("screens", "audio podcast player waveform episodes", "web"),
        ("screens", "photo gallery masonry grid lightbox", "web"),
        ("screens", "music playlist track list player", "web"),
    ],
    # Workflow & project management
    "workflow": [
        ("screens", "project timeline gantt roadmap view", "web"),
        ("screens", "task detail panel checklist assignee", "web"),
        ("screens", "calendar week schedule events grid", "web"),
        ("screens", "approval review workflow status steps", "web"),
    ],
    # Maps & location
    "maps": [
        ("screens", "map view with location pins sidebar list", "web"),
        ("screens", "delivery tracking map route status", "web"),
        ("screens", "location address picker autocomplete", "web"),
    ],
    # Security & trust
    "security": [
        ("screens", "two factor authentication otp verification code", "web"),
        ("screens", "security settings sessions devices list", "web"),
        ("screens", "audit log activity history events table", "web"),
        ("screens", "permissions roles matrix access control", "web"),
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


def search(token, kind, query, platform, limit=6):
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
