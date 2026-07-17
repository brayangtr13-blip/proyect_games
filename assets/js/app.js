// ============================================================
// app.js — Core Controller de la Aplicación
// Orquestador central: estado del juego, cronómetro,
// barajado Fisher-Yates y lógica de emparejamiento.
// ============================================================

import { getScores, saveScore, clearScores } from './storage.js';
import { renderNav, renderFooter, renderBoard, renderScoreboard, setActiveTab } from './components.js';

// ----- Configuración de niveles -----
// pairs: pares a encontrar | cols: columnas del CSS Grid
const LEVELS = {
    1: { pairs: 4,  cols: 4, name: 'Grupos' },       // 8 cartas  (4x2)
    2: { pairs: 6,  cols: 4, name: 'Octavos' },      // 12 cartas (4x3)
    3: { pairs: 8,  cols: 4, name: 'Semifinal' },    // 16 cartas (4x4)
    4: { pairs: 10, cols: 5, name: 'La Final' }      // 20 cartas (5x4)
};

const TOTAL_IMAGES = 10;         // pool: img1.png ... img10.png
const PREVIEW_MS = 3000;         // tiempo que se muestran las cartas al repartir

// ----- Estado del juego (variables críticas en caliente) -----
const gameState = {
    level: 2,
    playing: false,    // hay una partida en curso
    deck: [],
    firstCard: null,   // primera carta seleccionada
    lockBoard: false,  // bloqueo lógico durante comparación/preview
    moves: 0,
    matchedPairs: 0,
    seconds: 0,
    timerId: null,
    previewId: null
};

// ============================================================
// NAVEGACIÓN ENTRE VISTAS (SPA)
// ============================================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ============================================================
// BARAJADO — Algoritmo Fisher-Yates
// ============================================================
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================================
// INICIO / REINICIO DE PARTIDA
// ============================================================
function startGame() {
    // Nivel según la pill de dificultad activa (fase del torneo)
    const activePill = document.querySelector('#difficulty-group .pill.active');
    const level = Number(activePill.dataset.level);
    const config = LEVELS[level];

    // Reiniciar estado
    gameState.level = level;
    gameState.playing = true;
    gameState.firstCard = null;
    gameState.lockBoard = true; // bloqueado durante el preview
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.seconds = 0;
    stopTimer();
    clearTimeout(gameState.previewId);
    document.getElementById('stat-timer').textContent = formatTime(0);

    // Elegir imágenes al azar del pool y duplicarlas (pares)
    const imageIds = shuffle(
        Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1)
    ).slice(0, config.pairs);

    const deck = imageIds.flatMap(id => [
        { id, img: `./assets/images/img${id}.png` },
        { id, img: `./assets/images/img${id}.png` }
    ]);

    // Barajar el mazo completo antes de repartir
    gameState.deck = shuffle(deck);

    // Ajustar columnas del CSS Grid según el nivel
    document.documentElement.style.setProperty('--grid-cols', config.cols);

    // Renderizar interfaz
    renderBoard(gameState.deck);
    updateStats();

    // Preview: mostrar todas las cartas, luego ocultarlas y arrancar
    previewCards();
}

/**
 * Al repartir: muestra las cartas barajadas unos segundos
 * para que el jugador las memorice, luego las voltea.
 */
function previewCards() {
    const cards = document.querySelectorAll('.memory-card');
    const msg = document.getElementById('preview-message');

    msg.textContent = '👀 ¡Memoriza las cartas!';
    cards.forEach(c => c.classList.add('flipped'));

    gameState.previewId = setTimeout(() => {
        cards.forEach(c => c.classList.remove('flipped'));
        msg.textContent = '';
        gameState.lockBoard = false;
        startTimer();
    }, PREVIEW_MS);
}

// ============================================================
// LÓGICA DE VOLTEO Y EMPAREJAMIENTO
// ============================================================
function onCardClick(cardEl) {
    if (!gameState.playing || gameState.lockBoard) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    cardEl.classList.add('flipped');

    if (!gameState.firstCard) {
        // Primera carta del turno
        gameState.firstCard = cardEl;
        return;
    }

    // Segunda carta: contar movimiento y comparar
    gameState.moves++;
    updateStats();

    const first = gameState.firstCard;
    const isMatch = first.dataset.id === cardEl.dataset.id;

    if (isMatch) {
        first.classList.add('matched');
        cardEl.classList.add('matched');
        gameState.firstCard = null;
        gameState.matchedPairs++;
        updateStats();

        if (gameState.matchedPairs === LEVELS[gameState.level].pairs) {
            finishGame();
        }
    } else {
        // No coinciden: bloquear y voltear de regreso
        gameState.lockBoard = true;
        setTimeout(() => {
            first.classList.remove('flipped');
            cardEl.classList.remove('flipped');
            gameState.firstCard = null;
            gameState.lockBoard = false;
        }, 900);
    }
}

