import brand from "./brand.json";

export const campaign = brand.campaign;
export const colors = brand.colors;
export const icons = brand.icons;
export const type = brand.type;
export const motif = brand.motif;
export const radii = brand.radii;

/** Convierte un valor en "cqw" (definido en brand.json, % del ancho de referencia
 * del sistema visual) a píxeles reales para un render de `widthPx` de ancho. */
export function cqw(value: number, widthPx: number): number {
  return (value / 100) * widthPx;
}
