import type { CSSProperties } from "react";
import { campaign, type MarcaCliente } from "./campaign";
import { hexToRgbaTransparent } from "./scale";
import { fitAndTruncate, truncate } from "./fit";
import type { VerticalSpec, BannerSpec } from "./layoutSpecs";
import type { ThemeDefinition } from "./themes/types";

export interface PiezaContenido {
  headlineMain: string;
  headlineAccent: string;
  lede: string;
  dato: string | null;
  datoResaltado: string | null;
  cta: string;
}

// Íconos compartidos entre todos los temas — son formas genéricas (gota,
// fuga, flecha), no identidad visual de un tema en particular. Si un tema
// futuro necesita íconos propios (ej. Bloque más angular), se agrega un
// override puntual entonces, no antes.
const ICONS = {
  drop: "M12 2s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13z",
  leak: "M12 2v6M12 22a7 7 0 0 0 7-7c0-4-7-9-7-9s-7 5-7 9a7 7 0 0 0 7 7z",
  arrow: "M5 12h14M13 6l6 6-6 6",
};

function Icon({
  path,
  size,
  color,
  filled = true,
  strokeWidth = 2,
}: {
  path: string;
  size: number;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "flex" }}>
      {filled ? (
        <path d={path} fill={color} />
      ) : (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// --- Motivo decorativo de fondo ---------------------------------------
// Cada tema declara un `motif` (waves | hardShapes | organicBlobs | none) —
// los 4 están implementados (Corriente, Bloque, Marea, Papel/"none").

const WAVES_RIPPLES = {
  radii: [18, 28, 38, 48],
  viewBox: "0 0 100 100",
  strokeWidth: 0.4,
  opacity: 0.22,
  sizeCqw: 50,
  offsetCqw: -20,
};

const WAVES_LINE = {
  viewBox: "0 0 1080 60",
  path: "M0 30 Q 135 6 270 30 T 540 30 T 810 30 T 1080 30",
  strokeWidth: 2.5,
  opacity: 0.35,
  bottomCqw: 20,
};

/** Ondas concéntricas irradiando desde la esquina superior derecha —
 * contenidas y sutiles, no deben competir con el titular ni cruzarlo. */
function WavesRipples({ theme, boxWidth }: { theme: ThemeDefinition; boxWidth: number }) {
  const size = (WAVES_RIPPLES.sizeCqw / 100) * boxWidth;
  const offset = (WAVES_RIPPLES.offsetCqw / 100) * boxWidth;
  return (
    <svg
      viewBox={WAVES_RIPPLES.viewBox}
      width={size}
      height={size}
      style={{ display: "flex", position: "absolute", top: offset, right: offset }}
    >
      {WAVES_RIPPLES.radii.map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth={WAVES_RIPPLES.strokeWidth}
          opacity={WAVES_RIPPLES.opacity}
        />
      ))}
    </svg>
  );
}

/** Línea de onda horizontal, separa cuerpo de pie. */
function WavesLine({ theme, width, containerWidth }: { theme: ThemeDefinition; width: number; containerWidth: number }) {
  const bottom = (WAVES_LINE.bottomCqw / 100) * containerWidth;
  return (
    <svg
      viewBox={WAVES_LINE.viewBox}
      width={width}
      height={(60 / 1080) * width}
      preserveAspectRatio="none"
      style={{ display: "flex", position: "absolute", left: 0, bottom, opacity: WAVES_LINE.opacity }}
    >
      <path d={WAVES_LINE.path} fill="none" stroke={theme.colors.accent} strokeWidth={WAVES_LINE.strokeWidth} />
    </svg>
  );
}

const HARD_SQUARES = {
  // Lados de cuadrado — se rotan 45° (quedan como rombos), mismo espíritu
  // que las ondas concéntricas de Corriente pero angular en vez de circular.
  sides: [22, 36, 50, 64],
  viewBox: "0 0 100 100",
  strokeWidth: 0.5,
  opacity: 0.4,
  sizeCqw: 46,
  offsetCqw: -18,
};

const HARD_ZIGZAG = {
  viewBox: "0 0 1080 60",
  // Reemplazo anguloso de la curva de onda — mismos puntos de apoyo, sin
  // curvas Q, todo en líneas rectas.
  path: "M0 40 L120 12 L240 40 L360 12 L480 40 L600 12 L720 40 L840 12 L960 40 L1080 12",
  strokeWidth: 3,
  opacity: 0.5,
  bottomCqw: 20,
};

