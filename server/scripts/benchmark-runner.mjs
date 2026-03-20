import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = process.env.BENCH_API_BASE || 'http://localhost:3000/api';
const BENCH_PDF_PATHS = (process.env.BENCH_PDF_PATHS || '').split(',').map((p) => p.trim()).filter(Boolean);
const INR_PER_1K_INPUT = Number(process.env.BENCH_INR_PER_1K_INPUT || '0');
const INR_PER_1K_OUTPUT = Number(process.env.BENCH_INR_PER_1K_OUTPUT || '0');

const QUESTIONS = [
  'Summarize the key ideas of this chapter in 5 points.',
  'Explain the topic in simple terms for class 8 students.',
  'What are the important definitions and formulas from this section?',
  'Create 5 exam-style questions with short answers from the relevant chapter.',
  'What are common mistakes students make in this topic and how to avoid them?',
  'Give a step-by-step explanation with one practical example.',
  'List likely board exam questions from this material.',
  'Provide a quick revision checklist from the most relevant section.',
];

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function estimateInr(tokens, per1k) {
  if (!per1k || per1k <= 0) {
    return null;
  }
  return Number(((tokens / 1000) * per1k).toFixed(4));
}

function estimateTotalInr(inputTokens, outputTokens) {
  const inputCost = estimateInr(inputTokens, INR_PER_1K_INPUT) || 0;
  const outputCost = estimateInr(outputTokens, INR_PER_1K_OUTPUT) || 0;

  if (INR_PER_1K_INPUT <= 0 && INR_PER_1K_OUTPUT <= 0) {
    return null;
  }

  return Number((inputCost + outputCost).toFixed(4));
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function toTokenCount(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseCookieFromHeaders(headers) {
  if (!headers) {
    return '';
  }

  const getSetCookie = headers.getSetCookie?.bind(headers);
  const all = typeof getSetCookie === 'function' ? getSetCookie() : [];

  for (const raw of all) {
    const match = raw.match(/connect\.sid=[^;]+/);
    if (match) {
      return match[0];
    }
  }

  const single = headers.get('set-cookie');
  if (!single) {
    return '';
  }

  const match = single.match(/connect\.sid=[^;]+/);
  return match ? match[0] : '';
}

async function httpJson(endpoint, { method = 'GET', body, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const parsedCookie = parseCookieFromHeaders(response.headers);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Request failed ${method} ${endpoint}: ${response.status} ${JSON.stringify(payload)}`);
  }

  return { payload, cookie: parsedCookie };
}

async function uploadPdfs(cookie) {
  if (BENCH_PDF_PATHS.length === 0) {
    return cookie;
  }

  const formData = new FormData();

  for (const pdfPath of BENCH_PDF_PATHS) {
    const absolute = path.resolve(process.cwd(), pdfPath);
    const data = await fs.readFile(absolute);
    const fileName = path.basename(absolute);
    const blob = new Blob([data], { type: 'application/pdf' });
    formData.append('pdfs', blob, fileName);
  }

  const headers = {};
  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(`${API_BASE}/upload-pdf`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const parsedCookie = parseCookieFromHeaders(response.headers);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.success) {
    throw new Error(`Upload failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return parsedCookie || cookie;
}

function buildMarkdown({ generatedAt, filesUploaded, rows, totals, failedAssertions }) {
  const assumptions = INR_PER_1K_INPUT > 0 || INR_PER_1K_OUTPUT > 0
    ? `Input rate: INR ${INR_PER_1K_INPUT}/1K tokens, Output rate: INR ${INR_PER_1K_OUTPUT}/1K tokens`
    : 'INR estimates disabled (set BENCH_INR_PER_1K_INPUT and BENCH_INR_PER_1K_OUTPUT to enable).';

  const lines = [
    '# Benchmark Report',
    '',
    `Generated at: ${generatedAt}`,
    `API base: ${API_BASE}`,
    `PDFs uploaded by script: ${filesUploaded.length > 0 ? filesUploaded.join(', ') : 'None (used existing session uploads)'}`,
    `Pricing assumptions: ${assumptions}`,
    '',
    '## Query Metrics',
    '',
    '| # | Question | Baseline | Routed | Compressed | Route Save | Total Save | Selected Sections |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
  ];

  rows.forEach((row, index) => {
    lines.push(`| ${index + 1} | ${row.question} | ${row.baselineTokens} | ${row.optimizedTokens} | ${row.compressedTokens} | ${pct(row.routingSavingsPct)} | ${pct(row.totalSavingsPct)} | ${row.selectedSections}/${row.totalSections} |`);
  });

  lines.push('');
  lines.push('## Aggregate');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---:|');
  lines.push(`| Avg baseline tokens | ${totals.avgBaselineTokens} |`);
  lines.push(`| Avg routed tokens | ${totals.avgOptimizedTokens} |`);
  lines.push(`| Avg compressed tokens | ${totals.avgCompressedTokens} |`);
  lines.push(`| Avg routing savings | ${pct(totals.avgRoutingSavingsPct)} |`);
  lines.push(`| Avg total savings | ${pct(totals.avgTotalSavingsPct)} |`);

  if (totals.avgBaselineCostInr !== null) {
    lines.push(`| Avg baseline cost (INR) | ${totals.avgBaselineCostInr} |`);
    lines.push(`| Avg routed cost (INR) | ${totals.avgOptimizedCostInr} |`);
    lines.push(`| Avg compressed cost (INR) | ${totals.avgCompressedCostInr} |`);
  }

  lines.push('');
  lines.push('## Assertions');
  lines.push('');

  if (failedAssertions.length === 0) {
    lines.push('- PASS: All metric integrity assertions passed.');
  } else {
    lines.push('- FAIL: Some assertions failed.');
    failedAssertions.forEach((failure) => lines.push(`- ${failure}`));
  }

  return lines.join('\n');
}

function avg(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  return Number((numbers.reduce((acc, n) => acc + n, 0) / numbers.length).toFixed(2));
}

async function main() {
  const generatedAt = new Date().toISOString();
  let sessionCookie = '';

  const health = await fetch(`${API_BASE.replace(/\/api$/, '')}/`).catch(() => null);
  if (!health || !health.ok) {
    throw new Error(`Backend is not reachable at ${API_BASE}`);
  }

  sessionCookie = await uploadPdfs(sessionCookie);

  const rows = [];
  const failedAssertions = [];

  for (const question of QUESTIONS) {
    const benchmark = await httpJson('/benchmark', {
      method: 'POST',
      body: { question },
      cookie: sessionCookie,
    });

    sessionCookie = benchmark.cookie || sessionCookie;

    const chat = await httpJson('/chat', {
      method: 'POST',
      body: { question },
      cookie: sessionCookie,
    });

    sessionCookie = chat.cookie || sessionCookie;

    const b = benchmark.payload?.benchmark || {};
    const m = chat.payload?.metadata || {};

    const baselineTokens = toTokenCount(m.baseline_estimated_tokens ?? b.baseline_estimated_tokens);
    const optimizedTokens = toTokenCount(m.optimized_estimated_tokens ?? b.optimized_estimated_tokens);
    const compressedTokens = toTokenCount(m.compressed_tokens);
    const routingSavingsPct = Number(m.routing_savings_pct ?? b.routing_savings_pct ?? 0);
    const totalSavingsPct = Number(m.total_savings_pct ?? 0);
    const selectedSections = toTokenCount(m.selected_sections_count ?? b.selected_sections_count);
    const totalSections = toTokenCount(m.total_sections_count ?? b.total_sections_count);
    const outputTokens = toTokenCount(m.llm_tokens_used);

    if (optimizedTokens > baselineTokens) {
      failedAssertions.push(`Question '${question}': optimized (${optimizedTokens}) > baseline (${baselineTokens}).`);
    }

    if (compressedTokens > optimizedTokens) {
      failedAssertions.push(`Question '${question}': compressed (${compressedTokens}) > optimized (${optimizedTokens}).`);
    }

    if (routingSavingsPct < 0 || routingSavingsPct > 100) {
      failedAssertions.push(`Question '${question}': routing_savings_pct out of bounds (${routingSavingsPct}).`);
    }

    if (totalSavingsPct < 0 || totalSavingsPct > 100) {
      failedAssertions.push(`Question '${question}': total_savings_pct out of bounds (${totalSavingsPct}).`);
    }

    rows.push({
      question,
      baselineTokens,
      optimizedTokens,
      compressedTokens,
      routingSavingsPct,
      totalSavingsPct,
      selectedSections,
      totalSections,
      outputTokens,
      baselineCostInr: estimateTotalInr(baselineTokens, outputTokens),
      optimizedCostInr: estimateTotalInr(optimizedTokens, outputTokens),
      compressedCostInr: estimateTotalInr(compressedTokens, outputTokens),
    });
  }

  const totals = {
    avgBaselineTokens: avg(rows.map((r) => r.baselineTokens)),
    avgOptimizedTokens: avg(rows.map((r) => r.optimizedTokens)),
    avgCompressedTokens: avg(rows.map((r) => r.compressedTokens)),
    avgRoutingSavingsPct: avg(rows.map((r) => r.routingSavingsPct)),
    avgTotalSavingsPct: avg(rows.map((r) => r.totalSavingsPct)),
    avgBaselineCostInr: rows.some((r) => r.baselineCostInr !== null) ? avg(rows.map((r) => r.baselineCostInr || 0)) : null,
    avgOptimizedCostInr: rows.some((r) => r.optimizedCostInr !== null) ? avg(rows.map((r) => r.optimizedCostInr || 0)) : null,
    avgCompressedCostInr: rows.some((r) => r.compressedCostInr !== null) ? avg(rows.map((r) => r.compressedCostInr || 0)) : null,
  };

  const output = {
    generatedAt,
    apiBase: API_BASE,
    pricing: {
      inr_per_1k_input_tokens: INR_PER_1K_INPUT,
      inr_per_1k_output_tokens: INR_PER_1K_OUTPUT,
      note: 'INR estimates are optional and user-configured assumptions.',
    },
    questions: QUESTIONS,
    rows,
    totals,
    assertions: {
      passed: failedAssertions.length === 0,
      failed: failedAssertions,
    },
  };

  const stamp = nowStamp();
  const outDir = path.resolve(process.cwd(), '..', 'Docs', 'benchmarks');
  await fs.mkdir(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `benchmark-report-${stamp}.json`);
  const mdPath = path.join(outDir, `benchmark-report-${stamp}.md`);

  await fs.writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  await fs.writeFile(mdPath, `${buildMarkdown({
    generatedAt,
    filesUploaded: BENCH_PDF_PATHS,
    rows,
    totals,
    failedAssertions,
  })}\n`, 'utf8');

  console.log(`Benchmark JSON: ${jsonPath}`);
  console.log(`Benchmark Markdown: ${mdPath}`);

  if (failedAssertions.length > 0) {
    console.error('Metric assertions failed. Check generated report.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Benchmark runner failed:', error);
  process.exit(1);
});
