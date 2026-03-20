# Education Tutor for Remote India

AI tutoring system for low-bandwidth regions that ingests state-board textbook PDFs and delivers curriculum-aligned answers with measurable context-pruning savings.

## Architecture
`PDF -> Section Indexing -> Relevance Routing -> ScaleDown -> LLM`

## Why This Is Not Basic RAG
- Upload-time section indexing stores chapter-like slices for each document.
- Query-time relevance routing picks only top sections.
- ScaleDown compresses routed context before LLM call.
- Response metadata exposes baseline vs routed vs compressed tokens.

## Core APIs (Canonical Metrics Contract)
- `POST /api/chat`
  - metadata fields: `baseline_estimated_tokens`, `optimized_estimated_tokens`, `compressed_tokens`, `routing_savings_pct`, `total_savings_pct`, `selected_chapters`
- `POST /api/benchmark`
  - benchmark fields: baseline/routed token estimates + routing savings for fast comparison.

## Environment
Create `server/.env`:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-with-a-secure-random-string
SCALEDOWN_API_KEY=your_scaledown_api_key
GROQ_API_KEY=your_groq_api_key

# Optional benchmark pricing assumptions (INR)
BENCH_INR_PER_1K_INPUT=0
BENCH_INR_PER_1K_OUTPUT=0
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Reproduce Benchmark In 3 Commands
1. `cd server && npm install && npm run dev`
2. In a second terminal: `cd client && npm install && npm run dev`
3. In a third terminal:
   - With scripted upload:  
     `cd server && set BENCH_PDF_PATHS=..\Docs\sample.pdf && npm run benchmark`
   - Or with existing browser session uploads:  
     `cd server && npm run benchmark`

Generated reports:
- `Docs/benchmarks/benchmark-report-<timestamp>.json`
- `Docs/benchmarks/benchmark-report-<timestamp>.md`

## Expected Judge-Facing Output Format
| Metric | Example |
|---|---:|
| Baseline estimated tokens | 11200 |
| Routed estimated tokens | 1400 |
| Compressed tokens | 680 |
| Routing savings % | 87.5% |
| Total savings % | 93.9% |

Token metrics are primary evidence. INR values are optional derived estimates from configured assumptions.

## Privacy & Repo Cleanliness Checklist
- Do not commit personal files, invoices, screenshots, or unrelated exports.
- Keep secrets only in `.env` files (never in committed code).
- Keep generated benchmark outputs under `Docs/benchmarks/` and attach only selected evidence files.
- Run `git status` before every push.

## 60-Second Demo Runbook
See [Docs/demo_runbook.md](Docs/demo_runbook.md) for the exact talk-track and on-screen sequence.
