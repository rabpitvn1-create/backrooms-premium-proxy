# backrooms-premium-proxy

Premium lane proxy (Render). POST /chat -> OpenAI-style chat completions at the
configured upstream, key kept server-side in env. GET /health -> {"ok":true}.

Env vars:
- PREMIUM_API_KEY (required, set only in Render dashboard)
- PREMIUM_BASE_URL (default https://api.vilao.ai/v1)
- PREMIUM_MODEL (default occ/claude-haiku-5-5)

No dependencies; Node >= 18 (global fetch).
