import Image from "next/image";
import styles from "./Header.module.css";

/** Marca del PRODUCTO ("Campaña", logo.png) — nunca la del cliente.
 * El proyecto activo se muestra como chip discreto, no como título. Ver
 * DESIGN.md §1 ("las dos marcas, no mezclar"). */
export function Header({ proyecto }: { proyecto: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.marca}>
        <Image
          src="/brand/logo.png"
          alt=""
          width={30}
          height={30}
          className={styles.logo}
          priority
        />
        <span className={styles.nombre}>Campaña</span>
      </div>
      <span className={styles.proyecto}>Proyecto activo · {proyecto}</span>
    </header>
  );
}