/** Rombos anidados (cuadrados rotados 45°) irradiando desde la esquina
 * superior derecha — versión angular del motivo de ondas, para el tema de
 * alto contraste. Contenido y no debe cruzar el titular. */
function HardCorner({ theme, boxWidth }: { theme: ThemeDefinition; boxWidth: number }) {
  const size = (HARD_SQUARES.sizeCqw / 100) * boxWidth;
  const offset = (HARD_SQUARES.offsetCqw / 100) * boxWidth;
  return (
    <svg
      viewBox={HARD_SQUARES.viewBox}
      width={size}
      height={size}
      style={{ display: "flex", position: "absolute", top: offset, right: offset }}
    >
      {HARD_SQUARES.sides.map((side) => (
        <rect
          key={side}
          x={50 - side / 2}
          y={50 - side / 2}
          width={side}
          height={side}
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth={HARD_SQUARES.strokeWidth}
          opacity={HARD_SQUARES.opacity}
          transform={`rotate(45 50 50)`}
        />
      ))}
    </svg>
  );
}

/** Zigzag anguloso horizontal — separa cuerpo de pie, versión "dura" de la
 * línea de onda. */
function HardLine({ theme, width, containerWidth }: { theme: ThemeDefinition; width: number; containerWidth: number }) {
  const bottom = (HARD_ZIGZAG.bottomCqw / 100) * containerWidth;
  return (
    <svg
      viewBox={HARD_ZIGZAG.viewBox}
      width={width}
      height={(60 / 1080) * width}
      preserveAspectRatio="none"
      style={{ display: "flex", position: "absolute", left: 0, bottom, opacity: HARD_ZIGZAG.opacity }}
    >
      <path d={HARD_ZIGZAG.path} fill="none" stroke={theme.colors.accent} strokeWidth={HARD_ZIGZAG.strokeWidth} />
    </svg>
  );
}

// Un par de manchas orgánicas (blobs) superpuestas — versión fluida/curva
// del motivo de esquina, en vez de círculos concéntricos o rombos duros.
// Ambas viven en el MISMO viewBox 0-100 de un solo <svg> (no uno por blob):
// varios <svg> posicionados por separado rompía el posicionamiento en
// Satori (terminaban en la esquina opuesta) — mismo patrón que
// WavesRipples/HardCorner, que sí funcionan.
const ORGANIC_BLOBS = {
  sizeCqw: 48,
  offsetCqw: -16,
  paths: [
    { d: "M50,8 C68,6 90,18 92,40 C94,63 78,88 54,90 C32,92 8,76 8,50 C8,26 30,10 50,8 Z", opacity: 0.22 },
    { d: "M50,14 C64,12 82,24 84,44 C86,62 72,82 52,84 C34,86 16,72 16,50 C16,30 34,16 50,14 Z", opacity: 0.16 },
  ],
};

const ORGANIC_WAVE = {
  viewBox: "0 0 1080 60",
  // Curva de mayor amplitud que la de Corriente — más sinuosa/fluida.
  path: "M0 40 C 90 10, 180 10, 270 40 C 360 70, 450 70, 540 40 C 630 10, 720 10, 810 40 C 900 70, 990 70, 1080 40",
  strokeWidth: 2.5,
  opacity: 0.4,
  bottomCqw: 20,
};

/** Manchas orgánicas superpuestas irradiando desde la esquina superior
 * derecha — versión curva/fluida del motivo de esquina. */
function OrganicCorner({ theme, boxWidth }: { theme: ThemeDefinition; boxWidth: number }) {
  const size = (ORGANIC_BLOBS.sizeCqw / 100) * boxWidth;
  const offset = (ORGANIC_BLOBS.offsetCqw / 100) * boxWidth;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "flex", position: "absolute", top: offset, right: offset }}
    >
      {ORGANIC_BLOBS.paths.map((blob, i) => (
        <path key={i} d={blob.d} fill={theme.colors.accent} opacity={blob.opacity} />
      ))}
    </svg>
  );
}

/** Onda fluida de mayor amplitud — separa cuerpo de pie, versión "curva" del
 * motivo de línea. */
