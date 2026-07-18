"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Header } from "@/design-system/components/Header";
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

const FORMATOS: { clave: "post" | "story" | "banner"; etiqueta: string; medida: string }[] = [
  { clave: "post", etiqueta: "Post", medida: "1:1" },
  { clave: "story", etiqueta: "Story", medida: "9:16" },
  { clave: "banner", etiqueta: "Banner", medida: "1200×628" },
];

function urlImagen(formato: string, pieza: PiezaCopy, tema: ThemeId, foto: string | null) {
  const params = new URLSearchParams({ data: JSON.stringify(pieza), tema });
  if (foto) params.set("foto", foto);
  return `/api/imagen/${formato}?${params.toString()}`;
}

function IconoDescargar() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5v8.25m0 0L4.75 6.5M8 9.75 11.25 6.5M2.5 11.5v1.75c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const [mensaje, setMensaje] = useState("");
  const [link, setLink] = useState("");
  const [datosVerificados, setDatosVerificados] = useState("");
  const [tema, setTema] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaCampana | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<Record<string, string>>({});

  const [usarFoto, setUsarFoto] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [buscandoFoto, setBuscandoFoto] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);

  const temaActual = THEME_META.find((t) => t.id === tema);
  const mostrarPanelResultados = cargando || resultado !== null || error !== null;
  const motivoDeshabilitado = !mensaje.trim() ? "Escribí un mensaje de campaña para continuar." : null;

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
    setLoadedSrc({});
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
    <main className={styles.pagina}>
      <Header proyecto="Agua Guadalajara" />

      <div className={mostrarPanelResultados ? styles.layoutConResultados : styles.layoutInicial}>
        <section className={styles.panelFormulario}>
          <h1 className={styles.tituloFormulario}>Generá tus piezas</h1>
          <p className={styles.subtitulo}>
            Un mensaje de campaña. Tres piezas gráficas listas para publicar.
          </p>

          <div className={styles.formulario}>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>Mensaje de campaña *</span>
              <textarea
                className={styles.mensajeInput}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder='Ej. "Hierve el agua antes de consumirla mientras dure la alerta"'
                rows={3}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Link / CTA (opcional)</span>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ej. guadalajara.gob.mx/agua"
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Datos verificados / lineamientos oficiales (opcional)</span>
              <textarea
                value={datosVerificados}
                onChange={(e) => setDatosVerificados(e.target.value)}
                placeholder="Ej. El programa entrega filtros, pastillas de cloro y tinacos en las colonias afectadas. No prometas cosas que no estén aquí."
                rows={3}
              />
            </label>

            <div className={styles.divisor} />
            <span className={styles.etiquetaGrupo}>Personalización</span>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Tema visual</span>
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
              <span className={styles.textoAyuda}>{temaActual?.description}</span>
            </label>

            <label className={styles.campoCheckbox}>
              <input
                type="checkbox"
                checked={usarFoto}
                disabled={!temaActual?.photoSupported}
                onChange={(e) => setUsarFoto(e.target.checked)}
              />
              <span>
                Usar imagen de fondo
                {!temaActual?.photoSupported && (
                  <span className={styles.textoAyuda}> — no disponible para este tema todavía</span>
                )}
              </span>
            </label>

            {usarFoto && resultado && (
              <div className={styles.fotoControles}>
                <label className={styles.campo}>
                  <span className={styles.etiqueta}>Palabra clave para la foto (banco: Pexels)</span>
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

            <div className={styles.accionPrincipal}>
              <button
                onClick={generar}
                disabled={cargando || !mensaje.trim()}
                className={styles.botonPrimario}
              >
                {cargando ? "Generando…" : "Generar piezas"}
              </button>
              {!cargando && motivoDeshabilitado && (
                <p className={styles.hintDeshabilitado}>{motivoDeshabilitado}</p>
              )}
            </div>
          </div>
        </section>

        {mostrarPanelResultados && (
          <section className={styles.panelResultados}>
            {resultado && !error && (
              <>
                <h2 className={styles.tituloResultados}>Tus piezas</h2>
                <p className={styles.notaMarca}>
                  El lockup dentro de las piezas ("AGUA GDL" + gota) es un placeholder de
                  demo — se reemplaza por la marca real de cada organización que use la
                  herramienta.
                </p>
              </>
            )}

            {cargando && !resultado && <h2 className={styles.tituloResultados}>Generando tus piezas…</h2>}

            {error && (
              <>
                <h2 className={styles.tituloResultados}>Algo falló</h2>
                <p className={styles.error}>
                  {error}{" "}
                  <button onClick={generar} className={styles.reintentar}>
                    Reintentar
                  </button>
                </p>
              </>
            )}

            {!error && (
              <div className={styles.grillaResultados}>
                {FORMATOS.map(({ clave, etiqueta, medida }, i) => {
                  const pieza = resultado?.[clave];
                  const src = pieza ? urlImagen(clave, pieza, tema, usarFoto ? fotoUrl : null) : null;
                  const cargada = !!src && loadedSrc[clave] === src;

                  return (
                    <div
                      key={clave}
                      className={styles.pieza}
                      style={{ transitionDelay: `${i * 120}ms`, animationDelay: `${i * 120}ms` }}
                    >
                      <div className={`${styles.marcoImagen} ${styles[`marco_${clave}`]}`}>
                        {!cargada && <div className={styles.skeleton} aria-hidden="true" />}
                        {src && (
                          <img
                            src={src}
                            alt={pieza ? `${pieza.headlineMain} ${pieza.headlineAccent}` : ""}
                            className={`${styles.imagen} ${cargada ? styles.imagenVisible : styles.imagenOculta}`}
                            onLoad={() => setLoadedSrc((prev) => ({ ...prev, [clave]: src }))}
                          />
                        )}
                      </div>
                      <div className={styles.piezaPie}>
                        <span className={styles.formatoNombre}>
                          {etiqueta} <span className={styles.formatoMedida}>{medida}</span>
                        </span>
                        {pieza && src && (
                          <a href={src} download={`${clave}.png`} className={styles.botonDescargar}>
                            <IconoDescargar />
                            Descargar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
