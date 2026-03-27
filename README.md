# VIVO SIM — Deevo Simulation Intelligence Engine

**AI-powered scenario simulation for GCC decision intelligence.**

VIVO SIM transforms real-world events into interactive, agent-based simulations. Input a scenario — a policy change, price hike, or social trigger — and watch it propagate through a network of GCC-specific personas, producing predictive intelligence on how public reaction might unfold.

This is not a chatbot. This is not a dashboard. This is a **system experience**.

---

## Architecture

```
deevo-sim/
├── frontend/     Next.js 14 · TypeScript · Tailwind CSS · React Flow · Framer Motion
├── backend/      FastAPI · Python 3.11+ · Pydantic v2 · Async Services
├── seeds/        JSON seed data (scenarios, agents, graphs, simulations)
└── docs/         Validation reports, architecture docs
```

**8-Stage Pipeline:** Normalize → Signals → Graph Build → Graph Enrich → Simulate → Decision → Intelligence Brief → Analysis Query

---

## Deployment

| Service   | Platform | Root Directory |
|-----------|----------|----------------|
| Backend   | Railway  | `backend/`     |
| Frontend  | Vercel   | `frontend/`    |

### Backend (Railway)

1. Create a new Railway service from this repo
2. Set **Root Directory** to `backend`
3. Railway auto-detects Python via `requirements.txt`
4. Startup command (via Procfile): `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables (see below)
6. Health check: `GET /health`

### Frontend (Vercel)

1. Import this repo into Vercel
2. Set **Root Directory** to `frontend`
3. Framework auto-detects as **Next.js**
4. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
5. Deploy

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — product overview, pipeline walkthrough, use cases |
| `/control-room` | **Control Room** — 8-stage pipeline intelligence interface |
| `/demo` | Demo — graph visualization, timeline, report, analyst chat |
| `/architecture` | System architecture — pipeline deep dive, data flow, tech stack |

---

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/scenario/normalize` | Normalize scenario, extract entities |
| POST | `/api/v1/signals/extract` | Extract signals from scenario |
| POST | `/api/v1/graph/build` | Build relationship graph |
| POST | `/api/v1/graph/enrich` | Enrich graph with influence scores |
| POST | `/api/v1/simulate/run-branched` | Run branched simulation |
| POST | `/api/v1/decision/compute-branched` | Compute decision actions |
| POST | `/api/v1/brief/generate-branched` | Generate intelligence brief |
| POST | `/api/v1/analysis/query-branched` | Query analysis with follow-up |

---

## Environment Variables

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g. `https://your-app.railway.app`) |

### Backend (Railway)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Auto | `8000` | Set by Railway automatically |
| `ALLOWED_ORIGINS` | Recommended | `*` | Comma-separated list of allowed CORS origins (set to your Vercel URL) |
| `DEBUG` | No | `false` | Enable debug mode |

---

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # Edit NEXT_PUBLIC_API_URL
npm run dev                    # → http://localhost:3000
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # → http://localhost:8000
```

API docs at `http://localhost:8000/docs` (Swagger UI).

---

## License

Proprietary — Deevo Analytics. All rights reserved. See [LICENSE](LICENSE).
