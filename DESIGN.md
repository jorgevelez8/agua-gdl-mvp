# DESIGN.md — Reglas de diseño del producto

> Este archivo define cómo se ve y se siente **Campaña**, la herramienta.
> Es de lectura obligatoria antes de tocar cualquier pantalla, componente o flujo de la interfaz.
> No aplica al render de las piezas generadas (eso vive en `pieceTemplate.tsx` y los temas).

---

## 0. FUENTE DE VERDAD

- Todo estilo deriva de `brand.json` / `design.tokens.css` / `tokens.ts`.
- Prohibido hardcodear color, fuente, radio o espaciado dentro de un componente.
- Si falta un token, se **agrega al sistema** — nunca se inventa un valor local.

---

## 1. LAS DOS MARCAS (no mezclar)

Este producto maneja dos identidades distintas. Confundirlas es un error conceptual, no cosmético.

| | Qué es | Dónde vive |
|---|---|---|
| **Marca del producto** | `public/brand/logo.png` + el nombre **Campaña** | Solo en la **interfaz** (`page.tsx`, encabezado) |
| **Marca del cliente** | Lockup "AGUA GDL" + gota, con su disclaimer de placeholder | Solo **dentro de las piezas generadas** |

- `logo.png` **NO** entra a `pieceTemplate.tsx` ni a ningún render de pieza.
- El lockup del cliente **NO** aparece en la interfaz como si fuera la marca del producto.
- La herramienta es **genérica**: cualquier organización puede usarla. Por eso el logo no tiene motivo de agua, y está bien así.

### Encabezado

- El encabezado lleva el **logo + "Campaña"**.
- El cliente actual ("Agua Guadalajara") se muestra como **proyecto activo**, con discreción — un chip o una línea secundaria, nunca como título principal.

---

## 2. NORTE ESTÉTICO

- Referencia: **Apple** (aire, jerarquía, superficies suaves) + **Vercel** (disciplina tipográfica).
- **NO Linear** — su densidad de información contradice el resto de estas reglas.
- Interfaz en **claro**. Las piezas generadas son mayormente oscuras y deben lucir sobre ella.

---

## 3. ELEMENTO DE CARÁCTER

> Un minimalismo sin ancla es un formulario blanco. Este producto tiene **una** cosa que lo hace memorable.

**El momento de la generación es el protagonista.**

- El usuario escribe una línea y salen tres piezas profesionales. Ese instante es el corazón del producto y debe tratarse como tal.
- Los resultados **no** son un anexo debajo del formulario: son la pantalla.
- La generación tarda segundos reales — hay tiempo que llenar. El estado de carga no es adorno, es respuesta a una necesidad: nada de spinner genérico.
- Las tres piezas entran **escalonadas** (post → story → banner), con transición suave. Sin rebotes ni efectos llamativos.
- La descarga es una acción limpia y evidente, no un link de texto.

**Soporte:** tipografía con presencia en el encabezado, y todo lo demás en silencio alrededor. El contraste entre un título con peso y una interfaz callada es lo que sostiene el conjunto.

**No hacer:** el logo como marca de agua gigante de fondo. Es el recurso que más rápido se lee como templado.

---

## 4. RESTRICCIONES DURAS (verificables)

Estas son falsables: se pueden revisar en el código y en el render.

1. **Espaciado**: múltiplos de 4px. Ningún valor suelto.
2. **Escala tipográfica**: máximo **4 tamaños** en toda la app.
3. **Un solo color de acento** en pantalla. El botón primario es el único elemento con color saturado.
4. **Radios y sombras**: un valor de cada uno, tomado del sistema. Sombras casi imperceptibles. Sin bordes duros.
5. **Contraste mínimo AA (4.5:1)** en todo texto.

---

## 5. FLUJO

1. Antes de implementar: ¿se puede resolver con menos elementos? Si sí, **esa** es la versión.
2. Cada vista debe parecer parte del mismo producto. Nada de interfaces tipo CRUD o Bootstrap.
3. **Estados obligatorios** en toda acción: idle, loading, éxito, error, vacío, deshabilitado.
4. Un botón deshabilitado debe comunicar **por qué** lo está, no solo verse gris.

---

## 6. INGENIERÍA

1. Componentes reutilizables. Sin estilos ad-hoc por pantalla.
2. Responsive real: verificar en ancho de móvil, no solo desktop.
3. Acentos y caracteres especiales siempre en UTF-8 correcto. Verificar que no aparezca mojibake en el render.

---

## 7. VERIFICACIÓN (no negociable)

> Toda esta sesión demostró que el reporte no equivale a lo que se renderiza.

1. Ninguna pantalla se da por terminada sin **abrirla renderizada y mirarla**.
2. Type-check **no** es verificación.
3. Verificar en **producción**, no solo en local. Hacer hard-refresh: el caché ya engañó una vez.
4. Si algo no se puede verificar visualmente, decirlo — no darlo por hecho.
