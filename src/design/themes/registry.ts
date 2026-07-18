import type { ThemeDefinition, ThemeId } from "./types";
import { corriente } from "./corriente";
import { papel } from "./papel";
import { bloque } from "./bloque";
import { marea } from "./marea";

export const DEFAULT_THEME_ID: ThemeId = "corriente";

/** Metadata para el selector de la UI — incluye los 4 temas del sistema
 * aunque todavía no estén todos implementados (`implemented: false` los
 * deshabilita en el selector hasta que tengan su ThemeDefinition real). */
export const THEME_META: {
  id: ThemeId;
  label: string;
  description: string;
  implemented: boolean;
  /** Si el tema ya tiene un photoOverlay calibrado — controla si el toggle
   * "usar imagen de fondo" de la UI está habilitado para este tema. */
  photoSupported: boolean;
}[] = [
  {
    id: "corriente",
    label: "Corriente",
    description: "Teal/cyan profundo, ondas como firma, Anton.",
    implemented: true,
    photoSupported: true,
  },
  {
    id: "papel",
    label: "Papel",
    description: "Claro editorial, hueso/blanco, tipografía geométrica limpia.",
    implemented: true,
    photoSupported: false,
  },
  {
    id: "bloque",
    label: "Bloque",
    description: "Alto contraste, negro + color eléctrico, formas duras.",
    implemented: true,
    photoSupported: false,
  },
  {
    id: "marea",
    label: "Marea",
    description: "Cálido/orgánico, degradado agua-atardecer, formas curvas.",
    implemented: true,
    photoSupported: true,
  },
];

const THEMES: Partial<Record<ThemeId, ThemeDefinition>> = {
  corriente,
  papel,
  bloque,
  marea,
};

export class TemaNoImplementadoError extends Error {
  constructor(id: ThemeId) {
    super(`El tema "${id}" todavía no está implementado.`);
    this.name = "TemaNoImplementadoError";
  }
}

/** Devuelve la definición completa de un tema. Lanza si el id no existe o
 * si todavía no se implementó (los otros 3 temas, por ahora). */
export function getTheme(id: string | null | undefined): ThemeDefinition {
  const themeId = (id || DEFAULT_THEME_ID) as ThemeId;
  const theme = THEMES[themeId];
  if (!theme) {
    throw new TemaNoImplementadoError(themeId);
  }
  return theme;
}
