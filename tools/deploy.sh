#!/usr/bin/env bash
# One-command deployment of the awesome-ui static site to production.
#
# Implements the deployment SOP (Obsidian: Note/Infra/awesome-ui 组件库与 CI 运维.md)
# as executable code, replacing the hand-typed 3-command flow:
#   tar -> scp -> atomic swap (site.new -> site) -> three-way MD5 acceptance.
#
# Chain: CF orange cloud -> tunnel ali-bj-awesome-ui -> Caddy :18080 -> webroot.
# Caddy file_server picks up swapped files instantly — no service restarts.
#
# Usage:
#   bash tools/deploy.sh              # preflight + package + upload + swap + verify
#   bash tools/deploy.sh --rollback   # swap site.old back to site (emergency)
#
# Requires: git bash (tar/scp/ssh/md5sum), python -I, SSH key ~/.ssh/aliyun_bj_ed25519.
set -euo pipefail

HOST="root@182.92.198.142"
KEY="$HOME/.ssh/aliyun_bj_ed25519"
WEBROOT="/opt/awesome-ui/site"
TARBALL="/tmp/awesome-ui-site.tar.gz"
URL="https://awesome-ui.mangoqwq.com"
SSH_OPTS=(-o ConnectTimeout=15 -o BatchMode=yes)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

say() { printf '\n==> %s\n' "$*"; }

# --- preflight: local consistency gates (same checks CI runs) ---------------
if [[ "${1:-}" != "--rollback" ]]; then
  say "Preflight: registry + ledger consistency"
  python -I tools/check_registry.py
  python -I tools/check_llms_ledger.py
  [[ -f index.html ]] || { echo "FAIL: index.html missing"; exit 1; }
fi

# --- SSH helper -------------------------------------------------------------
run_ssh() { ssh -i "$KEY" "${SSH_OPTS[@]}" "$HOST" "$@"; }

# --- rollback mode ----------------------------------------------------------
if [[ "${1:-}" == "--rollback" ]]; then
  say "Rollback: swapping $WEBROOT.old back to $WEBROOT"
  run_ssh "set -e; [ -d $WEBROOT.old ] || { echo 'no site.old to roll back to'; exit 1; };
    mv $WEBROOT $WEBROOT.failed && mv $WEBROOT.old $WEBROOT && echo 'rollback done'"
  say "Verify public site"
  curl -sf -o /dev/null -w 'HTTP %{http_code}\n' "$URL/?nocache=$(date +%s)"
  echo "Rollback complete. Re-run 'bash tools/deploy.sh' after fixing the bad release."
  exit 0
fi

# --- package ---------------------------------------------------------------
say "Package: $TARBALL"
tar -czf "$TARBALL" \
  --exclude=.git --exclude=tests --exclude=screenshots --exclude=docs \
  --exclude=tools --exclude=references --exclude=backup --exclude=node_modules \
  --exclude=tmp_transcode --exclude=__pycache__ \
  -C "$ROOT" .
ls -lh "$TARBALL"

# --- upload ----------------------------------------------------------------
say "Upload to $HOST"
scp -i "$KEY" "${SSH_OPTS[@]}" "$TARBALL" "$HOST:/tmp/"

# --- atomic swap on server ---------------------------------------------------
# Extract into site.new, rotate old snapshot to site.old (kept as one-step
# rollback target; the previous site.old is removed first to avoid stacking),
# then move site.new into place. Two mv's = no window where webroot is empty.
say "Atomic swap on server"
run_ssh "set -e
  rm -rf $WEBROOT.new $WEBROOT.old
  mkdir -p $WEBROOT.new
  tar -xzf /tmp/awesome-ui-site.tar.gz -C $WEBROOT.new
  mv $WEBROOT $WEBROOT.old
  mv $WEBROOT.new $WEBROOT
  echo 'swap done'"

# --- acceptance: three-way MD5 on index.html --------------------------------
say "Acceptance: three-way MD5 (local = server = public via CF)"
LOCAL_MD5=$(md5sum index.html | awk '{print $1}')
SERVER_MD5=$(run_ssh "md5sum $WEBROOT/index.html" | awk '{print $1}')
NOCACHE="nocache_$(date +%s)_$RANDOM"
PUBLIC_MD5=$(curl -s "$URL/index.html?$NOCACHE" | md5sum | awk '{print $1}')
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$URL/?$NOCACHE")

printf '  local   %s\n  server  %s\n  public  %s  (HTTP %s)\n' \
  "$LOCAL_MD5" "$SERVER_MD5" "$PUBLIC_MD5" "$HTTP_CODE"

if [[ "$LOCAL_MD5" != "$SERVER_MD5" || "$LOCAL_MD5" != "$PUBLIC_MD5" ]]; then
  echo "FAIL: MD5 mismatch — run 'bash tools/deploy.sh --rollback' to restore."
  exit 1
fi
[[ "$HTTP_CODE" == "200" ]] || { echo "FAIL: public HTTP $HTTP_CODE"; exit 1; }

# --- spot checks + cleanup ---------------------------------------------------
say "Spot checks: component sources + llms.txt"
for p in "llms.txt" "llms-full.txt" "react/UiIcon.tsx" "vanilla/UiIcon.js" "vue/UiIcon.vue"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$URL/$p?$NOCACHE")
  echo "  $p -> $code"
  [[ "$code" == "200" ]] || { echo "FAIL: $p returned $code"; exit 1; }
done

say "Cleanup: remove server-side tarball and failed-snapshot leftovers"
run_ssh "rm -f /tmp/awesome-ui-site.tar.gz; rm -rf $WEBROOT.failed"

echo
echo "DEPLOY OK — $URL is serving the new release."
echo "Rollback target kept at $WEBROOT.old (one-step: bash tools/deploy.sh --rollback)."
