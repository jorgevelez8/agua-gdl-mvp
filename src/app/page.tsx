"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { THEME_META, DEFAULT_THEME_ID } from "@/design/themes/registry";
import type { ThemeId } from "@/design/themes/types";

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

const FORMATOS: { clave: "post" | "story" | "banner"; etiqueta: string }[] = [
  { clave: "post", etiqueta: "Post (1:1)" },
  { clave: "story", etiqueta: "Story (9:16)" },
  { clave: "banner", etiqueta: "Banner" },
];

function urlImagen(formato: string, pieza: PiezaCopy, tema: ThemeId, foto: string | null) {
  const params = new URLSearchParams({ data: JSON.stringify(pieza), tema });
  if (foto) params.set("foto", foto);
  return `/api/imagen/${formato}?${params.toString()}`;
}

export default function Home() {
  const [mensaje, setMensaje] = useState("");
  const [link, setLink] = useState("");
  const [datosVerificados, setDatosVerificados] = useState("");
  const [tema, setTema] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaCampana | null>(null);

  const [usarFoto, setUsarFoto] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [buscandoFoto, setBuscandoFoto] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);

  const temaActual = THEME_META.find((t) => t.id === tema);

  async function buscarFotoConKeyword(kw: string) {
    if (!kw.trim()) return;
    setBuscandoFoto(true);
    setFotoError(null);
    try {
      const res = await fetch("/api/buscar-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error desconocido.");
      }
      setFotoUrl(data.url);
    } catch (err) {
      setFotoError(err instanceof Error ? err.message : "Error desconocido.");
      setFotoUrl(null);
    } finally {
      setBuscandoFoto(false);
    }
  }

  async function generar() {
    setCargando(true);
    setError(null);
    setResultado(null);
    setFotoUrl(null);
    setFotoError(null);
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
      if (usarFoto && temaActual?.photoSupported) {
        setKeyword(data.keyword);
        await buscarFotoConKeyword(data.keyword);
      }
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

        <label>
          Tema visual
          <select
            value={tema}
            onChange={(e) => {
              const nuevoTema = e.target.value as ThemeId;
              setTema(nuevoTema);
              const soportaFoto = THEME_META.find((t) => t.id === nuevoTema)?.photoSupported;
              if (!soportaFoto) setUsarFoto(false);
            }}
            className={styles.temaSelect}
          >
            {THEME_META.map((t) => (
              <option key={t.id} value={t.id} disabled={!t.implemented}>
                {t.label}
                {!t.implemented ? " — próximamente" : ""}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.temaDescripcion}>{temaActual?.description}</p>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={usarFoto}
            disabled={!temaActual?.photoSupported}
            onChange={(e) => setUsarFoto(e.target.checked)}
          />
          Usar imagen de fondo
          {!temaActual?.photoSupported && (
            <span className={styles.temaDescripcion}> (no disponible para este tema todavía)</span>
          )}
        </label>

        {usarFoto && resultado && (
          <div className={styles.fotoControles}>
            <label>
              Palabra clave para la foto (banco: Pexels)
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ej. water"
              />
            </label>
            <button
              type="button"
              onClick={() => buscarFotoConKeyword(keyword)}
              disabled={buscandoFoto || !keyword.trim()}
              className={styles.botonSecundario}
            >
              {buscandoFoto ? "Buscando…" : "Actualizar foto"}
            </button>
            {fotoError && <p className={styles.error}>{fotoError}</p>}
          </div>
        )}

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
            const src = urlImagen(clave, pieza, tema, usarFoto ? fotoUrl : null);
            return (
              <div key={clave} className={styles.pieza}>
                <h2>{etiqueta}</h2>
                <img
                  src={src}
                  alt={`${pieza.headlineMain} ${pieza.headlineAccent}`}
                  className={styles.imagen}
                />
                <p className={styles.copyTexto}>{pieza.lede}</p>
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
