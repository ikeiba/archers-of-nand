import { COLORES, FUENTES, DIFICULTADES } from '../config/GameConstants.js';
import TextButton from '../components/TextButton.js';

export default class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    preload() {
        // Carga tu imagen de fondo original
        this.load.image('game_cover', 'assets/others/game_cover.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Añade el fondo
        this.add.image(595, 359, 'game_cover');

        // --- CONTENEDORES DE VISTAS ---
        this.mainView = this.add.container(0, 0);
        this.diffView = this.add.container(0, 0).setVisible(false);
        this.customView = this.add.container(0, 0).setVisible(false);

        // Construir las tres interfaces
        this.createMainView(w, h);
        this.createDiffView(w, h);
        this.createCustomView(w, h);
    }

    // ==========================================
    // 1. VISTA PRINCIPAL
    // ==========================================
    createMainView(w, h) {
        // Mantenemos la posición X en 0.86 como querías y aplicamos .setColor('#ffffff')
        const btnStart = new TextButton(this, w * 0.86, h * 0.6, 'START', '52px', () => {
            this.scene.start('Board', DIFICULTADES.FACIL); 
        }).setColor('#ffffff');

        // [NUEVO] Botón de Tutorial
        const btnTutorial = new TextButton(this, w * 0.86, h * 0.80, 'TUTORIAL', '26px', () => {
            // Le pasamos un flag especial y una configuración de 1 sola ronda
            const configTutorial = { tutorial: true, mazo: [3,3], flechas: 50, penalizacion: 1 };
            this.scene.start('Board', configTutorial); 
        }).setColor('#ffffff');
        
        const btnSettings = new TextButton(this, w * 0.86, h * 0.70, 'DIFFICULTIES', '32px', () => {
            this.mainView.setVisible(false);
            this.diffView.setVisible(true);
        }).setColor('#ffffff');

        this.mainView.add([btnStart, btnSettings, btnTutorial]);
    }

    // ==========================================
    // 2. VISTA DE SELECCIÓN DE DIFICULTAD
    // ==========================================
    createDiffView(w, h) {
        // [NUEVO] Panel oscuro semitransparente (x, y, ancho, alto, color, opacidad)
        const panelOscuro = this.add.rectangle(w/2, h/2, w * 0.5, h * 0.85, 0x000000, 0.75);

        // Ponemos este menú en el centro para que se lea mejor
        const title = this.add.text(w/2, h * 0.25, '- Select Difficulty -', {fontFamily: FUENTES.PRINCIPAL, fontSize: '40px', color: '#ffffff'}).setOrigin(0.5);

        // Botones en blanco usando .setColor()
        const btnFacil = new TextButton(this, w/2, h * 0.40, 'Easy', '36px', () => this.scene.start('Board', DIFICULTADES.FACIL)).setColor('#ffffff');
        const btnMedio = new TextButton(this, w/2, h * 0.50, 'Normal', '36px', () => this.scene.start('Board', DIFICULTADES.INTERMEDIO)).setColor('#ffffff');
        const btnDificil = new TextButton(this, w/2, h * 0.60, 'Hard', '36px', () => this.scene.start('Board', DIFICULTADES.DIFICIL)).setColor('#ffffff');
        
        const btnCustom = new TextButton(this, w/2, h * 0.70, 'Custom', '36px', () => {
            this.diffView.setVisible(false);
            this.customView.setVisible(true);
        }).setColor('#ffffff');

        // --- [NUEVO] TEXTO DE INFORMACIÓN DINÁMICO ---
        const infoText = this.add.text(w/2, h * 0.87, 'Hover over an option to see details', {
            fontFamily: FUENTES.PRINCIPAL, 
            fontSize: '22px', 
            color: '#ffcc00' // Un color dorado para que destaque
        }).setOrigin(0.5);

        // Lógica de actualización al pasar el ratón
        btnFacil.on('pointerover', () => infoText.setText('10 Hordes (5x3, 5x4) | 50 Arrows | -1 on flee'));
        btnMedio.on('pointerover', () => infoText.setText('12 Hordes (4x3, 4x4, 4x5) | 48 Arrows | -2 on flee'));
        btnDificil.on('pointerover', () => infoText.setText('15 Hordes (5x3, 5x4, 5x5) | 45 Arrows | -3 on flee'));
        btnCustom.on('pointerover', () => infoText.setText('Create your own custom challenge!'));

        const resetInfo = () => infoText.setText('Hover over an option to see details');
        btnFacil.on('pointerout', resetInfo);
        btnMedio.on('pointerout', resetInfo);
        btnDificil.on('pointerout', resetInfo);
        btnCustom.on('pointerout', resetInfo);

        const btnBack = new TextButton(this, w/2, h * 0.8, 'Back', '28px', () => {
            this.diffView.setVisible(false);
            this.mainView.setVisible(true);
        }).setColor('#ffffff');

        // Añadimos TODO al contenedor
        this.diffView.add([
            panelOscuro, title, 
            btnFacil, btnMedio, btnDificil, btnCustom, 
            infoText, // Añadimos el nuevo texto aquí
            btnBack
        ])
    }

