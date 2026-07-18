import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { buildVerticalPoster, buildBannerPoster, PiezaContenido } from "@/design/pieceTemplate";
import { postSpec, storySpec, bannerSpec } from "@/design/layoutSpecs";

// Node.js runtime (no edge): necesitamos `fs` para leer las fuentes locales
// desde /public — más confiable en dev/Windows que fetch(new URL(..., import.meta.url)).
function loadFont(filename: string): ArrayBuffer {
  const buf = readFileSync(path.join(process.cwd(), "public", "fonts", filename));
  const uint8 = new Uint8Array(buf);
  return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
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

  const anton = loadFont("Anton-Regular.ttf");
  const barlowRegular = loadFont("Barlow-Regular.ttf");
  const barlowMedium = loadFont("Barlow-Medium.ttf");
  const barlowSemiBold = loadFont("Barlow-SemiBold.ttf");
  const barlowSemiBoldItalic = loadFont("Barlow-SemiBoldItalic.ttf");

  const fonts = [
    { name: "Anton", data: anton, weight: 400 as const, style: "normal" as const },
    { name: "Barlow", data: barlowRegular, weight: 400 as const, style: "normal" as const },
    { name: "Barlow", data: barlowMedium, weight: 500 as const, style: "normal" as const },
    { name: "Barlow", data: barlowSemiBold, weight: 600 as const, style: "normal" as const },
    { name: "Barlow", data: barlowSemiBoldItalic, weight: 600 as const, style: "italic" as const },
  ];

  if (formato === "banner") {
    return new ImageResponse(buildBannerPoster(bannerSpec, contenido), {
      width: bannerSpec.width,
      height: bannerSpec.height,
      fonts,
    });
  }

  const spec = formato === "story" ? storySpec : formato === "post" ? postSpec : null;
  if (!spec) {
    return new Response("Formato inválido", { status: 400 });
  }

  return new ImageResponse(buildVerticalPoster(spec, contenido), {
    width: spec.width,
    height: spec.height,
    fonts,
  });
}