function OrganicWave({ theme, width, containerWidth }: { theme: ThemeDefinition; width: number; containerWidth: number }) {
  const bottom = (ORGANIC_WAVE.bottomCqw / 100) * containerWidth;
  return (
    <svg
      viewBox={ORGANIC_WAVE.viewBox}
      width={width}
      height={(60 / 1080) * width}
      preserveAspectRatio="none"
      style={{ display: "flex", position: "absolute", left: 0, bottom, opacity: ORGANIC_WAVE.opacity }}
    >
      <path d={ORGANIC_WAVE.path} fill="none" stroke={theme.colors.accent} strokeWidth={ORGANIC_WAVE.strokeWidth} />
    </svg>
  );
}

/** Dispatcher del motivo de fondo según theme.motif. Devuelve los elementos
 * decorativos a superponer (ya posicionados en absoluto). */
function Motif({ theme, width, boxWidth }: { theme: ThemeDefinition; width: number; boxWidth: number }) {
  switch (theme.motif) {
    case "waves":
      return (
        <>
          <WavesRipples theme={theme} boxWidth={boxWidth} />
          <WavesLine theme={theme} width={width} containerWidth={width} />
        </>
      );
    case "hardShapes":
      return (
        <>
          <HardCorner theme={theme} boxWidth={boxWidth} />
          <HardLine theme={theme} width={width} containerWidth={width} />
        </>
      );
    case "organicBlobs":
      return (
        <>
          <OrganicCorner theme={theme} boxWidth={boxWidth} />
          <OrganicWave theme={theme} width={width} containerWidth={width} />
        </>
      );
    // "none" (Papel) deliberadamente no dibuja nada acá — el aire es su firma.
    default:
      return null;
  }
}

function Eyebrow({
  theme,
  fontSize,
  maxWidthPx,
  texto,
}: {
  theme: ThemeDefinition;
  fontSize: number;
  maxWidthPx?: number;
  texto: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.75,
        background: theme.colors.accentSoftBg,
        border: `${Math.max(1, fontSize * 0.11)}px solid ${theme.colors.accentBorder}`,
        borderRadius: theme.radii.pill,
        padding: `${fontSize * 0.7}px ${fontSize * 1.2}px`,
        color: theme.colors.accentEyebrowText,
        fontFamily: theme.fonts.body.family,
        fontWeight: 600,
        fontSize,
        letterSpacing: fontSize * 0.1,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...(maxWidthPx !== undefined ? { maxWidth: maxWidthPx } : {}),
      }}
    >
      <Icon path={ICONS.drop} size={fontSize * 1.3} color={theme.colors.accentEyebrowText} />
      {texto}
    </div>
  );
}

function Headline({
  theme,
  main,
  accent,
  mainSize,
  accentSize,
  lineHeight,
}: {
  theme: ThemeDefinition;
  main: string;
  accent: string;
  mainSize: number;
  accentSize: number;
  lineHeight?: number;
}) {
  const lh = lineHeight ?? theme.type.headline.lineHeight;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          display: "flex",
          fontFamily: theme.fonts.display.family,
          fontWeight: theme.fonts.display.primaryWeight,
          fontSize: mainSize,
          lineHeight: lh,
          color: theme.colors.textPrimary,
          textTransform: "uppercase",
        }}
      >
        {main}
      </span>
      <span
        style={{
          display: "flex",
          fontFamily: theme.fonts.display.family,
          fontWeight: theme.fonts.display.primaryWeight,
          fontSize: accentSize,
          lineHeight: lh,
          // Mayúsculas acentuadas (Ú, Ó, Á...) exceden la caja de line-height
          // tan ajustada y pinchan la línea de arriba — este margen las
          // despeja. El factor es específico de cada fuente/tema — se
          // recalibra y se verifica con PNG al implementar cada tema nuevo.
          marginTop: accentSize * theme.type.headline.accentGapFactor,
          color: theme.colors.accent,
          textTransform: "uppercase",
        }}
      >
        {accent}
      </span>
    </div>
  );
}

/** Titular en una sola línea (main + accent lado a lado, no apilados) —
 * para el banner, que es ancho y bajo y no tiene alto para 2 líneas grandes. */
