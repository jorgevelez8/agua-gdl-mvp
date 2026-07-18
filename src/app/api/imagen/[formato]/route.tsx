import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { buildVerticalPoster, buildBannerPoster, PiezaContenido } from "@/design/pieceTemplate";
import { buildVerticalSpec, buildBannerSpec } from "@/design/layoutSpecs";
import { getTheme, TemaNoImplementadoError } from "@/design/themes/registry";
import { campaign, type MarcaCliente } from "@/design/campaign";
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

// Satori no le hace fetch a un <img src="https://..."> por su cuenta de forma
// confiable en este setup — hay que resolver la foto a bytes ACÁ y pasarle
// un data URI ya embebido. Si el fetch falla, la pieza sale sin foto en vez
// de romper el render entero.
async function resolverFotoComoDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error("Error resolviendo foto de fondo:", err);
    return null;
  }
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

/** Marca del cliente, configurable desde Opciones avanzadas (DESIGN.md §1
 * — no confundir con la marca del producto, que nunca entra acá). Sin
 * nombre configurado, cae a los valores neutros de campaign.ts y muestra
 * el aviso de placeholder; con nombre configurado, el aviso desaparece
 * porque ya no es una demo. */
function resolverMarca(searchParams: URLSearchParams): MarcaCliente {
  const nombre = searchParams.get("marcaNombre")?.trim();
  const eyebrow = searchParams.get("marcaEyebrow")?.trim();
  const marcaConfigurada = Boolean(nombre);
  return {
    brandName: marcaConfigurada ? nombre! : campaign.brandName,
    eyebrow: eyebrow ? eyebrow : campaign.eyebrow,
    brandNote: marcaConfigurada ? null : campaign.brandNote,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formato: string }> }
) {
  const { formato } = await params;
  const { searchParams } = new URL(req.url);
  const contenido = parseContenido(searchParams.get("data"));
  const marca = resolverMarca(searchParams);
  const fotoParam = searchParams.get("foto");
  // Solo se acepta una URL https real — cualquier otra cosa se ignora en
  // silencio (la pieza sale sin foto) en vez de romper el render entero.
  const foto =
    fotoParam && fotoParam.startsWith("https://")
      ? await resolverFotoComoDataUri(fotoParam)
      : null;

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
    return new ImageResponse(buildBannerPoster(theme, spec, contenido, foto, marca), {
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
  return new ImageResponse(buildVerticalPoster(theme, spec, contenido, foto, marca), {
    width: spec.width,
    height: spec.height,
    fonts,
  });
}
