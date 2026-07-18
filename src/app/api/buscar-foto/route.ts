import { NextRequest, NextResponse } from "next/server";
import { buscarFoto, Orientacion } from "@/lib/pexels";

function esOrientacionValida(v: unknown): v is Orientacion {
  return v === "square" || v === "portrait" || v === "landscape";
}

export async function POST(req: NextRequest) {
  const { keyword, orientacion } = await req.json();

  if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
    return NextResponse.json({ error: "Falta la keyword de búsqueda." }, { status: 400 });
  }
  if (orientacion !== undefined && !esOrientacionValida(orientacion)) {
    return NextResponse.json({ error: "Orientación inválida." }, { status: 400 });
  }

  try {
    const foto = await buscarFoto(keyword.trim(), orientacion);
    if (!foto) {
      return NextResponse.json({ error: "No se encontró ninguna foto para esa keyword." }, { status: 404 });
    }
    return NextResponse.json(foto);
  } catch (err) {
    console.error("Error buscando foto en Pexels:", err);
    return NextResponse.json({ error: "No se pudo buscar la foto. Intenta de nuevo." }, { status: 502 });
  }
}
