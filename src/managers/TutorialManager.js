import { FUENTES } from '../config/GameConstants.js';

export default class TutorialManager {
    constructor(scene) {
        this.scene = scene;
        this.step = 0; // Estado actual del tutorial
        this.bloquearJuego = true; // [NUEVO] Controla si se puede interactuar con el tablero

        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        // --- UI DEL TUTORIAL ---
        // Panel oscuro en la parte inferior
        this.bg = this.scene.add.rectangle(w / 2, h - 60, 900, 100, 0x000000, 0.85).setDepth(1000);
        
        // Texto de instrucciones
        this.texto = this.scene.add.text(w / 2, h - 60, '', {
            fontFamily: FUENTES.PRINCIPAL,
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(1001);

        // Botón "Siguiente" para los pasos que son solo de leer
        this.btnNext = this.scene.add.text(w / 2 + 380, h - 30, 'Next >', {
            fontFamily: FUENTES.PRINCIPAL, fontSize: '24px', color: '#ffcc00'
        }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });
        
        this.btnNext.on('pointerdown', () => this.nextStep());

        // Iniciar el primer paso
        this.ejecutarPaso();
    }

    ejecutarPaso() {
        switch(this.step) {
            case 0:
                this.bloquearJuego = true; // Solo leer
                this.texto.setText("Welcome to Archers of Nand!\nYour goal is to defend the territories from the Orc hordes.");
                this.btnNext.setVisible(true);
                break;
            case 1:
                this.bloquearJuego = false; // Permitir jugar
                this.texto.setText("PHASE 1: DEPLOYMENT.\nClick on any territory to place a Warrior to defend it.");
                this.btnNext.setVisible(false); // Ocultamos 'Next' porque el jugador DEBE hacer clic en un territorio
                break;
            case 2:
                this.bloquearJuego = false;
                this.texto.setText("PHASE 2: THE HORDE.\nClick on the coins to flip them. The colors will determine where the Orcs attack.");
                this.btnNext.setVisible(false); // Esperamos a que tire las monedas
                break;
            case 3:
                this.bloquearJuego = false;
                this.texto.setText("PHASE 3: ACTION.\nSelect one of your Attack Cards to shoot arrows at the Orcs.");
                this.btnNext.setVisible(false); // Esperamos a que seleccione una carta
                break;
            case 4:
                this.bloquearJuego = false;
                this.texto.setText("Configure your attack and check the Arrow Cost on the right.\nThen, click 'Attack' to shoot! Do this with two cards.");
                this.btnNext.setVisible(false); // Esperamos a que confirme el ataque
                break;
            case 5:
                this.bloquearJuego = false;
                this.texto.setText("PHASE 4: MELEE FIGHT.\nIf Orcs and Warriors share a territory, they will fight. Click 'FIGHT' to resolve.");
                this.btnNext.setVisible(false); // Esperamos a que pulse FIGHT
                break;
            case 6:
                this.bloquearJuego = true;
                this.texto.setText("Round complete! Survive all hordes without losing 4 territories to win.\nGood luck!");
                this.btnNext.setVisible(true);
                break;
            case 7:
                this.bloquearJuego = false;
                this.bg.destroy();
                this.texto.destroy();
                this.btnNext.destroy();
                // [NUEVO] El jugador ya ha leído el final, terminamos la ronda para ir a la pantalla de victoria
                this.scene.scene.start('Menu');
                break;
        }
    }

    nextStep() {
        this.step++;
        this.ejecutarPaso();
    }

    // Método que llamaremos desde Board.js cuando el jugador haga la acción correcta
    avanzarSiEstaEnPaso(pasoEsperado) {
        if (this.step === pasoEsperado) {
            this.scene.time.delayedCall(500, () => { // Pequeño delay para que no sea tan brusco
                this.nextStep();
            });
        }
    }

    // ==========================================
    // NUEVO: SISTEMA DE BLOQUEO Y AVISO VISUAL
    // ==========================================
    mostrarAviso(mensaje) {
        // [NUEVO] Si ya estamos mostrando una advertencia, ignoramos los clics
        if (this.isShowingWarning) return; 
        this.isShowingWarning = true;

        // Guardamos el texto en el que estábamos para volver a él
        const textoOriginal = this.texto.text;
        
        this.texto.setText(mensaje);
        this.texto.setColor('#ff0000'); // Texto en rojo
        
        // Efecto de sacudida (shake)
        this.scene.tweens.add({
            targets: this.texto,
            x: this.texto.x + 10,
            yoyo: true,
            repeat: 3,
            duration: 50
        });

        // Restaurar a los 2.5 segundos
        this.scene.time.delayedCall(2500, () => {
            if(this.texto && this.texto.active) {
                this.texto.setText(textoOriginal);
                this.texto.setColor('#ffffff');
                this.isShowingWarning = false; // [NUEVO] Liberamos el cerrojo
            }
        });
    }
}