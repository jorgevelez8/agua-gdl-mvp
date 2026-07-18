import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { buildVerticalPoster, buildBannerPoster, PiezaContenido } from "@/design/pieceTemplate";
import { postSpec, storySpec, bannerSpec } from "@/design/layoutSpecs";

export const runtime = "edge";

async function loadFont(path: string): Promise<ArrayBuffer> {
  return fetch(new URL(path, import.meta.url)).then((res) => res.arrayBuffer());
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

  const [anton, barlowRegular, barlowMedium, barlowSemiBold, barlowSemiBoldItalic] = await Promise.all([
    loadFont("../../../../assets/fonts/Anton-Regular.ttf"),
    loadFont("../../../../assets/fonts/Barlow-Regular.ttf"),
    loadFont("../../../../assets/fonts/Barlow-Medium.ttf"),
    loadFont("../../../../assets/fonts/Barlow-SemiBold.ttf"),
    loadFont("../../../../assets/fonts/Barlow-SemiBoldItalic.ttf"),
  ]);

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
