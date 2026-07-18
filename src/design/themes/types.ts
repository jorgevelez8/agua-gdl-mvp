export type ThemeId = "corriente" | "papel" | "bloque" | "marea";

export interface ThemeFontFile {
  weight: 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
  /** Nombre de archivo dentro de public/fonts/<themeId>/ */
  file: string;
}

export interface ThemeFont {
  /** Nombre usado como fontFamily en los estilos y en fonts[] de ImageResponse. */
  family: string;
  files: ThemeFontFile[];
  /** Peso principal a usar donde antes había un "400" fijo (Anton solo tiene
   * esa variante) — temas con fuentes multi-peso (Space Grotesk, etc.)
   * necesitan poder pedir su propio peso "hero" para el titular/marca. */
  primaryWeight: ThemeFontFile["weight"];
}

export interface ThemeColors {
  bgTop: string;
  bgMid: string;
  bgDeep: string;
  /** Color del glow radial decorativo. Solo se usa si background.glow=true. */
  glow: string;
  accent: string;
  accentEyebrowText: string;
  accentSoftBg: string;
  accentBorder: string;
  chipIconBg: string;
  chipBg: string;
  ctaBg: string;
  ctaText: string;
  brandMarkBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export interface ThemeBackground {
  mode: "gradient" | "flat";
  /** Ángulo del gradiente lineal (grados). Solo aplica si mode="gradient". */
  angle?: number;
  /** Si el tema tiene el glow radial decorativo detrás del contenido. */
  glow: boolean;
}

/** Motivo decorativo de fondo — cada tema puede usar uno distinto.
 * Hoy solo "waves" está implementado (Corriente); los demás se agregan
 * cuando se implementa el tema que los necesita. */
export type MotifKind = "waves" | "hardShapes" | "organicBlobs" | "none";

/** Calibración de ajuste de texto — depende de la geometría de la fuente,
 * por eso vive en el tema y no en layoutSpecs (que es por-formato, no por-fuente). */
export interface ThemeTypeCalibration {
  headline: {
    charWidthFactor: number;
    lineHeight: number;
    /** Fracción del tamaño de fuente que se agrega como marginTop a la
     * segunda línea del titular, para que mayúsculas acentuadas (Á/Í/Ú/Ó/É)
     * no toquen la línea de arriba. Se recalibra por tema/fuente — ver
     * el paso de verificación con PNG antes de dar un tema por terminado. */
    accentGapFactor: number;
  };
  eyebrow: { charWidthFactor: number };
  cta: { charWidthFactor: number };
  dato: { charWidthFactor: number };
}

export interface ThemeRadii {
  /** Border-radius del eyebrow y el botón CTA. 999 = píldora completa, 0 = esquina dura. */
  pill: number;
  /** Multiplicador (× fontSize) del radio del lado redondeado del chip de dato. */
  chipCorner: number;
  /** Multiplicador (× nameSize) del radio del marco del ícono de marca. */
  brandMark: number;
}

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  description: string;
  colors: ThemeColors;
  background: ThemeBackground;
  /** `body` debe traer al menos los pesos 400 (texto normal) y 600 normal
   * (eyebrow/CTA/resaltado del chip) — esos dos pesos están hardcodeados
   * en pieceTemplate.tsx en vez de leerse del tema, así que cualquier tema
   * nuevo tiene que cubrirlos para no romper el font-matching de Satori. */
  fonts: { display: ThemeFont; body: ThemeFont };
  type: ThemeTypeCalibration;
  radii: ThemeRadii;
  motif: MotifKind;
}
