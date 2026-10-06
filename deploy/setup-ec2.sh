#!/usr/bin/env bash
# One-time / repeatable setup of Ownquesta on an Ubuntu 22.04/24.04 EC2 instance.
# Run as the `ubuntu` user:  bash setup-ec2.sh <public-host-or-ip>
#   e.g. bash setup-ec2.sh 13.209.7.181
# Re-running pulls the latest code, reinstalls deps, rebuilds the frontend and restarts services.
set -euo pipefail

HOST="${1:?usage: setup-ec2.sh <public-host-or-ip>}"
BRANCH="${BRANCH:-main}"
ROOT=/opt/ownquesta
WEB_REPO="${WEB_REPO:-https://github.com/zeeelll/ownquesta.git}"
AGENTS_REPO="${AGENTS_REPO:-https://github.com/zeeelll/ownquesta_agents.git}"

echo "==> System packages"
sudo apt-get update -y
sudo apt-get install -y git nginx python3-venv python3-pip build-essential curl ca-certificates
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Swap (small instances run out of memory during npm build / pip install)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> Code"
sudo mkdir -p "$ROOT" && sudo chown "$USER":"$USER" "$ROOT"
clone_or_pull() { # repo dir
  if [ -d "$2/.git" ]; then git -C "$2" fetch origin && git -C "$2" checkout "$BRANCH" && git -C "$2" pull origin "$BRANCH"
  else git clone --branch "$BRANCH" "$1" "$2"; fi
}
clone_or_pull "$WEB_REPO"    "$ROOT/ownquesta"
clone_or_pull "$AGENTS_REPO" "$ROOT/ownquesta_agents"

echo "==> Env files"
W="$ROOT/ownquesta"; A="$ROOT/ownquesta_agents"
[ -f "$W/backend/.env" ]  || { sed "s#13.209.7.181#$HOST#g" "$W/deploy/backend.env.example" > "$W/backend/.env"; NEED_EDIT=1; }
[ -f "$A/.env" ]          || { sed "s#13.209.7.181#$HOST#g" "$A/.env.example" > "$A/.env"; NEED_EDIT=1; }
sed "s#13.209.7.181#$HOST#g" "$W/deploy/frontend.env.example" > "$W/frontend/.env.production"
chmod 600 "$W/backend/.env" "$A/.env"
if [ "${NEED_EDIT:-0}" = 1 ]; then
  echo; echo "!! Fill in the secrets in $W/backend/.env and $A/.env, then re-run this script."; exit 0
fi

echo "==> Backend deps"
(cd "$W/backend" && npm ci --omit=dev)

echo "==> Frontend build"
(cd "$W/frontend" && npm ci && NODE_OPTIONS=--max-old-space-size=1536 npm run build)

echo "==> Agents deps (venv)"
[ -d "$A/.venv" ] || python3 -m venv "$A/.venv"
python3 - "$A" <<'PY'
import sys, tomllib, pathlib
a = pathlib.Path(sys.argv[1])
deps = tomllib.loads((a / "pyproject.toml").read_text())["project"]["dependencies"]
(a / ".deploy-requirements.txt").write_text("\n".join(deps) + "\n")
PY
"$A/.venv/bin/pip" install --upgrade pip
"$A/.venv/bin/pip" install -r "$A/.deploy-requirements.txt" \
  -r "$A/lab_agent_server/requirements.txt" -r "$A/lab_backend_server/requirements.txt"

echo "==> systemd + nginx"
for s in backend frontend agents; do sudo cp "$W/deploy/systemd/ownquesta-$s.service" /etc/systemd/system/; done
sudo cp "$W/deploy/nginx/ownquesta.conf" /etc/nginx/sites-available/ownquesta
sudo ln -sf /etc/nginx/sites-available/ownquesta /etc/nginx/sites-enabled/ownquesta
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable --now ownquesta-backend ownquesta-agents ownquesta-frontend
sudo systemctl restart ownquesta-backend ownquesta-agents ownquesta-frontend nginx

echo "==> Done. Open http://$HOST/"