// ============================================================
// CRONÓMETRO (setInterval / clearInterval) — formato HH:MM:SS
// ============================================================
function startTimer() {
    stopTimer();
    gameState.timerId = setInterval(() => {
        gameState.seconds++;
        document.getElementById('stat-timer').textContent = formatTime(gameState.seconds);
    }, 1000);
}

function stopTimer() {
    if (gameState.timerId) {
        clearInterval(gameState.timerId);
        gameState.timerId = null;
    }
}

function formatTime(totalSeconds) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ============================================================
// ESTADÍSTICAS EN VIVO
// ============================================================
function updateStats() {
    document.getElementById('stat-moves').textContent = gameState.moves;
    document.getElementById('stat-pairs').textContent =
        `${gameState.matchedPairs}/${LEVELS[gameState.level].pairs}`;
}

// ============================================================
// PUNTUACIÓN
// Base por nivel - penalización por tiempo y movimientos extra
// ============================================================
function calculateScore() {
    const config = LEVELS[gameState.level];
    const base = config.pairs * 100 + gameState.level * 500;
    const timePenalty = gameState.seconds * 2;
    const movePenalty = Math.max(0, gameState.moves - config.pairs) * 10;
    return Math.max(100, base - timePenalty - movePenalty);
}

// ============================================================
// FIN DE PARTIDA → MODAL CON FORMULARIO DE GUARDADO
// ============================================================
function finishGame() {
    stopTimer();
    gameState.playing = false;
    const score = calculateScore();

    document.getElementById('win-level').textContent = LEVELS[gameState.level].name;
    document.getElementById('win-moves').textContent = gameState.moves;
    document.getElementById('win-time').textContent = formatTime(gameState.seconds);
    document.getElementById('win-score').textContent = score;
    document.getElementById('input-score').value = score;

    // Pequeña pausa para que se vea el último par encontrado
    setTimeout(() => {
        document.getElementById('win-modal').classList.remove('hidden');
        document.getElementById('input-name').focus();
    }, 800);
}

function onSaveSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('input-name').value.trim();
    if (!name) return;

    saveScore({
        name,
        score: Number(document.getElementById('input-score').value),
        level: LEVELS[gameState.level].name,
        moves: gameState.moves,
        seconds: gameState.seconds,
        time: formatTime(gameState.seconds),
        date: new Date().toLocaleDateString('es-CO')
    });

    document.getElementById('save-form').reset();
    document.getElementById('win-modal').classList.add('hidden');
    showScores();
}

// ============================================================
// VISTA ESTADÍSTICAS (TOP 10)
// ============================================================
function showScores() {
    renderScoreboard(getScores());
    setActiveTab('estadisticas');
    showScreen('screen-scores');
}

function showGame() {
    setActiveTab('componente');
    showScreen('screen-game');
}

// ============================================================
// EVENTOS GLOBALES (delegación)
// ============================================================
function bindEvents() {
    // Pills de dificultad: marcar la fase seleccionada
    document.getElementById('difficulty-group').addEventListener('click', e => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        document.querySelectorAll('#difficulty-group .pill').forEach(p =>
            p.classList.remove('active'));
        pill.classList.add('active');
    });

    // Botones KICK OFF y REINICIAR
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);

    // Clic en cartas (delegación sobre el tablero)
    document.getElementById('game-board').addEventListener('click', e => {
        const card = e.target.closest('.memory-card');
        if (card) onCardClick(card);
    });

    // Formulario de guardado
    document.getElementById('save-form').addEventListener('submit', onSaveSubmit);

    // Pestañas del nav dinámico (Componente / Estadísticas)
    document.getElementById('app-nav').addEventListener('click', e => {
        const action = e.target.dataset.action;
        if (action === 'componente') showGame();
        if (action === 'estadisticas') showScores();
    });

    // Acciones de la vista Estadísticas
    document.getElementById('btn-play-again').addEventListener('click', showGame);

    document.getElementById('btn-clear-scores').addEventListener('click', () => {
        if (confirm('¿Borrar todos los registros del ranking?')) {
            clearScores();
            renderScoreboard([]);
        }
    });
}

// ============================================================
// ARRANQUE DE LA APLICACIÓN
// ============================================================
renderNav();
renderFooter();
bindEvents();
showGame();
