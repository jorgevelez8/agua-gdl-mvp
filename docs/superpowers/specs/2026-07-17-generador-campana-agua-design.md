# Generador de piezas de campaña — Agua GDL (MVP)

**Fecha:** 2026-07-17
**Contexto:** Reto "las diez". Guadalajara vive una crisis de calidad del agua; el municipio (con SIAPA) aprobó un programa emergente y necesita difundir ampliamente recomendaciones y acciones preventivas a la ciudadanía. El equipo decidió que el MVP no sea un trámite ciudadano, sino una herramienta de comunicación: a partir de un mensaje de campaña, generar automáticamente piezas gráficas consistentes para redes sociales.

> **Actualización 2026-07-18:** la implementación reemplazó Claude/Anthropic por Groq con `openai/gpt-oss-120b`, manteniendo los prompts, contratos del frontend y salvaguardas editoriales. Las respuestas de IA ahora usan JSON Schema estricto. La configuración vigente está documentada en el README y `.env.local.example`.

## Problema

Los equipos de comunicación de gobierno necesitan publicar recomendaciones (ej. "hierve el agua antes de consumirla") en múltiples formatos de redes sociales, rápido y manteniendo la misma identidad visual. Hacerlo a mano pieza por pieza es lento y genera inconsistencia entre publicaciones.

## Solución

Una app de una sola página: el usuario escribe un mensaje de campaña (+ opcionalmente un link/CTA). La app genera 3 piezas listas para publicar — post cuadrado (1:1), story vertical (9:16), banner horizontal — cada una con su copy, usando siempre la misma paleta de colores y el mismo emblema.

## Alcance (dentro del MVP)

- Un campo de texto: mensaje de campaña. Campo opcional: link/CTA.
- Campo opcional "datos verificados / lineamientos oficiales" (textarea): hechos concretos del programa que el operador pega a mano (ej. nombres reales de los apoyos — filtros, pastillas de cloro, tinacos — o cifras oficiales). **Diferenciador frente a Canva/herramientas genéricas de copy con IA:** el prompt al modelo instruye explícitamente a no inventar cifras ni beneficios que no estén en ese campo, y a señalar si el mensaje pide algo no cubierto por los datos provistos. Así el copy generado es verificable contra la normativa real, no solo "bonito".
- Una llamada a Groq/GPT-OSS 120B que adapta el mensaje (+ datos verificados, si los hay) a 3 formatos (copy corto por pieza, tono ajustado a cada formato).
- Render de 3 imágenes PNG (post, story, banner) vía `next/og` (`ImageResponse`), con plantilla fija por formato: misma paleta de colores institucional (azules del agua) y mismo emblema (ícono de gota de agua, ya que no hay logo oficial provisto).
- Preview de las 3 piezas en pantalla + botón de descarga PNG por pieza + copy visible para copiar/pegar.
- Aviso visible en la UI (no solo en este documento): "Paleta y emblema son un placeholder de marca para esta demo — el sistema aplicaría la identidad visual oficial del programa una vez integrado." Esto evita que la demo se lea como si usara el logo real de SIAPA/Guadalajara sin serlo.
- Manejo de error simple (mensaje + botón reintentar) si falla la llamada a Groq.

## Fuera de alcance (explícitamente, para no repetir el pivote anterior)

- Ningún formulario de datos del ciudadano (nombre, colonia, teléfono, tipo de ayuda).
- Ningún PDF de solicitud de ayuda/trámite.
- Sin generación de imagen con modelos de IA de imagen (Flux/fal.ai) — el fondo/diseño es una plantilla HTML/CSS fija vía Satori (`next/og`), solo el copy usa IA.
- Sin variaciones de paleta/logo por campaña — un solo set de identidad visual fijo para todo el MVP.
- Sin persistencia/base de datos — cada generación es efímera, sin historial.
- Sin autenticación de usuarios.

## Arquitectura

- **Next.js (App Router)**, desplegado en Vercel con el CLI ya autenticado (`jorgevelezsena-6766`).
- **`/` (página única):** formulario (mensaje + link opcional) → estado de carga → preview de 3 piezas.
- **`POST /api/generar-campana`:** recibe `{ mensaje, link?, datosVerificados?, nombreOrganizacion?, textoEyebrow? }`. Llama a Groq (SDK oficial, `GROQ_API_KEY`) con `openai/gpt-oss-120b` por defecto y exige JSON Schema estricto:
  ```json
  {
    "keyword": "water safety",
    "linkDetectado": "https://ejemplo.gob.mx",
    "post":   { "headlineMain": "Agua segura", "headlineAccent": "Cuídate.", "lede": "...", "dato": null, "datoResaltado": null, "cta": "Ver medidas" },
    "story":  { "headlineMain": "...", "headlineAccent": "...", "lede": "...", "dato": null, "datoResaltado": null, "cta": "..." },
    "banner": { "headlineMain": "...", "headlineAccent": "...", "lede": "...", "dato": null, "datoResaltado": null, "cta": "..." }
  }
  ```
  Devuelve ese JSON al cliente.
- **`POST /api/refinar-campo`:** recibe el campo asistido, su valor actual y una lluvia de ideas. Usa el mismo modelo y devuelve exactamente `{ "propuesta": "..." }` mediante un segundo esquema estricto.
- **`src/lib/groqCopy.ts`:** centraliza el modelo predeterminado/configurable, el cliente con timeout, los tipos compartidos y ambos JSON Schemas. `COPY_MODEL` solo puede apuntar a modelos de Groq compatibles con Structured Outputs estrictos.
- **Render de imágenes:** 3 rutas (o una ruta parametrizada) `app/api/imagen/[formato]/route.tsx` usando `ImageResponse` de `next/og`, cada una con su propio tamaño (`1080x1080`, `1080x1920`, `1200x628`) y la misma plantilla visual (fondo con paleta azul, emblema de gota, título + copy recibidos por query param o body).
- El cliente arma la URL de cada imagen con el texto ya generado y las muestra en `<img>` + link de descarga.

## Manejo de errores

Si la llamada a Groq falla (timeout, rate limit, cuota gratuita agotada o respuesta ausente): mostrar mensaje de error en la página y botón "Reintentar". Sin reintentos automáticos ni cola — es un flujo de un solo uso por sesión, alineado al tiempo disponible para la demo. Si falta `GROQ_API_KEY`, los endpoints devuelven 503; los errores del proveedor devuelven 502 sin exponer credenciales.

## Testing

Verificación manual end-to-end: enviar un mensaje de ejemplo ("hierve el agua antes de consumirla"), confirmar que las 3 piezas se generan con la paleta correcta, que el copy tiene sentido por formato, y que las descargas PNG funcionan. No se arma suite automatizada dado el plazo de entrega (hoy).

## Identidad visual fija (placeholder para este MVP)

- Paleta: azul agua (`#0B5FA5` primario, `#7FD1E0` secundario, blanco para texto sobre fondo oscuro).
- Emblema: ícono simple de gota de agua (SVG inline dentro de la plantilla Satori) — no hay logo oficial del programa disponible en este momento.
- Tipografía: system font (Satori no soporta fuentes custom sin cargarlas explícitamente; se usa la fuente por defecto para evitar riesgo de configuración en el tiempo disponible).
