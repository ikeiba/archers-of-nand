import { COLORES, FUENTES } from '../config/GameConstants.js';

export default class AttackManager {
    constructor(scene) {
        this.scene = scene;
        
        // Estado interno de la selección actual
        this.selectionState = {
            leftBanner: null,
            rightBanner: null,
            notBanner: null,
            genericText: null, // Para COUNT, LIKE, FLARE
            bannersList: [],   // Referencia para borrar grupos de banners
            mode: null         // 'bool', 'not', 'generico'
        };
    }

    // ============================================================
    // PUNTO DE ENTRADA PRINCIPAL
    // ============================================================
    initiateAttack(cardKey, onReadyCallback) {
        this.onReadyToConfirm = onReadyCallback;
        this.resetState();

        console.log(`AttackManager: Iniciando lógica para ${cardKey}`);

        switch(cardKey) {
            case "and":
            case "or":
            case "xor":
                this.setupBoolAttack(cardKey);
                break;
            case "count":
                this.setupCountAttack();
                break;
            case "like":
                this.setupLikeAttack();
                break;
            case "flare":
                this.setupFlareAttack();
                break;
            case "not":
                this.setupNotAttack();
                break;
            default:
                console.warn("Carta desconocida:", cardKey);
        }
    }

    // ============================================================
    // LÓGICA ESPECÍFICA POR TIPO
    // ============================================================

    // --- BOOL (AND, OR, XOR) ---
    setupBoolAttack(operation) {
        this.selectionState.mode = 'bool';
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        // Texto de operación
        this.selectionState.genericText = this.scene.add.text(
            w * 0.81, h * 0.51, operation.toUpperCase(),
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL }
        ).setOrigin(0.5);

        // Banners Izquierda
        const leftGroup = this.createBannerGroup(w * 0.72, h * 0.46, 'left');
        // Banners Derecha
        const rightGroup = this.createBannerGroup(w * 0.85, h * 0.46, 'right');
        
