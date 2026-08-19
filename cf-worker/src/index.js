const ALLOWED_ORIGINS = [
  'https://nickhafen.github.io',
];

const MODEL_WHITELIST = [
  'google/gemma-4-26b-a4b-it:free',
];

const MAX_TOKENS_CAP = 60;
const TOP_LOGPROBS_CAP = 10;

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

    const { model, messages, temperature, top_logprobs } = body || {};

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

    const safeTemperature = Math.min(2, Math.max(0, Number(temperature) || 0.7));
    const safeTopLogprobs = Math.min(TOP_LOGPROBS_CAP, Math.max(1, Number(top_logprobs) || 5));

    try {
      const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://nickhafen.github.io/ai-law-lab/',
          'X-Title': 'AI & Law — Token Explorer',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: safeTemperature,
          max_tokens: MAX_TOKENS_CAP,
          logprobs: true,
          top_logprobs: safeTopLogprobs,
        }),
      });

      const data = await upstream.text();
      const responseHeaders = { ...headers, 'Content-Type': 'application/json' };
      const retryAfter = upstream.headers.get('Retry-After');
      if (retryAfter) responseHeaders['Retry-After'] = retryAfter;
      return new Response(data, {
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
