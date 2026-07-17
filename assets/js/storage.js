// ============================================================
// storage.js — Servicio de Persistencia
// Wrapper exclusivo de la API localStorage del navegador.
// Guarda y recupera el ranking Top 10 sin base de datos.
// ============================================================

const STORAGE_KEY = 'top10';

/**
 * Recupera el arreglo de puntuaciones guardadas.
 * @returns {Array<{name, score, level, moves, time, date}>}
 */
export function getScores() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

/**
 * Guarda un nuevo registro, ordena por puntuación (mayor a menor)
 * y limita el resultado a los 10 mejores récords.
 * @param {object} record - { name, score, level, moves, time, date }
 */
export function saveScore(record) {
    const scores = getScores();
    scores.push(record);

    // Orden: mayor puntuación primero; si empatan, menor tiempo gana
    scores.sort((a, b) => b.score - a.score || a.seconds - b.seconds);

    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
}

/**
 * Elimina todos los registros del ranking.
 */
export function clearScores() {
    localStorage.removeItem(STORAGE_KEY);
}
