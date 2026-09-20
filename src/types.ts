export interface ModelLimit {
  context: number;
  output: number;
}

export interface ModelModalities {
  input: ("text" | "image" | "audio" | "video" | "pdf")[];
  output: ("text" | "image" | "audio" | "video" | "pdf")[];
}

export interface KIConnectModelDefinition {
  name: string;
  attachment?: boolean;
  tool_call?: boolean;
  reasoning?: boolean;
  interleaved?: boolean | string | { field: string };
  limit?: ModelLimit;
  modalities?: ModelModalities;
  variants?: Record<string, unknown>;
}

export interface KIConnectConfigFile {
  apiKey?: string;
  key?: string;
  baseURL?: string;
}
