import type { ThemeDefinition } from "./types";

/** Papel — claro editorial. Fondo hueso, mucho aire, tipografía geométrica
 * (Space Grotesk) y un solo color de acento fuerte. Sin degradados, sin
 * motivo decorativo — el restraint es la firma visual. */
export const papel: ThemeDefinition = {
  id: "papel",
  label: "Papel",
  description: "Claro editorial, hueso/blanco, tipografía geométrica limpia.",
  colors: {
    bgTop: "#f6f2e9",
    bgMid: "#f6f2e9",
    bgDeep: "#f6f2e9",
    glow: "#f6f2e9",
    accent: "#c1272d",
    accentEyebrowText: "#c1272d",
    accentSoftBg: "rgba(193,39,45,0.08)",
    accentBorder: "rgba(193,39,45,0.35)",
    chipIconBg: "rgba(193,39,45,0.12)",
    chipBg: "rgba(20,18,15,0.045)",
    ctaBg: "#c1272d",
    ctaText: "#fbf8f3",
    brandMarkBg: "rgba(20,18,15,0.06)",
    textPrimary: "#1a1815",
    textSecondary: "#4a463f",
    textMuted: "rgba(26,24,21,0.45)",
  },
  background: { mode: "flat", glow: false },
  fonts: {
    display: {
      family: "Space Grotesk",
      files: [{ weight: 700, style: "normal", file: "SpaceGrotesk-Bold.ttf" }],
      primaryWeight: 700,
    },
    body: {
      family: "Space Grotesk",
      files: [
        { weight: 400, style: "normal", file: "SpaceGrotesk-Regular.ttf" },
        { weight: 500, style: "normal", file: "SpaceGrotesk-Medium.ttf" },
        { weight: 600, style: "normal", file: "SpaceGrotesk-SemiBold.ttf" },
      ],
      primaryWeight: 400,
    },
  },
  type: {
    // Space Grotesk Bold es menos condensada que Anton — arranca de un
    // factor más ancho; se recalibra con el loop de render+inspección.
    headline: { charWidthFactor: 0.58, lineHeight: 1.05, accentGapFactor: 0.2 },
    eyebrow: { charWidthFactor: 0.6 },
    cta: { charWidthFactor: 0.58 },
    dato: { charWidthFactor: 0.54 },
  },
  radii: { pill: 999, chipCorner: 0.7, brandMark: 0.45 },
  motif: "none",
  // Caso especial: Papel es el único tema con texto OSCURO sobre fondo
  // CLARO — todos los demás invierten esto (texto claro, overlay oscurea
  // la foto). Acá el overlay tiene que ACLARAR la foto, no oscurecerla, y
  // con más densidad que un scrim oscuro típico: un textPrimary casi negro
  // se pierde fácil contra cualquier región oscura de una foto real, así
  // que hace falta empujarla fuerte hacia el crema del fondo (bgTop) para
  // sostener el mismo contraste en toda la pieza. Se calibra en la
  // verificación de PNG con foto oscura Y foto clara antes de dar por
  // bueno el valor.
  photoOverlay: { mode: "flat", flatColor: "rgba(246,242,233,0.85)" },
};
