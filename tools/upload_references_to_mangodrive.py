#!/usr/bin/env python3
"""awesome-ui references 素材库 → MangoDrive 聚合盘（复用业务方接入契约）。

通道：公网 REST https://api-drive.mangoqwq.com/api/*
账号：app-uploader-rw（base_path /GooglePool-Secure/Apps/uploader）
契约要点：PUT /api/fs/put（非 POST）、File-Path URL 转义、Authorization token 原文
（不带 Bearer）、As-Task: false；存在性探测用 fs/list 勿用 fs/get（零 WARN）。
口令从 vault 凭据页就地解析，不在脚本内落值。
用法：
  python -I tools/upload_references_to_mangodrive.py --sandbox   # 沙箱试跑
  python -I tools/upload_references_to_mangodrive.py             # 正式上传（幂等续传）
  python -I tools/upload_references_to_mangodrive.py --verify    # 抽样回读校验
"""
import argparse
import base64
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

VAULT_CRED = Path(r"E:/profile/note/note/Note/Accounts/网络账号/GoogleDrive 聚合盘凭据.md")
REFS = Path(r"E:/code/awesome-ui/references")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) awesome-ui-refs-uploader/1.0"


def load_password(account):
    text = VAULT_CRED.read_text(encoding="utf-8")
    m = re.search(rf"`{account}`\s*\|[^|]*\|[^|]*\|[^|]*\|\s*`?([A-Za-z0-9/_+\-]{{20,}})`?\s*\|", text)
    if not m:
        sys.exit(f"未能在凭据页解析 {account} 口令")
    return m.group(1)


class Drive:
    def __init__(self, base, user, password):
        self.base = base.rstrip("/")
        resp = self._req("POST", "/api/auth/login",
                         body={"username": user, "password": password})
        tok = resp if isinstance(resp, dict) else json.loads(resp)
        if tok.get("code") != 200:
            sys.exit(f"login failed: {tok}")
        self.token = tok["data"]["token"]

    def _req(self, method, path, body=None, headers=None, data=None):
        h = {"User-Agent": UA}
        if body is not None:
            h["Content-Type"] = "application/json"
            data = json.dumps(body).encode()
        if headers:
            h.update(headers)
        req = urllib.request.Request(self.base + path, data=data, headers=h, method=method)
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())

    def _auth(self):
        return {"Authorization": self.token}

    def list(self, path):
        return self._req("POST", "/api/fs/list",
                         body={"path": path, "page": 1, "per_page": 0}, headers=self._auth())

    def exists(self, dir_path, name):
        # 契约 §三.5：fs/list 列父目录查叶子名，服务端零 WARN
        try:
            r = self.list(dir_path)
            return any(c.get("name") == name for c in (r.get("data") or {}).get("content") or [])
        except Exception:
            return False

    def mkdir(self, path):
        try:
            self._req("POST", "/api/fs/mkdir", body={"path": path}, headers=self._auth())
        except Exception:
            pass  # 已存在时 500，无害

    def put(self, path, fp):
        h = self._auth()
        h["User-Agent"] = UA  # 缺 Mozilla 形态 UA 会被 CF 拦（契约 §三.5/§四.3 口径）
        h["File-Path"] = urllib.parse.quote(path)
        h["As-Task"] = "false"
        h["Content-Type"] = "application/octet-stream"
        h["Content-Length"] = str(fp.stat().st_size)
        req = urllib.request.Request(self.base + "/api/fs/put", data=fp.read_bytes(),
                                     headers=h, method="PUT")
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read().decode())

    def get_raw(self, path):
        r = self._req("POST", "/api/fs/get", body={"path": path}, headers=self._auth())
        return (r.get("data") or {}).get("raw_url")


def iter_images():
    for sub in sorted(REFS.iterdir()):
        if sub.is_dir():
            for img in sorted(sub.glob("*.png")) + sorted(sub.glob("*.jpg")) + sorted(sub.glob("*.webp")):
                yield sub.name, img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sandbox", action="store_true", help="先在 /Apps/sandbox 试跑")
    ap.add_argument("--verify", action="store_true", help="抽样回读 sha256 校验")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if args.sandbox:
        # 沙箱共享联调：小样试跑验证链路，落在 sandbox 目录不污染业务数据
        account, base = "app-sandbox", "/awesome-ui-sandbox/references"
    else:
        account, base = "app-uploader-rw", "/awesome-ui/references"
    drv = Drive("https://api-drive.mangoqwq.com", account, load_password(account))

    if args.verify:
        samples = list(iter_images())[:: max(1, len(list(iter_images())) // 10)][:10]
        ok = 0
        for cat, img in samples:
            raw = drv.get_raw(f"{base}/{cat}/{img.name}")
            if not raw:
                print(f"MISS {cat}/{img.name}")
                continue
            req = urllib.request.Request(raw, headers={"User-Agent": UA})
            sha = hashlib.sha256(urllib.request.urlopen(req, timeout=120).read()).hexdigest()
            local = hashlib.sha256(img.read_bytes()).hexdigest()
            print(("PASS " if sha == local else "FAIL ") + f"{cat}/{img.name}")
            ok += sha == local
        print(f"verify {ok}/{len(samples)}")
        return

    items = list(iter_images())
    if args.limit:
        items = items[: args.limit]
    print(f"total {len(items)} images -> {base}/<category>/")
    done = skip = fail = 0
    for i, (cat, img) in enumerate(items, 1):
        rel = f"{base}/{cat}"
        name = img.name
        try:
            if drv.exists(rel, name):
                skip += 1
            else:
                drv.mkdir(rel)
                r = drv.put(f"{rel}/{name}", img)
                if r.get("code") != 200:
                    raise RuntimeError(str(r))
                done += 1
        except Exception as e:
            fail += 1
            print(f"FAIL {cat}/{name}: {e}")
        if i % 50 == 0 or i == len(items):
            print(f"[{i}/{len(items)}] done={done} skip={skip} fail={fail}")
        time.sleep(0.15)  # 公网链路温和限速
    print(f"FINISHED done={done} skip={skip} fail={fail}")


if __name__ == "__main__":
    main()
