import type { KIConnectModelDefinition } from "./types";

/**
 * Curated catalog of models self-hosted on RWTH Aachen HPC / KI:connect infrastructure.
 * Context lengths and capabilities verified against IT Center documentation and live API inspection.
 */
export const KICONNECT_DEFAULT_MODELS: Record<string, KIConnectModelDefinition> = {
  // --- Qwen 3.8 27B ---
  "Qwen 3.8 27B": {
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
  // Kebab-case alias for convenience
  "qwen-3.8-27b": {
    name: "Qwen 3.8 27B (KI:connect)",
    attachment: true,
    tool_call: true,
    reasoning: true,
    interleaved: "reasoning",
    limit: {
      context: 262_144,
      output: 65_536,
    },
    modalities: {
      input: ["text", "image"],
      output: ["text"],
    },
  },

  // --- Mistral Small 4 119B ---
  "mistralai-mistral-small-4-119b": {
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
  "mistral-small-4-119b": {
    name: "Mistral Small 4 119B (KI:connect)",
    attachment: true,
    tool_call: true,
    limit: {
      context: 262_144,
      output: 32_768,
    },
    modalities: {
      input: ["text", "image"],
      output: ["text"],
    },
  },

  // --- GPT OSS 120B ---
  "gpt-oss-120b": {
    name: "GPT OSS 120B (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 131_072, // 128K context
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },

  // --- GPT 5.4 Mini & 5.5 ---
  "gpt-5.4-mini": {
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
  "gpt-5.5": {
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

  // --- Devstral Small 2 24B (Specialized for agentic coding) ---
  "Devstral-Small-2-24B-Instruct-2512": {
    name: "Devstral Small 2 24B (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 393_216, // 384K context
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },

  // --- Mistral Small 3.2 24B ---
  "Mistral-Small-3.2-24B": {
    name: "Mistral Small 3.2 24B (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 131_072, // 128K context
      output: 16_384,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },

  // --- Apertus 70B ---
  "Apertus-70B": {
    name: "Apertus 70B (KI:connect)",
    attachment: false,
    tool_call: true,
    limit: {
      context: 65_536, // 64K context
      output: 8_192,
    },
    modalities: {
      input: ["text"],
      output: ["text"],
    },
  },
};
