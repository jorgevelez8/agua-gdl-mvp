export interface FitConfig {
  maxWidthPx: number;
  /** Ancho promedio de un carácter como fracción del font-size, para esta
   * familia/peso de fuente. Es una heurística (Satori no expone medición de
   * texto real), calibrada a ojo en el loop de crítica visual. */
  charWidthFactor: number;
  minSize: number;
  maxSize: number;
}

/** Tamaño de fuente que hace caber `text` en `maxWidthPx` en una sola línea,
 * dentro de [minSize, maxSize]. Reemplaza el shrink-to-fit que Satori no tiene. */
export function fitFontSize(text: string, cfg: FitConfig): number {
  const len = Math.max(text.trim().length, 1);
  const raw = cfg.maxWidthPx / (len * cfg.charWidthFactor);
  return Math.max(cfg.minSize, Math.min(cfg.maxSize, Math.floor(raw)));
}

function maxCharsAtSize(size: number, cfg: Pick<FitConfig, "maxWidthPx" | "charWidthFactor">): number {
  return Math.max(1, Math.floor(cfg.maxWidthPx / (size * cfg.charWidthFactor)));
}

/** Corte duro de seguridad, con elipsis, cortando en el último espacio. */
export function truncate(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  const cut = trimmed.slice(0, maxChars).replace(/\s+\S*$/, "");
  return `${cut || trimmed.slice(0, maxChars)}…`;
}

/** Combina ambas defensas: encoge hasta minSize; si a minSize todavía
 * desborda, trunca el texto para que quepa exactamente ahí. Nunca desborda. */
export function fitAndTruncate(text: string, cfg: FitConfig): { text: string; sizePx: number } {
  const size = fitFontSize(text, cfg);
  if (size > cfg.minSize) return { text: text.trim(), sizePx: size };
  const cap = maxCharsAtSize(cfg.minSize, cfg);
  return { text: truncate(text, cap), sizePx: cfg.minSize };
}
