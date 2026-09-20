# opencode-kiconnect

OpenCode provider plugin for **KI:connect** (`chat.kiconnect.nrw`) — access to sovereign, self-hosted open-weight LLMs on RWTH Aachen HPC / Inferenz NRW infrastructure, as well as commercial models routed via the KI:connect gateway.

---

## Architecture & Hosting Landscape

Understanding where models run is essential for IP protection, data privacy, and NDA compliance:

```
                      ┌────────────────────────────────────────────────────────┐
                      │              OpenCode Client (Your Machine)            │
                      └──────────────────────────┬─────────────────────────────┘
                                                 │ HTTPS (API Key)
                                                 ▼
                      ┌────────────────────────────────────────────────────────┐
                      │               KI:connect Gateway                       │
                      │            (chat.kiconnect.nrw)                        │
                      │  Operated by RWTH Aachen (CLS & IT Center) for NRW     │
                      └──────────────┬──────────────────────────┬──────────────┘
                                     │                          │
                 (Sovereign / Open-Weight)                      │ (Commercial)
                                     ▼                          ▼
      ┌──────────────────────────────────────────────┐ ┌───────────────────────────────┐
      │     RWTH Aachen HPC Clusters (CLAIX)         │ │     OpenAI Cloud (External)   │
      │  Inferenz NRW (MKW NRW) & WestAI (BMBF)      │ │  Proxied via KI:connect       │
      │  • Processed in GPU RAM in real time only    │ │  • Forwarded outside Germany  │
      │  • No persistent storage, no logging         │ │  • Subject to 3rd-party terms │
      │  • Aachen, Germany                           │ │  • Strict per-user quotas     │
      └──────────────────────────────────────────────┘ └───────────────────────────────┘
```

1. **RWTH Aachen HPC (CLAIX)**: The physical high-performance compute clusters located in Aachen, Germany. Hosts the dedicated GPU nodes serving open-weight models with real-time inference (via vLLM). Prompts and outputs exist in volatile memory (RAM) only — zero persistent disk logging, storage, or training.
2. **Inferenz NRW**: A state-wide initiative funded by the Ministry of Culture and Science of North Rhine-Westphalia (MKW NRW) under the DH.NRW framework, financing sovereign, free AI compute for all universities across NRW.
3. **WestAI**: One of four National AI Service Centers in Germany, funded by the BMBF and operated by a consortium including RWTH Aachen, Fraunhofer IAIS, and TU Dortmund.
4. **KI:connect (`chat.kiconnect.nrw`)**: The central access portal and API gateway developed by RWTH Aachen (Center for Innovative Learning Technologies / CLS and the IT Center). Manages institutional SSO auth (DFN-AAI) and routes requests to either the local HPC clusters or commercial providers.
5. **External Commercial Cloud (OpenAI)**: Proprietary models (`gpt-5.4-mini`, `gpt-5.5`) are not hosted on RWTH hardware. The KI:connect gateway acts as a proxy forwarding these requests to external OpenAI infrastructure.

---

## Supported Models

### Table 1: Model Overview & Data Residency

| Model | Hosting Provider | Location & Data Residency | Status | Released |
| :--- | :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | RWTH HPC (Inferenz NRW / WestAI) | Germany (local cluster, zero storage) | Live | 2026-08-13 |
| `kiconnect/mistral-small-4-119b` | RWTH HPC (Inferenz NRW / WestAI) | Germany (local cluster, zero storage) | Live | 2026-03-16 |
| `kiconnect/gpt-oss-120b` | RWTH HPC (Inferenz NRW / WestAI) | Germany (local cluster, zero storage) | Live | 2025-08-06 |
| `kiconnect/gpt-5.4-mini` | OpenAI Cloud (via KI:connect proxy) | **External** (third-party cloud) | Live (quota-limited) | Commercial |
| `kiconnect/gpt-5.5` | OpenAI Cloud (via KI:connect proxy) | **External** (third-party cloud) | Live (quota-limited) | Commercial |

