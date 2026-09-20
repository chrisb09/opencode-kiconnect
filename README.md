# opencode-kiconnect

OpenCode provider plugin for **KI:connect** (`chat.kiconnect.nrw`) — access to self-hosted open-weight LLMs on RWTH Aachen HPC / Inferenz NRW infrastructure plus commercial models routed via the KI:connect gateway.

---

## Features

- **Deduplicated Model Catalog**: Unique, curated identifiers so every model appears exactly once in the OpenCode picker.
- **Upstream ID Mapping**: Clean kebab-case IDs sent locally (e.g. `qwen-3.8-27b`) are mapped to the exact upstream names the gateway expects (e.g. `Qwen 3.8 27B`).
- **Global Fetch Interceptor**: Authorization, alias rewriting, parameter normalization and retries are active on every request — independent of how your API key is stored.
- **Parameter Adjustments**: `max_tokens` → `max_completion_tokens` for the GPT-5 series; invalid `temperature` values removed for `gpt-5.5` (fixed at 1); required `status: "completed"` injected on assistant messages for the Responses API.
- **Cluster Resilience**: Jittered exponential backoff on transient errors (`408`, `429`, `500`, `502`, `503`, `504`).
- **Flexible Auth Resolution**: OpenCode `auth login`, environment variables, `~/.config/opencode/kiconnect.json`, or `~/.env`.

---

## Supported Models

| Model | Data Residency | Status | Released |
| :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | Germany (self-hosted) | Live | 2026-08-13 |
| `kiconnect/mistral-small-4-119b` | Germany (self-hosted) | Live | 2026-03-16 |
| `kiconnect/gpt-oss-120b` | Germany (self-hosted) | Live | 2025-08-06 |
| `kiconnect/gpt-5.4-mini` | **External (OpenAI)** | Live | n/a (commercial) |
| `kiconnect/gpt-5.5` | **External (OpenAI)** | Live, quota-limited | n/a (commercial) |
| `kiconnect/devstral-small-2-24b` | Germany (self-hosted) | Not available* | 2025-12-09 |
| `kiconnect/mistral-small-3.2-24b` | Germany (self-hosted) | Not available* | 2025-06-25 |
| `kiconnect/apertus-70b` | Germany (self-hosted) | Not available* | 2025-09-02 |

\* Listed in the [official model catalog](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/) but currently returning `404 model_not_found` on the KI:connect gateway (checked 2026-09-20). Model rotation happens regularly.

### Data Residency & NDA Relevance

- **Self-hosted (Germany)**: Open-weight models on RWTH HPC via Inferenz NRW / WestAI. Prompts and requests are **processed in real time only** — content is not saved, logged, or stored (per IT Center). Suitable for confidential work and most NDAs.
- **External (OpenAI)**: Commercial GPT models are forwarded through the KI:connect gateway to OpenAI's cloud (outside Germany). Prompts pass a third party. Treat as external data transfer — check your NDA / data protection officer before use.

**Rule of thumb for IP-protected content:** prefer `qwen-3.8-27b`, `mistral-small-4-119b`, or `gpt-oss-120b`.

Model list and data-handling statement source: [IT Center — LLM Hosting: Available Models](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/)

### Usage Limits

- RWTH IT Center currently states **no hard per-user token/request quotas** on self-hosted models (fair-use; limits may be introduced under load).
- **`gpt-5.5` (and likely other commercial models) enforces personal, per-period quotas** — observed live: `429 rate_limit_error / code: user_quota_exceeded` ("You exceeded your current quota for this period"). `gpt-5.4-mini` had no quota issue at the same time.
- The plugin retries `429`s with jittered backoff (3 attempts); if the quota stays exhausted, switch to a self-hosted model.

### Model Details

**`qwen-3.8-27b`** — Qwen 3.8 27B
Context 256K (host-side cap; model natively supports up to 1M), output cap 64K. Text + vision input. Reasoning model: emits internal thinking tokens before the visible answer, so small output budgets can be fully consumed by reasoning.

**`mistral-small-4-119b`** — Mistral Small 4 119B
Context 256K, output cap 32K. 119B MoE (4 active). Text + vision input. Instruct following, coding, agentic tasks.

**`gpt-oss-120b`** — GPT OSS 120B
Context 128K, output cap 16K. Strong reasoning/coding performance; self-hosted open weights. Reasoning model (same budget caveat as Qwen).

**`gpt-5.4-mini`** — GPT 5.4 Mini (commercial)
Context 128K (plugin default), output cap 16K. Fast lightweight option via OpenAI.

**`gpt-5.5`** — GPT 5.5 (commercial)
Context 128K (plugin default), output cap 16K. Only accepts `temperature: 1` (handled automatically). Subject to personal per-period quota; expect `429` bursts when exhausted.

**`devstral-small-2-24b`** — Devstral Small 2 24B
Context 384K, output cap 16K. Optimized for agentic coding workflows. Currently offline on the gateway.

**`mistral-small-3.2-24b`** — Mistral Small 3.2 24B
Context 128K, output cap 16K. Compact low-latency model. Currently offline on the gateway.

**`apertus-70b`** — Apertus 70B
Context 64K, output cap 8K. Multilingual open model (quantized `2509` variant). Currently offline on the gateway.

---

## Setup Guide

### 1. Build the Plugin

```bash
bun install
bun run build
```

### 2. Register the Plugin in OpenCode

Add the plugin path to your OpenCode configuration (e.g. `~/.config/opencode/opencode.jsonc`):

```jsonc
{
  "plugin": [
    "/path/to/opencode-kiconnect"
  ]
}
```

### 3. Configure Your API Key

The plugin searches for your API key in this priority order:

1. **OpenCode Auth Command**:
   ```bash
   opencode auth login
   # Select "KI:connect (RWTH/NRW)" and paste your key
   ```
2. **Environment Variable**:
   ```bash
   export KICONNECT_NRW_API_KEY="your-api-key"
   # or export KICONNECT_API_KEY="your-api-key"
   ```
3. **Dedicated Config File** (`~/.config/opencode/kiconnect.json`, mode 600):
   ```json
   {
     "apiKey": "your-api-key"
   }
   ```
4. **Home Directory `.env`**: any `KICONNECT_NRW_API_KEY=...` line inside `~/.env`.

To obtain a key: log in to [chat.kiconnect.nrw](https://chat.kiconnect.nrw) via institutional SSO → username (bottom left) → **API Keys Management** → **Generate Key**.

---

## Troubleshooting

- **"The model 'X' does not exist."**: The catalog model ID doesn't reach the gateway (custom `fetch` hook not loaded). Rebuild (`bun run build`) and restart OpenCode so the plugin config hook is picked up.
- **"The selected model does not support this operation." (`invalid_request_error`)**: The gateway serves some models only via `/v1/chat/completions`. The plugin's `@ai-sdk/openai-compatible` driver routes everything through chat completions; don't switch the provider npm to `@ai-sdk/openai`.
- **"You exceeded your current quota for this period." (`429`)**: Personal per-period quota exhausted, currently observed on `gpt-5.5`. Switch to a self-hosted model or wait for the quota to reset.
- **Empty responses from reasoning models**: Reasoning tokens consumed the whole output budget. Raise the output limit in your OpenCode config/agent for `qwen-3.8-27b` and `gpt-oss-120b`.
- **Model suddenly missing**: KI:connect rotates its model lineup regularly (demand/hardware dependent). Check the [official list](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/) and live `GET /api/v1/models`.
