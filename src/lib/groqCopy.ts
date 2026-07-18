import Groq from "groq-sdk";

export const MODELO_COPY = process.env.COPY_MODEL?.trim() || "openai/gpt-oss-120b";
export const TIMEOUT_IA_MS = 20_000;

export interface PiezaCopy {
  headlineMain: string;
  headlineAccent: string;
  lede: string;
  dato: string | null;
  datoResaltado: string | null;
  cta: string;
}

export interface RespuestaCampana {
  keyword: string;
  linkDetectado: string | null;
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

export interface RespuestaRefinamiento {
  propuesta: string;
}

const ESQUEMA_PIEZA = {
  type: "object",
  additionalProperties: false,
  properties: {
    headlineMain: { type: "string" },
    headlineAccent: { type: "string" },
    lede: { type: "string" },
    dato: { type: ["string", "null"] },
    datoResaltado: { type: ["string", "null"] },
    cta: { type: "string" },
  },
  required: ["headlineMain", "headlineAccent", "lede", "dato", "datoResaltado", "cta"],
} as const;

export const FORMATO_RESPUESTA_CAMPANA = {
  type: "json_schema",
  json_schema: {
    name: "respuesta_campana",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        keyword: { type: "string" },
        linkDetectado: { type: ["string", "null"] },
        post: ESQUEMA_PIEZA,
        story: ESQUEMA_PIEZA,
        banner: ESQUEMA_PIEZA,
      },
      required: ["keyword", "linkDetectado", "post", "story", "banner"],
    },
  },
} as const satisfies Groq.Chat.CompletionCreateParams.ResponseFormatJsonSchema;

export const FORMATO_RESPUESTA_REFINAMIENTO = {
  type: "json_schema",
  json_schema: {
    name: "respuesta_refinamiento",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        propuesta: { type: "string" },
      },
      required: ["propuesta"],
    },
  },
} as const satisfies Groq.Chat.CompletionCreateParams.ResponseFormatJsonSchema;

export function crearClienteGroq(apiKey: string) {
  return new Groq({
    apiKey,
    maxRetries: 0,
    timeout: TIMEOUT_IA_MS,
  });
}

export function parsearRespuestaJson<T>(contenido: string | null | undefined): T {
  if (!contenido) {
    throw new Error("La respuesta de Groq no incluyó contenido.");
  }

  return JSON.parse(contenido) as T;
}
