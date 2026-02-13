// src/components/TextButton.js
import { COLORES, FUENTES } from '../config/GameConstants.js';

export default class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, fontSize = FUENTES.TAMANO_BTN_PEQUENO, callback) {
        super(scene, x, y, text, { 
            fontFamily: FUENTES.PRINCIPAL, 
            fontSize: fontSize, 
            color: COLORES.TEXTO_PRINCIPAL,
            padding: { x: 20, y: 10 } // Padding estándar que usabas
        });

        // Configuración básica
        this.setOrigin(0.5);
        this.setInteractive({ useHandCursor: true });
        
        // Guardamos el texto original para poder restaurarlo al quitar los símbolos > <
        this.originalText = text;

        // --- EVENTOS INTERNOS (Hover) ---
        this.on('pointerover', () => {
            this.setScale(1.1);
            this.setText(`>${this.originalText}<`); // Tu efecto de hover
        });

        this.on('pointerout', () => {
            this.setScale(1);
            this.setText(this.originalText);
        });

        // --- CLICK ---
        if (callback) {
            this.on('pointerdown', callback);
        }

        // Añadir a la escena automáticamente
        scene.add.existing(this);
    }

    // Método para cambiar el texto
    actualizarTexto(nuevoTexto) {
        this.originalText = nuevoTexto;
        this.setText(nuevoTexto);
    }
}