#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_DIR="${ROOT}/services/wechat-rss-lite"

if [[ ! -d "${SERVICE_DIR}" ]]; then
  echo "Missing services/wechat-rss-lite. Run: git submodule update --init"
  exit 1
fi

bash "${ROOT}/scripts/sync-wechat-rss-env.sh"

WECHAT_PORT="${WECHAT_RSS_PORT:-8081}"
if curl -sf "http://127.0.0.1:${WECHAT_PORT}/health" >/dev/null 2>&1; then
  echo "Note: port ${WECHAT_PORT} already has a running service; if login fails, stop the old process or set WECHAT_RSS_PORT."
fi

cd "${SERVICE_DIR}"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required. Install: https://docs.astral.sh/uv/"
  exit 1
fi

uv sync --extra api
exec uv run uvicorn wechat_rss_lite.api:create_app --factory --host 127.0.0.1 --port "${WECHAT_RSS_PORT:-8081}"
