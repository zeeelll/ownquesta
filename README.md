# Ownquesta

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
Fnal_ownquesta/
├── backend/                 # Node.js/Express API
├── frontend/                # Next.js Web App
├── agent-backend/           # FastAPI Agent Service
├── data-processing/         # Data Processing Service
├── docker-compose.yml       # Orchestrate all services
├── .env.example             # Environment template
└── README.md
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
cd Fnal_ownquesta

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Run Services Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Agent Backend:**
```bash
cd agent-backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
```

**Terminal 4 - Data Processing:**
```bash
cd data-processing
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
```

## 📡 Service URLs

| Service | URL | Port | Type |
|---------|-----|------|------|
| Frontend | http://localhost:3000 | 3000 | Next.js |
| Backend | http://localhost:5000 | 5000 | Node.js |
| Agent API | http://localhost:8000 | 8000 | FastAPI |
| Data Processing | http://localhost:8001 | 8001 | FastAPI |
| MongoDB | mongodb://localhost:27017 | 27017 | Database |
| Redis | redis://localhost:6379 | 6379 | Cache |

## 🔗 Service Communication

### From Frontend to Backend
```typescript
// services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
};
```

### From Frontend to Agent
```typescript
const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:8000';

export const agentAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${AGENT_URL}${endpoint}`, options);
  return response.json();
};
```

### From Frontend to Data Processing
```typescript
const DATA_URL = process.env.NEXT_PUBLIC_DATA_PROCESS_URL || 'http://localhost:8001';

export const dataProcessingAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${DATA_URL}${endpoint}`, options);
  return response.json();
};
```

## 🤖 Related Repositories

- [ownquesta_agents](https://github.com/zeeelll/ownquesta_agents) — the AI agent service (ML Assistant) that powers Ownquesta's guided model building
