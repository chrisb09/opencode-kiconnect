import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  KICONNECT_PROVIDER_ID,
  KICONNECT_DEFAULT_NAME,
  KICONNECT_DEFAULT_BASE_URL,
  KICONNECT_DEFAULT_NPM,
  KICONNECT_ENV_VARS,
  MODEL_ALIASES,
} from "./constants";
import { KICONNECT_DEFAULT_MODELS } from "./models";
import type { KIConnectConfigFile } from "./types";

const MAX_RETRY_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);

function getConfigFile(): string {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return join(process.env.OPENCODE_CONFIG_DIR, "kiconnect.json");
  }
  const xdg = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(xdg, "opencode", "kiconnect.json");
}

export function readApiKeyFromConfigFile(): string | undefined {
  try {
    const file = getConfigFile();
    if (existsSync(file)) {
      const content = readFileSync(file, "utf8");
      const parsed = JSON.parse(content) as KIConnectConfigFile;
      return parsed.apiKey || parsed.key;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function saveApiKeyToConfigFile(apiKey: string): void {
  try {
    const file = getConfigFile();
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, JSON.stringify({ apiKey }, null, 2), { mode: 0o600 });
  } catch {
    // ignore
  }
}

export function readApiKeyFromDotenv(): string | undefined {
  try {
    const envPath = join(homedir(), ".env");
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
      const envMap = new Map<string, string>();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (match && match[1] && match[2] !== undefined) {
          const keyName = match[1];
          let val = match[2].trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          envMap.set(keyName, val);
        }
      }

      for (const keyName of KICONNECT_ENV_VARS) {
        const val = envMap.get(keyName);
        if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
          return val;
        }
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function resolveApiKey(authKey?: string, providerApiKey?: string): string {
  if (authKey && authKey.trim()) return authKey.trim();

  for (const envVar of KICONNECT_ENV_VARS) {
    const val = process.env[envVar];
    if (val && val.trim()) return val.trim();
  }

  const fromConfig = readApiKeyFromConfigFile();
  if (fromConfig && fromConfig.trim()) return fromConfig.trim();

  const fromDotenv = readApiKeyFromDotenv();
  if (fromDotenv && fromDotenv.trim()) return fromDotenv.trim();

  if (providerApiKey && providerApiKey.trim()) return providerApiKey.trim();

  return "";
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function rewriteModelInPayload(bodyText: string): string {
  try {
    const payload = JSON.parse(bodyText);
    if (payload && typeof payload.model === "string") {
      const targetModel = payload.model;
      const lower = targetModel.toLowerCase();
      const mapped = MODEL_ALIASES[lower] || MODEL_ALIASES[targetModel];
      if (mapped) {
        payload.model = mapped;
        return JSON.stringify(payload);
      }
    }
  } catch {
    // return unchanged
  }
  return bodyText;
}

async function prepareRequestBody(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ modifiedInit: RequestInit | undefined }> {
  let body: BodyInit | null | undefined = init?.body;

  if (body === undefined && typeof input === "object" && "body" in input && (input as Request).body) {
    try {
      body = await (input as Request).clone().text();
    } catch {
      // ignore
    }
  }

  if (typeof body === "string" && body.trim().startsWith("{")) {
    const rewritten = rewriteModelInPayload(body);
    if (rewritten !== body) {
      const headers = new Headers(
        init?.headers ??
          (typeof input === "object" && "headers" in input ? (input as Request).headers : {})
      );
      headers.set("content-type", "application/json");
      return {
        modifiedInit: {
          ...init,
          headers,
          body: rewritten,
        },
      };
    }
  }

  return { modifiedInit: init };
}

function retryDelay(response: Response | undefined, attempt: number): number {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30_000);

    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.min(Math.max(date - Date.now(), 0), 30_000);
  }

  return Math.min(1_000 * 2 ** attempt + Math.floor(Math.random() * 250), 10_000);
}

function isRetryable(response: Response): boolean {
  return RETRYABLE_STATUS_CODES.has(response.status);
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export const plugin: Plugin = async ({ client }) => {
  return {
    auth: {
      provider: KICONNECT_PROVIDER_ID,
      loader: async (getAuth, provider) => {
        const auth = await getAuth();
        const providerRecord = provider as unknown as Record<string, unknown> | undefined;
        const providerOptions = providerRecord?.options as Record<string, unknown> | undefined;
        const authKey =
          auth && "key" in auth && typeof auth.key === "string" ? auth.key : undefined;
        const providerApiKey = providerOptions?.apiKey as string | undefined;

        const apiKey = resolveApiKey(authKey, providerApiKey);

        const baseURL =
          process.env.KICONNECT_BASE_URL ||
          (providerOptions?.baseURL as string | undefined) ||
          KICONNECT_DEFAULT_BASE_URL;
        const baseOrigin = new URL(baseURL).origin;

        return {
          apiKey,
          async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
            const url = requestUrl(input);
            if (new URL(url).origin !== baseOrigin) {
              return fetch(input, init);
            }

            const { modifiedInit } = await prepareRequestBody(input, init);
            const headers = new Headers(
              modifiedInit?.headers ??
                (typeof input === "object" && "headers" in input ? (input as Request).headers : {})
            );
            if (apiKey && !headers.has("Authorization")) {
              headers.set("Authorization", `Bearer ${apiKey}`);
            }

            const finalInit: RequestInit = {
              ...modifiedInit,
              headers,
            };

            let lastError: unknown;
            for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
              try {
                const response = await fetch(input, finalInit);
                if (!isRetryable(response) || attempt === MAX_RETRY_ATTEMPTS - 1) {
                  return response;
                }

                await sleep(retryDelay(response, attempt));
              } catch (error) {
                lastError = error;
                if (attempt === MAX_RETRY_ATTEMPTS - 1) throw error;

                await sleep(retryDelay(undefined, attempt));
              }
            }

            throw lastError;
          },
        };
      },
      methods: [
        {
          label: "KI:connect API key",
          type: "api",
          prompts: [
            {
              type: "text",
              key: "key",
              message: "KI:connect API key",
              placeholder: "Enter KI:connect API key...",
              validate: (val: string) =>
                val && val.trim().length > 0
                  ? undefined
                  : "Please enter a valid KI:connect API key",
            },
          ],
          authorize: async (inputs?: Record<string, string>) => {
            const key = inputs?.["key"]?.trim() || "";
            if (!key) {
              return { type: "failed" };
            }

            saveApiKeyToConfigFile(key);

            try {
              await client.tui.showToast({
                body: {
                  title: "KI:connect Login",
                  message: "Successfully saved KI:connect API key",
                  variant: "success",
                },
              });
            } catch {
              // TUI might be unavailable in non-interactive sessions
            }

            return {
              type: "success",
              key,
              provider: KICONNECT_PROVIDER_ID,
            };
          },
        },
      ],
    },
    config: async (cfg) => {
      cfg.provider = cfg.provider || {};
      const existing = (cfg.provider[KICONNECT_PROVIDER_ID] || {}) as Record<string, any>;
      const existingOptions = (existing.options || {}) as Record<string, any>;
      const existingModels = (existing.models || {}) as Record<string, any>;

      const resolvedApiKey = resolveApiKey(undefined, existingOptions.apiKey);

      cfg.provider[KICONNECT_PROVIDER_ID] = {
        name: existing.name || KICONNECT_DEFAULT_NAME,
        npm: existing.npm || KICONNECT_DEFAULT_NPM,
        ...existing,
        options: {
          baseURL:
            process.env.KICONNECT_BASE_URL ||
            existingOptions.baseURL ||
            KICONNECT_DEFAULT_BASE_URL,
          ...(resolvedApiKey ? { apiKey: resolvedApiKey } : {}),
          ...existingOptions,
        },
        models: {
          ...KICONNECT_DEFAULT_MODELS,
          ...existingModels,
        },
      };
    },
  };
};

export default plugin;
