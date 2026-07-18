"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface PiezaCopy {
  titulo: string;
  copy: string;
}

interface RespuestaCampana {
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

const FORMATOS: { clave: keyof RespuestaCampana; etiqueta: string }[] = [
  { clave: "post", etiqueta: "Post (1:1)" },
  { clave: "story", etiqueta: "Story (9:16)" },
  { clave: "banner", etiqueta: "Banner" },
];

function urlImagen(formato: string, pieza: PiezaCopy) {
  const params = new URLSearchParams({
    titulo: pieza.titulo,
    copy: pieza.copy,
  });
  return `/api/imagen/${formato}?${params.toString()}`;
}

export default function Home() {
  const [mensaje, setMensaje] = useState("");
  const [link, setLink] = useState("");
  const [datosVerificados, setDatosVerificados] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaCampana | null>(null);

  async function generar() {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/generar-campana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje, link, datosVerificados }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error desconocido.");
      }
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className={styles.main}>
      <h1>Generador de campaña — Agua Guadalajara</h1>
      <p className={styles.aviso}>
        Paleta y emblema son un <strong>placeholder de marca</strong> para
        esta demo — el sistema aplicaría la identidad visual oficial del
        programa una vez integrado.
      </p>

      <div className={styles.form}>
        <label>
          Mensaje de campaña *
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder='Ej. "Hierve el agua antes de consumirla mientras dure la alerta"'
            rows={3}
          />
        </label>

        <label>
          Link / CTA (opcional)
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ej. guadalajara.gob.mx/agua"
          />
        </label>

        <label>
          Datos verificados / lineamientos oficiales (opcional)
          <textarea
            value={datosVerificados}
            onChange={(e) => setDatosVerificados(e.target.value)}
            placeholder="Ej. El programa entrega filtros, pastillas de cloro y tinacos en las colonias afectadas. No prometas cosas que no estén aquí."
            rows={3}
          />
        </label>

        <button onClick={generar} disabled={cargando || !mensaje.trim()}>
          {cargando ? "Generando…" : "Generar piezas"}
        </button>

        {error && (
          <p className={styles.error}>
            {error}{" "}
            <button onClick={generar} className={styles.reintentar}>
              Reintentar
            </button>
          </p>
        )}
      </div>

      {resultado && (
        <div className={styles.resultados}>
          {FORMATOS.map(({ clave, etiqueta }) => {
            const pieza = resultado[clave];
            const src = urlImagen(clave, pieza);
            return (
              <div key={clave} className={styles.pieza}>
                <h2>{etiqueta}</h2>
                <img src={src} alt={pieza.titulo} className={styles.imagen} />
                <p className={styles.copyTexto}>{pieza.copy}</p>
                <a href={src} download={`${clave}.png`}>
                  Descargar PNG
                </a>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
