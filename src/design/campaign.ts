/** Marca del CLIENTE (no la del producto — ver DESIGN.md §1). Se aplica
 * dentro de las piezas generadas: eyebrow + lockup ("nombre" + gota) +
 * nota de placeholder. Configurable desde la UI (Opciones avanzadas →
 * Marca del cliente); estos son solo los valores neutros de arranque,
 * antes de que el usuario cargue su propia organización — no asumen
 * ningún rubro en particular. Agua GDL es un ejemplo posible que se
 * escribe en el campo, nunca el estado por defecto. */
export interface MarcaCliente {
  eyebrow: string;
  brandName: string;
  /** null = no mostrar nota — se usa cuando el usuario ya configuró su
   * propia marca, porque en ese caso ya no es un placeholder de demo. */
  brandNote: string | null;
}

export const campaign: MarcaCliente = {
  eyebrow: "Campaña informativa",
  brandName: "Tu Organización",
  brandNote: "identidad placeholder — demo",
};
