const ALLOWED_ORIGINS = [
  'https://nickhafen.github.io',
];

const MODEL_WHITELIST = [
  'google/gemma-4-26b-a4b-it:free',
  // meta-llama/llama-3.3-70b-instruct was removed: OpenRouter load-balances it across
  // providers whose logprobs support is broken in different ways. Cloudflare returns
  // none; Novita, AkashML and Parasail return partial arrays (55-57 entries for 60
  // tokens) with tokens missing from the middle. Across 11 runs it never once returned
  // a complete array, so the card cannot display its output faithfully. Any open-weight
  // model added here must be screened for complete logprobs first.
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1',
];

const MAX_TOKENS_CAP = 60;
// Absolute ceiling for an explicit max_tokens. The card never sends one, so normal
// student traffic stays at MAX_TOKENS_CAP; this exists so the cached-example capture
// script can record longer passages without a second deploy to raise and restore the
// cap. Kept low enough that the worst case is still a fraction of a cent per request.
const MAX_TOKENS_CEILING = 150;
const TOP_LOGPROBS_CAP = 10;
const TOP_K_CAP = 100;
const SYSTEM_PROMPT_CHAR_CAP = 2000;
// max_tokens caps what we pay for on output, but input is billed too. Without a
// prompt cap a single pasted document could cost more than a whole class session.
const PROMPT_CHAR_CAP = 8000;

// `Number(value) || fallback` silently rewrites 0 into the fallback, because 0 is
// falsy. That matters here: temperature 0, top_k 0, and seed 0 are all meaningful
// values, and temperature 0 is the whole point of the determinism demonstration.
// Number() is equally unhelpful in the other direction — Number(null) and Number('')
// are both 0 — so absent values are rejected before parsing rather than after.
function toFiniteNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clampNumber(value, min, max, fallback) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clampInteger(value, min, max) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'Retry-After',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      const model = new URL(request.url).searchParams.get('model');
      if (!MODEL_WHITELIST.includes(model)) {
        return new Response(JSON.stringify({ error: 'Model not allowed' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      try {
        const modelPath = model.split('/').map(encodeURIComponent).join('/');
        const upstream = await fetch('https://openrouter.ai/api/v1/model/' + modelPath);
        const data = await upstream.json();
        if (!upstream.ok) {
          return new Response(JSON.stringify({ error: data?.error || 'Could not load model pricing' }), {
            status: upstream.status,
            headers: { ...headers, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({
          model: data?.data?.id || model,
          pricing: data?.data?.pricing || null,
        }), {
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Could not load model pricing', detail: String(err) }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { model, messages, system, temperature, top_logprobs, seed, top_k, top_p, max_tokens } = body || {};

    if (!MODEL_WHITELIST.includes(model)) {
      return new Response(JSON.stringify({ error: 'Model not allowed' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const promptChars = messages.reduce((total, message) => total + String(message?.content ?? '').length, 0);
    if (promptChars > PROMPT_CHAR_CAP) {
      return new Response(JSON.stringify({
        error: 'Prompt is too long (' + promptChars + ' characters, limit ' + PROMPT_CHAR_CAP + ')',
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const systemText = typeof system === 'string' ? system.trim() : '';
    if (systemText.length > SYSTEM_PROMPT_CHAR_CAP) {
      return new Response(JSON.stringify({
        error: 'System prompt is too long (' + systemText.length + ' characters, limit ' + SYSTEM_PROMPT_CHAR_CAP + ')',
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const outboundMessages = systemText
      ? [{ role: 'system', content: systemText }, ...messages]
      : messages;

    const upstreamPayload = {
      model,
      messages: outboundMessages,
      temperature: clampNumber(temperature, 0, 2, 0.7),
      max_tokens: clampInteger(max_tokens, 1, MAX_TOKENS_CEILING) ?? MAX_TOKENS_CAP,
      logprobs: true,
      top_logprobs: clampNumber(top_logprobs, 1, TOP_LOGPROBS_CAP, 5),
      // NOTE: `provider: { require_parameters: true }` was tried here to avoid
      // providers with broken logprobs support. It made things worse — OpenAI models
      // 404'd with "No endpoints found that can handle the requested parameters",
      // while the open-weight providers it did allow still returned partial arrays.
      // The client-side check that the logprob tokens reproduce message.content is
      // the reliable defence; keep it there rather than trying to solve it by routing.
    };

    const safeSeed = clampInteger(seed, 0, 2147483647);
    if (safeSeed !== null) upstreamPayload.seed = safeSeed;

    // top_k 0 is "disabled" by convention, so it is omitted rather than sent as 0 —
    // some providers reject an explicit 0.
    const safeTopK = clampInteger(top_k, 0, TOP_K_CAP);
    if (safeTopK !== null && safeTopK > 0) upstreamPayload.top_k = safeTopK;

    // top_p is a probability mass, so 0 is not a sensible floor — a nucleus of 0
    // leaves nothing to sample from. Blank means "unset" and is omitted entirely.
    const safeTopP = clampNumber(top_p, 0.01, 1, null);
    if (safeTopP !== null) upstreamPayload.top_p = safeTopP;

    try {
      const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://nickhafen.github.io/ai-law-lab/',
          'X-Title': 'AI & Law — Token Explorer',
        },
        body: JSON.stringify(upstreamPayload),
      });

      const rawBody = await upstream.text();
      let responseBody = rawBody;

      // Echo the exact payload forwarded upstream so the card's "View request" panel
      // shows what the provider actually received, not a client-side reconstruction.
      if (upstream.ok) {
        try {
          const parsed = JSON.parse(rawBody);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            parsed._request = upstreamPayload;
            responseBody = JSON.stringify(parsed);
          }
        } catch {
          // Non-JSON success bodies pass through untouched.
        }
      }

      const responseHeaders = { ...headers, 'Content-Type': 'application/json' };
      const retryAfter = upstream.headers.get('Retry-After');
      if (retryAfter) responseHeaders['Retry-After'] = retryAfter;
      return new Response(responseBody, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upstream request failed', detail: String(err) }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
  },
};
