/**
 * Banco de fotos: Pexels, elegido sobre Unsplash.
 *
 * - Pexels: una sola API key por registro, sin flujo OAuth ni distinción
 *   "app demo vs. producción" — funciona a full capacidad (200 req/hora,
 *   20.000/mes) desde el primer día. Licencia Pexels: uso comercial y no
 *   comercial libre, SIN atribución obligatoria.
 * - Unsplash: las apps nuevas arrancan limitadas a 50 req/hora hasta que
 *   Unsplash aprueba manualmente el pase a "producción", y su licencia
 *   exige atribución del fotógrafo + disparar su endpoint de "download"
 *   en cada uso real — inviable para una imagen generada sin UI de crédito.
 *
 * Requiere PEXELS_API_KEY en el entorno (nunca hardcodeada, nunca al repo).
 */

export type Orientacion = "square" | "portrait" | "landscape";

export interface FotoPexels {
  url: string;
  photographer: string;
  pexelsUrl: string;
}

/** Una sola foto se comparte entre post/story/banner (cada uno la recorta
 * con object-fit:cover a su propio aspect ratio) — no se busca 1 por
 * formato. "landscape" por defecto es el origen más seguro para recortar
 * en cualquier proporción sin perder demasiado del encuadre. */
export async function buscarFoto(
  keyword: string,
  orientacion: Orientacion = "landscape"
): Promise<FotoPexels | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error("Falta PEXELS_API_KEY en el entorno.");
  }

  const params = new URLSearchParams({
    query: keyword,
    per_page: "1",
    orientation: orientacion,
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) {
    throw new Error(`Pexels respondió ${res.status}`);
  }

  const data = await res.json();
  const foto = data.photos?.[0];
  if (!foto) return null;

  return {
    url: foto.src.large,
    photographer: foto.photographer,
    pexelsUrl: foto.url,
  };
}
