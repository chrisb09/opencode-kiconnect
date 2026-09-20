import type { KIConnectModelDefinition } from "./types";

/**
 * Curated catalog of active models accessible via KI:connect (chat.kiconnect.nrw).
 * Each model is uniquely keyed to appear exactly once in the OpenCode model picker,
 * with `id` mapped to the exact upstream model identifier expected by the gateway.
 */
export const KICONNECT_DEFAULT_MODELS: Record<string, KIConnectModelDefinition> = {
  // --- Qwen 3.8 27B ---
  "qwen-3.8-27b": {
    id: "Qwen 3.8 27B",
    name: "Qwen 3.8 27B (KI:connect)",
    attachment: true,
    tool_call: true,
    reasoning: true,
    interleaved: "reasoning",
    limit: {
      context: 262_144, // 256K context limit on RWTH hosting
      output: 65_536,
    },
    modalities: {
      input: ["text", "image"],
      output: ["text"],
    },
  },

  // --- Mistral Small 4 119B ---
  "mistral-small-4-119b": {
    id: "mistralai-mistral-small-4-119b",
    name: "Mistral Small 4 119B (KI:connect)",
    attachment: true,
    tool_call: true,
    limit: {
      context: 262_144, // 256K context
      output: 32_768,
    },
    modalities: {
      input: ["text", "image"],
      output: ["text"],
    },
  },

  // --- GPT OSS 120B ---
  "gpt-oss-120b": {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B (KI:connect)",
    attachment: false,
    tool_call: true,
    reasoning: true,
    interleaved: "reasoning",
    limit: {
      context: 131_072, // 128K context
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },

  // --- GPT 5.4 Mini (Commercial via OpenAI) ---
  "gpt-5.4-mini": {
    id: "gpt-5.4-mini",
    name: "GPT 5.4 Mini (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 131_072,
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },

  // --- GPT 5.5 (Commercial via OpenAI) ---
  "gpt-5.5": {
    id: "gpt-5.5",
    name: "GPT 5.5 (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 131_072,
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },
};
