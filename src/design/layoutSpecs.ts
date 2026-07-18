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
  datoMaxChars: number;
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
    datoMaxChars: 130,
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
  headlineMain: FitConfig;
  headlineAccent: FitConfig;
  ledeMaxChars: number;
  datoMaxChars: number;
  cta: FitConfig;
}

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 628;
const bannerPadding = cqw(5, BANNER_WIDTH);
const bannerLeftColWidth = BANNER_WIDTH * 0.56 - bannerPadding * 1.5;

export const bannerSpec: BannerSpec = {
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
  padding: bannerPadding,
  leftColWidth: bannerLeftColWidth,
  headlineMain: {
    maxWidthPx: bannerLeftColWidth,
    charWidthFactor: 0.62,
    minSize: 26,
    maxSize: 64,
  },
  headlineAccent: {
    maxWidthPx: bannerLeftColWidth,
    charWidthFactor: 0.62,
    minSize: 22,
    maxSize: 54,
  },
  ledeMaxChars: 92,
  datoMaxChars: 80,
  cta: {
    maxWidthPx: BANNER_WIDTH * 0.24,
    charWidthFactor: 0.56,
    minSize: 15,
    maxSize: 21,
  },
};
