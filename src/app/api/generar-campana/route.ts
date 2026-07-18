import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MODELO = "claude-sonnet-4-6";

interface PiezaCopy {
  headlineMain: string;
  headlineAccent: string;
  lede: string;
  dato: string | null;
  datoResaltado: string | null;
  cta: string;
}

interface RespuestaCampana {
  keyword: string;
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

const KEYWORD_POR_DEFECTO = "water";

export async function POST(req: NextRequest) {
  const { mensaje, link, datosVerificados } = await req.json();

  if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
    return NextResponse.json(
      { error: "El mensaje de campaña es obligatorio." },
      { status: 400 }
    );
  }

  const tieneDatos = Boolean(datosVerificados && datosVerificados.trim());
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Eres el redactor de la campaña de comunicación del Programa Emergente de Calidad del Agua de Guadalajara (con SIAPA). A partir de un mensaje central, adapta el contenido a 3 formatos de redes sociales (post, story, banner), cada uno con la misma estructura: un titular corto en dos líneas (la segunda línea es un cierre corto y contundente que se destaca en color de acento), una bajada de una frase, y un botón de acción.

MENSAJE CENTRAL: "${mensaje.trim()}"
${link ? `LINK/CTA A INCLUIR (referencia para el botón, no lo repitas como URL suelta en el texto): ${link.trim()}` : ""}
${
  tieneDatos
    ? `DATOS VERIFICADOS / LINEAMIENTOS OFICIALES (úsalos para el "dato" de cada pieza; NO inventes cifras ni beneficios que no estén aquí):\n${datosVerificados.trim()}`
    : "No se proveyeron datos verificados. NO inventes cifras, estadísticas ni beneficios específicos — deja \"dato\" y \"datoResaltado\" en null para las 3 piezas."
}

Para cada formato (post, story, banner) genera:
- headlineMain: primera línea del titular. Corta (ideal 2-4 palabras).
- headlineAccent: segunda línea, el cierre/remate (ideal 1-3 palabras, termina en punto o exclamación). Regla: siempre es la frase de acción o urgencia más corta posible que resuma el mensaje — nunca una palabra al azar del headline, es su propia frase de cierre.
- lede: una frase de apoyo (post: hasta ~28 palabras; story: hasta ~12 palabras, más urgente; banner: hasta ~14 palabras, más formal).
${
  tieneDatos
    ? `- dato: una frase corta con el dato verificado aplicado a este formato.
- datoResaltado: la sub-frase EXACTA dentro de "dato" (cópiala literal) que debe resaltarse en negrita — normalmente la cifra o el beneficio concreto.`
    : `- dato: null
- datoResaltado: null`
}
- cta: texto de botón, máximo 3 palabras, imperativo (ej. "Reportar fuga", "Más información").

Además, generá UNA sola vez (no por formato):
- keyword: 1-2 palabras EN INGLÉS que describan el sujeto fotografiable más literal del mensaje (ej. "hierve el agua" → "boiling water"; "reportá fugas" → "water leak"; "cuida el acuífero" → "aquifer"). Es para buscar una foto de banco de imágenes — tiene que ser un objeto o escena concreta, no un concepto abstracto. Si el mensaje no da pie a nada fotografiable concreto, usá "${KEYWORD_POR_DEFECTO}".

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta forma exacta:
{"keyword": "...", "post": {"headlineMain": "...", "headlineAccent": "...", "lede": "...", "dato": ${tieneDatos ? '"..."' : "null"}, "datoResaltado": ${tieneDatos ? '"..."' : "null"}, "cta": "..."}, "story": {...misma forma...}, "banner": {...misma forma...}}`;

  let respuestaTexto: string;
  try {
    const mensajeRespuesta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 1536,
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

  // Defensa en profundidad: el chip de dato verificado solo puede existir si el
  // usuario proveyó datos — no confiar únicamente en que el prompt se respete.
  if (!tieneDatos) {
    for (const pieza of [datos.post, datos.story, datos.banner]) {
      pieza.dato = null;
      pieza.datoResaltado = null;
    }
  }

  // Red de seguridad: si Claude no devolvió una keyword usable, no dejar
  // el campo vacío/roto — cae al término seguro por defecto.
  if (!datos.keyword || typeof datos.keyword !== "string" || !datos.keyword.trim()) {
    datos.keyword = KEYWORD_POR_DEFECTO;
  }

  return NextResponse.json(datos);
}
