// src/config/GameConstants.js

export const COLORES = {
    TEXTO_PRINCIPAL: '#395436', // Verde oscuro característico
    TEXTO_ERROR: '#FF0000',     // Rojo para "No arrows" o "You lost"
    TEXTO_OSCURO: '#000000',    // Para puntuaciones
    BLANCO: '#ffffff',
    TINT_HOVER: 0xffff88,       // Amarillo al pasar ratón por territorio
    TINT_ERROR: 0xff0000,       // Rojo al dañar
    TINT_DISABLED: 0x888888     // Gris para cartas deshabilitadas
};

export const FUENTES = {
    PRINCIPAL: 'Diogenes',
    TAMANO_TITULO: '52px',
    TAMANO_BTN_GRANDE: '32px',
    TAMANO_BTN_MEDIO: '28px',
    TAMANO_BTN_PEQUENO: '27px',
    TAMANO_HUD: '27px'
};

// Mapa de vecinos (Adjacency List)
export const ADYACENCIAS = {
    'bekstenholm': ['klifstenvik', 'beknesvik', 'aenesholm', 'aestensand', 'bekdalsand', 'klifdalholm'],
    'klifstenvik': ['bekstenholm', 'klifdalholm', 'beknesvik'],
    'beknesvik':   ['bekstenholm', 'klifstenvik', 'aenesholm'],
    'aenesholm':   ['bekstenholm', 'beknesvik', 'aestensand'],
    'aestensand':  ['bekstenholm', 'aenesholm', 'bekdalsand'],
    'bekdalsand':  ['bekstenholm', 'aestensand', 'klifdalholm'],
    'klifdalholm': ['bekstenholm', 'bekdalsand', 'klifstenvik']
};

// Posiciones relativas (Porcentajes del ancho/alto de pantalla)
// Esto facilita ajustar la UI en un solo sitio
export const POSICIONES = {
    LOGO: { x: 0.795, y: 0.5 },
    LOGO_ES: { x: 0.82, y: 0.5 },
    
    // UI Derecha
    TEXTO_INSTRUCCIONES: { x: 0.82, y: 0.5 },
    BTN_DISCARD: { x: 0.81, y: 0.43 },
    BTN_MOVE: { x: 0.81, y: 0.50 },
    BTN_ATTACK: { x: 0.81, y: 0.57 },
    BTN_FIGHT: { x: 0.81, y: 0.54 },
    TEXTO_MELEE: { x: 0.81, y: 0.444 },
    
    // Botones de Confirmación de Ataque
    BTN_CANCEL: { x: 0.74, y: 0.555 },
    BTN_CONFIRM: { x: 0.88, y: 0.555 },
    FLECHAS_GASTO: { x: 0.855, y: 0.485 },
    ARROW_ICON: { x: 0.88, y: 0.45 },

    // HUD Izquierda
    HUD_FLECHAS: { x: 0.09, y: 0.55 },
    HUD_HORDAS: { x: 0.185, y: 0.866 },
    
    // Cartas
    DECK_HORDAS: { x: 0.12, y: 0.77 },
    DECK_ARQUERAS: { x: 0.12, y: 0.24 },
    QUIVER: { x: 0.12, y: 0.5 },
    
    // Monedas
    MONEDAS_BASE: { x: 0.785, y: 0.495 }
};

export const GAME_CONFIG = {
    MAX_HORDAS: 10,
    FLECHAS_INICIALES: 50,
    HORDAS_INICIALES: 10
};