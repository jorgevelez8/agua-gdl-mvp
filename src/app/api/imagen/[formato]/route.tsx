import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { buildVerticalPoster, buildBannerPoster, PiezaContenido } from "@/design/pieceTemplate";
import { buildVerticalSpec, buildBannerSpec } from "@/design/layoutSpecs";
import { getTheme, TemaNoImplementadoError } from "@/design/themes/registry";
import type { ThemeDefinition, ThemeFont } from "@/design/themes/types";

// Node.js runtime (no edge): necesitamos `fs` para leer las fuentes locales
// desde /public — más confiable en dev/Windows que fetch(new URL(..., import.meta.url)).
function loadFont(themeId: string, filename: string): ArrayBuffer {
  const buf = readFileSync(path.join(process.cwd(), "public", "fonts", themeId, filename));
  const uint8 = new Uint8Array(buf);
  return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
}

function loadThemeFonts(theme: ThemeDefinition) {
  const fromFont = (font: ThemeFont) =>
    font.files.map((f) => ({
      name: font.family,
      data: loadFont(theme.id, f.file),
      weight: f.weight,
      style: f.style,
    }));
  return [...fromFont(theme.fonts.display), ...fromFont(theme.fonts.body)];
}

function parseContenido(raw: string | null): PiezaContenido {
  if (!raw) {
    return { headlineMain: "", headlineAccent: "", lede: "", dato: null, datoResaltado: null, cta: "" };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      headlineMain: String(parsed.headlineMain ?? ""),
      headlineAccent: String(parsed.headlineAccent ?? ""),
      lede: String(parsed.lede ?? ""),
      dato: parsed.dato ? String(parsed.dato) : null,
      datoResaltado: parsed.datoResaltado ? String(parsed.datoResaltado) : null,
      cta: String(parsed.cta ?? ""),
    };
  } catch {
    return { headlineMain: "", headlineAccent: "", lede: "", dato: null, datoResaltado: null, cta: "" };
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formato: string }> }
) {
  const { formato } = await params;
  const { searchParams } = new URL(req.url);
  const contenido = parseContenido(searchParams.get("data"));

  let theme;
  try {
    theme = getTheme(searchParams.get("tema"));
  } catch (err) {
    if (err instanceof TemaNoImplementadoError) {
      return new Response(err.message, { status: 400 });
    }
    throw err;
  }

  const fonts = loadThemeFonts(theme);

  if (formato === "banner") {
    const spec = buildBannerSpec(theme);
    return new ImageResponse(buildBannerPoster(theme, spec, contenido), {
      width: spec.width,
      height: spec.height,
      fonts,
    });
  }

  if (formato !== "post" && formato !== "story") {
    return new Response("Formato inválido", { status: 400 });
  }

  const [width, height] = formato === "story" ? [1080, 1920] : [1080, 1080];
  const spec = buildVerticalSpec(theme, width, height);
  return new ImageResponse(buildVerticalPoster(theme, spec, contenido), {
    width: spec.width,
    height: spec.height,
    fonts,
  });
}
