import { COLORES, FUENTES } from '../config/GameConstants.js';

export default class TextButton extends Phaser.GameObjects.Text {
    // Añadimos 'usaFlechasHover' con valor por defecto 'true' para no romper los demás botones
    constructor(scene, x, y, text, fontSize = FUENTES.TAMANO_BTN_PEQUENO, callback, usaFlechasHover = true) {
        super(scene, x, y, text, { 
            fontFamily: FUENTES.PRINCIPAL, 
            fontSize: fontSize, 
            color: COLORES.TEXTO_PRINCIPAL,
            padding: { x: 20, y: 10 } 
        });

        this.setOrigin(0.5);
        this.setInteractive({ useHandCursor: true });
        
        this.originalText = text;

        // --- EVENTOS INTERNOS (Hover) ---
        this.on('pointerover', () => {
            this.setScale(1.1); // Siempre se hace grande
            if (usaFlechasHover) {
                this.setText(`>${this.originalText}<`); // Solo añade > < si está activado
            }
        });

        this.on('pointerout', () => {
            this.setScale(1); // Vuelve a su tamaño
            if (usaFlechasHover) {
                this.setText(this.originalText);
            }
        });

        // --- CLICK ---
        if (callback) {
            this.on('pointerdown', callback);
        }

        scene.add.existing(this);
    }

    actualizarTexto(nuevoTexto) {
        this.originalText = nuevoTexto;
        this.setText(nuevoTexto);
    }
}