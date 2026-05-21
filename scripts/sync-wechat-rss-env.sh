#!/usr/bin/env bash
# Sync wechat-rss-lite .env and project .env.local for local dev (tokens + SITE_URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_DIR="${ROOT}/services/wechat-rss-lite"
ENV_FILE="${SERVICE_DIR}/.env"
EXAMPLE_ENV="${SERVICE_DIR}/.env.example"
LOCAL_ENV="${ROOT}/.env.local"
AINOW_PORT="${AINOW_PORT:-3000}"
WECHAT_PORT="${WECHAT_RSS_PORT:-8081}"
PROXY_SITE_URL="http://127.0.0.1:${AINOW_PORT}/api/admin/wechat-rss"
BASE_URL="http://127.0.0.1:${WECHAT_PORT}"

if [[ ! -d "${SERVICE_DIR}" ]]; then
  echo "Missing services/wechat-rss-lite. Run: git submodule update --init"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${EXAMPLE_ENV}" "${ENV_FILE}"
  echo "Created ${ENV_FILE}"
fi

set_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "${file}" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "${file}"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "${file}"
    fi
  else
    printf '\n%s=%s\n' "${key}" "${value}" >> "${file}"
  fi
}

get_env_var() {
  local file="$1"
  local key="$2"
  grep -E "^${key}=" "${file}" 2>/dev/null | head -1 | cut -d= -f2- || true
}

current_token="$(get_env_var "${ENV_FILE}" ADMIN_API_TOKEN)"
if [[ -z "${current_token}" ]]; then
  if command -v openssl >/dev/null 2>&1; then
    current_token="$(openssl rand -hex 24)"
  else
    current_token="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 48)"
  fi
  echo "Generated ADMIN_API_TOKEN for local dev."
fi

set_env_var "${ENV_FILE}" ADMIN_API_TOKEN "${current_token}"
set_env_var "${ENV_FILE}" SITE_URL "${PROXY_SITE_URL}"

if ! grep -q '^WECHAT_RSS_BASE_URL=' "${LOCAL_ENV}" 2>/dev/null; then
  touch "${LOCAL_ENV}"
fi
set_env_var "${LOCAL_ENV}" WECHAT_RSS_BASE_URL "${BASE_URL}"
set_env_var "${LOCAL_ENV}" WECHAT_RSS_ADMIN_TOKEN "${current_token}"

echo "Synced wechat-rss env:"
echo "  services/wechat-rss-lite/.env  ADMIN_API_TOKEN + SITE_URL=${PROXY_SITE_URL}"
echo "  .env.local                     WECHAT_RSS_BASE_URL + WECHAT_RSS_ADMIN_TOKEN"
echo "Restart npm run dev and npm run wechat-rss:dev if they are already running."
