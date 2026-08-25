// Captures real model responses — text AND token probabilities — for the Token
// Explorer's "Cached Examples" panel, and writes them to token-cached-examples.json.
//
// The examples used to be hand-written prose paired with probabilities synthesised
// from a string hash. That was fine as an illustration but taught the wrong intuition:
// notably, it never showed the top token winning 100% of the time at temperature 0,
// which is exactly what really happens. These captures are genuine API output.
//
// Requires the Worker to be deployed with MAX_TOKENS_CEILING >= MAX_TOKENS.
//
//   node scripts/capture-cached-examples.mjs
//
// Costs roughly one cent for the whole run. Re-run whenever the model or prompts
// change; the output file is committed so class time never depends on the network.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const WORKER_URL = 'https://ai-law-lab-token-explorer.nickhafen.workers.dev';
// The Worker only accepts requests from the site's own origins; localhost is allowed
// so the card can be developed against the live proxy, and that is what we use here.
const ORIGIN = 'http://localhost:8123';

const MODEL = 'openai/gpt-4.1';
const MODEL_LABEL = 'GPT-4.1';
const MAX_TOKENS = 150;
const TOP_LOGPROBS = 5;
const TEMPERATURES = [0, 1, 2];

// Must stay in sync with TOKEN_SAMPLE_PROMPTS in app.js.
const PROMPTS = {
  gettysburg: 'What is the Gettysburg address?',
  'pride-prejudice': 'What is Pride and Prejudice about?',
  'black-mirror': 'Give me 3 ideas for Black Mirror episodes.',
};

const OUT_FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'token-cached-examples.json');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function capture(prompt, temperature, attempt = 1) {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      top_logprobs: TOP_LOGPROBS,
      max_tokens: MAX_TOKENS,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.metadata?.raw || data?.error?.message || data?.error || `HTTP ${response.status}`;
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    if (retryable && attempt < 4) {
      const wait = 2000 * attempt;
      console.log(`      retryable (${message}); waiting ${wait}ms…`);
      await sleep(wait);
      return capture(prompt, temperature, attempt + 1);
    }
    throw new Error(String(message));
  }

  const content = data?.choices?.[0]?.logprobs?.content;
  if (!Array.isArray(content) || !content.length) {
    throw new Error('No token probabilities returned — this provider does not support logprobs');
  }

  // Some providers drop tokens from the middle of the logprobs array. Capturing that
  // would bake a transcript the model never produced into the teaching examples, so
  // the joined tokens must reproduce the message text exactly.
  const message = data?.choices?.[0]?.message?.content;
  const rendered = content.map(entry => entry.token).join('');
  if (typeof message === 'string' && message.trim() && rendered.trim() !== message.trim()) {
    throw new Error(`Incomplete logprobs: ${content.length} entries for ${data?.usage?.completion_tokens} tokens`);
  }

  // Drop `bytes`: it is roughly 40% of the payload and the card never reads it.
  return {
    content: content.map(entry => ({
      token: entry.token,
      logprob: entry.logprob,
      top_logprobs: (entry.top_logprobs || []).map(alt => ({ token: alt.token, logprob: alt.logprob })),
    })),
    usage: data?.usage ?? null,
    resolvedModel: data?.model ?? MODEL,
  };
}

const examples = {};
let totalCost = 0;
let captured = 0;

console.log(`Capturing ${Object.keys(PROMPTS).length * TEMPERATURES.length} examples with ${MODEL} (max_tokens=${MAX_TOKENS})\n`);

for (const [key, prompt] of Object.entries(PROMPTS)) {
  examples[key] = { prompt, responses: {} };
  for (const temperature of TEMPERATURES) {
    process.stdout.write(`  ${key} @ temp ${temperature} … `);
    try {
      const { content, usage, resolvedModel } = await capture(prompt, temperature);

      // Sanity signal, not a hard requirement: at temperature 0 the generated token
      // should be the top-ranked one every time. If it is not, something upstream is
      // overriding temperature and the capture is not worth keeping.
      let topRanked = 0;
      content.forEach(entry => {
        const sorted = [...entry.top_logprobs].sort((a, b) => b.logprob - a.logprob);
        if (sorted[0]?.token === entry.token) topRanked++;
      });

      examples[key].responses[temperature] = content;
      totalCost += Number(usage?.cost) || 0;
      captured++;

      const pct = Math.round((topRanked / content.length) * 100);
      console.log(`${content.length} tokens, top-ranked ${pct}%  (${resolvedModel})`);
      if (temperature === 0 && pct !== 100) {
        console.log(`      WARNING: expected 100% at temperature 0, got ${pct}%`);
      }
    } catch (error) {
      console.log(`FAILED — ${error.message}`);
      process.exitCode = 1;
    }
    await sleep(400);
  }
}

const payload = {
  capturedAt: new Date().toISOString(),
  model: MODEL,
  modelLabel: MODEL_LABEL,
  maxTokens: MAX_TOKENS,
  topLogprobs: TOP_LOGPROBS,
  note: 'Real API captures, including live token probabilities. Regenerate with scripts/capture-cached-examples.mjs',
  examples,
};

// Round to the six decimals the card actually displays and skip pretty-printing.
// Together these cut the file by about two thirds (920KB -> ~315KB) with no visible
// change, which matters because the browser fetches the whole thing on first expand.
const compact = (key, value) =>
  (typeof value === 'number' && !Number.isInteger(value) ? Number(value.toFixed(6)) : value);

await writeFile(OUT_FILE, JSON.stringify(payload, compact) + '\n', 'utf8');

console.log(`\nWrote ${OUT_FILE}`);
console.log(`Captured ${captured} of ${Object.keys(PROMPTS).length * TEMPERATURES.length} examples`);
console.log(`Reported cost: $${totalCost.toFixed(6)}`);
