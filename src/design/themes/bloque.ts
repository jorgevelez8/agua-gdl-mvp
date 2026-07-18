import type { ThemeDefinition } from "./types";

/** Bloque — alto contraste. Negro casi puro + un verde eléctrico atenuado
 * (no neón puro, para no vibrar sobre negro), Archivo Black (titular
 * pesado que ocupa la pieza) + Archivo (cuerpo), formas geométricas duras
 * en vez de ondas. Impacto máximo, sin suavizar con degradados. */
export const bloque: ThemeDefinition = {
  id: "bloque",
  label: "Bloque",
  description: "Alto contraste, negro + color eléctrico, formas duras.",
  colors: {
    bgTop: "#0a0a0a",
    bgMid: "#0a0a0a",
    bgDeep: "#0a0a0a",
    glow: "#0a0a0a",
    // Verde lima eléctrico pero atenuado (no #39FF14 puro) — impacto sin
    // vibrar sobre negro. Se re-evalúa en la verificación de PNG.
    accent: "#C6FF3D",
    accentEyebrowText: "#C6FF3D",
    accentSoftBg: "rgba(198,255,61,0.12)",
    accentBorder: "rgba(198,255,61,0.45)",
    chipIconBg: "rgba(198,255,61,0.18)",
    chipBg: "rgba(255,255,255,0.06)",
    ctaBg: "#C6FF3D",
    ctaText: "#0a0a0a",
    brandMarkBg: "rgba(255,255,255,0.12)",
    textPrimary: "#f5f5f5",
    // Punto de riesgo señalado: el lede en gris sobre negro es donde más
    // se pierde legibilidad — mantener claro, no un gris oscuro.
    textSecondary: "#d4d4d4",
    textMuted: "rgba(245,245,245,0.55)",
  },
  background: { mode: "flat", glow: false },
  fonts: {
    display: {
      family: "Archivo Black",
      files: [{ weight: 400, style: "normal", file: "ArchivoBlack-Regular.ttf" }],
      primaryWeight: 400,
    },
    body: {
      family: "Archivo",
      files: [
        { weight: 400, style: "normal", file: "Archivo-Regular.ttf" },
        { weight: 500, style: "normal", file: "Archivo-Medium.ttf" },
        { weight: 600, style: "normal", file: "Archivo-SemiBold.ttf" },
      ],
      primaryWeight: 400,
    },
  },
  type: {
    // Archivo Black es más ancha/bloque que Anton. 0.66 dejaba que un
    // "CONTAMINA TODOS." calculado para una línea en realidad envolviera a
    // 2 (Satori lo resolvió solo, sin desborde, pero no era la intención) —
    // subido a 0.72 tras verlo en PNG.
    headline: { charWidthFactor: 0.72, lineHeight: 1.0, accentGapFactor: 0.3 },
    eyebrow: { charWidthFactor: 0.58 },
    cta: { charWidthFactor: 0.56 },
    dato: { charWidthFactor: 0.52 },
  },
  // Formas geométricas duras — esquinas sin redondear, no píldoras.
  radii: { pill: 0, chipCorner: 0, brandMark: 0 },
  motif: "hardShapes",
  // Overlay plano casi negro, más denso que el de Corriente (0.85 vs 0.78):
  // el lima solo funciona a máximo contraste, así que no alcanza con
  // "atenuar" la foto — hay que dejarla casi monocromática, visible como
  // textura/escena pero sin que su brillo o color compita con el acento.
  // Con foto clara/luminosa esta densidad es la que evita que el lima vibre.
  photoOverlay: { mode: "flat", flatColor: "rgba(10,10,10,0.85)" },
};