Official IT Center reference: [RWTH IT Center — LLM Hosting: Available Models](https://help.itc.rwth-aachen.de/service/5a9d03f1675f4f85ac9b3fd7bb853d44/article/eefe9314f19a42bd99d64b4df68780d5/)

### Table 2: Specifications & Live Benchmarks

| Model | Context | Output | Input Modalities | TTFT | Speed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | 256k | 64k | Text, Vision | ~107 ms | ~63 tok/s |
| `kiconnect/mistral-small-4-119b` | 256k | 32k | Text, Vision | ~48 ms | ~146 tok/s |
| `kiconnect/gpt-oss-120b` | 128k | 16k | Text | ~52 ms | ~203 tok/s |
| `kiconnect/gpt-5.4-mini` | 128k | 16k | Text | ~614 ms | ~316 tok/s |
| `kiconnect/gpt-5.5` | 128k | 16k | Text | ~1930 ms | ~85 tok/s |

*Benchmarks measured directly against live KI:connect endpoints with streaming completions.*

---

## Data Residency, NDAs & IP Protection

- **Sovereign / Local (`qwen-3.8-27b`, `mistral-small-4-119b`, `gpt-oss-120b`)**: Data remains strictly within the RWTH HPC data center in Aachen. Under IT Center guidelines, prompts and generated texts are processed in volatile GPU memory and are **never saved, logged, or retained on disk**. Fully compliant with strict non-disclosure agreements (NDAs), trade secrets, patent research, and personal data requirements.
- **Commercial (`gpt-5.4-mini`, `gpt-5.5`)**: Traffic is transmitted across network boundaries to commercial vendor servers (OpenAI). Do not use these models for proprietary, sensitive, or NDA-bound codebase analyses without explicit authorization.

---

## Usage Quotas & Rate Limits

- **Self-Hosted Models**: The IT Center currently maintains a **fair-use policy with no hard token or request caps** on the self-hosted HPC models.
- **Commercial Models**: Both `gpt-5.4-mini` and `gpt-5.5` are constrained by central institutional budgets and enforce **per-user, period-based quotas and rate limits**. When a quota window is exhausted, requests return `429 rate_limit_error (user_quota_exceeded)`. The plugin performs automatic exponential backoff retries; if the quota window has ended, switch to a self-hosted model.

---

## Model Profiles

### `kiconnect/qwen-3.8-27b`
- **Architecture**: Qwen 3.8 27B dense model with vision and reasoning.
- **Context / Output**: 256K context limit on RWTH hosting (native architecture supports 1M), 64K output limit.
- **Characteristics**: Multimodal text + image input. Emits chain-of-thought reasoning tokens; ensure your OpenCode agent has adequate output token budget so reasoning does not deplete the budget before text appears.

### `kiconnect/mistral-small-4-119b`
- **Architecture**: Mistral 119B Mixture-of-Experts (4 active experts per token).
- **Context / Output**: 256K context, 32K output limit.
- **Characteristics**: Very fast time-to-first-token (~48 ms), vision-capable, strong instruction-following for coding and agentic workflows.

### `kiconnect/gpt-oss-120b`
- **Architecture**: OpenAI open-weight 120B model hosted locally on RWTH hardware.
- **Context / Output**: 128K context, 16K output limit.
- **Characteristics**: High throughput (~203 tok/s), strong reasoning and mathematics capabilities with 100% local data residency.

### `kiconnect/gpt-5.4-mini`
- **Architecture**: Commercial lightweight model via OpenAI.
- **Context / Output**: 128K context, 16K output limit.
- **Characteristics**: Fast throughput (~316 tok/s). Subject to commercial quotas and third-party data processing.

### `kiconnect/gpt-5.5`
- **Architecture**: Commercial flagship model via OpenAI.
- **Context / Output**: 128K context, 16K output limit.
- **Characteristics**: Accepts only `temperature: 1` (handled transparently by the plugin). Subject to commercial rate limits and periodic quotas.

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

The plugin resolves your API key automatically in this order:

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
3. **Dedicated Config File** (`~/.config/opencode/kiconnect.json`, mode `0600`):
   ```json
   {
     "apiKey": "your-api-key"
   }
   ```
4. **User Environment File**: Any `KICONNECT_NRW_API_KEY=...` line inside `~/.env`.

To create an API key: Log in to [chat.kiconnect.nrw](https://chat.kiconnect.nrw) via your university SSO &rarr; click your username (bottom left) &rarr; **API Keys Management** &rarr; **Generate Key**.

---

## Troubleshooting

- **"The model 'X' does not exist."**: Rebuild the plugin with `bun run build` and restart your OpenCode session so the latest catalog and upstream ID mappings are loaded.
- **"The selected model does not support this operation."**: KI:connect serves models exclusively via standard `/v1/chat/completions`. The plugin uses `@ai-sdk/openai-compatible` to route cleanly through chat completions.
- **"You exceeded your current quota for this period." (`429`)**: Periodic quota reached on commercial models (`gpt-5.4-mini`, `gpt-5.5`). Switch to a self-hosted model (`qwen-3.8-27b`, `mistral-small-4-119b`, `gpt-oss-120b`) which has no hard quota.
- **Empty reasoning responses**: If a reasoning model emits no visible text, increase the agent's output token allowance.
