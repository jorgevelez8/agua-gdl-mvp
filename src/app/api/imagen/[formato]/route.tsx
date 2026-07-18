import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TAMANOS: Record<string, { width: number; height: number }> = {
  post: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  banner: { width: 1200, height: 628 },
};

const AZUL_PRIMARIO = "#0B5FA5";
const AZUL_SECUNDARIO = "#7FD1E0";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formato: string }> }
) {
  const { formato } = await params;
  const tamano = TAMANOS[formato];
  if (!tamano) {
    return new Response("Formato inválido", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const titulo = searchParams.get("titulo") || "";
  const copy = searchParams.get("copy") || "";
  const esBanner = formato === "banner";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(160deg, ${AZUL_PRIMARIO} 0%, ${AZUL_SECUNDARIO} 100%)`,
          padding: "60px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "white",
            marginBottom: 32,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          💧
        </div>
        <div
          style={{
            display: "flex",
            fontSize: esBanner ? 48 : 64,
            fontWeight: 700,
            color: "white",
            marginBottom: 20,
            lineHeight: 1.15,
            maxWidth: "90%",
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: esBanner ? 26 : 34,
            color: "white",
            opacity: 0.92,
            maxWidth: "85%",
            lineHeight: 1.3,
          }}
        >
          {copy}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 24,
            fontSize: 18,
            color: "white",
            opacity: 0.7,
          }}
        >
          Placeholder de marca — demo
        </div>
      </div>
    ),
    { width: tamano.width, height: tamano.height, emoji: "twemoji" }
  );
}
