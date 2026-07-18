import type { ThemeDefinition } from "./types";

/** Corriente — el tema actual. Teal/cyan profundo, ondas concéntricas como
 * firma visual, Anton (titulares) + Barlow (cuerpo). Default del sistema. */
export const corriente: ThemeDefinition = {
  id: "corriente",
  label: "Corriente",
  description: "Teal/cyan profundo, ondas concéntricas como firma, Anton + Barlow.",
  colors: {
    bgTop: "#0e4a5c",
    bgMid: "#08344a",
    bgDeep: "#05202f",
    glow: "#12718a",
    accent: "#34e0d0",
    accentEyebrowText: "#7ff3e6",
    accentSoftBg: "rgba(52,224,208,0.14)",
    accentBorder: "rgba(52,224,208,0.55)",
    chipIconBg: "rgba(52,224,208,0.18)",
    chipBg: "rgba(255,255,255,0.07)",
    ctaBg: "#34e0d0",
    ctaText: "#05202f",
    brandMarkBg: "rgba(255,255,255,0.12)",
    textPrimary: "#eafcff",
    textSecondary: "#cdeef4",
    textMuted: "rgba(234,252,255,0.5)",
  },
  background: { mode: "gradient", angle: 168, glow: true },
  fonts: {
    display: {
      family: "Anton",
      files: [{ weight: 400, style: "normal", file: "Anton-Regular.ttf" }],
      primaryWeight: 400,
    },
    body: {
      family: "Barlow",
      files: [
        { weight: 400, style: "normal", file: "Barlow-Regular.ttf" },
        { weight: 500, style: "normal", file: "Barlow-Medium.ttf" },
        { weight: 600, style: "normal", file: "Barlow-SemiBold.ttf" },
        { weight: 600, style: "italic", file: "Barlow-SemiBoldItalic.ttf" },
      ],
      primaryWeight: 400,
    },
  },
  type: {
    headline: { charWidthFactor: 0.62, lineHeight: 0.92, accentGapFactor: 0.55 },
    eyebrow: { charWidthFactor: 0.62 },
    cta: { charWidthFactor: 0.56 },
    dato: { charWidthFactor: 0.52 },
  },
  radii: { pill: 999, chipCorner: 0.7, brandMark: 0.45 },
  motif: "waves",
  // Overlay oscuro directo (plano, no degradado) — Corriente ya es un tema
  // oscuro, así que un scrim plano en su propio bgDeep alcanza para
  // legibilidad sin desentonar con la paleta. Otros temas necesitan su
  // propio tratamiento (Papel en particular: fondo claro, mismo problema
  // al revés) — se agregan cuando se implementa cada uno.
  photoOverlay: { mode: "flat", flatColor: "rgba(5,32,47,0.78)" },
};
