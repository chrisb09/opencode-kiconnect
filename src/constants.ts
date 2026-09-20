export const KICONNECT_PROVIDER_ID = "kiconnect";
export const KICONNECT_DEFAULT_NAME = "KI:connect (RWTH/NRW)";
export const KICONNECT_DEFAULT_BASE_URL = "https://chat.kiconnect.nrw/api/v1";
export const KICONNECT_DEFAULT_NPM = "@ai-sdk/openai";

/**
 * Known environment variable names to inspect for KI:connect API keys.
 */
export const KICONNECT_ENV_VARS = [
  "KICONNECT_NRW_API_KEY",
  "KICONNECT_API_KEY",
  "KICONNECT_TOKEN",
] as const;

/**
 * User-friendly aliases mapped to the exact model IDs expected by KI:connect backend.
 */
export const MODEL_ALIASES: Record<string, string> = {
  // Qwen
  "qwen-3.8-27b": "Qwen 3.8 27B",
  "qwen3.8-27b": "Qwen 3.8 27B",
  "qwen3-8-27b": "Qwen 3.8 27B",
  "qwen-27b": "Qwen 3.8 27B",
  "qwen 3.8 27b": "Qwen 3.8 27B",

  // Mistral Small 4
  "mistral-small-4-119b": "mistralai-mistral-small-4-119b",
  "mistral-small-4": "mistralai-mistral-small-4-119b",
  "mistral-119b": "mistralai-mistral-small-4-119b",
  "mistralai-mistral-small-4-119b": "mistralai-mistral-small-4-119b",

  // GPT OSS
  "gpt-oss": "gpt-oss-120b",
  "gpt-oss-120b": "gpt-oss-120b",

  // Devstral
  "devstral-small-2-24b": "Devstral-Small-2-24B-Instruct-2512",
  "devstral-24b": "Devstral-Small-2-24B-Instruct-2512",
  "devstral": "Devstral-Small-2-24B-Instruct-2512",

  // Mistral Small 3.2
  "mistral-small-3.2-24b": "Mistral-Small-3.2-24B",
  "mistral-3.2-24b": "Mistral-Small-3.2-24B",

  // Apertus
  "apertus-70b": "Apertus-70B",
  "apertus": "Apertus-70B",
};
