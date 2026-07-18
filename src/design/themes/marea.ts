import type { ThemeDefinition } from "./types";

/** Marea — cálido/orgánico. Degradado agua-atardecer (azul profundo → rosa
 * ciruela → terracota), Nunito (humanista redondeada), formas curvas
 * fluidas. Riesgo específico: un degradado cálido puede volverse claro en
 * algún punto y matar el contraste — por eso los 3 stops se mantienen en
 * un rango oscuro/profundo parejo (nunca pastel), para que un solo color
 * de texto funcione en toda la extensión del degradado. */
export const marea: ThemeDefinition = {
  id: "marea",
  label: "Marea",
  description: "Cálido/orgánico, degradado agua-atardecer, formas curvas.",
  colors: {
    bgTop: "#0f3d52",
    bgMid: "#5c3a4a",
    bgDeep: "#7a4530",
    glow: "#ffb066",
    accent: "#FFD166",
    accentEyebrowText: "#FFD166",
    accentSoftBg: "rgba(255,209,102,0.16)",
    accentBorder: "rgba(255,209,102,0.5)",
    chipIconBg: "rgba(255,209,102,0.2)",
    chipBg: "rgba(255,255,255,0.08)",
    ctaBg: "#FFD166",
    ctaText: "#3a2412",
    brandMarkBg: "rgba(255,255,255,0.14)",
    textPrimary: "#fdf6ee",
    textSecondary: "#f0ded1",
    textMuted: "rgba(253,246,238,0.55)",
  },
  background: { mode: "gradient", angle: 150, glow: true },
  fonts: {
    display: {
      family: "Nunito",
      files: [{ weight: 800, style: "normal", file: "Nunito-ExtraBold.ttf" }],
      primaryWeight: 800,
    },
    body: {
      family: "Nunito",
      files: [
        { weight: 400, style: "normal", file: "Nunito-Regular.ttf" },
        { weight: 600, style: "normal", file: "Nunito-SemiBold.ttf" },
        { weight: 700, style: "normal", file: "Nunito-Bold.ttf" },
      ],
      primaryWeight: 400,
    },
  },
  type: {
    // 0.6 dejaba que "CONTAMINA TODOS." calculado para una línea envolviera
    // a 2 (mismo síntoma que Bloque) — subido a 0.68 tras verlo en PNG.
    headline: { charWidthFactor: 0.68, lineHeight: 1.05, accentGapFactor: 0.25 },
    eyebrow: { charWidthFactor: 0.58 },
    cta: { charWidthFactor: 0.56 },
    dato: { charWidthFactor: 0.52 },
  },
  // Formas curvas fluidas — todo más redondeado que los demás temas.
  radii: { pill: 999, chipCorner: 1.0, brandMark: 0.5 },
  motif: "organicBlobs",
  // Overlay en degradado (no plano): reaplica el MISMO degradado agua-
  // atardecer del fondo (mismo ángulo, mismos 3 stops) por encima de la
  // foto, en vez de un scrim neutro. Así la foto queda teñida por la
  // identidad de Marea en vez de competir con ella — se ve "a través del
  // lente" del tema. Un flat oscuro neutro (como Corriente/Bloque) mataría
  // justamente lo que hace a Marea reconocible: su gradiente cálido.
  photoOverlay: {
    mode: "gradient",
    gradient: {
      angle: 150,
      stops: [
        { color: "rgba(15,61,82,0.78)", at: "0%" },
        { color: "rgba(92,58,74,0.78)", at: "48%" },
        { color: "rgba(122,69,48,0.78)", at: "100%" },
      ],
    },
  },
};
