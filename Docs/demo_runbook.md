# 60-Second Demo Runbook

## Goal
Show that context pruning reduces cost/latency compared to sending full textbook context.

## Demo Sequence
1. Open app with at least one uploaded textbook PDF.
2. Ask one curriculum question.
3. Point to top metrics bar:
   - Baseline tokens
   - Routed tokens
   - Compressed tokens
   - Route Save %
   - Total Save %
4. Point to routing summary banner:
   - Selected sections count
   - Top selected chapter titles
5. Mention API pipeline in one line:  
   `Section Routing -> ScaleDown Compression -> LLM Answer`
6. Show one generated benchmark report from `Docs/benchmarks/`.

## Talk Track (Concise)
- "We index textbook sections at upload time so we do not reprocess the full PDF for every query."
- "At query time, we route only relevant sections, then compress with ScaleDown before LLM inference."
- "This gives measurable savings in both routed and compressed token counts, visible after every answer."

## Backup If Live API Is Slow
- Show latest benchmark markdown report table and explain baseline vs routed vs compressed values.
