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

function Ripples({ width }: { width: number }) {
  const size = (motif.ripples.sizeCqw / 100) * width;
  const offset = (motif.ripples.offsetCqw / 100) * width;
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

function Eyebrow({ fontSize }: { fontSize: number }) {
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
    <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
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
          color: colors.accent,
          textTransform: "uppercase",
        }}
      >
        {accent}
      </span>
    </div>
  );
}

function Lede({ text, fontSize, maxWidthPct = 82 }: { text: string; fontSize: number; maxWidthPct?: number }) {
  return (
    <p
      style={{
        display: "flex",
        fontFamily: "Barlow",
        fontWeight: 400,
        fontSize,
        lineHeight: 1.4,
        color: colors.textSecondary,
        maxWidth: `${maxWidthPct}%`,
        marginTop: fontSize * 0.9,
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
  return { before: dato.slice(0, idx), bold: resaltado, after: dato.slice(idx + resaltado.length) };
}

function DataChip({
  dato,
  datoResaltado,
  fontSize,
  iconSize,
}: {
  dato: string;
  datoResaltado: string | null;
  fontSize: number;
  iconSize: number;
}) {
  const parts = splitHighlight(dato, datoResaltado);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.9,
        background: colors.chipBg,
        borderLeft: `${fontSize * 0.26}px solid ${colors.accent}`,
        borderRadius: `0 ${fontSize * 0.7}px ${fontSize * 0.7}px 0`,
        padding: `${fontSize * 0.95}px ${fontSize * 1.1}px`,
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
      <p style={{ display: "flex", fontFamily: "Barlow", fontSize, lineHeight: 1.35, color: colors.textPrimary }}>
        {parts ? (
          <>
            {parts.before}
            <span style={{ display: "flex", fontWeight: 600, color: "#ffffff" }}>{parts.bold}</span>
            {parts.after}
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
        <span style={{ display: "flex", fontFamily: "Anton", fontSize: nameSize, color: colors.textPrimary }}>
          {campaign.brandName}
        </span>
      </div>
      <span style={{ display: "flex", fontSize: noteSize, color: colors.textMuted, fontStyle: "italic", marginTop: noteSize * 0.5 }}>
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
  const ctaSize = fitAndTruncate(contenido.cta, spec.cta).sizePx;
  const ctaText = fitAndTruncate(contenido.cta, spec.cta).text;
  const datoSize = (2.7 / 100) * spec.width;
  const datoText = contenido.dato ? truncate(contenido.dato, spec.datoMaxChars) : null;

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
      <Ripples width={spec.width} />
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
        <Headline main={headlineMain.text} accent={headlineAccent.text} mainSize={headlineMain.sizePx} accentSize={headlineAccent.sizePx} />
        <Lede text={ledeText} fontSize={ledeSize} />
        {datoText && <DataChip dato={datoText} datoResaltado={contenido.datoResaltado} fontSize={datoSize} iconSize={datoSize * 2.2} />}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: (5 / 100) * spec.width,
          }}
        >
          <CtaButton label={ctaText} fontSize={ctaSize} />
          <BrandLockup nameSize={(3 / 100) * spec.width} noteSize={(1.7 / 100) * spec.width} />
        </div>
      </div>
    </div>
  );
}

export function buildBannerPoster(spec: BannerSpec, contenido: PiezaContenido) {
  const eyebrowSize = spec.width * 0.02;
  const headlineMain = fitAndTruncate(contenido.headlineMain, spec.headlineMain);
  const headlineAccent = fitAndTruncate(contenido.headlineAccent, spec.headlineAccent);
  const ledeText = truncate(contenido.lede, spec.ledeMaxChars);
  const ledeSize = spec.width * 0.026;
  const ctaFit = fitAndTruncate(contenido.cta, spec.cta);
  const datoSize = spec.width * 0.02;
  const datoText = contenido.dato ? truncate(contenido.dato, spec.datoMaxChars) : null;

  return (
    <div style={background(spec.width, spec.height)}>
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 140% at 88% 0%, ${colors.glow} 0%, rgba(18,113,138,0) 55%)`,
        }}
      />
      <Ripples width={spec.width * 0.7} />
      <div
        style={{
          display: "flex",
          position: "relative",
          height: "100%",
          width: "100%",
          padding: spec.padding,
          alignItems: "center",
          justifyContent: "space-between",
          gap: spec.padding,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: spec.leftColWidth }}>
          <Eyebrow fontSize={eyebrowSize} />
          <Headline
            main={headlineMain.text}
            accent={headlineAccent.text}
            mainSize={headlineMain.sizePx}
            accentSize={headlineAccent.sizePx}
            lineHeight={1}
          />
          <Lede text={ledeText} fontSize={ledeSize} maxWidthPct={96} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", height: "100%", justifyContent: "space-between" }}>
          <BrandLockup nameSize={spec.width * 0.022} noteSize={spec.width * 0.013} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: spec.padding * 0.5 }}>
            {datoText && (
              <DataChip dato={datoText} datoResaltado={contenido.datoResaltado} fontSize={datoSize} iconSize={datoSize * 2} />
            )}
            <CtaButton label={ctaFit.text} fontSize={ctaFit.sizePx} />
          </div>
        </div>
      </div>
    </div>
  );
}
