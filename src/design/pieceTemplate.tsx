import type { CSSProperties } from "react";
import { colors, icons, motif, campaign } from "./tokens";
import { fitAndTruncate, truncate } from "./fit";
import type { VerticalSpec, BannerSpec } from "./layoutSpecs";

export interface PiezaContenido {
  headlineMain: string;
  headlineAccent: string;
  lede: string;
  dato: string | null;
  datoResaltado: string | null;
  cta: string;
}

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

/** Textura de marca, contenida a la esquina superior derecha y baja en
 * opacidad — no debe competir con el titular ni cruzarlo visualmente. */
function Ripples({ width, boxWidth }: { width: number; boxWidth: number }) {
  const size = (motif.ripples.sizeCqw / 100) * boxWidth;
  const offset = (motif.ripples.offsetCqw / 100) * boxWidth;
  return (
    <svg
      viewBox={motif.ripples.viewBox}
      width={size}
      height={size}
      style={{ display: "flex", position: "absolute", top: offset, right: offset }}
    >
      {motif.ripples.radii.map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={colors.accent}
          strokeWidth={motif.ripples.strokeWidth}
          opacity={motif.ripples.opacity}
        />
      ))}
    </svg>
  );
}

function Wave({ width, containerWidth }: { width: number; containerWidth: number }) {
  const bottom = (motif.wave.bottomCqw / 100) * containerWidth;
  return (
    <svg
      viewBox={motif.wave.viewBox}
      width={width}
      height={(60 / 1080) * width}
      preserveAspectRatio="none"
      style={{ display: "flex", position: "absolute", left: 0, bottom, opacity: motif.wave.opacity }}
    >
      <path d={motif.wave.path} fill="none" stroke={colors.accent} strokeWidth={motif.wave.strokeWidth} />
    </svg>
  );
}

function Eyebrow({ fontSize, maxWidthPx }: { fontSize: number; maxWidthPx?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.75,
        background: colors.accentSoftBg,
        border: `${Math.max(1, fontSize * 0.11)}px solid ${colors.accentBorder}`,
        borderRadius: 999,
        padding: `${fontSize * 0.7}px ${fontSize * 1.2}px`,
        color: colors.accentEyebrowText,
        fontFamily: "Barlow",
        fontWeight: 600,
        fontSize,
        letterSpacing: fontSize * 0.1,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...(maxWidthPx !== undefined ? { maxWidth: maxWidthPx } : {}),
      }}
    >
      <Icon path={icons.drop} size={fontSize * 1.3} color={colors.accentEyebrowText} />
      {campaign.eyebrow}
    </div>
  );
}

function Headline({
  main,
  accent,
  mainSize,
  accentSize,
  lineHeight = 0.92,
}: {
  main: string;
  accent: string;
  mainSize: number;
  accentSize: number;
  lineHeight?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          display: "flex",
          fontFamily: "Anton",
          fontWeight: 400,
          fontSize: mainSize,
          lineHeight,
          color: colors.textPrimary,
          textTransform: "uppercase",
        }}
      >
        {main}
      </span>
      <span
        style={{
          display: "flex",
          fontFamily: "Anton",
          fontWeight: 400,
          fontSize: accentSize,
          lineHeight,
          // Mayúsculas acentuadas (Ú, Ó, Á...) exceden la caja de line-height
          // tan ajustada y pinchan la línea de arriba — este margen las despeja.
          marginTop: accentSize * 0.55,
          color: colors.accent,
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
function HeadlineInline({ main, accent, size }: { main: string; accent: string; size: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
      <span
        style={{
          display: "flex",
          fontFamily: "Anton",
          fontWeight: 400,
          fontSize: size,
          lineHeight: 1.05,
          color: colors.textPrimary,
          textTransform: "uppercase",
        }}
      >
        {main}
        {" "}
      </span>
      <span
        style={{
          display: "flex",
          fontFamily: "Anton",
          fontWeight: 400,
          fontSize: size,
          lineHeight: 1.05,
          color: colors.accent,
          textTransform: "uppercase",
        }}
      >
        {accent}
      </span>
    </div>
  );
}

function Lede({
  text,
  fontSize,
  maxWidthPct = 82,
  maxWidthPx,
  marginTop,
}: {
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
        fontFamily: "Barlow",
        fontWeight: 400,
        fontSize,
        lineHeight: 1.4,
        color: colors.textSecondary,
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
  dato,
  datoResaltado,
  fontSize,
  iconSize,
  maxWidthPx,
}: {
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
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        maxWidth: maxWidthPx,
        background: colors.chipBg,
        borderLeft: `${fontSize * 0.26}px solid ${colors.accent}`,
        borderRadius: `0 ${fontSize * 0.7}px ${fontSize * 0.7}px 0`,
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
          background: colors.chipIconBg,
          borderRadius: 999,
        }}
      >
        <Icon path={icons.leak} size={iconSize * 0.56} color={colors.accent} filled={false} strokeWidth={1.8} />
      </div>
      <p
        style={{
          display: "flex",
          fontFamily: "Barlow",
          fontSize,
          lineHeight: 1.35,
          color: colors.textPrimary,
          maxWidth: textMaxWidth,
        }}
      >
        {parts ? (
          <>
            {parts.before ? `${parts.before} ` : ""}
            <span style={{ display: "flex", fontWeight: 600, color: "#ffffff" }}>{parts.bold}</span>
            {parts.afterNeedsLeadingSpace ? ` ${parts.after}` : parts.after}
          </>
        ) : (
          dato
        )}
      </p>
    </div>
  );
}

