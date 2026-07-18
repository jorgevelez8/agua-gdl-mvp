import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MODELO = "claude-sonnet-4-6";

interface PiezaCopy {
  titulo: string;
  copy: string;
}

interface RespuestaCampana {
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

export async function POST(req: NextRequest) {
  const { mensaje, link, datosVerificados } = await req.json();

  if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
    return NextResponse.json(
      { error: "El mensaje de campaña es obligatorio." },
      { status: 400 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Eres el redactor de la campaña de comunicación del Programa Emergente de Calidad del Agua de Guadalajara (con SIAPA). A partir de un mensaje central, adapta el texto a 3 formatos de redes sociales, cada uno con su propio título corto y copy.

MENSAJE CENTRAL: "${mensaje.trim()}"
${link ? `LINK/CTA A INCLUIR: ${link.trim()}` : ""}
${
  datosVerificados && datosVerificados.trim()
    ? `DATOS VERIFICADOS / LINEAMIENTOS OFICIALES (úsalos si son relevantes, NO inventes cifras ni beneficios que no estén aquí):\n${datosVerificados.trim()}`
    : "No se proveyeron datos verificados adicionales — mantén el copy general y no inventes cifras, programas o beneficios específicos que no estén en el mensaje central."
}

Formatos a generar:
- post: Facebook/Instagram feed, tono cercano, 1-2 frases de copy.
- story: Instagram/Facebook story, tono urgente y directo, copy muy breve (una frase).
- banner: banner institucional horizontal, tono formal, copy breve tipo titular.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con esta forma exacta:
{"post": {"titulo": "...", "copy": "..."}, "story": {"titulo": "...", "copy": "..."}, "banner": {"titulo": "...", "copy": "..."}}`;

  let respuestaTexto: string;
  try {
    const mensajeRespuesta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const bloque = mensajeRespuesta.content.find((b) => b.type === "text");
    if (!bloque || bloque.type !== "text") {
      throw new Error("Respuesta de Claude sin contenido de texto.");
    }
    respuestaTexto = bloque.text;
  } catch (err) {
    console.error("Error llamando a Claude:", err);
    return NextResponse.json(
      { error: "No se pudo generar el contenido. Intenta de nuevo." },
      { status: 502 }
    );
  }

  let datos: RespuestaCampana;
  try {
    const jsonMatch = respuestaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se encontró JSON en la respuesta.");
    datos = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Error parseando JSON de Claude:", err, respuestaTexto);
    return NextResponse.json(
      { error: "La respuesta generada no tuvo el formato esperado. Intenta de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json(datos);
}
