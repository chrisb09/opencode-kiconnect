# opencode-kiconnect

OpenCode provider plugin for **KI:connect**, connecting OpenCode to self-hosted open-weight LLMs hosted on RWTH Aachen University and NRW university infrastructure.

---

## Features

- **OpenAI-Compatible Chat Completions & Responses Support**: Routes OpenCode traffic cleanly through KI:connect's gateway.
- **Deduplicated Model Catalog**: Unique, curated identifiers in OpenCode's picker so models appear exactly once.
- **Model Alias Rewriting**: Automatically maps clean kebab-case IDs (e.g. `qwen-3.8-27b`) to upstream gateway names (e.g. `Qwen 3.8 27B`).
- **Responses API Normalization**: Injects required `status: "completed"` on conversational assistant messages to satisfy ASP.NET backend validation.
- **Parameter Adjustments**: Automatically normalizes legacy `max_tokens` to `max_completion_tokens` on newer models and drops invalid temperature values.
- **Cluster Resilience**: Automatic jittered exponential backoff retries for transient load spikes (`429`, `502`, `503`, `504`).
- **Flexible Auth Resolution**: Works with OpenCode auth login, environment variables, config files, or user `.env`.

---

## Supported Models

| OpenCode Model ID | Display Name | Context Window | Output Limit | Modalities | Capabilities | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `kiconnect/qwen-3.8-27b` | Qwen 3.8 27B (KI:connect) | 256k | 64k | Text, Vision | Tools, Reasoning | Supports Chat & Responses API |
| `kiconnect/mistral-small-4-119b` | Mistral Small 4 119B (KI:connect) | 256k | 32k | Text, Vision | Tools | 119B MoE; requires Chat Completions |
| `kiconnect/gpt-oss-120b` | GPT OSS 120B (KI:connect) | 128k | 16k | Text | Tools, Reasoning | High-throughput open OSS model |
| `kiconnect/gpt-5.4-mini` | GPT 5.4 Mini (KI:connect) | 128k | 16k | Text | Tools | Fast lightweight assistant |
| `kiconnect/gpt-5.5` | GPT 5.5 (KI:connect) | 128k | 16k | Text | Tools | Fixed temperature requirement handled automatically |
| `kiconnect/devstral-small-2-24b` | Devstral Small 2 24B (KI:connect) | 384k | 16k | Text | Tools | Optimized for software development & agentic workflows |
| `kiconnect/mistral-small-3.2-24b` | Mistral Small 3.2 24B (KI:connect) | 128k | 16k | Text | Tools | Balanced daily coding model |
| `kiconnect/apertus-70b` | Apertus 70B (KI:connect) | 64k | 8k | Text | Tools | Open multilingual weights |

---

## Setup Guide

### 1. Build the Plugin

Run the build step inside this directory:

```bash
bun install
bun run build
```

### 2. Register the Plugin in OpenCode

Add the plugin path to your OpenCode configuration (e.g. `~/.config/opencode/opencode.jsonc`):

```jsonc
{
  "plugin": [
    "/rwthfs/rz/cluster/home/ro092286/git/opencode-kiconnect"
  ]
}
```

### 3. Configure Your API Key

The plugin searches for your API key in the following priority order:

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
3. **Dedicated Config File**:
   Store the key with safe permissions in `~/.config/opencode/kiconnect.json`:
   ```json
   {
     "apiKey": "your-api-key"
   }
   ```
   ```bash
   chmod 600 ~/.config/opencode/kiconnect.json
   ```
4. **Home Directory `.env`**:
   Any `KICONNECT_NRW_API_KEY=...` line inside `~/.env`.

---

## Troubleshooting & Important Notes

- **"The selected model does not support this operation"**:
  Certain upstream models on KI:connect (such as Mistral and GPT OSS) only support `/v1/chat/completions`, not the `/v1/responses` API. The plugin defaults to `@ai-sdk/openai-compatible` to ensure calls route through chat completions.
- **Empty or missing answers on reasoning models**:
  Reasoning models like Qwen 3.8 and GPT OSS emit internal reasoning tokens before generating their visible response. Ensure your agent or prompt allows sufficient output token budget (at least 256–512 tokens) so reasoning does not consume the entire output quota before text starts.
- **Model duplicates in picker**:
  Earlier builds registered both raw gateway names and kebab aliases. Rebuilding the latest version guarantees every model appears exactly once under its canonical ID.