function HeadlineInline({
  theme,
  main,
  accent,
  size,
}: {
  theme: ThemeDefinition;
  main: string;
  accent: string;
  size: number;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
      <span
        style={{
          display: "flex",
          fontFamily: theme.fonts.display.family,
          fontWeight: theme.fonts.display.primaryWeight,
          fontSize: size,
          lineHeight: 1.05,
          color: theme.colors.textPrimary,
          textTransform: "uppercase",
        }}
      >
        {main}
        {" "}
      </span>
      <span
        style={{
          display: "flex",
          fontFamily: theme.fonts.display.family,
          fontWeight: theme.fonts.display.primaryWeight,
          fontSize: size,
          lineHeight: 1.05,
          color: theme.colors.accent,
          textTransform: "uppercase",
        }}
      >
        {accent}
      </span>
    </div>
  );
}

function Lede({
  theme,
  text,
  fontSize,
  maxWidthPct = 82,
  maxWidthPx,
  marginTop,
}: {
  theme: ThemeDefinition;
  text: string;
  fontSize: number;
  maxWidthPct?: number;
  maxWidthPx?: number;
  marginTop?: number;
}) {
  return (
    <p
      style={{
        display: "flex",
        fontFamily: theme.fonts.body.family,
        fontWeight: 400,
        fontSize,
        lineHeight: 1.4,
        color: theme.colors.textSecondary,
        maxWidth: maxWidthPx ?? `${maxWidthPct}%`,
        marginTop: marginTop ?? fontSize * 0.9,
      }}
    >
      {text}
    </p>
  );
}

function splitHighlight(dato: string, resaltado: string | null) {
  if (!resaltado) return null;
  const idx = dato.indexOf(resaltado);
  if (idx === -1) return null;
  // Satori no preserva espacios en el borde entre nodos de texto hermanos
  // (before / <span> / after), así que se recortan y se reinsertan a mano.
  const before = dato.slice(0, idx).trim();
  const afterRaw = dato.slice(idx + resaltado.length).trim();
  const afterNeedsLeadingSpace = afterRaw.length > 0 && !/^[.,;:!?)]/.test(afterRaw);
  return { before, bold: resaltado.trim(), after: afterRaw, afterNeedsLeadingSpace };
}

function DataChip({
  theme,
  dato,
  datoResaltado,
  fontSize,
  iconSize,
  maxWidthPx,
}: {
  theme: ThemeDefinition;
  dato: string;
  datoResaltado: string | null;
  fontSize: number;
  iconSize: number;
  maxWidthPx: number;
}) {
  const parts = splitHighlight(dato, datoResaltado);
  const gap = fontSize * 0.9;
  const paddingX = fontSize * 1.1;
  const textMaxWidth = Math.max(60, maxWidthPx - iconSize - gap - paddingX * 2);
  const corner = fontSize * theme.radii.chipCorner;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        maxWidth: maxWidthPx,
        background: theme.colors.chipBg,
        borderLeft: `${fontSize * 0.26}px solid ${theme.colors.accent}`,
        borderRadius: `0 ${corner}px ${corner}px 0`,
        padding: `${fontSize * 0.95}px ${paddingX}px`,
        marginTop: fontSize * 1.4,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: "0 0 auto",
          width: iconSize,
          height: iconSize,
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.chipIconBg,
          borderRadius: theme.radii.pill,
        }}
      >
        <Icon path={ICONS.leak} size={iconSize * 0.56} color={theme.colors.accent} filled={false} strokeWidth={1.8} />
      </div>
      <p
        style={{
          display: "flex",
          fontFamily: theme.fonts.body.family,
          fontSize,
          lineHeight: 1.35,
          color: theme.colors.textPrimary,
          maxWidth: textMaxWidth,
        }}
      >
        {parts ? (
          <>
            {parts.before ? `${parts.before} ` : ""}
            <span style={{ display: "flex", fontWeight: 600, color: theme.colors.textPrimary }}>{parts.bold}</span>
            {parts.afterNeedsLeadingSpace ? ` ${parts.after}` : parts.after}
          </>
        ) : (
          dato
        )}
      </p>
    </div>
  );
}

function CtaButton({ theme, label, fontSize }: { theme: ThemeDefinition; label: string; fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.6,
        background: theme.colors.ctaBg,
        color: theme.colors.ctaText,
        fontFamily: theme.fonts.body.family,
        fontWeight: 600,
        fontSize,
        padding: `${fontSize * 0.85}px ${fontSize * 1.4}px`,
        borderRadius: theme.radii.pill,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <Icon path={ICONS.arrow} size={fontSize * 1.15} color={theme.colors.ctaText} filled={false} strokeWidth={2.4} />
    </div>
  );
}

