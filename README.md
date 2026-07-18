# Agua GDL — Generador de campaña (MVP para el reto "Las Diez")

Herramienta que, a partir de **un mensaje de campaña** (ej. "hierve el agua antes de consumirla"), genera automáticamente 3 piezas gráficas listas para publicar en redes — **post cuadrado (1:1)**, **story vertical (9:16)** y **banner horizontal** — todas con la misma identidad visual (paleta, tipografía, ícono), usando IA para redactar el copy de cada formato.

**Demo en vivo:** https://agua-gdl-mvp.vercel.app
**Spec de diseño original:** [`docs/superpowers/specs/2026-07-17-generador-campana-agua-design.md`](docs/superpowers/specs/2026-07-17-generador-campana-agua-design.md)

Este README asume que **no sabés nada de este proyecto todavía** — seguí los pasos en orden.

---

## 1. Qué necesitás instalado (una sola vez)

- **Node.js 20 o superior** — descargalo de [nodejs.org](https://nodejs.org) (elegí la versión LTS). Trae `npm` incluido.
- **Git** — para clonar el repo. Si podés correr `git --version` en tu terminal, ya lo tenés.
- Un editor de código (VS Code, Cursor, lo que uses).

No necesitás instalar nada de Python, Docker, ni bases de datos — esto es 100% Node.js/Next.js sin servidor propio.

## 2. Clonar el proyecto

```bash
git clone https://github.com/jorgevelez8/agua-gdl-mvp.git
cd agua-gdl-mvp
npm install
```

`npm install` va a bajar todas las dependencias (Next.js, React, el SDK de Anthropic). Tarda 1-2 minutos.

## 3. Conseguir una API key de Anthropic (Claude) — **obligatorio**

Sin esto, la generación de copy no funciona (las imágenes sí se pueden ver, pero vacías).

1. Andá a **https://console.anthropic.com** y creá una cuenta (o pedime que te pase acceso a la que ya estamos usando — preguntame por WhatsApp).
2. En el dashboard, sección **API Keys**, generá una nueva key (empieza con `sk-ant-...`).
3. En la raíz del proyecto (`agua-gdl-mvp/`) hay un archivo `.env.local.example`. Copialo y renombrá la copia a **`.env.local`** (así, con el punto adelante, sin `.example`):

   ```bash
   cp .env.local.example .env.local
   ```

   Abrí `.env.local` y reemplazá el valor de ejemplo por tu key real:

   ```
   ANTHROPIC_API_KEY=sk-ant-tu-key-aca
   ```

   Este archivo **nunca se sube a git** (está en `.gitignore` a propósito, porque es una credencial). Cada persona que trabaje en el proyecto necesita su propia copia local de este archivo.

4. (Opcional) Para la **foto de fondo** de las piezas necesitás también una key de **Pexels** (gratis, sin aprobación manual — a diferencia de Unsplash) en `PEXELS_API_KEY`, en el mismo `.env.local`. Sacala en https://www.pexels.com/api/. Sin esta key, todo lo demás funciona igual — el toggle de foto solo no va a andar.

## 4. Correrlo en tu compu

```bash
npm run dev
```

Abrí **http://localhost:3000** en el navegador. Deberías ver el formulario: un campo de mensaje de campaña, un campo opcional de link, y un campo opcional de "datos verificados". Escribí algo y tocá "Generar piezas" — si la API key está bien configurada, en unos segundos aparecen las 3 imágenes con botón de descarga.

Si ves un error de "No se pudo generar el contenido", revisá que `.env.local` tenga la key bien copiada (sin espacios, sin comillas) y que hayas **reiniciado** `npm run dev` después de crear/editar ese archivo (las variables de entorno solo se leen al arrancar).

## 5. Cómo está armado el proyecto (para no perderte)

```
src/
├── app/
│   ├── page.tsx                        ← la página única con el formulario (mensaje, tema, toggle de foto)
│   ├── page.module.css                 ← estilos de esa página
│   └── api/
│       ├── generar-campana/route.ts    ← llama a Claude, devuelve el copy de las 3 piezas + una keyword sugerida para la foto
│       ├── buscar-foto/route.ts        ← busca una foto en Pexels a partir de esa keyword (editable en la UI)
│       └── imagen/[formato]/route.tsx  ← renderiza cada pieza a PNG (usa Satori, viene incluido en Next.js — no es una librería aparte)
├── lib/
│   └── pexels.ts                       ← cliente de la API de Pexels
├── design/                             ← EL SISTEMA DE DISEÑO, todo vive acá
│   ├── campaign.ts                     ← texto de campaña (eyebrow/nombre de marca) — igual en los 4 temas, no es parte del skin visual
│   ├── themes/                         ← un archivo por tema (corriente.ts, papel.ts, bloque.ts, marea.ts) + registry.ts (qué temas existen) + types.ts (el contrato)
│   ├── scale.ts                        ← helper de unidades (cqw → px)
│   ├── fit.ts                          ← lógica de "que el texto nunca se desborde" (achica la fuente o trunca)
│   ├── layoutSpecs.ts                  ← medidas exactas (anchos, tamaños mín/máx) de cada uno de los 3 formatos, por tema
│   └── pieceTemplate.tsx               ← los componentes visuales (título, chip de dato, botón CTA, logo, foto de fondo) y cómo se arman en post/story/banner
public/fonts/<tema>/                    ← las tipografías de cada tema como archivos .ttf, en su propia carpeta
```

**Si vas a cambiar el diseño de un tema** (colores, tipografía, radios): tocá su archivo en `src/design/themes/`, no busques estilos sueltos en otros lados — todo se alimenta de ahí. **Si vas a agregar un tema nuevo**: copiá la estructura de `themes/papel.ts`, descargá sus fuentes a `public/fonts/<id>/`, y registralo en `themes/registry.ts`.

**Si vas a cambiar qué le pedimos a la IA** (el copy que genera, o cómo arma la keyword de la foto): es `src/app/api/generar-campana/route.ts`.

**Foto de fondo:** hoy solo el tema **Corriente** tiene overlay de legibilidad calibrado (`photoOverlay` en `themes/corriente.ts`) — por eso el toggle está deshabilitado para los otros 3 temas en la UI (`photoSupported: false` en `registry.ts`). Para sumarle foto a otro tema, hay que definirle su propio `photoOverlay` (un fondo claro como Papel necesita un overlay muy distinto a uno oscuro) y marcar `photoSupported: true`.

## 6. Cómo hacer deploy (mandar cambios a producción)

El proyecto ya está conectado a Vercel bajo mi cuenta. Si querés que puedas desplegar vos directamente:

1. Te agrego como colaborador en el proyecto de Vercel (pedímelo).
2. Con eso, `npx vercel --prod` desde la carpeta del proyecto ya publica.

Si preferís no tocar el deploy y que yo lo suba cuando me pases tus cambios por git, también funciona así — avisame qué preferís.

**Importante:** si trabajás con tu propia cuenta de Vercel en vez de la mía, tenés que configurar las variables `ANTHROPIC_API_KEY` y `PEXELS_API_KEY` ahí también (Project Settings → Environment Variables) — el `.env.local` de tu compu no viaja al servidor.

## 7. Qué falta / dónde meterle mano

Esto es un MVP hecho en unas horas para el reto, no un producto terminado. Cosas pendientes, de más a menos importante:

1. **Identidad visual real** — hoy todo (paleta azul, logo de gota, nombre "AGUA GDL") es un *placeholder* explícito (se ve el aviso "identidad placeholder — demo" en cada pieza). Si el equipo consigue el manual de marca real del programa de Guadalajara/SIAPA, hay que reemplazar los valores en `src/design/brand.json` — el resto del sistema se actualiza solo.
2. **Grounding real de datos** — el campo "datos verificados" del formulario existe para que el copy generado no invente cifras, pero hoy es texto libre que cada usuario pega a mano. Sería mejor si viniera pre-cargado con los datos reales del programa (filtros, pastillas de cloro, tinacos, etc.) en vez de depender de que cada persona los escriba bien.
3. **Sin tests automatizados** — todo se probó a mano generando PNGs y mirándolos. Si el proyecto crece, valdría la pena algo de testing.
4. **Sin historial/persistencia** — cada generación es de un solo uso, no se guardan las campañas anteriores. Si el equipo quiere reusar mensajes o llevar un registro, hace falta agregar una base de datos (hoy no hay ninguna).

## 8. Si algo no funciona

Escribime por WhatsApp con: qué comando corriste, y el mensaje de error completo (copiá y pegá el texto de la terminal, no solo "no funciona"). El 90% de los problemas van a ser: (a) falta `.env.local`, (b) no se reinició `npm run dev` después de crearlo, o (c) versión vieja de Node.
