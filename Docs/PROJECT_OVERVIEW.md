# EduTutor Project Overview

## 1. Project Summary
**Education Tutor for Remote India** is an AI tutoring platform designed for low-bandwidth, cost-sensitive environments. It ingests state-board textbook PDFs and answers student questions with curriculum-aligned responses while minimizing token cost and data transfer.

Core objective: **reduce per-query cost and latency** without sacrificing answer quality.

---

## 2. What We Built

### 2.1 End-to-End Workflow
1. Student uploads one or more PDF textbooks.
2. Backend extracts text and indexes document sections.
3. At query time, relevant sections are routed (context pruning).
4. Routed context is compressed via ScaleDown.
5. Compressed context is sent to LLM (Groq) for final answer.
6. UI displays token and savings metrics for transparency.

### 2.2 Key Product Features
- Multi-PDF upload (session-based memory).
- Per-document management (view/remove/clear session).
- PDF preview in-app.
- Chat interface for textbook Q&A.
- Real-time token savings display in UI:
  - baseline tokens
  - routed tokens
  - compressed tokens
  - route savings %
  - total savings %
- Context routing summary with selected sections/chapters.

---

## 3. Why This Is Not Basic RAG
Our pipeline is not a simple retrieve-and-append baseline:

`PDF -> Section Indexing -> Relevance Routing -> ScaleDown Compression -> LLM`

Differences from basic RAG:
- We index and score section relevance at query time.
- We prune context before model call.
- We apply additional prompt compression (ScaleDown).
- We return measurable optimization metadata per query.

---

## 4. Technical Stack
- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- PDF processing: multer, pdf-parse
- Session state: express-session + in-memory store
- Context compression: ScaleDown API
- LLM response generation: Groq API

---

## 5. APIs and Metrics Contract

### 5.1 `POST /api/chat`
Returns answer + optimization metadata:
- `baseline_estimated_tokens`
- `optimized_estimated_tokens`
- `compressed_tokens`
- `routing_savings_pct`
- `total_savings_pct`
- `selected_chapters`

### 5.2 `POST /api/benchmark`
Returns fast baseline-vs-routing estimates:
- baseline/routed token counts
- routing savings %
- selected sections count

---

## 6. Benchmarking
Benchmarking is automated with:
- `server/scripts/benchmark-runner.mjs`
- Output folder: `Docs/benchmarks/`

### Latest Strong Report
- `benchmark-report-20260320-175505.md`

### Result Snapshot
- Avg baseline tokens: **2597**
- Avg routed tokens: **2286.88**
- Avg compressed tokens: **770**
- Avg routing savings: **12.0%**
- Avg total savings: **70.5%**
- Assertions: **PASS**

This demonstrates both:
1. **Non-zero routing (pruning) gains**, and
2. **Strong total compression gains**.

---

## 7. Reliability and Hardening Work Completed
- Removed accidental sensitive file from working branch (`temp.html`).
- Added repository hygiene safeguards in `.gitignore`.
- Added production session-secret enforcement.
- Added benchmark retry logic for transient external API failures.
- Added benchmark integrity assertions:
  - optimized <= baseline
  - compressed <= optimized
  - savings in valid range

---

## 8. How To Run

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Benchmark
```bash
cd server
set BENCH_PDF_PATHS=..\\Docs\\SRS_EducationTutor.pdf
npm run benchmark
```

Generated benchmark artifacts:
- `Docs/benchmarks/benchmark-report-<timestamp>.json`
- `Docs/benchmarks/benchmark-report-<timestamp>.md`

---

## 9. Demo Talking Points (60 sec)
1. Upload textbook PDF.
2. Ask question.
3. Show live savings bar in UI.
4. Show selected sections/chapters.
5. Highlight benchmark report proving cost reduction.

---

## 10. Current Status
Project is fully functional end-to-end and submission-ready with measurable optimization proof suitable for hackathon judging.