function BrandLockup({
  theme,
  nameSize,
  noteSize,
  brandName,
  brandNote,
}: {
  theme: ThemeDefinition;
  nameSize: number;
  noteSize: number;
  brandName: string;
  /** null → sin nota: se usa cuando el usuario ya configuró su propia
   * marca (deja de ser un placeholder de demo). */
  brandNote: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ display: "flex", alignItems: "center", gap: nameSize * 0.5 }}>
        <div
          style={{
            display: "flex",
            width: nameSize * 1.7,
            height: nameSize * 1.7,
            alignItems: "center",
            justifyContent: "center",
            background: theme.colors.brandMarkBg,
            borderRadius: nameSize * theme.radii.brandMark,
          }}
        >
          <Icon path={ICONS.drop} size={nameSize} color={theme.colors.textPrimary} />
        </div>
        <span
          style={{
            display: "flex",
            fontFamily: theme.fonts.display.family,
            fontWeight: theme.fonts.display.primaryWeight,
            fontSize: nameSize,
            color: theme.colors.textPrimary,
            whiteSpace: "nowrap",
          }}
        >
          {brandName}
        </span>
      </div>
      {brandNote && (
        <span
          style={{
            display: "flex",
            fontSize: noteSize,
            color: theme.colors.textMuted,
            marginTop: noteSize * 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {brandNote}
        </span>
      )}
    </div>
  );
}

function backgroundStyle(theme: ThemeDefinition, width: number, height: number): CSSProperties {
  const bg =
    theme.background.mode === "gradient"
      ? `linear-gradient(${theme.background.angle ?? 180}deg, ${theme.colors.bgTop} 0%, ${theme.colors.bgMid} 48%, ${theme.colors.bgDeep} 100%)`
      : theme.colors.bgTop;
  return {
    width,
    height,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: bg,
    fontFamily: theme.fonts.body.family,
  };
}

