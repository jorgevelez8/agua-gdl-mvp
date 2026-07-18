import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Configurable por env var — default a Haiku porque esta tarea es
// reformateo/extracción de texto (no razonamiento complejo). Subí a un
// Sonnet si en algún momento la calidad de copy se queda corta; ver
// .env.local.example para el detalle de precios de cada uno.
const MODELO = process.env.COPY_MODEL || "claude-haiku-4-5-20251001";

// USD por millón de tokens, verificado julio 2026. Sonnet 5 tiene precio
// introductorio hasta el 31/8/2026 ($2/$10) — después sube a $3/$15.
// El cálculo de costo usa el modelo que efectivamente corrió (MODELO),
// nunca uno hardcodeado, así que si cambia el env var el precio sigue
// siendo correcto sin tocar código — salvo que haga falta sumar una
// entrada nueva a esta tabla para un modelo no listado todavía.
const PRECIOS_POR_MILLON: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
};

const KEYWORD_POR_DEFECTO = "community";

// Parte FIJA del prompt — idéntica en cada llamada, candidata a
// cache_control. La parte variable (mensaje del usuario, organización,
// eyebrow, link, datos verificados) vive en el mensaje de "user", nunca
// acá. El rol es genérico a propósito: la herramienta la puede usar
// cualquier organización de cualquier rubro, no solo campañas de agua
// (ver DESIGN.md §1 y la config de marca en campaign.ts/page.tsx) — nada
// de Guadalajara, SIAPA ni agua hardcodeado en ningún lado de este texto.
const SYSTEM_PROMPT = `Sos redactor/a de campañas de comunicación digital. A partir de un mensaje central y el contexto de qué organización lo publica, adaptás el contenido a 3 formatos de redes sociales (post, story, banner), cada uno con la misma estructura: un titular corto en dos líneas (la segunda línea es un cierre corto y contundente que se destaca en color de acento), una bajada de una frase, y un botón de acción.

REGLAS DE INTERPRETACIÓN DEL MENSAJE CENTRAL (puede venir como una descripción libre, no como una línea ya pulida — separá lo siguiente en vez de copiarlo tal cual):
1. Si el mensaje incluye instrucciones sobre TONO o ESTILO (ej. "que sea urgente pero no alarmista"), aplicalas a cómo escribís — nunca las repitas como texto literal en el titular ni en la bajada.
2. Si el mensaje menciona una URL o un sitio web, usala SOLO como referencia para el "cta" — no la repitas como URL suelta dentro de headlineMain, headlineAccent ni lede.
3. Si el mensaje menciona una cifra, estadística o dato oficial concreto, ese es el candidato para "dato"/"datoResaltado" — no lo dejes perdido únicamente dentro de la bajada.
4. El contexto de ORGANIZACIÓN y EYEBROW (más abajo) es quién habla y en qué marco — no inventes datos, lugares ni cifras a partir de ellos, y no menciones ninguna ciudad, institución o tema que no esté en el MENSAJE CENTRAL, la ORGANIZACIÓN o el EYEBROW.

Para cada formato (post, story, banner) generá:
- headlineMain: primera línea del titular. Corta (ideal 2-4 palabras).
- headlineAccent: segunda línea, el cierre/remate (ideal 1-3 palabras, termina en punto o exclamación). Regla: siempre es la frase de acción o urgencia más corta posible que resuma el mensaje — nunca una palabra al azar del headline, es su propia frase de cierre.
- lede: una frase de apoyo (post: hasta ~28 palabras; story: hasta ~12 palabras, más urgente; banner: hasta ~14 palabras, más formal).
- dato: el mensaje del usuario indica si hay datos verificados disponibles para esta generación. Si los hay: una frase corta con el dato aplicado a este formato. Si no los hay: null.
- datoResaltado: si "dato" no es null, la sub-frase EXACTA dentro de "dato" (cópiala literal) que debe resaltarse en negrita — normalmente la cifra o el beneficio concreto. Si "dato" es null, también null.
- cta: texto de botón, máximo 3 palabras, imperativo (ej. "Reportar fuga", "Más información").

Además, generá UNA sola vez (no por formato):
- keyword: 1-2 palabras EN INGLÉS que describan el sujeto fotografiable más literal del mensaje (ej. "separá la basura reciclable" → "recycling bin"; "revisa el semáforo antes de cruzar" → "traffic light"; "vacuná a tu mascota" → "veterinarian appointment"). Es para buscar una foto de banco de imágenes — tiene que ser un objeto o escena concreta, no un concepto abstracto. Si el mensaje no da pie a nada fotografiable concreto, usá "${KEYWORD_POR_DEFECTO}".
- linkDetectado: si el MENSAJE CENTRAL menciona una URL, dominio o sitio web (con o sin "http"/"www"), devolvela tal como aparece. Si no se menciona ninguna, null. Si ya hay un LINK/CTA EXPLÍCITO en el mensaje de abajo, repetí ese mismo valor acá.

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta forma exacta:
{"keyword": "...", "linkDetectado": "..." o null, "post": {"headlineMain": "...", "headlineAccent": "...", "lede": "...", "dato": "..." o null, "datoResaltado": "..." o null, "cta": "..."}, "story": {...misma forma...}, "banner": {...misma forma...}}`;

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
  /** Link/URL detectado dentro del mensaje libre — igual mecánica que
   * keyword: la IA lo extrae, la UI lo muestra editable en el campo
   * avanzado "Link / CTA" (automático, con red de seguridad). */
  linkDetectado: string | null;
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

