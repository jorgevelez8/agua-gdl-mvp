"use client";

import styles from "./Chip.module.css";

/** Chip seleccionable — reemplaza <select> y checkboxes clásicos para
 * tema y opciones de personalización (DESIGN.md §5.6). Comparte
 * tipografía, radio y espaciado del sistema; el estado seleccionado usa
 * un tinte suave, no un relleno sólido, para no competir con el botón
 * primario como único color saturado en pantalla. */
export function Chip({
  selected,
  disabled,
  onClick,
  children,
  title,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.seleccionado : ""}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
