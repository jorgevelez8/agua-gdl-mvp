import { cqw } from "./tokens";
import type { FitConfig } from "./fit";

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

function verticalSpec(width: number, height: number): VerticalSpec {
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
      charWidthFactor: 0.62,
      minSize: cqw(5, width),
      maxSize: cqw(15, width),
    },
    headlineAccent: {
      maxWidthPx: headlineMaxWidth,
      charWidthFactor: 0.62,
      minSize: cqw(4.5, width),
      maxSize: cqw(13, width),
    },
    ledeMaxChars: 170,
    // Satori no hace wrap de un párrafo con hijos mixtos (texto + <span> +
    // texto), así que el dato del chip se ajusta a UNA sola línea con fit,
    // no con maxChars + wrap — evita el desborde que eso causaba.
    dato: {
      maxWidthPx: contentWidth * 0.78,
      charWidthFactor: 0.52,
      minSize: cqw(1.7, width),
      maxSize: cqw(2.7, width),
    },
    cta: {
      maxWidthPx: contentWidth * 0.44,
      charWidthFactor: 0.56,
      minSize: cqw(2, width),
      maxSize: cqw(3, width),
    },
  };
}

export const postSpec: VerticalSpec = verticalSpec(1080, 1080);
export const storySpec: VerticalSpec = verticalSpec(1080, 1920);

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
const bannerPadding = cqw(5, BANNER_WIDTH);
const bannerContentWidth = BANNER_WIDTH - bannerPadding * 2;

export const bannerSpec: BannerSpec = {
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
  padding: bannerPadding,
  contentWidth: bannerContentWidth,
  eyebrow: {
    maxWidthPx: bannerContentWidth * 0.6,
    charWidthFactor: 0.62,
    minSize: 14,
    maxSize: 20,
  },
  brand: { nameSize: BANNER_WIDTH * 0.02, noteSize: BANNER_WIDTH * 0.012 },
  // Titular en una sola línea (main + accent inline) a casi todo el ancho —
  // por eso puede ser mucho más grande que en el diseño anterior de 2 columnas.
  headline: {
    maxWidthPx: bannerContentWidth * 0.96,
    charWidthFactor: 0.6,
    minSize: 36,
    maxSize: 84,
  },
  ledeMaxWidthPx: bannerContentWidth * 0.54,
  bottomRowGap: bannerPadding * 0.7,
  dato: {
    maxWidthPx: bannerContentWidth * 0.44,
    charWidthFactor: 0.52,
    minSize: 12,
    maxSize: 16,
  },
  cta: {
    maxWidthPx: bannerContentWidth * 0.26,
    charWidthFactor: 0.56,
    minSize: 15,
    maxSize: 19,
  },
};
