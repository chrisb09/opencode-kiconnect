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

### Table 1: Model Overview & Data Residency

| Model | Data Residency | Status | Released |
| :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | Germany (RWTH HPC) | Live | 2026-08-13 |
| `kiconnect/mistral-small-4-119b` | Germany (RWTH HPC) | Live | 2026-03-16 |
| `kiconnect/gpt-oss-120b` | Germany (RWTH HPC) | Live | 2025-08-06 |
| `kiconnect/gpt-5.4-mini` | **External (OpenAI)** | Live | Commercial |
| `kiconnect/gpt-5.5` | **External (OpenAI)** | Live (quota-limited) | Commercial |
| `kiconnect/devstral-small-2-24b` | Germany (RWTH HPC) | Offline* | 2025-12-09 |
| `kiconnect/mistral-small-3.2-24b` | Germany (RWTH HPC) | Offline* | 2025-06-25 |
| `kiconnect/apertus-70b` | Germany (RWTH HPC) | Offline* | 2025-09-02 |

\* Listed in the [official IT Center catalog](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/) but currently returning `404 model_not_found` on the gateway (as of 2026-09-20). Models are rotated periodically.

### Table 2: Specifications & Live Benchmarks

| Model | Context | Output | Input Modalities | TTFT | Speed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | 256k | 64k | Text, Vision | ~107 ms | ~63 tok/s |
| `kiconnect/mistral-small-4-119b` | 256k | 32k | Text, Vision | ~48 ms | ~146 tok/s |
| `kiconnect/gpt-oss-120b` | 128k | 16k | Text | ~52 ms | ~203 tok/s |
| `kiconnect/gpt-5.4-mini` | 128k | 16k | Text | ~614 ms | ~316 tok/s |
| `kiconnect/gpt-5.5` | 128k | 16k | Text | ~1930 ms | ~85 tok/s |
| `kiconnect/devstral-small-2-24b` | 384k | 16k | Text | — | — |
| `kiconnect/mistral-small-3.2-24b` | 128k | 16k | Text | — | — |
| `kiconnect/apertus-70b` | 64k | 8k | Text | — | — |

*Benchmarks measured against live KI:connect endpoints with streaming completions.*

---

## Data Residency & IP Protection

- **Self-hosted (Germany / RWTH HPC)**: Open-weight models run on local HPC clusters via Inferenz NRW / WestAI. Prompts and outputs are **processed in real-time RAM only** — data is never logged, saved, or used for model training (per IT Center policy). Suitable for proprietary code, research data, and strict NDAs.
- **External (OpenAI Cloud)**: Commercial models (`gpt-5.4-mini`, `gpt-5.5`) are proxied through the gateway to OpenAI infrastructure outside Germany. Treat as external data processing subject to third-party terms.

**Recommendation for IP-sensitive workflows:** Use `kiconnect/qwen-3.8-27b`, `kiconnect/mistral-small-4-119b`, or `kiconnect/gpt-oss-120b`.

Source: [RWTH IT Center — LLM Hosting: Available Models](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/)

---

## Usage Quotas & Rate Limits

- **Self-hosted models**: IT Center currently imposes **no token or request quotas** (fair-use policy; limits may be added during cluster congestion).
- **Commercial models (`gpt-5.5`)**: Enforces personal, period-based quotas. When reached, the gateway returns `429 rate_limit_error (user_quota_exceeded)`. The plugin automatically attempts 3 retries with jittered backoff; if the quota remains exhausted, switch to a self-hosted alternative.

---

## Model Profiles

### `kiconnect/qwen-3.8-27b`
- **Architecture**: Qwen 3.8 27B with vision and reasoning.
- **Context / Output**: 256K context limit on RWTH hosting (native architecture supports 1M), 64K output.
- **Characteristics**: Supports multimodal image inputs and reasoning tokens. Ensure sufficient output budget in OpenCode agents so reasoning chains do not exhaust token allocations before visible text starts.

### `kiconnect/mistral-small-4-119b`
- **Architecture**: Mistral 119B Mixture-of-Experts (4 active experts).
- **Context / Output**: 256K context, 32K output.
- **Characteristics**: Fast time-to-first-token (~48 ms), vision-capable, strong instruction-following for coding and agentic workflows.

### `kiconnect/gpt-oss-120b`
- **Architecture**: OpenAI open-weight 120B model hosted locally on RWTH hardware.
- **Context / Output**: 128K context, 16K output.
- **Characteristics**: High throughput (~203 tok/s), strong reasoning and math performance without third-party data egress.

### `kiconnect/gpt-5.4-mini`
- **Architecture**: Commercial OpenAI lightweight model.
- **Context / Output**: 128K context, 16K output.
- **Characteristics**: Fast streaming (~316 tok/s), suitable for lightweight tasks where external routing is permissible.

### `kiconnect/gpt-5.5`
- **Architecture**: Commercial OpenAI flagship model.
- **Context / Output**: 128K context, 16K output.
- **Characteristics**: Only accepts `temperature: 1` (normalized automatically by plugin). Subject to periodic user quotas.

### `kiconnect/devstral-small-2-24b`
- **Architecture**: 24B parameter model fine-tuned for software development and agentic tool use.
- **Context / Output**: 384K context, 16K output. Currently offline on the gateway.

### `kiconnect/mistral-small-3.2-24b`
- **Architecture**: Compact 24B low-latency model.
- **Context / Output**: 128K context, 16K output. Currently offline on the gateway.

### `kiconnect/apertus-70b`
- **Architecture**: Swiss-AI open multilingual model (quantized W4A16).
- **Context / Output**: 64K context, 8K output. Currently offline on the gateway.

---

## Setup Guide

### 1. Build the Plugin

```bash
bun install
bun run build
```

### 2. Register the Plugin in OpenCode

Add the plugin path to your `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "plugin": [
    "/rwthfs/rz/cluster/home/ro092286/git/opencode-kiconnect"
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
3. **Dedicated Config File** (`~/.config/opencode/kiconnect.json`, permissions `0600`):
   ```json
   {
     "apiKey": "your-api-key"
   }
   ```
4. **User Environment File**: any `KICONNECT_NRW_API_KEY=...` line inside `~/.env`.

To generate a key: Log in to [chat.kiconnect.nrw](https://chat.kiconnect.nrw) via institutional SSO &rarr; click your username &rarr; **API Keys Management** &rarr; **Generate Key**.

---

## Troubleshooting

- **"The model 'X' does not exist."**: Plugin build is outdated or OpenCode has not reloaded. Run `bun run build` and restart your OpenCode session.
- **"The selected model does not support this operation."**: KI:connect serves certain models only through `/v1/chat/completions`. The plugin uses `@ai-sdk/openai-compatible` to route cleanly through chat completions.
- **"You exceeded your current quota for this period." (`429`)**: Personal quota limit reached on commercial models (`gpt-5.5`). Switch to a self-hosted model (`qwen-3.8-27b`, `mistral-small-4-119b`, `gpt-oss-120b`).
- **Empty reasoning responses**: Small token allowances were exhausted during reasoning before visible output began. Increase the agent's max output token budget.