    // ==========================================
    // 3. VISTA DE CONFIGURACIÓN PERSONALIZADA
    // ==========================================
    createCustomView(w, h) {
        // [NUEVO] Panel oscuro semitransparente un poco más ancho para albergar las opciones
        const panelOscuro = this.add.rectangle(w/2, h/2, w * 0.55, h * 0.85, 0x000000, 0.75);
        this.customView.add(panelOscuro); // Añadimos primero el panel

        this.customData = { h3: 3, h4: 3, h5: 3, arrows: 50, penalty: 1 };
        const startY = h * 0.38;
        const spacing = 45;

        const title = this.add.text(w/2, h * 0.22, '- Custom Difficulty -', {fontFamily: FUENTES.PRINCIPAL, fontSize: '40px', color: '#ffffff'}).setOrigin(0.5);
        this.customView.add(title);

        // Construir las filas usando el Helper
        this.buildRow('3-Orc Hordes', 'h3', w/2, startY, 0, 30, true, 1);
        this.buildRow('4-Orc Hordes', 'h4', w/2, startY + spacing, 0, 30, true, 1);
        this.buildRow('5-Orc Hordes', 'h5', w/2, startY + spacing*2, 0, 30, true, 1);
        this.buildRow('Initial Arrows', 'arrows', w/2, startY + spacing*3.2, 1, 120, false, 5); 
        this.buildRow('Flee Penalty', 'penalty', w/2, startY + spacing*4.2, 1, 5, false, 1);

        const btnPlay = new TextButton(this, w/2, h * 0.78, 'PLAY CUSTOM', '40px', () => {
            const totalHordas = this.customData.h3 + this.customData.h4 + this.customData.h5;
            if(totalHordas < 1 || totalHordas > 30) return; 

            let mazo = [];
            for(let i=0; i<this.customData.h3; i++) mazo.push(3);
            for(let i=0; i<this.customData.h4; i++) mazo.push(4);
            for(let i=0; i<this.customData.h5; i++) mazo.push(5);

            const customConfig = {
                mazo: mazo,
                flechas: this.customData.arrows,
                penalizacion: this.customData.penalty
            };
            
            this.scene.start('Board', customConfig);
        }).setColor('#ffffff');

        const btnBack = new TextButton(this, w/2, h * 0.88, 'Back', '28px', () => {
            this.customView.setVisible(false);
            this.diffView.setVisible(true);
        }).setColor('#ffffff');

        this.customView.add([btnPlay, btnBack]);
    }

    // ==========================================
    // HELPER: CREADOR DE FILAS (+ / -)
    // ==========================================
    buildRow(labelTxt, key, centerX, y, min, max, checkTotal, step) {
        const label = this.add.text(centerX - 90, y, labelTxt, {fontFamily: FUENTES.PRINCIPAL, fontSize: '24px', color: '#ffffff'}).setOrigin(1, 0.5);
        const valTxt = this.add.text(centerX + 70, y, this.customData[key], {fontFamily: FUENTES.PRINCIPAL, fontSize: '26px', color: '#ffffff'}).setOrigin(0.5);

        // Flecha menos en blanco
        const btnMinus = new TextButton(this, centerX, y, '<', '26px', () => {
            if(this.customData[key] > min) {
                if (checkTotal && (this.customData.h3 + this.customData.h4 + this.customData.h5) <= 1) return; 
                this.customData[key] -= step;
                if(this.customData[key] < min) this.customData[key] = min;
                valTxt.setText(this.customData[key]);
            }
        }, false).setColor('#ffffff'); // <-- Fíjate en el 'false' antes del .setColor

        // Flecha más en blanco (añadimos 'false' al final)
        const btnPlus = new TextButton(this, centerX + 140, y, '>', '26px', () => {
            if(this.customData[key] < max) {
                if (checkTotal && (this.customData.h3 + this.customData.h4 + this.customData.h5) >= 30) return; 
                this.customData[key] += step;
                if(this.customData[key] > max) this.customData[key] = max;
                valTxt.setText(this.customData[key]);
            }
        }, false).setColor('#ffffff');

        this.customView.add([label, valTxt, btnMinus, btnPlus]);
    }
}