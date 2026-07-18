import { cqw } from "./scale";
import type { FitConfig } from "./fit";
import type { ThemeDefinition } from "./themes/types";

export interface VerticalSpec {
  width: number;
  height: number;
  padding: number;
  contentWidth: number;
  headlineMain: FitConfig;
  headlineAccent: FitConfig;
  ledeMaxChars: number;
  dato: FitConfig;
  cta: FitConfig;
}

export function buildVerticalSpec(theme: ThemeDefinition, width: number, height: number): VerticalSpec {
  const padding = cqw(7, width);
  const contentWidth = width - padding * 2;
  const headlineMaxWidth = contentWidth * 0.94;
  return {
    width,
    height,
    padding,
    contentWidth,
    headlineMain: {
      maxWidthPx: headlineMaxWidth,
      charWidthFactor: theme.type.headline.charWidthFactor,
      minSize: cqw(5, width),
      maxSize: cqw(15, width),
    },
    headlineAccent: {
      maxWidthPx: headlineMaxWidth,
      charWidthFactor: theme.type.headline.charWidthFactor,
      minSize: cqw(4.5, width),
      maxSize: cqw(13, width),
    },
    ledeMaxChars: 170,
    // Satori no hace wrap de un párrafo con hijos mixtos (texto + <span> +
    // texto), así que el dato del chip se ajusta a UNA sola línea con fit,
    // no con maxChars + wrap — evita el desborde que eso causaba.
    dato: {
      maxWidthPx: contentWidth * 0.78,
      charWidthFactor: theme.type.dato.charWidthFactor,
      minSize: cqw(1.7, width),
      maxSize: cqw(2.7, width),
    },
    cta: {
      maxWidthPx: contentWidth * 0.44,
      charWidthFactor: theme.type.cta.charWidthFactor,
      minSize: cqw(2, width),
      maxSize: cqw(3, width),
    },
  };
}

// 1200×628 es ancho y bajo — partirlo en 2 columnas verticales (como un post
// estirado) fuerza el titular a achicarse y deja aire mal repartido en el
// medio. Composición propia: fila superior (eyebrow + marca), titular en
// UNA sola línea a casi todo el ancho, fila inferior (bajada a la izquierda,
// chip+CTA compactos a la derecha) — usa el ancho, no lo divide.
export interface BannerSpec {
  width: number;
  height: number;
  padding: number;
  contentWidth: number;
  eyebrow: FitConfig;
  brand: { nameSize: number; noteSize: number };
  headline: FitConfig;
  ledeMaxWidthPx: number;
  bottomRowGap: number;
  dato: FitConfig;
  cta: FitConfig;
}

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 628;

export function buildBannerSpec(theme: ThemeDefinition): BannerSpec {
  const padding = cqw(5, BANNER_WIDTH);
  const contentWidth = BANNER_WIDTH - padding * 2;
  return {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    padding,
    contentWidth,
    eyebrow: {
      maxWidthPx: contentWidth * 0.6,
      charWidthFactor: theme.type.eyebrow.charWidthFactor,
      minSize: 14,
      maxSize: 20,
    },
    brand: { nameSize: BANNER_WIDTH * 0.02, noteSize: BANNER_WIDTH * 0.012 },
    // Titular en una sola línea (main + accent inline) a casi todo el ancho —
    // por eso puede ser mucho más grande que en un diseño de 2 columnas.
    headline: {
      maxWidthPx: contentWidth * 0.96,
      charWidthFactor: theme.type.headline.charWidthFactor,
      minSize: 36,
      maxSize: 84,
    },
    ledeMaxWidthPx: contentWidth * 0.54,
    bottomRowGap: padding * 0.7,
    dato: {
      maxWidthPx: contentWidth * 0.44,
      charWidthFactor: theme.type.dato.charWidthFactor,
      minSize: 12,
      maxSize: 16,
    },
    cta: {
      maxWidthPx: contentWidth * 0.26,
      charWidthFactor: theme.type.cta.charWidthFactor,
      minSize: 15,
      maxSize: 19,
    },
  };
}
