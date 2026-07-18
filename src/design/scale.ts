/** Convierte un valor en "cqw" (% de un ancho de referencia) a píxeles reales
 * para un render de `widthPx` de ancho. Puramente matemático, no depende del
 * tema — cada tema aporta sus propios factores de ajuste (ver themes/types.ts). */
export function cqw(value: number, widthPx: number): number {
  return (value / 100) * widthPx;
}

/** Versión transparente (alpha 0) de un color hex, para el borde exterior de
 * un radial-gradient — evita que el desvanecido se note como un anillo con
 * otro tono (mismo RGB, solo cambia la opacidad). */
export function hexToRgbaTransparent(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0)`;
}
