# Deploying Ownquesta on AWS EC2

Target: Ubuntu 22.04/24.04 EC2 instance (`ownquesta`, `13.209.7.181`, ap-northeast-2).

## Architecture

```
Browser ──80──> nginx ─┬─ /            -> Next.js frontend   127.0.0.1:3000
                       ├─ /backend/    -> Express API        127.0.0.1:5000
                       ├─ /agents/     -> FastAPI agents     127.0.0.1:8000
                       │                    └─ spawns lab-backend :8010 and lab-agent :8020
                       ├─ /lab/        -> lab-backend        127.0.0.1:8010
                       └─ /lab-agent/  -> lab-agent          127.0.0.1:8020
MongoDB: Atlas (recommended)    Files: S3
```

Only port 80 (and 22 for SSH) is exposed; every app port is bound to localhost.

## Before you start

1. **Instance size.** `t3.micro` has 1 GiB RAM. The Python stack (pandas, scikit-learn, langchain) plus a Next.js
   build is tight; the script adds 4 GiB swap so it works, but builds are slow and the app may be sluggish.
   `t3.small`/`t3.medium` is strongly recommended. Use a **20 GB+ gp3 volume**.
2. **Elastic IP.** The instance has none, so the public IP changes on every stop/start. Allocate one and associate it
   (EC2 → Elastic IPs), then use that address everywhere below.
3. **Security group inbound:** SSH 22 (your IP only), HTTP 80 (anywhere), HTTPS 443 (if you add a domain).
   Do **not** open 3000/5000/8000/8010/8020 — lab-backend executes user Python code.
4. **MongoDB.** Create a free MongoDB Atlas cluster and allow the EC2 IP in Network Access.
5. **Secrets.** Have your real values ready (Mongo URI, session/JWT secrets, OpenAI/Anthropic/Tavily keys, SMTP, AWS/S3).

## Deploy

```bash
ssh -i your-key.pem ubuntu@13.209.7.181
curl -fsSLO https://raw.githubusercontent.com/zeeelll/ownquesta/<branch>/deploy/setup-ec2.sh   # or scp it
BRANCH=<branch> bash setup-ec2.sh 13.209.7.181
```

Use the branch that contains the `deploy/` folder (`feature/ownquesta-ec2-deploy-gjbrym` until it is merged to `main`).
If the repos are private, clone them yourself into `/opt/ownquesta/` with a deploy key or token first.

The first run creates `backend/.env` and `ownquesta_agents/.env` from the examples and **stops** so you can fill in
secrets (`nano /opt/ownquesta/ownquesta/backend/.env`). Run the same command again to install, build and start.

## Verify

```bash
systemctl status ownquesta-backend ownquesta-frontend ownquesta-agents nginx
curl -s http://127.0.0.1:8000/health     # agents
curl -s http://127.0.0.1:8010/health     # lab-backend
curl -s http://13.209.7.181/lab-agent/health
journalctl -u ownquesta-backend -f       # logs
```

Then open `http://13.209.7.181/`.

## Updating

Re-run `BRANCH=<branch> bash setup-ec2.sh 13.209.7.181` (pulls, rebuilds, restarts).

## Known limitations / next steps

- **Google login needs a domain.** Google rejects raw IPs as OAuth redirect URIs. Point a domain at the Elastic IP,
  run `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com`, then change the
  URLs in the env files to `https://yourdomain.com...` and re-run the script (the frontend must be rebuilt because
  `NEXT_PUBLIC_*` values are baked in at build time). Also set `cookie.secure` in `backend/src/app.js` once on HTTPS.
- **Secrets in git.** `backend/.env.backup` and `backend/.env.save` are tracked in the `ownquesta` repo. Rotate every
  credential in them and remove the files from history.
- **Docker features.** `docker-compose.yml`, `mlops-template` and the GitHub Action target Kubernetes/Docker and are not
  needed for this EC2 setup.