        this.selectionState.bannersList = [...leftGroup, ...rightGroup];
    }

    createBannerGroup(baseX, baseY, side) {
        const scale = 0.3;
        const banners = [
            this.scene.add.image(baseX, baseY, 'banner_green').setScale(scale),
            this.scene.add.image(baseX + 50, baseY, 'banner_red').setScale(scale),
            this.scene.add.image(baseX + 25, baseY + 80, 'banner_blue').setScale(scale)
        ];

        banners.forEach(b => {
            b.setInteractive({ useHandCursor: true });
            b.on('pointerdown', () => this.handleBannerClick(b, banners, side));
        });

        return banners;
    }

    handleBannerClick(selectedBanner, group, side) {
        // Visuals
        group.forEach(b => b.clearTint().setAlpha(0.5));
        selectedBanner.setTint(COLORES.TINT_HOVER).setAlpha(1);

        // Guardar selección
        if (side === 'left') this.selectionState.leftBanner = selectedBanner;
        else this.selectionState.rightBanner = selectedBanner;

        // Comprobar si tenemos ambos lados listos
        if (this.selectionState.leftBanner && this.selectionState.rightBanner) {
            this.finalizeBoolSelection();
        }
    }

    finalizeBoolSelection() {
        // Ocultar selección original
        this.selectionState.bannersList.forEach(b => b.setVisible(false));
        
        // Mover texto y crear copias visuales centradas
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        
        this.selectionState.genericText.setPosition(w * 0.745, h * 0.49);
        
        // Creamos visuales temporales para la confirmación
        const leftKey = this.selectionState.leftBanner.texture.key;
        const rightKey = this.selectionState.rightBanner.texture.key;
        
        this.visualLeft = this.scene.add.image(w * 0.695, h * 0.49, leftKey).setScale(0.3);
        this.visualRight = this.scene.add.image(w * 0.795, h * 0.49, rightKey).setScale(0.3);

        // Llamar al callback de Board
        this.onReadyToConfirm('bool');
    }

    // --- NOT ---
    setupNotAttack() {
        this.selectionState.mode = 'not';
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const scale = 0.45;

        // Crear banners centrales
        const banners = [
            this.scene.add.image(w * 0.735, h * 0.50, 'banner_green').setScale(scale),
            this.scene.add.image(w * 0.815, h * 0.50, 'banner_red').setScale(scale),
            this.scene.add.image(w * 0.895, h * 0.50, 'banner_blue').setScale(scale)
        ];

        this.selectionState.bannersList = banners;

        banners.forEach(b => {
            b.setInteractive({ useHandCursor: true });
            b.on('pointerdown', () => {
                // Ocultar otros
                banners.forEach(other => other.setVisible(false));
                
                // Configurar seleccionado
                b.setVisible(true);
                b.setPosition(w * 0.737, h * 0.477); // Mover al sitio final
                b.setScale(0.32);
                
                this.selectionState.notBanner = b;
                this.onReadyToConfirm('not');
            });
        });
    }

    // --- GENERICO: COUNT ---
    setupCountAttack() {
        this.selectionState.mode = 'generico';
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        
        const nums = ['1', '2', '3'];
        const spacing = 105;
        const centerX = w * 0.81;

        this.selectionState.bannersList = nums.map((n, i) => {
            const txt = this.scene.add.text(centerX + (i - 1) * spacing, h * 0.49, n, {
                fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            txt.on('pointerover', () => { txt.setScale(1.1); txt.setText(`>${n}<`); });
            txt.on('pointerout', () => { txt.setScale(1); txt.setText(n); });
            txt.on('pointerdown', () => this.finalizeGenericSelection(n));
            
            return txt;
        });
    }

    // --- GENERICO: LIKE ---
    setupLikeAttack() {
        this.selectionState.mode = 'generico';
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const matrix = [['KLIF', 'BEK', 'AE'], ['STEN', 'DAL', 'NES'], ['VIK', 'HOLM', 'SAND']];
        
        this.selectionState.bannersList = [];

        matrix.forEach((row, r) => {
            row.forEach((text, c) => {
                const x = w * 0.81 + (c - 1) * 105;
                const y = h * 0.49 + (r - 1) * 50;
                
                const txt = this.scene.add.text(x, y, text, {
                    fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                txt.on('pointerover', () => { txt.setScale(1.1); txt.setText(`>${text}<`); });
                txt.on('pointerout', () => { txt.setScale(1); txt.setText(text); });
                txt.on('pointerdown', () => this.finalizeGenericSelection(text));

                this.selectionState.bannersList.push(txt);
            });
        });
    }

    // --- GENERICO: FLARE (Interactúa con Territorios) ---
    setupFlareAttack() {
        this.selectionState.mode = 'generico';
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        // Texto Instrucciones
        const instrucc = this.scene.add.text(w * 0.82, h * 0.5, "Click on a territory to\nshoot the arrows.", {
            fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL, align: 'center'
        }).setOrigin(0.5);
        this.selectionState.bannersList.push(instrucc);

        // Activar listeners en territorios
        this.scene.territories.forEach(t => {
            // Guardamos referencias para limpiar luego
            const onDown = () => {
                this.finalizeGenericSelection(t.key);
                this.cleanupFlareListeners(); // Limpieza inmediata de interacción
            };
            
            t._flareListeners = {
                over: () => t.list[0].setTint(COLORES.TINT_HOVER),
                out: () => t.list[0].clearTint(),
                down: onDown
            };
            
            t.on('pointerover', t._flareListeners.over);
            t.on('pointerout', t._flareListeners.out);
            t.on('pointerdown', t._flareListeners.down);
        });
    }

    cleanupFlareListeners() {
        this.scene.territories.forEach(t => {
            t.list[0].clearTint();
            if (t._flareListeners) {
                t.off('pointerover', t._flareListeners.over);
                t.off('pointerout', t._flareListeners.out);
                t.off('pointerdown', t._flareListeners.down);
                t._flareListeners = null;
            }
        });
    }

    // --- FINALIZADOR GENÉRICO ---
    finalizeGenericSelection(value) {
        // Borrar opciones (matriz, números, instrucciones)
        this.selectionState.bannersList.forEach(obj => obj.destroy());
        this.selectionState.bannersList = [];

        // Mostrar selección final
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        this.selectionState.genericText = this.scene.add.text(
            w * 0.745, h * 0.49, value.toUpperCase(),
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL }
        ).setOrigin(0.5);

        this.onReadyToConfirm('generico');
    }

    // ============================================================
    // CÁLCULO DE OBJETIVOS
    // ============================================================
    calculateTargets(territories, cardKey) {
        const colorMap = { 'banner_red': 'rojo', 'banner_green': 'verde', 'banner_blue': 'azul' };
        let targets = [];
        const mode = this.selectionState.mode;

        if (mode === 'bool') {
            const cL = colorMap[this.selectionState.leftBanner.texture.key];
            const cR = colorMap[this.selectionState.rightBanner.texture.key];
            const op = this.selectionState.genericText.text; // AND, OR...

            targets = territories.filter(t => {
                const hasL = t.colores.includes(cL);
                const hasR = t.colores.includes(cR);
                if (op === 'AND') return hasL && hasR;
                if (op === 'OR') return hasL || hasR;
                if (op === 'XOR') return hasL !== hasR;
                return false;
            });

        } else if (mode === 'not') {
            const c = colorMap[this.selectionState.notBanner.texture.key];
            targets = territories.filter(t => !t.colores.includes(c));

        } else if (mode === 'generico') {
            const val = this.selectionState.genericText.text;
            
            if (cardKey === 'count') {
                targets = territories.filter(t => t.colores.length === parseInt(val));
            } else if (cardKey === 'like') {
                targets = territories.filter(t => t.key.toUpperCase().includes(val));
            } else if (cardKey === 'flare') {
                targets = territories.filter(t => t.key.toUpperCase() === val);
            }
        }

        return targets;
    }

    // ============================================================
    // LIMPIEZA TOTAL
    // ============================================================
    cleanUp() {
        console.log("AttackManager: Limpiando UI");
        
        // Destruir banners guardados
        if (this.selectionState.bannersList) {
            this.selectionState.bannersList.forEach(b => { if(b && b.destroy) b.destroy(); });
        }
        
        // Destruir textos y banners únicos
        if (this.selectionState.genericText) this.selectionState.genericText.destroy();
        if (this.visualLeft) this.visualLeft.destroy();
        if (this.visualRight) this.visualRight.destroy();
        
        // Caso especial NOT (el banner seleccionado es parte de la UI)
        if (this.selectionState.mode === 'not' && this.selectionState.notBanner) {
            this.selectionState.notBanner.destroy();
        }

        // Caso especial Flare (listeners)
        this.cleanupFlareListeners();

        this.resetState();
    }

    resetState() {
        this.selectionState = {
            leftBanner: null, rightBanner: null, notBanner: null,
            genericText: null, bannersList: [], mode: null
        };
        this.visualLeft = null;
        this.visualRight = null;
    }
}