function logUsoYCosto(modelo: string, usage: { input_tokens: number; output_tokens: number }) {
  const precios = PRECIOS_POR_MILLON[modelo];
  if (!precios) {
    console.warn(
      `[generar-campana] Modelo "${modelo}" sin precio conocido en PRECIOS_POR_MILLON — agregalo a la tabla para ver el costo estimado.`
    );
    console.log(
      `[generar-campana] tokens: input=${usage.input_tokens} output=${usage.output_tokens} modelo=${modelo} costo=desconocido`
    );
    return;
  }
  const costoInput = (usage.input_tokens / 1_000_000) * precios.input;
  const costoOutput = (usage.output_tokens / 1_000_000) * precios.output;
  const costoTotal = costoInput + costoOutput;
  console.log(
    `[generar-campana] tokens: input=${usage.input_tokens} output=${usage.output_tokens} modelo=${modelo} costo=$${costoTotal.toFixed(6)} USD`
  );
}

export async function POST(req: NextRequest) {
  const { mensaje, link, datosVerificados, nombreOrganizacion, textoEyebrow } = await req.json();

  if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
    return NextResponse.json(
      { error: "El mensaje de campaña es obligatorio." },
      { status: 400 }
    );
  }

  const datosVerificadosTrim = (datosVerificados || "").trim();
  const tieneDatosExplicitos = Boolean(datosVerificadosTrim);
  // El mensaje ahora puede ser una descripción libre de la campaña entera
  // (no una línea ya limpia) — puede traer, mezclados en prosa, el link,
  // el dato duro y hasta instrucciones de tono. Si menciona una cifra,
  // hay que extraerla de ahí también, no solo del campo separado.
  const contieneCifraEnMensaje = /\d/.test(mensaje);
  const tieneDatos = tieneDatosExplicitos || contieneCifraEnMensaje;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const organizacionTrim = (nombreOrganizacion || "").trim();
  const eyebrowTrim = (textoEyebrow || "").trim();

  // Parte VARIABLE del prompt — distinta en cada llamada, nunca cacheada.
  // ORGANIZACIÓN/EYEBROW vienen de la config de marca del cliente (misma
  // fuente que ve pieceTemplate.tsx) — es contexto de quién habla, no
  // texto fijo: sin esto, nada en el prompt sabe de qué organización o
  // rubro se trata.
  const promptUsuario = `ORGANIZACIÓN: ${organizacionTrim || "sin especificar"}
EYEBROW A USAR EN LA PIEZA: ${eyebrowTrim || "sin especificar"}
MENSAJE CENTRAL: "${mensaje.trim()}"
${link ? `LINK/CTA EXPLÍCITO A INCLUIR (además de cualquier link que ya menciones dentro del MENSAJE CENTRAL): ${link.trim()}` : ""}
${
  tieneDatosExplicitos
    ? `DATOS VERIFICADOS / LINEAMIENTOS OFICIALES ADICIONALES (úsalos para el "dato" de cada pieza junto con cualquier cifra que el MENSAJE CENTRAL ya mencione; NO inventes cifras ni beneficios que no estén en ninguno de los dos):\n${datosVerificadosTrim}`
    : contieneCifraEnMensaje
      ? `No se proveyeron datos verificados en un campo aparte, pero el MENSAJE CENTRAL sí menciona una cifra o dato concreto — extraelo de ahí para el "dato" de cada pieza, tal como está. No inventes cifras adicionales que no estén en el mensaje.`
      : `No se proveyeron datos verificados ni hay ninguna cifra concreta en el mensaje. NO inventes cifras, estadísticas ni beneficios específicos — "dato" y "datoResaltado" deben ir null para las 3 piezas.`
}`;

  let respuestaTexto: string;
  try {
    const mensajeRespuesta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 1536,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Solo rinde con prompts fijos grandes (~1000+ tokens) y uso
          // frecuente — el cache expira a los ~5 min. Se deja puesto para
          // cuando el volumen de generaciones lo justifique.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: promptUsuario }],
    });

    logUsoYCosto(MODELO, mensajeRespuesta.usage);

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

  // Si el usuario ya escribió un link explícito, ese manda — no lo pisamos
  // con lo que la IA haya detectado dentro del mensaje libre.
  if (link && typeof link === "string" && link.trim()) {
    datos.linkDetectado = link.trim();
  } else if (typeof datos.linkDetectado !== "string" || !datos.linkDetectado.trim()) {
    datos.linkDetectado = null;
  }

  return NextResponse.json(datos);
}
