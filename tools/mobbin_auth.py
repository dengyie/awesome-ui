#!/usr/bin/env python3
"""Mobbin MCP OAuth helper.

Phase 1: `python mobbin_auth.py auth`  -> opens browser, runs local callback server on 127.0.0.1:8765, saves token to mobbin_token.json (next to this script).
Phase 2: `python mobbin_auth.py refresh` -> uses stored refresh token to get a fresh access token.
Phase 3: read token: `python mobbin_auth.py token` -> prints access token (for curl / scripts).
"""
import base64
import hashlib
import json
import os
import secrets
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(HERE, "mobbin_token.json")
STATE_FILE = os.path.join(HERE, "mobbin_oauth_state.json")

AUTH_SERVER = "https://ujasntkfphywizsdaapi.supabase.co/auth/v1"
AUTHORIZE_URL = AUTH_SERVER + "/oauth/authorize"
TOKEN_URL = AUTH_SERVER + "/oauth/token"
CLIENT_ID = "d0799434-8330-4b97-810d-270e8d2afc56"
REDIRECT_URI = "http://127.0.0.1:8765/callback"
PORT = 8765


def _post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _save(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def _load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


class CallbackHandler(BaseHTTPRequestHandler):
    result = {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/callback":
            self.send_response(404)
            self.end_headers()
            return
        qs = urllib.parse.parse_qs(parsed.query)
        CallbackHandler.result = {k: v[0] for k, v in qs.items()}
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        ok = "code" in CallbackHandler.result
        msg = "授权成功，可以回到终端了。" if ok else "授权失败: " + CallbackHandler.result.get("error_description", str(CallbackHandler.result))
        self.wfile.write(f"<html><body style='font-family:sans-serif;text-align:center;padding-top:80px'><h2>{'✅' if ok else '❌'} {msg}</h2></body></html>".encode())

    def log_message(self, *args):
        pass


def cmd_auth():
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = secrets.token_urlsafe(16)
    _save(STATE_FILE, {"verifier": verifier, "state": state, "ts": time.time()})

    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "openid offline_access",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    url = AUTHORIZE_URL + "?" + urllib.parse.urlencode(params)
    server = HTTPServer(("127.0.0.1", PORT), CallbackHandler)
    webbrowser.open(url)
    print("浏览器已打开，请登录 Mobbin 并授权...")
    server.handle_request()  # single request

    res = CallbackHandler.result
    if "code" not in res:
        print("授权失败:", json.dumps(res, ensure_ascii=False))
        sys.exit(1)
    if res.get("state") != state:
        print("state 校验失败")
        sys.exit(1)

    tok = _post_form(TOKEN_URL, {
        "grant_type": "authorization_code",
        "code": res["code"],
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "code_verifier": verifier,
    })
    _save(TOKEN_FILE, tok)
    print("✅ token 已保存到", TOKEN_FILE)


def cmd_refresh():
    tok = _load(TOKEN_FILE)
    new = _post_form(TOKEN_URL, {
        "grant_type": "refresh_token",
        "refresh_token": tok.get("refresh_token"),
        "client_id": CLIENT_ID,
    })
    # Supabase may not return a new refresh token; keep the old one
    new.setdefault("refresh_token", tok.get("refresh_token"))
    _save(TOKEN_FILE, new)
    print("✅ access token 已刷新")


def cmd_token():
    tok = _load(TOKEN_FILE)
    exp = tok.get("expires_in") and tok.get("issued_at")
    print(tok["access_token"])


if __name__ == "__main__":
    cmds = {"auth": cmd_auth, "refresh": cmd_refresh, "token": cmd_token}
    if len(sys.argv) < 2 or sys.argv[1] not in cmds:
        print(__doc__)
        sys.exit(1)
    cmds[sys.argv[1]]()
