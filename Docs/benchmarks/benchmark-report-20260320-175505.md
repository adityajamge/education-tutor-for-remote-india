# Benchmark Report

Generated at: 2026-03-20T12:24:28.939Z
API base: http://localhost:3000/api
PDFs uploaded by script: ..\Docs\SRS_EducationTutor.pdf
Pricing assumptions: INR estimates disabled (set BENCH_INR_PER_1K_INPUT and BENCH_INR_PER_1K_OUTPUT to enable).

## Query Metrics

| # | Question | Baseline | Routed | Compressed | Route Save | Total Save | Selected Sections |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | What are the main functional requirements described in this document? | 2597 | 2597 | 1543 | 0.0% | 41.0% | 3/4 |
| 2 | Summarize the non-functional requirements and performance constraints. | 2597 | 2597 | 662 | 0.0% | 75.0% | 3/4 |
| 3 | List key user roles or actors and their responsibilities. | 2597 | 1770 | 346 | 32.0% | 87.0% | 2/4 |
| 4 | What are the core system modules or components mentioned? | 2597 | 1770 | 835 | 32.0% | 68.0% | 2/4 |
| 5 | Extract integration or API-related requirements from the relevant section. | 2597 | 2597 | 1075 | 0.0% | 59.0% | 3/4 |
| 6 | Identify security or privacy requirements in this document. | 2597 | 2597 | 519 | 0.0% | 80.0% | 3/4 |
| 7 | What assumptions or constraints are specified for deployment? | 2597 | 1770 | 593 | 32.0% | 77.0% | 2/4 |
| 8 | Create a short acceptance checklist from the most relevant requirements section. | 2597 | 2597 | 587 | 0.0% | 77.0% | 3/4 |

## Aggregate

| Metric | Value |
|---|---:|
| Avg baseline tokens | 2597 |
| Avg routed tokens | 2286.88 |
| Avg compressed tokens | 770 |
| Avg routing savings | 12.0% |
| Avg total savings | 70.5% |

## Assertions

- PASS: All metric integrity assertions passed.
