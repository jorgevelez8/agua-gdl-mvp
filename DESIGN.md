# DESIGN.md — Reglas de diseño del producto

> Este archivo define cómo se ve y se siente **Campaña**, la herramienta.
> Es de lectura obligatoria antes de tocar cualquier pantalla, componente o flujo de la interfaz.
> No aplica al render de las piezas generadas (eso vive en `pieceTemplate.tsx` y los temas).

---

## 0. FUENTE DE VERDAD

- Todo estilo deriva de `src/design-system/tokens.css` — es el único archivo de tokens del producto, ya implementado. No hay `brand.json` ni `tokens.ts` separados: no migrar de stack, no introducir Tailwind ni shadcn. El sistema de tokens actual es la base sobre la que se construye todo lo que sigue en este documento.
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

## 2. CONCEPTO CENTRAL: UN COPILOTO, NO UN FORMULARIO

> Este es el cambio de dirección más importante del producto. Todo lo demás en este documento se lee a la luz de esto.

**Campaña** deja de ser un formulario que se completa y pasa a ser un copiloto creativo que se conversa.

- La pantalla gira alrededor de **una sola pregunta**: "¿Qué campaña querés crear hoy?"
- Esa pregunta vive en una **caja de texto protagonista**, donde el usuario describe la campaña en lenguaje natural — no en campos separados que hay que saber llenar.
- Los campos individuales de antes (mensaje puntual, link/CTA, datos verificados) **no desaparecen**, pero pasan a ser **opciones avanzadas plegadas** — la vía para quien quiere precisión, no la vía principal para llegar a un resultado.
- El objetivo de esta pantalla es que alguien que nunca usó la herramienta entienda en un vistazo qué hacer, sin leer una etiqueta de campo.

Esto no reemplaza la regla de la sección 3 sobre los resultados — la extiende. Ahora hay **dos momentos protagonistas**, no uno:

1. **La pregunta**, al empezar.
2. **Los resultados**, al terminar.

Todo lo demás — opciones avanzadas, chips de personalización, texto de ayuda — se mantiene en silencio alrededor de esos dos momentos.

---

## 3. NORTE ESTÉTICO

- Referencia: **Apple** (aire, jerarquía, superficies suaves) + **Vercel** (disciplina tipográfica).
- **NO Linear** — su densidad de información contradice directamente el corazón de esta dirección: menos campos, más aire. Cuantas más opciones se vean a la vez, más se parece a un panel de administración y menos a un copiloto.
- **Sin emojis en la interfaz.** La iconografía es **Lucide**. Donde una referencia externa o un ejemplo pida un emoji en un botón, chip o mensaje, va un ícono de Lucide en su lugar — nunca el emoji literal.
- Interfaz en **claro**, con un fondo de gradiente muy suave — `linear-gradient(180deg, #FAFAFA, #F4F7FC)` — en vez de un gris plano, y un glow muy tenue (mismo acento del producto, a baja opacidad) detrás del contenido principal. Sigue siendo "claro": el gradiente y el glow son textura, no un cambio de paleta. Las piezas generadas son mayormente oscuras y deben lucir sobre esta base.
- Cards con radio amplio (más generoso que un radio discreto de formulario clásico — a calibrar y verificar en la implementación, partiendo de ~20px), sombras suaves, y mucho aire entre bloques. El radio amplio es **el mismo valor de radio del sistema** aplicado a todo — ver restricción dura §5.4, no se crea un radio especial para las cards.

---

## 4. ELEMENTO DE CARÁCTER

> Un minimalismo sin ancla es un formulario blanco. Este producto tiene **dos** cosas que lo hacen memorable: la pregunta y la respuesta.

**El momento de la generación es el protagonista — pero ya no es el único.**

- **Antes de generar:** la pregunta "¿Qué campaña querés crear hoy?" es el elemento con más presencia de la pantalla. No es un placeholder discreto de un textarea más — es el titular de la vista. El microcopy alrededor **inspira, no administra**: "Transformá una idea en una campaña profesional", no "Generá tus piezas".
- El usuario describe una campaña en una frase y salen tres piezas profesionales. Ese instante es el corazón del producto y debe tratarse como tal.
- **Después de generar:** los resultados **no** son un anexo debajo del formulario: son la pantalla. Esto no cambió con la nueva dirección — se reafirma.
- La generación tarda segundos reales — hay tiempo que llenar. El estado de carga no es adorno, es respuesta a una necesidad: nada de spinner genérico. Ver también §6, "lo que no se puede prometer".
- Las tres piezas entran **escalonadas** (post → story → banner), con transición suave. Sin rebotes ni efectos llamativos.
- La descarga es una acción limpia y evidente, no un link de texto.
- Las opciones de personalización (tema, formato, extras) se resuelven con **chips modernos**, no con `<select>` ni inputs clásicos — ver §5.6.

