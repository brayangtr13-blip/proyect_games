# ⚽ Memorama App — Jugadores del Mundial

Juego de memoria (SPA) construido **sin frameworks** con HTML5 semántico, CSS3 y
JavaScript ES6 modular, siguiendo la arquitectura del curso *"De la Pizarra al Código"*.

## 📂 Arquitectura de directorios

```
memorama-app/
├── index.html              ← Punto de entrada único (orquestador)
└── assets/
    ├── css/
    │   ├── styles.css      ← Estilos globales: reset, variables :root, CSS Grid
    │   └── components.css  ← Micro-diseño: nav, cartas 3D, tabla top10, formulario
    ├── js/
    │   ├── app.js          ← Core controller: gameState, cronómetro, Fisher-Yates
    │   ├── storage.js      ← Wrapper de localStorage (clave 'top10')
    │   └── components.js   ← Inyección dinámica de UI (nav, footer, tablero, tabla)
    └── images/
        └── img1.png ... img10.png   ← Pool de 10 imágenes 400x400 px
```

## ✅ Requisitos cumplidos

| Requisito | Dónde está |
|---|---|
| 4 niveles de dificultad | `LEVELS` en `app.js` (4, 6, 8 y 10 pares) |
| Formulario jugador + puntuación | `#save-form` en `index.html` |
| Top 10 mejores registros | `storage.js` + tabla en `components.js` |
| 10 imágenes 400x400 | `assets/images/img1.png` … `img10.png` |
| Barajar al repartir y mostrarlas | `shuffle()` (Fisher-Yates) + `previewCards()` en `app.js` |
| Guardado sin base de datos | `localStorage` clave `'top10'` |
| Flip 3D de cartas | `components.css` (`preserve-3d`, `rotateY`, `backface-visibility`) |

## 🚀 Cómo ejecutarlo

El proyecto usa **módulos ES6** (`type="module"`), por lo que necesita un servidor
HTTP (no funciona con doble clic / `file://`).

**Opción A — VS Code + Live Server (recomendada):**
1. Abre la carpeta `memorama-app` en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho sobre `index.html` → **Open with Live Server**.

**Opción B — Python:**
```bash
cd memorama-app
python -m http.server 8000
```
Abre `http://localhost:8000` en el navegador.

## ✏️ Guía rápida de edición

- **Cambiar colores del tema** → `styles.css`, bloque `:root` (variables `--primary`, `--bg`, etc.).
- **Cambiar dificultad / niveles** → `app.js`, objeto `LEVELS` (pares y columnas).
- **Cambiar tiempo de memorización** → `app.js`, constante `PREVIEW_MS` (milisegundos).
- **Cambiar fórmula de puntuación** → `app.js`, función `calculateScore()`.
- **Reemplazar imágenes** → sustituye `assets/images/img1.png` … `img10.png`
  por tus propias imágenes de **400x400 px** (mismo nombre y formato).
- **Cambiar textos del nav/footer** → `components.js`, funciones `renderNav()` y `renderFooter()`.
- **Cambiar velocidad del flip** → `components.css`, `.card-inner { transition: transform 0.5s; }`.

## 🧠 Cómo funciona

1. `index.html` carga `app.js` como módulo; este importa `storage.js` y `components.js`.
2. Al elegir nivel, `app.js` toma N imágenes al azar del pool, las duplica (pares)
   y baraja el mazo con **Fisher-Yates**.
3. Las cartas se muestran boca arriba 3 segundos (*preview*), se voltean y arranca el cronómetro.
4. Cada par acertado suma; al completar todos, se calcula la puntuación
   (base por nivel − penalización por tiempo y movimientos).
5. El formulario guarda `{jugador, puntuación, nivel, tiempo, fecha}` en
   `localStorage` y la tabla muestra los **10 mejores** ordenados por puntos.
