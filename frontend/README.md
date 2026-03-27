# Deevo Sim

**Simulation Intelligence Engine for GCC Scenarios**

Deevo Sim transforms real-world events into interactive, agent-based simulations. Input a scenario — a policy change, price hike, or social trigger — and watch it propagate through a network of GCC-specific personas, producing predictive intelligence on how public reaction might unfold.

This is not a chatbot. It is a system experience: entity extraction, graph visualization, temporal simulation, and an analyst interface, all rendered in a cinematic dark UI built for decision intelligence.

---

## What It Does

1. **Input** — Enter a real-world scenario in Arabic or English
2. **Extract** — System identifies entities (people, orgs, topics, regions)
3. **Graph** — Entities are mapped into a directed relationship graph
4. **Simulate** — GCC agent personas interact over 4 time steps
5. **Report** — Intelligence brief with prediction, confidence, spread analysis
6. **Query** — Ask the analyst interface "why?" and get explainable reasoning

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — product overview, pipeline walkthrough, use cases |
| `/demo` | **Control Room** — 3-column intelligence interface with graph, timeline, report, and analyst chat |
| `/architecture` | System architecture — 7-layer pipeline deep dive, data flow, tech stack |

---

## Tech Stack

**Frontend**

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS with custom `ds-*` design token system
- Framer Motion for scroll-reveal and micro-interactions
- React Flow (`@xyflow/react`) for interactive entity graph
- Lucide React for iconography

**Backend** (separate service)

- FastAPI (Python 3.11+)
- Pydantic v2 schemas
- Async service architecture
- JSON seed data

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/deevo-sim.git
cd deevo-sim/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

The frontend runs on `http://localhost:3000`. The backend API defaults to `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

---

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                  # Landing page (cinematic hero)
│   ├── layout.tsx                # Root layout + metadata + SEO
│   ├── demo/page.tsx             # Control Room (simulation UI)
│   └── architecture/page.tsx     # Architecture overview
├── components/
│   ├── graph/GraphPanel.tsx      # Entity graph (React Flow + custom nodes)
│   ├── simulation/TimelinePanel.tsx  # 4-step simulation timeline
│   ├── report/ReportPanel.tsx    # Intelligence brief output
│   ├── chat/ChatPanel.tsx        # Analyst query interface
│   └── ui/
│       ├── Navbar.tsx            # Floating navigation bar
│       ├── Footer.tsx            # Site footer
│       └── SectionHeading.tsx    # Section header component
├── lib/
│   ├── types.ts                  # Core TypeScript interfaces
│   ├── mock-data.ts              # Typed seed data (scenarios, agents, graph)
│   ├── api.ts                    # API client (6 endpoints)
│   └── utils.ts                  # Utility functions (cn, formatters, colors)
├── styles/
│   └── globals.css               # Design system component layer + base reset
├── public/
│   └── favicon.svg               # SVG favicon
├── tailwind.config.ts            # Custom design tokens
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript strict mode
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variable template
└── package.json                  # Dependencies and scripts
```

---

## Design System

The UI uses a custom `ds-*` token namespace defined in `tailwind.config.ts`:

**Colors** — Deep blacks (`#06060A` base), 4-tier surface hierarchy, refined accent blue (`#5B7BF8`), semantic status colors.

**Typography** — Display (5.5rem) through nano (0.6875rem), Inter + JetBrains Mono.

**Shadows** — Layered depth system (`ds` through `ds-xl`) plus accent glow variants.

**Components** — `.ds-card`, `.ds-card-interactive`, `.ds-btn-primary`, `.ds-btn-secondary`, `.ds-input`, `.ds-badge-accent`, `.ds-panel-header` — all defined in `globals.css` component layer.

---

## Simulation Logic

The current engine is rule-based (mock data), designed for future ML integration:

1. **Negative events** spread faster through the network
2. **High-influence agents** amplify reach disproportionately
3. **Official responses** reduce spread intensity
4. **Conflicting information** increases chaos score

Time progresses through 4 steps: Initial Reaction → Amplification → Peak Intensity → Stabilization.

---

## GCC Agent Archetypes

| Archetype | Behavior | Platform | Role |
|-----------|----------|----------|------|
| Saudi Citizen | Reactive | Twitter | Primary affected demographic |
| Kuwaiti Citizen | Analytical | Twitter | Cross-border observer |
| Influencer | Reactive | Twitter | Signal amplifier |
| Media Account | Analytical | News | Narrative shaper |
| Government Voice | Neutral | News | De-escalation agent |
| Youth User | Reactive | WhatsApp | Viral propagator |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/deevo-sim&root-directory=frontend)

### Manual Deploy

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Deevo Sim v1.0"
   git remote add origin https://github.com/YOUR_USERNAME/deevo-sim.git
   git push -u origin main
   ```

2. Connect to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your `deevo-sim` repository
   - Set **Root Directory** to `frontend`
   - Framework Preset will auto-detect **Next.js**

3. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` → your backend API URL (optional — frontend works standalone with mock data)

4. Deploy. Vercel auto-builds on every push to `main`.

### Build Settings (auto-detected)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node.js Version | 18.x or 20.x |

---

## License

Proprietary — Deevo Analytics. All rights reserved.