function CtaButton({ label, fontSize }: { label: string; fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.6,
        background: colors.ctaBg,
        color: colors.ctaText,
        fontFamily: "Barlow",
        fontWeight: 600,
        fontSize,
        padding: `${fontSize * 0.85}px ${fontSize * 1.4}px`,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <Icon path={icons.arrow} size={fontSize * 1.15} color={colors.ctaText} filled={false} strokeWidth={2.4} />
    </div>
  );
}

function BrandLockup({ nameSize, noteSize }: { nameSize: number; noteSize: number }) {
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
            background: colors.brandMarkBg,
            borderRadius: nameSize * 0.45,
          }}
        >
          <Icon path={icons.drop} size={nameSize} color={colors.textPrimary} />
        </div>
        <span style={{ display: "flex", fontFamily: "Anton", fontSize: nameSize, color: colors.textPrimary, whiteSpace: "nowrap" }}>
          {campaign.brandName}
        </span>
      </div>
      <span
        style={{
          display: "flex",
          fontSize: noteSize,
          color: colors.textMuted,
          fontStyle: "italic",
          marginTop: noteSize * 0.5,
          whiteSpace: "nowrap",
        }}
      >
        identidad placeholder — demo
      </span>
    </div>
  );
}

function background(width: number, height: number): CSSProperties {
  return {
    width,
    height,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: `linear-gradient(168deg, ${colors.bgTop} 0%, ${colors.bgMid} 48%, ${colors.bgDeep} 100%)`,
    fontFamily: "Barlow",
  };
}

export function buildVerticalPoster(spec: VerticalSpec, contenido: PiezaContenido) {
  const eyebrowSize = (2.15 / 100) * spec.width;
  const headlineMain = fitAndTruncate(contenido.headlineMain, spec.headlineMain);
  const headlineAccent = fitAndTruncate(contenido.headlineAccent, spec.headlineAccent);
  const ledeText = truncate(contenido.lede, spec.ledeMaxChars);
  const ledeSize = (3.5 / 100) * spec.width;
  const ctaFit = fitAndTruncate(contenido.cta, spec.cta);
  const datoFit = contenido.dato ? fitAndTruncate(contenido.dato, spec.dato) : null;

  return (
    <div style={background(spec.width, spec.height)}>
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 90% at 82% 8%, ${colors.glow} 0%, rgba(18,113,138,0) 55%)`,
        }}
      />
      <Ripples width={spec.width} boxWidth={spec.width} />
      <Wave width={spec.width} containerWidth={spec.width} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
          padding: spec.padding,
        }}
      >
        <Eyebrow fontSize={eyebrowSize} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <Headline main={headlineMain.text} accent={headlineAccent.text} mainSize={headlineMain.sizePx} accentSize={headlineAccent.sizePx} />
          <Lede text={ledeText} fontSize={ledeSize} />
          {datoFit && (
            <DataChip
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
          <CtaButton label={ctaFit.text} fontSize={ctaFit.sizePx} />
          <BrandLockup nameSize={(3 / 100) * spec.width} noteSize={(1.7 / 100) * spec.width} />
        </div>
      </div>
    </div>
  );
}

export function buildBannerPoster(spec: BannerSpec, contenido: PiezaContenido) {
  const eyebrowFit = fitAndTruncate(campaign.eyebrow, spec.eyebrow);
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
    <div style={background(spec.width, spec.height)}>
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(90% 120% at 98% 0%, ${colors.glow} 0%, rgba(18,113,138,0) 55%)`,
        }}
      />
      <Ripples width={spec.width} boxWidth={spec.width * 0.4} />
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
          <Eyebrow fontSize={eyebrowFit.sizePx} maxWidthPx={spec.eyebrow.maxWidthPx} />
          <BrandLockup nameSize={spec.brand.nameSize} noteSize={spec.brand.noteSize} />
        </div>
        <div style={{ display: "flex" }}>
          <HeadlineInline main={headlineMain} accent={headlineAccent} size={headlineFit.sizePx} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: spec.bottomRowGap,
          }}
        >
          <Lede text={ledeText} fontSize={ledeSize} maxWidthPx={spec.ledeMaxWidthPx} marginTop={0} />
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
                dato={datoFit.text}
                datoResaltado={contenido.datoResaltado}
                fontSize={datoFit.sizePx}
                iconSize={datoFit.sizePx * 2}
                maxWidthPx={spec.dato.maxWidthPx}
              />
            )}
            <CtaButton label={ctaFit.text} fontSize={ctaFit.sizePx} />
          </div>
        </div>
      </div>
    </div>
  );
}