function Glow({ theme, position, size }: { theme: ThemeDefinition; position: string; size: string }) {
  if (!theme.background.glow) return null;
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(${size} at ${position}, ${theme.colors.glow} 0%, ${hexToRgbaTransparent(theme.colors.glow)} 55%)`,
      }}
    />
  );
}

/** Foto de fondo opcional + su overlay de legibilidad (calibrado por
 * tema — ver ThemeDefinition.photoOverlay). Si el tema todavía no tiene
 * overlay configurado, no se dibuja nada (la UI ya deshabilita el toggle
 * para esos temas, pero esto es la red de seguridad del lado del render). */
function PhotoBackground({ theme, foto }: { theme: ThemeDefinition; foto: string }) {
  const overlay = theme.photoOverlay;
  if (!overlay) return null;

  const overlayBackground =
    overlay.mode === "flat"
      ? overlay.flatColor
      : `linear-gradient(${overlay.gradient?.angle ?? 180}deg, ${(overlay.gradient?.stops ?? [])
          .map((s) => `${s.color} ${s.at}`)
          .join(", ")})`;

  // Un solo <div> posicionado envolviendo la foto + su overlay — un
  // Fragment con 2 elementos posicionados por separado (mismo patrón que
  // rompió OrganicCorner antes) no se renderiza de forma confiable en Satori.
  // Además: "inset: 0" no funciona en Satori (el elemento queda con tamaño
  // cero, invisible) — hay que usar top/left/right/bottom explícitos.
  return (
    <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <img
        src={foto}
        alt=""
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: overlayBackground,
        }}
      />
    </div>
  );
}

export function buildVerticalPoster(
  theme: ThemeDefinition,
  spec: VerticalSpec,
  contenido: PiezaContenido,
  foto?: string | null,
  marca?: MarcaCliente
) {
  const m = marca ?? campaign;
  const eyebrowSize = (2.15 / 100) * spec.width;
  const headlineMain = fitAndTruncate(contenido.headlineMain, spec.headlineMain);
  const headlineAccent = fitAndTruncate(contenido.headlineAccent, spec.headlineAccent);
  const ledeText = truncate(contenido.lede, spec.ledeMaxChars);
  const ledeSize = (3.5 / 100) * spec.width;
  const ctaFit = fitAndTruncate(contenido.cta, spec.cta);
  const datoFit = contenido.dato ? fitAndTruncate(contenido.dato, spec.dato) : null;

  return (
    <div style={backgroundStyle(theme, spec.width, spec.height)}>
      {foto ? (
        <PhotoBackground theme={theme} foto={foto} />
      ) : (
        <Glow theme={theme} position="82% 8%" size="120% 90%" />
      )}
      <Motif theme={theme} width={spec.width} boxWidth={spec.width} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
          padding: spec.padding,
        }}
      >
        <Eyebrow theme={theme} fontSize={eyebrowSize} texto={m.eyebrow} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <Headline
            theme={theme}
            main={headlineMain.text}
            accent={headlineAccent.text}
            mainSize={headlineMain.sizePx}
            accentSize={headlineAccent.sizePx}
          />
          <Lede theme={theme} text={ledeText} fontSize={ledeSize} />
          {datoFit && (
            <DataChip
              theme={theme}
              dato={datoFit.text}
              datoResaltado={contenido.datoResaltado}
              fontSize={datoFit.sizePx}
              iconSize={datoFit.sizePx * 2.2}
              maxWidthPx={spec.contentWidth}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingTop: (5 / 100) * spec.width,
          }}
        >
          <CtaButton theme={theme} label={ctaFit.text} fontSize={ctaFit.sizePx} />
          <BrandLockup
            theme={theme}
            nameSize={(3 / 100) * spec.width}
            noteSize={(1.7 / 100) * spec.width}
            brandName={m.brandName}
            brandNote={m.brandNote}
          />
        </div>
      </div>
    </div>
  );
}

export function buildBannerPoster(
  theme: ThemeDefinition,
  spec: BannerSpec,
  contenido: PiezaContenido,
  foto?: string | null,
  marca?: MarcaCliente
) {
  const m = marca ?? campaign;
  const eyebrowFit = fitAndTruncate(m.eyebrow, spec.eyebrow);
  const headlineText = `${contenido.headlineMain} ${contenido.headlineAccent}`.trim();
  const headlineFit = fitAndTruncate(headlineText, spec.headline);
  // fitAndTruncate puede truncar el texto combinado — recortamos accent
  // primero (es el cierre, se puede perder antes que el mensaje principal).
  const headlineMain =
    headlineFit.text.length >= contenido.headlineMain.length
      ? contenido.headlineMain
      : headlineFit.text;
  const headlineAccent = headlineFit.text.length >= contenido.headlineMain.length
    ? headlineFit.text.slice(contenido.headlineMain.length).trim()
    : "";
  const ledeText = truncate(contenido.lede, 100);
  const ledeSize = spec.width * 0.021;
  const ctaFit = fitAndTruncate(contenido.cta, spec.cta);
  const datoFit = contenido.dato ? fitAndTruncate(contenido.dato, spec.dato) : null;

  return (
    <div style={backgroundStyle(theme, spec.width, spec.height)}>
      {foto ? (
        <PhotoBackground theme={theme} foto={foto} />
      ) : (
        <Glow theme={theme} position="98% 0%" size="90% 120%" />
      )}
      <Motif theme={theme} width={spec.width} boxWidth={spec.width * 0.4} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
          width: "100%",
          padding: spec.padding,
          justifyContent: "center",
          gap: spec.padding * 0.65,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow theme={theme} fontSize={eyebrowFit.sizePx} maxWidthPx={spec.eyebrow.maxWidthPx} texto={m.eyebrow} />
          <BrandLockup
            theme={theme}
            nameSize={spec.brand.nameSize}
            noteSize={spec.brand.noteSize}
            brandName={m.brandName}
            brandNote={m.brandNote}
          />
        </div>
        <div style={{ display: "flex" }}>
          <HeadlineInline theme={theme} main={headlineMain} accent={headlineAccent} size={headlineFit.sizePx} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: spec.bottomRowGap,
          }}
        >
          <Lede theme={theme} text={ledeText} fontSize={ledeSize} maxWidthPx={spec.ledeMaxWidthPx} marginTop={0} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: spec.bottomRowGap * 0.6,
            }}
          >
            {datoFit && (
              <DataChip
                theme={theme}
                dato={datoFit.text}
                datoResaltado={contenido.datoResaltado}
                fontSize={datoFit.sizePx}
                iconSize={datoFit.sizePx * 2}
                maxWidthPx={spec.dato.maxWidthPx}
              />
            )}
            <CtaButton theme={theme} label={ctaFit.text} fontSize={ctaFit.sizePx} />
          </div>
        </div>
      </div>
    </div>
  );
}
