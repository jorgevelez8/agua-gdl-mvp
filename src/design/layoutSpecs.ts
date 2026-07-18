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

export interface BannerSpec {
  width: number;
  height: number;
  padding: number;
  leftColWidth: number;
  rightColWidth: number;
  eyebrow: FitConfig;
  headlineMain: FitConfig;
  headlineAccent: FitConfig;
  ledeMaxChars: number;
  dato: FitConfig;
  cta: FitConfig;
}

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 628;
const bannerPadding = cqw(5, BANNER_WIDTH);
const bannerGap = bannerPadding;
const bannerLeftColWidth = BANNER_WIDTH * 0.52 - bannerPadding * 1.5;
const bannerRightColWidth = BANNER_WIDTH - bannerPadding * 2 - bannerGap - bannerLeftColWidth;

export const bannerSpec: BannerSpec = {
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
  padding: bannerPadding,
  leftColWidth: bannerLeftColWidth,
  rightColWidth: bannerRightColWidth,
  eyebrow: {
    // el eyebrow es texto de marca fijo y largo — se achica para no envolver
    // a 2 líneas dentro de la píldora, en vez de dejarlo desbordar.
    maxWidthPx: bannerLeftColWidth - 24,
    charWidthFactor: 0.62,
    minSize: 13,
    maxSize: 20,
  },
  headlineMain: {
    maxWidthPx: bannerLeftColWidth,
    charWidthFactor: 0.62,
    minSize: 26,
    maxSize: 60,
  },
  headlineAccent: {
    maxWidthPx: bannerLeftColWidth,
    charWidthFactor: 0.62,
    minSize: 22,
    maxSize: 50,
  },
  ledeMaxChars: 92,
  dato: {
    maxWidthPx: bannerRightColWidth * 0.74,
    charWidthFactor: 0.52,
    minSize: 12,
    maxSize: 17,
  },
  cta: {
    maxWidthPx: bannerRightColWidth * 0.92,
    charWidthFactor: 0.56,
    minSize: 15,
    maxSize: 20,
  },
};