**Soporte:** tipografía con presencia en los dos momentos protagonistas, y todo lo demás en silencio alrededor: opciones avanzadas, chips, texto de ayuda. El contraste entre un título con peso y una interfaz callada es lo que sostiene el conjunto.

**No hacer:** el logo como marca de agua gigante de fondo. Es el recurso que más rápido se lee como templado.

---

## 5. RESTRICCIONES DURAS (verificables)

Estas son falsables: se pueden revisar en el código y en el render.

1. **Espaciado**: múltiplos de 4px. Ningún valor suelto.
2. **Escala tipográfica**: máximo **4 tamaños** en toda la app. La pregunta protagonista y el título de resultados comparten el mismo tamaño "hero" del sistema — no se agrega un quinto tamaño para la pregunta.
3. **Un solo color de acento** en pantalla. El botón primario es el único elemento con color saturado. El glow de fondo (§3) es ese mismo acento a baja opacidad — no cuenta como un segundo color.
4. **Radios y sombras**: un valor de cada uno, tomado del sistema. Sombras casi imperceptibles. Sin bordes duros. Los chips (§5.6) usan **el mismo radio compartido** — no un radio tipo píldora aparte. Si el radio del sistema sube para lograr el look "amplio" de §3, sube para todo: cards, botones, inputs y chips por igual.
5. **Contraste mínimo AA (4.5:1)** en todo texto.
6. **Chips en vez de controles clásicos**: tema, formato y opciones de personalización se eligen con chips seleccionables (estado seleccionado = el acento del producto), no con `<select>` ni checkboxes de formulario tradicional. Los chips heredan tipografía, radio y espaciado del sistema — no inventan los suyos.

---

## 6. LO QUE NO SE PUEDE PROMETER

> Dejarlo escrito para no pedirlo ni prometerlo más adelante por error.

- **No puede existir vista previa en vivo de las piezas mientras el usuario escribe.** Cada generación llama a Groq/GPT-OSS 120B y renderiza con Satori — tarda segundos reales y consume cuota de tokens. No hay forma de mostrar un preview "en caliente" a medida que se tipea sin disparar esa llamada.
- Lo máximo posible mientras se genera es mostrar el **frame vacío de cada formato** (post 1:1, story 9:16, banner 1200×628) — que es exactamente lo que ya hacen los placeholders del estado de carga. No se agrega nada más ambicioso que eso.

---

## 7. DATOS REALES DEL PRODUCTO (no inventar otros)

Cualquier copy, mockup o referencia externa que mencione datos distintos a estos está desactualizada o mal — corregir contra esto, no contra la fuente externa.

- **Temas visuales, exactamente 4**: Corriente, Papel, Bloque, Marea. No existen "Minimal" ni "Editorial" como temas del sistema.
- **Formatos, exactamente 3**: Post (1:1), Story (9:16), Banner (1200×628). No hay formatos separados de "Instagram" o "Facebook" — son los mismos 3 formatos para cualquier destino.
- Bloque es, por decisión de diseño ya tomada y verificada, el único tema sin soporte de foto de fondo (`photoSupported: false` en `registry.ts`) — no es un olvido, es intencional.

---

## 8. FLUJO

1. Antes de implementar: ¿se puede resolver con menos elementos? Si sí, **esa** es la versión. La pregunta única de §2 es la expresión máxima de esta regla — no la excepción a ella.
2. Cada vista debe parecer parte del mismo producto. Nada de interfaces tipo CRUD o Bootstrap.
3. **Estados obligatorios** en toda acción: idle, loading, éxito, error, vacío, deshabilitado.
4. Un botón deshabilitado debe comunicar **por qué** lo está, no solo verse gris.

---

## 9. INGENIERÍA

1. Componentes reutilizables. Sin estilos ad-hoc por pantalla.
2. Responsive real: verificar en ancho de móvil, no solo desktop.
3. Acentos y caracteres especiales siempre en UTF-8 correcto. Verificar que no aparezca mojibake en el render.

---

## 10. BACKLOG (no implementar ahora)

Ideas válidas, fuera de alcance mientras la app no tenga persistencia de estado real.

- Historial de campañas generadas.
- Command palette.
- Undo / redo.
- Autoguardado de lo que se está escribiendo.
- Drag & drop de imágenes propias (más allá de la búsqueda en Pexels).
- Atajos de teclado.

Todo esto requiere algún tipo de persistencia (base de datos, storage local serio) que la app hoy no tiene. No se empieza a construir nada de esta lista sin decidir antes esa pieza de infraestructura.

---

## 11. VERIFICACIÓN (no negociable)

> El reporte nunca equivale a lo que se renderiza.

1. Ninguna pantalla se da por terminada sin **abrirla renderizada y mirarla**.
2. Type-check **no** es verificación.
3. Verificar en **producción**, no solo en local. Hacer hard-refresh: el caché ya engañó una vez.
4. Si algo no se puede verificar visualmente, decirlo — no darlo por hecho.
