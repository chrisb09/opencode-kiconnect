# opencode-kiconnect

KI:connect (RWTH Aachen University & Inferenz NRW) integration plugin for OpenCode.

Provides unified, zero-friction access to self-hosted open-weight LLMs hosted on RWTH's HPC infrastructure with:
- Pre-configured models (Qwen 3.8 27B with 256K context, Mistral Small 4 119B, Devstral Small 2 24B, GPT OSS 120B, etc.)
- Transparent model alias rewriting (e.g. `qwen-3.8-27b` -> `Qwen 3.8 27B`)
- High-resilience fetch wrapper with jittered exponential backoff for cluster congestion (429, 502, 504, etc.)
- Multi-source API key resolution:
  1. OpenCode interactive auth (`opencode auth login` -> KI:connect API key)
  2. Environment variables (`$KICONNECT_NRW_API_KEY` or `$KICONNECT_API_KEY`)
  3. `~/.config/opencode/kiconnect.json`
  4. Local `~/.env` file
  5. `provider.kiconnect.options.apiKey` in `opencode.jsonc`

## Installation

Add this plugin to your `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "plugin": [
    "/home/ro092286/git/opencode-kiconnect"
  ]
}
```

## Available Models

- `kiconnect/Qwen 3.8 27B` (or alias `kiconnect/qwen-3.8-27b`): 256K context, text + vision + reasoning + tools
- `kiconnect/mistralai-mistral-small-4-119b` (or alias `kiconnect/mistral-small-4-119b`): 256K context, 119B MoE
- `kiconnect/Devstral-Small-2-24B-Instruct-2512`: 384K context, specialized for agentic workflows & coding
- `kiconnect/gpt-oss-120b`: 128K context
