// ============================================================
// components.js — Renderizado de UI
// Construye e inyecta marcado HTML dinámico en el DOM usando
// plantillas literales de ES6. Mantiene index.html limpio.
// ============================================================

/**
 * Inyecta la barra de navegación superior (estilo Copa Mundial).
 */
export function renderNav() {
    const nav = document.getElementById('app-nav');
    nav.innerHTML = `
        <nav class="main-nav">
            <span class="nav-logo">🏆 Copa Memoria | Mundial 2026</span>
            <div class="nav-actions">
                <button class="nav-btn active" data-action="componente">⚽ Partido</button>
                <button class="nav-btn" data-action="estadisticas">🏅 Ranking</button>
            </div>
        </nav>
    `;
}

/**
 * Inyecta el pie de página.
 */
export function renderFooter() {
    const footer = document.getElementById('app-footer');
    const year = new Date().getFullYear();
    footer.innerHTML = `
        <div class="main-footer">
            © ${year} Bryan · Copa Memoria ⚽ Desarrollado en Vanilla JS con fines académicos.
        </div>
    `;
}

/**
 * Marca la pestaña activa del nav (Componente / Estadísticas).
 */
export function setActiveTab(action) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.action === action);
    });
}

/**
 * Construye las cartas del tablero e inyecta los nodos en caliente.
 * Cada carta tiene anverso (imagen) y reverso (dorso) para el flip 3D.
 * @param {Array<{id:number, img:string}>} deck - mazo ya barajado
 */
export function renderBoard(deck) {
    const board = document.getElementById('game-board');
    board.innerHTML = deck.map((card, index) => `
        <button class="memory-card" data-index="${index}" data-id="${card.id}"
                aria-label="Carta ${index + 1}">
            <div class="card-inner">
                <div class="card-face card-back">⚽</div>
                <div class="card-face card-front">
                    <img src="${card.img}" alt="Jugador ${card.id}" draggable="false">
                </div>
            </div>
        </button>
    `).join('');
}

/**
 * Genera la tabla semántica del Top 10 y la inyecta en el DOM.
 * @param {Array} scores - registros ordenados de storage.js
 */
export function renderScoreboard(scores) {
    const container = document.getElementById('scoreboard-container');

    if (scores.length === 0) {
        container.innerHTML = `
            <p class="empty-scores">
                Aún no hay registros guardados.<br>¡Sé el primero en el ranking! 🎮
            </p>
        `;
        return;
    }

    const rows = scores.map((s, i) => `
        <tr>
            <td class="pos-${i + 1}">${i + 1}${medal(i + 1)}</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${s.level}</td>
            <td>${s.moves}</td>
            <td>${s.time}</td>
            <td>${s.date}</td>
            <td class="score-cell">${s.score}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table class="scores-table">
            <caption>Los 10 mejores registros guardados en este navegador</caption>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Fase</th>
                    <th>Mov.</th>
                    <th>Tiempo</th>
                    <th>Fecha</th>
                    <th>Puntos</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/** Medalla decorativa para los 3 primeros puestos. */
function medal(pos) {
    return { 1: ' 🥇', 2: ' 🥈', 3: ' 🥉' }[pos] || '';
}

/** Evita inyección de HTML en el nombre del jugador. */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
