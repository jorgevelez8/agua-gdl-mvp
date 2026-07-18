"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import styles from "./page.module.css";
import { Header } from "@/design-system/components/Header";
import { Chip } from "@/design-system/components/Chip";
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
  linkDetectado: string | null;
  post: PiezaCopy;
  story: PiezaCopy;
  banner: PiezaCopy;
}

const FORMATOS: { clave: "post" | "story" | "banner"; etiqueta: string; medida: string }[] = [
  { clave: "post", etiqueta: "Post", medida: "1:1" },
  { clave: "story", etiqueta: "Story", medida: "9:16" },
  { clave: "banner", etiqueta: "Banner", medida: "1200×628" },
];

function urlImagen(
  formato: string,
  pieza: PiezaCopy,
  tema: ThemeId,
  foto: string | null,
  marcaNombre: string,
  marcaEyebrow: string
) {
  const params = new URLSearchParams({ data: JSON.stringify(pieza), tema });
  if (foto) params.set("foto", foto);
  if (marcaNombre.trim()) params.set("marcaNombre", marcaNombre.trim());
  if (marcaEyebrow.trim()) params.set("marcaEyebrow", marcaEyebrow.trim());
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
  const [loadedSrc, setLoadedSrc] = useState<Record<string, string>>({});
  const [opcionesAbiertas, setOpcionesAbiertas] = useState(false);

  const [usarFoto, setUsarFoto] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [buscandoFoto, setBuscandoFoto] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);

  // Marca del cliente (DESIGN.md §1) — configurable, sin persistencia. Sin
  // nombre, las piezas caen a la identidad neutra de campaign.ts con su
  // aviso de placeholder; con nombre, el aviso desaparece.
  const [nombreOrganizacion, setNombreOrganizacion] = useState("");
  const [textoEyebrow, setTextoEyebrow] = useState("");
  const marcaConfigurada = nombreOrganizacion.trim().length > 0;

  const temaActual = THEME_META.find((t) => t.id === tema);
  const mostrarPanelResultados = cargando || resultado !== null || error !== null;
  const motivoDeshabilitado = !mensaje.trim() ? "Describí tu campaña para continuar." : null;

  function elegirTema(nuevoTema: ThemeId) {
    setTema(nuevoTema);
    const soportaFoto = THEME_META.find((t) => t.id === nuevoTema)?.photoSupported;
    if (!soportaFoto) setUsarFoto(false);
  }

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
        body: JSON.stringify({ mensaje, link, datosVerificados, nombreOrganizacion, textoEyebrow }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error desconocido.");
      }
      setResultado(data);
      // Igual mecánica que la keyword de foto: automático, con red de
      // seguridad — solo completa el campo si el usuario no escribió ya
      // un link propio ahí (no le pisamos lo que haya tipeado a mano).
      if (data.linkDetectado && !link.trim()) {
        setLink(data.linkDetectado);
      }
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
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.contenido}>
      <Header proyecto={marcaConfigurada ? nombreOrganizacion.trim() : "Sin marca configurada"} />

      <div className={mostrarPanelResultados ? styles.layoutConResultados : styles.layoutInicial}>
        <section className={styles.panelFormulario}>
          <h1 className={styles.tituloFormulario}>¿Qué campaña querés crear hoy?</h1>
          <p className={styles.subtitulo}>Transformá una idea en una campaña profesional.</p>

          <div className={styles.formulario}>
            <textarea
              className={styles.mensajeInput}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder='Ej. "Necesito una campaña para que los vecinos separen la basura reciclable, tono motivador, con un link a nuestro programa"'
              rows={4}
            />

            <button
              type="button"
              className={styles.disclosureToggle}
              onClick={() => setOpcionesAbiertas((v) => !v)}
              aria-expanded={opcionesAbiertas}
              aria-controls="opciones-avanzadas"
            >
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${opcionesAbiertas ? styles.chevronAbierto : ""}`}
              />
              Opciones avanzadas
            </button>

            <div
              id="opciones-avanzadas"
              className={styles.disclosureWrapper}
              data-abierto={opcionesAbiertas}
            >
              <div className={styles.disclosureInner}>
                <label className={styles.campo}>
                  <span className={styles.etiqueta}>Link / CTA (opcional)</span>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Ej. tuorganizacion.com/campaña"
                  />
                </label>

                <label className={styles.campo}>
                  <span className={styles.etiqueta}>
                    Datos verificados / lineamientos oficiales (opcional)
                  </span>
                  <textarea
                    value={datosVerificados}
                    onChange={(e) => setDatosVerificados(e.target.value)}
                    placeholder="Ej. El programa ofrece talleres gratuitos y descuentos en los centros comunitarios. No prometas cosas que no estén aquí."
                    rows={3}
                  />
                </label>

                <div className={styles.divisor} />
                <span className={styles.etiquetaGrupo}>Marca del cliente</span>

                <label className={styles.campo}>
                  <span className={styles.etiqueta}>Nombre de la organización (opcional)</span>
                  <input
                    type="text"
                    value={nombreOrganizacion}
                    onChange={(e) => setNombreOrganizacion(e.target.value)}
                    placeholder="Ej. EcoVerde"
                  />
                </label>

                <label className={styles.campo}>
                  <span className={styles.etiqueta}>Texto del eyebrow (opcional)</span>
                  <input
                    type="text"
                    value={textoEyebrow}
                    onChange={(e) => setTextoEyebrow(e.target.value)}
                    placeholder="Ej. Campaña de reciclaje responsable"
                  />
                </label>
                <span className={styles.textoAyuda}>
                  {marcaConfigurada
                    ? "Se aplica a las piezas generadas — sin nombre configurado, vuelven a mostrar una identidad de ejemplo."
                    : "Sin completar, las piezas muestran una identidad de ejemplo con aviso de placeholder."}
                </span>

                <div className={styles.divisor} />
                <span className={styles.etiquetaGrupo}>Personalización</span>

                <div className={styles.campo}>
                  <span className={styles.etiqueta}>Tema visual</span>
                  <div className={styles.chipsFila}>
                    {THEME_META.map((t) => (
                      <Chip
                        key={t.id}
                        selected={tema === t.id}
                        disabled={!t.implemented}
                        onClick={() => elegirTema(t.id)}
                        title={!t.implemented ? "Próximamente" : undefined}
                      >
                        {t.label}
                      </Chip>
                    ))}
                  </div>
                  <span className={styles.textoAyuda}>{temaActual?.description}</span>
                </div>

                <div className={styles.campo}>
                  <Chip
                    selected={usarFoto}
                    disabled={!temaActual?.photoSupported}
                    onClick={() => setUsarFoto((v) => !v)}
                  >
                    Imagen de fondo
                  </Chip>
                  {!temaActual?.photoSupported && (
                    <span className={styles.textoAyuda}>No disponible para este tema todavía.</span>
                  )}
                </div>

                {usarFoto && resultado && (
                  <div className={styles.fotoControles}>
                    <label className={styles.campo}>
                      <span className={styles.etiqueta}>
                        Palabra clave para la foto (banco: Pexels)
                      </span>
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
              </div>
            </div>

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
                {!marcaConfigurada && (
                  <p className={styles.notaMarca}>
                    El lockup dentro de las piezas es un placeholder de demo — configurá el
                    nombre de tu organización en Opciones avanzadas para reemplazarlo por tu
                    marca real.
                  </p>
                )}
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
                  const src = pieza
                    ? urlImagen(clave, pieza, tema, usarFoto ? fotoUrl : null, nombreOrganizacion, textoEyebrow)
                    : null;
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
                            <Download size={14} />
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
      </div>
    </main>
  );
}
