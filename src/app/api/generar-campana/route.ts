import { NextRequest, NextResponse } from "next/server";
import {
  crearClienteGroq,
  esErrorAutenticacionGroq,
  FORMATO_RESPUESTA_CAMPANA,
  MODELO_COPY,
  parsearRespuestaJson,
  type RespuestaCampana,
} from "@/lib/groqCopy";

// El modelo vive en src/lib/groqCopy.ts y se puede cambiar con COPY_MODEL.
// Debe soportar Structured Outputs estrictos; ver .env.local.example.

const KEYWORD_POR_DEFECTO = "community";

// Parte FIJA del prompt — idéntica en cada llamada. La parte variable
// (mensaje del usuario, organización, eyebrow, link, datos verificados)
// vive en el mensaje de "user", nunca acá. El rol es genérico a propósito:
// la herramienta la puede usar
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

function logUso(
  modelo: string,
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
) {
  if (!usage) {
    console.warn(`[generar-campana] Groq no devolvió métricas de uso para ${modelo}.`);
    return;
  }

  console.log(
    `[generar-campana] tokens: input=${usage.prompt_tokens} output=${usage.completion_tokens} total=${usage.total_tokens} modelo=${modelo}`
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[generar-campana] GROQ_API_KEY no está configurada.");
    return NextResponse.json(
      { error: "La asistencia de IA no está configurada en este entorno." },
      { status: 503 }
    );
  }

  const groq = crearClienteGroq(apiKey);

  let datos: RespuestaCampana;
  try {
    const respuesta = await groq.chat.completions.create({
      model: MODELO_COPY,
      max_completion_tokens: 1536,
      reasoning_effort: "low",
      response_format: FORMATO_RESPUESTA_CAMPANA,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptUsuario },
      ],
    });

    logUso(MODELO_COPY, respuesta.usage);
    datos = parsearRespuestaJson<RespuestaCampana>(respuesta.choices[0]?.message.content);
  } catch (err) {
    if (esErrorAutenticacionGroq(err)) {
      console.error("[generar-campana] Groq rechazó GROQ_API_KEY.");
      return NextResponse.json(
        { error: "La asistencia de IA no está configurada correctamente." },
        { status: 503 }
      );
    }

    console.error("Error generando la campaña con Groq:", err);
    return NextResponse.json(
      { error: "No se pudo generar el contenido. Intenta de nuevo." },
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

  // Red de seguridad: si el modelo no devolvió una keyword usable, no dejar
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
