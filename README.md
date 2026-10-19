# Ownquesta

![CI](https://github.com/zeeelll/ownquesta/actions/workflows/ci.yml/badge.svg)

**Build ML models from scratch, on one platform, with AI agents by your side.**

## 💡 What is Ownquesta?

Ownquesta is an **AutoML platform** built for junior ML engineers and early-stage teams. The idea is simple: you should be able to go from raw data to a working ML model **without constantly switching between an ML tool and a separate AI chatbot** to ask what to do next.

Ownquesta brings both into a single place. You build the model yourself, step by step, while built-in AI agents help you understand your data, choose an approach, and generate and explain the code along the way. You stay in control and you learn how the model is actually built, instead of getting a black box.

## 🎯 Why Ownquesta?

Most beginners learning ML today work like this: open a notebook, get stuck, copy the problem into an AI chat, paste the answer back, repeat. Ownquesta removes that back-and-forth by putting the guidance right inside the ML workflow.

**Who it's for:**
- **Junior ML developers** who want to learn how ML models are built and coded, not just get a result
- **Startups** that need to build and test ML models quickly without a large ML team

## 🧭 Vision & Roadmap

The long-term goal is to grow Ownquesta from a learning-friendly AutoML tool into a platform that can handle **large-scale ML workflows end to end**, all in one place.

Planned next steps:
- **Deep Learning support** — bring DL model building into the same guided workflow
- **One-click deployment** — deploy your trained model directly from Ownquesta, in an automated way
- **More AI agents** — agent features are developed in the separate [ownquesta_agents](https://github.com/zeeelll/ownquesta_agents) repository

> **Status:** Ownquesta is a personal project. Active development is currently on hold due to other work commitments, but the vision above is where it's headed.

---

## 📁 Project Structure

```
ownquesta/
├── frontend/        # Next.js web app
├── backend/         # Node.js / Express API (auth, users, payments, S3 uploads)
├── lab-agent/       # Lab agent service (Docker setup)
├── lab-backend/     # Code-execution service (Docker setup)
├── mlops-template/  # Inference API + Kubernetes manifests, deployed via GitHub Actions
├── docs/            # Implementation notes
└── .github/workflows/
```

> The actively developed lab/agent services live in [ownquesta_agents](https://github.com/zeeelll/ownquesta_agents).

## 🏗️ Architecture

```
Browser ─► Nginx (HTTPS) ─┬─► Next.js frontend    :3000
                          ├─► Express backend     :5000 ─► MongoDB Atlas, S3
                          └─► FastAPI agents      :8000 ─► lab backend :8010 / lab agent :8020
```

## 🚀 Quick Start

**Prerequisites:** Node 22+, Python 3.12 with [uv](https://docs.astral.sh/uv/), and a MongoDB connection string.

```bash
# Backend  (copy .env.example to .env and set MONGODB_URI + SESSION_SECRET)
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Agents  (from the ownquesta_agents repo; set OPENAI_API_KEY in .env)
uv sync && uv run uvicorn main:app --port 8000   # also starts the lab services
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Agents API | http://localhost:8000 |

The frontend falls back to these localhost URLs. For another host, set `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_LAB_URL` and `NEXT_PUBLIC_LAB_AGENT_URL` before `npm run build`.

## ☁️ Deployment

Runs on a single EC2 instance behind Nginx with Let's Encrypt HTTPS. The frontend and backend run under PM2; the agents run as a sandboxed systemd service under an unprivileged user. CI runs on GitHub Actions.

## 🤖 Related Repositories

- [ownquesta_agents](https://github.com/zeeelll/ownquesta_agents) — the AI agent service (ML Assistant) that powers Ownquesta's guided model building
