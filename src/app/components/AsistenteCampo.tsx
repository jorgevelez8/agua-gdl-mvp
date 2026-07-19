"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Lightbulb, Sparkles, X } from "lucide-react";
import { CAMPOS_IA, type CampoIAId } from "@/lib/camposAsistidos";
import styles from "./AsistenteCampo.module.css";

interface AsistenteCampoProps {
  campo: CampoIAId;
  valorActual: string;
  onAplicar: (propuesta: string) => void;
  onCerrar: () => void;
}

export function AsistenteCampo({
  campo,
  valorActual,
  onAplicar,
  onCerrar,
}: AsistenteCampoProps) {
  const [lluviaIdeas, setLluviaIdeas] = useState("");
  const [propuesta, setPropuesta] = useState("");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogoRef = useRef<HTMLElement>(null);
  const generandoRef = useRef(false);
  const tituloId = useId();
  const descripcionId = useId();

  useEffect(() => {
    const enfoqueAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 0);

    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !generandoRef.current) onCerrar();

      if (event.key !== "Tab" || !dialogoRef.current) return;
      const enfocables = Array.from(
        dialogoRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), textarea:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
      const primero = enfocables[0];
      const ultimo = enfocables.at(-1);
      if (!primero || !ultimo) return;

      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
      enfoqueAnterior?.focus();
    };
  }, [campo, onCerrar]);

  if (typeof document === "undefined") return null;

  const config = CAMPOS_IA[campo];
  const puedeGenerar = lluviaIdeas.trim().length > 0 && !generando;

  async function generarPropuesta() {
    if (!lluviaIdeas.trim()) return;
    generandoRef.current = true;
    setGenerando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/refinar-campo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campo,
          valorActual,
          lluviaIdeas,
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "No se pudo crear una propuesta.");
      }

      if (typeof datos.propuesta !== "string" || !datos.propuesta.trim()) {
        throw new Error("La IA no devolvió una propuesta válida.");
      }

      setPropuesta(datos.propuesta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear una propuesta.");
    } finally {
      generandoRef.current = false;
      setGenerando(false);
    }
  }

  function aplicarPropuesta() {
    if (!propuesta.trim()) return;
    onAplicar(propuesta.trim());
    onCerrar();
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={generando ? undefined : onCerrar}>
      <section
        ref={dialogoRef}
        className={styles.dialogo}
        role="dialog"
        aria-modal="true"
        aria-busy={generando}
        aria-labelledby={tituloId}
        aria-describedby={descripcionId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.encabezado}>
          <div className={styles.iconoCabecera} aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div className={styles.titulos}>
            <span className={styles.sobretitulo}>Asistente de campo</span>
            <h2 id={tituloId} className={styles.titulo}>
              {config.titulo}
            </h2>
          </div>
          <button
            type="button"
            className={styles.cerrar}
            onClick={onCerrar}
            disabled={generando}
            aria-label="Cerrar asistente"
          >
            <X size={20} />
          </button>
        </header>

        <p id={descripcionId} className={styles.descripcion}>
          {config.descripcion} No necesitas redactarlo perfecto: empieza con ideas sueltas.
        </p>

        {valorActual.trim() && (
          <div className={styles.valorActual}>
            <span className={styles.etiquetaPequena}>Partimos de lo que ya escribiste</span>
            <p>{valorActual}</p>
          </div>
        )}

        <div className={styles.guia}>
          <div className={styles.guiaTitulo}>
            <Lightbulb size={18} aria-hidden="true" />
            <span>Para tu lluvia de ideas, piensa en esto</span>
          </div>
          <ul className={styles.preguntas}>
            {config.preguntas.map((pregunta) => (
              <li key={pregunta}>{pregunta}</li>
            ))}
          </ul>
        </div>

        <label className={styles.campoPrompt}>
          <span className={styles.etiqueta}>Tu prompt para la IA</span>
          <textarea
            ref={textareaRef}
            value={lluviaIdeas}
            onChange={(event) => setLluviaIdeas(event.target.value)}
            placeholder={config.ejemploPrompt}
            rows={5}
            maxLength={2000}
            disabled={generando}
          />
          <span className={styles.ayudaPrompt}>
            Escribe como te salga; el asistente se encarga de ordenar y pulir.
          </span>
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {propuesta && (
          <label className={styles.propuesta}>
            <span className={styles.propuestaTitulo}>
              <Check size={18} aria-hidden="true" />
              Propuesta para tu {config.nombreCampo}
            </span>
            <textarea
              value={propuesta}
              onChange={(event) => setPropuesta(event.target.value)}
              rows={campo === "datosVerificados" || campo === "mensaje" ? 5 : 3}
            />
            <span className={styles.ayudaPrompt}>Puedes editarla antes de aplicarla.</span>
          </label>
        )}

        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.botonCancelar}
            onClick={onCerrar}
            disabled={generando}
          >
            Cancelar
          </button>
          {propuesta ? (
            <>
              <button
                type="button"
                className={styles.botonSecundario}
                onClick={generarPropuesta}
                disabled={!puedeGenerar}
              >
                Generar otra
              </button>
              <button
                type="button"
                className={styles.botonPrimario}
                onClick={aplicarPropuesta}
                disabled={!propuesta.trim()}
              >
                Usar propuesta
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.botonPrimario}
              onClick={generarPropuesta}
              disabled={!puedeGenerar}
            >
              <Sparkles size={16} aria-hidden="true" />
              {generando ? "Creando propuesta…" : "Crear propuesta"}
            </button>
          )}
        </div>

        {!lluviaIdeas.trim() && !generando && (
          <p className={styles.estadoAccion} aria-live="polite">
            Cuéntanos al menos una idea para crear la propuesta.
          </p>
        )}
        {generando && (
          <p className={styles.estadoAccion} aria-live="polite">
            Ordenando tus ideas y cuidando el propósito del campo…
          </p>
        )}
      </section>
    </div>,
    document.body
  );
}
