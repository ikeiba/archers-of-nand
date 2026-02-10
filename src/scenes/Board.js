import { COLORES, FUENTES, ADYACENCIAS, POSICIONES, GAME_CONFIG } from '../config/GameConstants.js';
import TextButton from '../components/TextButton.js';
import Territory from '../components/Territory.js';
import AttackManager from '../managers/AttackManager.js';
import CoinManager from '../managers/CoinManager.js';

export default class Board extends Phaser.Scene {
    
    constructor() {
        super('Board');
    }

    // ============================================================
    // PRELOAD: CARGA DE TODOS LOS ASSETS
    // ============================================================
    preload() {
        // --- FONDO ---
        this.load.image('background', 'assets/others/background.png');
        
        // --- TERRITORIOS (NORMAL + DESTRUIDO) ---
        this.load.image('bekstenholm', 'assets/territory/bekstenholm.png');
        this.load.image('bekstenholmDestroyed', 'assets/territory/bekstenholm_destroyed.png');
        this.load.image('klifstenvik', 'assets/territory/klifstenvik.png');
        this.load.image('klifstenvikDestroyed', 'assets/territory/klifstenvik_destroyed.png');
        this.load.image('aestensand', 'assets/territory/aestensand.png');
        this.load.image('aestensandDestroyed', 'assets/territory/aestensand_destroyed.png');
        this.load.image('klifdalholm', 'assets/territory/klifdalholm.png');
        this.load.image('klifdalholmDestroyed', 'assets/territory/klifdalholm_destroyed.png');
        this.load.image('beknesvik', 'assets/territory/beknesvik.png');
        this.load.image('beknesvikDestroyed', 'assets/territory/beknesvik_destroyed.png');
        this.load.image('bekdalsand', 'assets/territory/bekdalsand.png');
        this.load.image('bekdalsandDestroyed', 'assets/territory/bekdalsand_destroyed.png');
        this.load.image('aenesholm', 'assets/territory/aenesholm.png');
        this.load.image('aenesholmDestroyed', 'assets/territory/aenesholm_destroyed.png');

        // --- CARTAS DE ARQUERAS Y HORDAS ---
        this.load.image('archerRight', 'assets/cards/archer_card_pointing_right.png');
        this.load.image('archerBlank', 'assets/cards/archer_card_blank.png');
        this.load.image('horde3', 'assets/cards/horde_3.png');
        this.load.image('horde4', 'assets/cards/horde_4.png');
        this.load.image('horde5', 'assets/cards/horde_5.png');

        // --- CARTAS DE ATAQUE ---
        this.load.image('and', 'assets/cards/and.png');
        this.load.image('count', 'assets/cards/count.png');
        this.load.image('flare', 'assets/cards/flare.png');
        this.load.image('like', 'assets/cards/like.png');
        this.load.image('not', 'assets/cards/not.png');
        this.load.image('or', 'assets/cards/or.png');
        this.load.image('xor', 'assets/cards/xor.png');
        this.load.image('empty', 'assets/cards/empty.png');

        // --- OTROS ---
        this.load.image('quiver', 'assets/others/quiver.png');
        this.load.image('guerrero', 'assets/others/warrior.png');
        this.load.image('orco', 'assets/others/orc.png');
        this.load.image('arrow', 'assets/others/single_arrow.png');

        // --- MONEDAS ---
        this.load.image('coin_empty', 'assets/coins/blank.png');
        this.load.image('coin_red', 'assets/coins/red.png');
        this.load.image('coin_green', 'assets/coins/green.png');
        this.load.image('coin_blue', 'assets/coins/blue.png');

        // --- LOGOS ---
        this.load.image('logo_english', 'assets/logos/logo_english.png');
        this.load.image('logo_spanish', 'assets/logos/logo_spanish.png');

        // --- ESTANDARTES ---
        this.load.image('banner_red', 'assets/banners/red_banner.png');
        this.load.image('banner_green', 'assets/banners/green_banner.png');
        this.load.image('banner_blue', 'assets/banners/blue_banner.png');
    }

    // ============================================================
    // CREATE: INICIALIZACIÓN DE LA ESCENA
    // ============================================================
    create() {
        // --- 1. CONFIGURACIÓN INICIAL ---
        this.estados = {
            COLOCAR_GUERRERO: 'colocar_guerrero',
            TIRAR_MONEDAS: 'tirar_monedas',
            SELECCIONAR_CARTA: 'seleccionar_carta',
            EJECUTAR_ACCION: 'ejecutar_accion',
            MELEE_FIGHT: 'melee_fight'
        };

        // Usamos la constante importada
        this.adyacencias = ADYACENCIAS; 

        this.estadoActual = this.estados.COLOCAR_GUERRERO;
        this.cartasEmpty = [];
        this.cartasUsadas = 0;
        this.isMovingWarrior = false; // Inicialización temprana
        
        const w = this.scale.width;
        const h = this.scale.height;

        // --- 2. FONDO ---
        this.add.image(595, 359, 'background');

        // --- 3. LOGOS ---
        this.logoCastellano = this.add.image(w * POSICIONES.LOGO_ES.x, h * POSICIONES.LOGO_ES.y, 'logo_spanish').setScale(0.2).setVisible(false);
        this.logoIngles = this.add.image(w * POSICIONES.LOGO.x, h * POSICIONES.LOGO.y, 'logo_english').setScale(0.18).setVisible(false);
        
        // --- 4. TERRITORIOS ---
        // (Esto lo limpiaremos en la Fase 3, por ahora se queda igual)
        const centerX = 500;
        const centerY = 357;
        const territory_w = 241;
        const territory_h = territory_w / 1.30303;
        const territory_scale = 0.45;
        
        this.territories = this.crearTerritorios(centerX, centerY, territory_w, territory_h, territory_scale);
        this.configurarListenersTerritorios(territory_w, territory_h, territory_scale); // He extraído esto a un método abajo para limpiar create()

        // --- 5. ELEMENTOS DEL JUEGO (Sprites) ---
        const cardScale = 0.3;
        this.archerRight = this.add.image(w * POSICIONES.DECK_ARQUERAS.x, h * POSICIONES.DECK_ARQUERAS.y, 'archerRight').setScale(cardScale);
        this.archerBlank = this.add.image(w * POSICIONES.DECK_ARQUERAS.x, h * POSICIONES.DECK_ARQUERAS.y, 'archerBlank').setScale(cardScale).setVisible(false);
        
        this.hordeCards = [
            this.add.image(w * POSICIONES.DECK_HORDAS.x, h * POSICIONES.DECK_HORDAS.y, 'horde3').setScale(cardScale).setVisible(false),
            this.add.image(w * POSICIONES.DECK_HORDAS.x, h * POSICIONES.DECK_HORDAS.y, 'horde4').setScale(cardScale).setVisible(false),
            this.add.image(w * POSICIONES.DECK_HORDAS.x, h * POSICIONES.DECK_HORDAS.y, 'horde5').setScale(cardScale).setVisible(false)
        ];
        
        this.quiver = this.add.image(w * POSICIONES.QUIVER.x, h * POSICIONES.QUIVER.y, 'quiver').setScale(cardScale);
        this.arrow = this.add.image(w * POSICIONES.ARROW_ICON.x, h * POSICIONES.ARROW_ICON.y, 'arrow').setScale(0.38).setVisible(false);

        // --- 6. UI Y BOTONES (REFACTORIZADO CON TextButton) ---
        
        // Texto instrucciones (No es botón, es texto estático interactivo)
        this.botonPosicionarGuerrero = this.add.text(
            w * POSICIONES.TEXTO_INSTRUCCIONES.x, h * POSICIONES.TEXTO_INSTRUCCIONES.y,
            'Click on a territory to \nplace a warrior.',
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // HUD: Contadores
        this.botonflechasRestantes = this.add.text(
            w * POSICIONES.HUD_FLECHAS.x, h * POSICIONES.HUD_FLECHAS.y,
            `x${GAME_CONFIG.FLECHAS_INICIALES}`,
            { fontFamily: FUENTES.PRINCIPAL, fontSize: FUENTES.TAMANO_HUD, color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.botonhordasRestantes = this.add.text(
            w * POSICIONES.HUD_HORDAS.x, h * POSICIONES.HUD_HORDAS.y,
            `x${GAME_CONFIG.HORDAS_INICIALES}`,
            { fontFamily: FUENTES.PRINCIPAL, fontSize: FUENTES.TAMANO_HUD, color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // --- BOTONES PRINCIPALES (Usando la nueva clase) ---
        this.botonDiscard = new TextButton(this, 
            w * POSICIONES.BTN_DISCARD.x, h * POSICIONES.BTN_DISCARD.y, 
            'Discard', 
            FUENTES.TAMANO_BTN_PEQUENO
        ).setVisible(false);

        this.botonMoveWarrior = new TextButton(this, 
            w * POSICIONES.BTN_MOVE.x, h * POSICIONES.BTN_MOVE.y, 
            'Move warrior', 
            FUENTES.TAMANO_BTN_PEQUENO
        ).setVisible(false);

        this.botonAttack = new TextButton(this, 
            w * POSICIONES.BTN_ATTACK.x, h * POSICIONES.BTN_ATTACK.y, 
            'Attack', 
            FUENTES.TAMANO_BTN_PEQUENO
        ).setVisible(false);

        // Agrupamos para visibilidad
        this.botonesJuego = [this.botonDiscard, this.botonMoveWarrior, this.botonAttack];

        // Texto Fight (no es un botón estándar porque cambia mucho)
        this.botonFight = new TextButton(this,
            w * POSICIONES.BTN_FIGHT.x, h * POSICIONES.BTN_FIGHT.y,
            'FIGHT',
            '28px'
        ).setVisible(false);

        this.textoMelee = this.add.text(
            w * POSICIONES.TEXTO_MELEE.x, h * POSICIONES.TEXTO_MELEE.y,
            'Melee fight',
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '30px', color: COLORES.TEXTO_PRINCIPAL, padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);

        // --- 7. INICIALIZACIÓN DE LÓGICA ---
        this.configurarInputMonedas(); // [NUEVO] Método extraído        
        this.inicializarHordas(); // Método extraído abajo
        this.crearCartasAtaque(w, h); // Método extraído abajo
        this.configurarListenersBotones(); // Método extraído abajo
        
        this.attackManager = new AttackManager(this);
        this.coinManager = new CoinManager(this); // [NUEVO]
    }

    // ... AQUI EMPEZARÍAN TUS MÉTODOS AUXILIARES ...
    // He extraído código del create() a funciones pequeñas para que veas lo limpio que queda.
    // Tienes que copiar los bloques de lógica de tu create() y meterlos en estas funciones:

    configurarListenersTerritorios() {
        this.territories.forEach(t => {
            // NOTA: setSize y setInteractive ya se hacen dentro de Territory.js
            // Solo añadimos el listener de lógica de juego aquí
            
            t.on('pointerdown', () => {
                if (this.isMovingWarrior) return; 
                if (this.estadoActual === this.estados.COLOCAR_GUERRERO) {
                    // REFACTORIZADO: Usamos el método de la clase
                    t.addWarrior(); 
                    
                    // Log
                    console.log(`${t.key}: Guerreros=${t.contarUnidades('guerrero')}, Orcos=${t.contarUnidades('orco')}`);
                    
                    this.cambiarEstado(this.estados.TIRAR_MONEDAS);
                }
            });
        });
    }

    inicializarHordas() {
        this.maxHordas = GAME_CONFIG.MAX_HORDAS;
        this.hordasJugadas = 0;
        this.currentHorde = Phaser.Math.RND.pick(this.hordeCards);
        this.currentHorde.setVisible(true);
        this.currentHordeValue = parseInt(this.currentHorde.texture.key.replace('horde', ''), 10);
    }

    crearCartasAtaque(w, h) {
        // Pega aquí la creación de attackCards y sus listeners
        const attack_card_scale = 0.35;
        this.attackCardKeys = ['and', 'or', 'xor', 'count', 'like', 'flare', 'not'];
        this.attackCardPositions = [
            { x: w * 0.74, y: h * 0.24 }, { x: w * 0.88, y: h * 0.24 },
            { x: w * 0.74, y: h * 0.74 }, { x: w * 0.88, y: h * 0.74 }
        ];
        this.attackCards = [];
        for (let i = 0; i < 4; i++) {
            const randomKey = Phaser.Utils.Array.GetRandom(this.attackCardKeys);
            const pos = this.attackCardPositions[i];
            const card = this.add.image(pos.x, pos.y, randomKey).setScale(attack_card_scale).setInteractive();
            card.cardKey = randomKey;
            this.attackCards.push(card);
        }
        // Listener de cartas
        this.attackCards.forEach(card => {
             // ... pega tu lógica de click en carta aquí ...
             card.on('pointerdown', () => {
                if (this.estadoActual !== this.estados.SELECCIONAR_CARTA) return;
                this.attackCards.forEach(c => { c.selected = false; c.setScale(attack_card_scale); c.setTint(COLORES.TINT_DISABLED); });
                card.selected = true;
                card.clearTint();
                this.cartaSeleccionada = card;
                this.botonesJuego.forEach(b => b.setVisible(true));
                this.logoIngles.setVisible(false);
             });
             // ... hovers ...
        });
    }

    configurarInputMonedas() {
        this.input.on('gameobjectdown', (pointer, obj) => {
            // 1. Validaciones
            if (!this.coinManager.isCoin(obj)) return; // ¿Es una moneda?
            if (this.estadoActual !== this.estados.TIRAR_MONEDAS) return;
            if (this.coinManager.isShuffling) return; // ¿Ya se están moviendo?
            if (this.currentHordeValue <= 0) return;

            // 2. Actualizar estado del juego
            this.currentHordeValue--;

            // 3. Lanzar monedas (Animación)
            this.coinManager.lanzar().then((resultados) => {
                // 4. Procesar lógica cuando terminan de caer
                this.procesarTiradaMonedas(resultados);
            });

            // 5. Gestión de fin de tiradas (Timing)
            // Si era la última tirada, programamos el cambio de fase
            if (this.currentHordeValue === 0) {
                this.time.delayedCall(1700, () => {
                    this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
                });
            }
        });
    }

    // Método extraído con la lógica de juego pura (sin animaciones de monedas)
    procesarTiradaMonedas(resultados) {
        // A) Caso fallo total (ninguna cara)
        if (resultados.length === 0) {
            if (this.archerBlank.visible) return;
            
            // Perder una flecha (penalización)
            const text = this.botonflechasRestantes.text;
            const current = parseInt(text.replace('x', ''), 10);
            this.botonflechasRestantes.setText('x' + Math.max(current - 1, 0));
            
            // Feedback visual penalización
            this.archerBlank.setVisible(true);
            this.tweens.add({
                targets: this.archerBlank, alpha: 0, yoyo: true, repeat: 2, duration: 150
            });
            this.archerRight.setVisible(false);
            return;
        }

        // B) Buscar territorios coincidentes
        const territoriosCoincidentes = this.territories.filter(t => {
            const coloresTerritorio = [...t.colores].sort().join(',');
            const coloresResultado = [...resultados].sort().join(',');
            return coloresTerritorio === coloresResultado;
        });

        // C) Colocar Orcos
        territoriosCoincidentes.forEach(t => {
            // Delegamos en el territorio la lógica de añadir orco
            t.addOrc(); 
            // Feedback visual en el territorio
            t.hacerParpadeo(0xffffff); // Parpadeo blanco o normal
        });

        if (territoriosCoincidentes.length === 0) {
            console.log('Ningún territorio coincide con los colores:', resultados);
        }
    }

    configurarListenersBotones() {
        // Aquí conectamos los botones (Discard, Move, Attack, Fight) a sus funciones
        // Nota: Ya NO hace falta poner pointerover/out porque la clase TextButton lo hace sola
        
        // === LISTENERS DE BOTONES DE ACCIÓN ===
        this.botonDiscard.on('pointerdown', () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
            this.colocarCartaEmpty(this.cartaSeleccionada);
            this.cartaSeleccionada.setVisible(false);
            this.cartasUsadas++;
            
            // Ocultar botones y quitar tintes
            this.botonesJuego.forEach(b => b.setVisible(false));
            this.attackCards.forEach(c => c.clearTint());
            
            if (this.cartasUsadas === 2) {
                this.cambiarEstado(this.estados.MELEE_FIGHT);
            }
        });

        // Listener de Move Warrior
        this.botonMoveWarrior.on('pointerdown', async () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
            // [NUEVO] Cambiamos estado para BLOQUEAR la selección de otras cartas
            this.cambiarEstado(this.estados.EJECUTAR_ACCION);

            this.botonesJuego.forEach(b => b.setVisible(false));
            
            // Llamamos a la función asíncrona y esperamos respuesta (true/false)
            const movimientoRealizado = await this.moveWarrior();

            if (movimientoRealizado) {
                console.log('Movimiento completado.');
                this.colocarCartaEmpty(this.cartaSeleccionada);
                this.cartaSeleccionada.setVisible(false);            
                this.attackCards.forEach(c => c.clearTint());
                this.cartasUsadas++;
                
                if (this.cartasUsadas === 2) {
                    this.cambiarEstado(this.estados.MELEE_FIGHT);
                } else {
                    // [NUEVO] Si queda otra carta, volvemos al estado de selección
                    this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
                }
            } else {
                console.log('Movimiento cancelado.');
                this.cartaSeleccionada.selected = false;
                this.cartaSeleccionada.clearTint();
                this.cartaSeleccionada = null;
                this.attackCards.forEach(c => c.setInteractive());
                this.logoIngles.setVisible(true);
                // Volvemos al estado de selección
                this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
            }
        });

        // Listener de Attack (Modificado para gestionar cancelación)
        this.botonAttack.on('pointerdown', async () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
            // [NUEVO] Cambiamos estado para BLOQUEAR la selección de otras cartas
            this.cambiarEstado(this.estados.EJECUTAR_ACCION);

            this.botonesJuego.forEach(b => b.setVisible(false));
            
            // Esperamos a que el jugador decida (Atacar o Cancelar)
            const ataqueRealizado = await this.attack(this.cartaSeleccionada); 
            
            if (ataqueRealizado) {
                console.log('Ataque completado con éxito.');
                this.colocarCartaEmpty(this.cartaSeleccionada);
                this.cartaSeleccionada.setVisible(false);            
                this.attackCards.forEach(c => c.clearTint());
                this.cartasUsadas++;
                
                if (this.cartasUsadas === 2) {
                    this.cambiarEstado(this.estados.MELEE_FIGHT);
                } else {
                    // [NUEVO] Si queda otra carta, volvemos al estado de selección
                    this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
                }
            } else {
                console.log('Ataque cancelado. Volviendo a selección.');
                // Canceló: Restauramos el estado visual
                this.cartaSeleccionada.selected = false;
                this.cartaSeleccionada.clearTint();
                this.cartaSeleccionada = null; 
                this.attackCards.forEach(c => c.setInteractive()); 
                this.logoIngles.setVisible(true); 
                
                // Volvemos explícitamente al estado de seleccionar
                this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
            }
        });

        this.botonFight.on('pointerdown', () => {
            // 1. Resolver el combate cuerpo a cuerpo primero
            this.resolverCombate();

            // 2. Avanzar la ronda (cambiar cartas, regenerar, etc.)
            // Damos un pequeño delay para que se vea la muerte de las fichas antes del reset
            this.time.delayedCall(800, () => {
                this.realizarRonda();
                this.regenerarCartasUsadas();
                this.cambiarEstado(this.estados.COLOCAR_GUERRERO);
                
                // Reset visual UI
                this.archerBlank.setVisible(false);
                this.archerRight.setVisible(true);
                this.cartasUsadas = 0;
            });
        });
    }

    // ============================================================
    // CAMBIAR ESTADO
    // ============================================================
    cambiarEstado(nuevoEstado) {
        console.log(`Estado: ${this.estadoActual} -> ${nuevoEstado}`);
        this.estadoActual = nuevoEstado;
        
        // Resetear visibilidad de elementos según el estado
        switch(nuevoEstado) {
            case this.estados.COLOCAR_GUERRERO:
                this.botonPosicionarGuerrero.setVisible(true);
                // this.coins.forEach(coin => coin.setVisible(false));
                this.logoIngles.setVisible(false);
                this.botonesJuego.forEach(b => b.setVisible(false));
                this.botonFight.setVisible(false);
                this.textoMelee.setVisible(false);
                // [NUEVO] Resetear monedas usando el Manager
                this.coinManager.reset();
                break;
                
            case this.estados.TIRAR_MONEDAS:
                this.botonPosicionarGuerrero.setVisible(false);
                // [NUEVO] Mostrar monedas
                this.coinManager.setVisible(true);
                break;
                
            case this.estados.SELECCIONAR_CARTA:
                this.coinManager.setVisible(false);
                this.logoIngles.setVisible(true);
                this.attackCards.forEach(c => {
                    c.clearTint();
                    c.setInteractive();
                });
                break;
                
            case this.estados.MELEE_FIGHT:
                this.botonesJuego.forEach(b => b.setVisible(false));
                this.botonFight.setVisible(true);
                this.textoMelee.setVisible(true);
                // [NUEVO] Asegurar que el logo se oculta al entrar en combate
                this.logoIngles.setVisible(false);
                break;
        }
    }

    // ============================================================
    // CREAR TERRITORIOS
    // ============================================================
    crearTerritorios(centerX, centerY, w, h, s) {
        const crear = (x, y, key, keyDestroyed, colores) => {
            return new Territory(this, x, y, key, keyDestroyed, colores, s);
        };

        return [
            crear(centerX, centerY - h, 'klifstenvik', 'klifstenvikDestroyed', ['rojo']),
            crear(centerX - 0.75 * w, centerY - h / 2, 'klifdalholm', 'klifdalholmDestroyed', ['verde', 'rojo']),
            crear(centerX - 0.75 * w, centerY + h / 2, 'bekdalsand', 'bekdalsandDestroyed', ['verde']),
            crear(centerX, centerY + h, 'aestensand', 'aestensandDestroyed', ['verde', 'azul']),
            crear(centerX + 0.75 * w, centerY + h / 2, 'aenesholm', 'aenesholmDestroyed', ['azul']),
            crear(centerX, centerY, 'bekstenholm', 'bekstenholmDestroyed', ['verde', 'rojo', 'azul']),
            crear(centerX + 0.75 * w, centerY - h / 2, 'beknesvik', 'beknesvikDestroyed', ['rojo', 'azul'])
        ];
    }

    // ============================================================
    // COLOCAR ORCO (Actualizado)
    // ============================================================
    colocarOrco(territorio) {
        if (this.estadoActual !== this.estados.TIRAR_MONEDAS) return;
        territorio.addOrc(); // La clase Territory gestiona la posición y si se destruye sola
    }

    // ============================================================
    // REALIZAR RONDA (Comprobación de Final de Partida)
    // ============================================================
    realizarRonda() {
        // 1. Aumentamos el contador de rondas jugadas
        this.hordasJugadas++;

        // 2. CHECK DE DERROTA: ¿4 o más territorios destruidos?
        const territoriosDestruidos = this.territories.filter(t => t.destruido).length;
        if (territoriosDestruidos >= 4) {
            console.log("GAME OVER: Demasiados territorios destruidos.");
            this.scene.start('End', { win: false });
            return; // Importante: salir de la función para no seguir jugando
        }

        // 3. CHECK DE VICTORIA: ¿Se acabaron las cartas de horda?
        // Si hemos jugado las 10 rondas (o las que sean maxHordas) y seguimos vivos
        if (this.hordasJugadas >= this.maxHordas) {
            console.log("VICTORY: Has sobrevivido a todas las hordas.");
            const puntuacion = this.calcularPuntuacionFinal();
            this.scene.start('End', { 
                win: true, 
                score: puntuacion.total,
                details: puntuacion.desglose // Para mostrar detalles si quieres
            });
            return;
        }

        // 4. Si no ha terminado, continuamos la partida
        this.cambiarCartaHorda();
    }

    // ============================================================
    // CAMBIAR CARTA DE HORDA
    // ============================================================
    cambiarCartaHorda() {
        this.currentHorde.setVisible(false);

        let nuevaCarta = Phaser.Math.RND.pick(this.hordeCards);

        this.currentHorde = nuevaCarta;
        this.currentHorde.setVisible(true);
        this.currentHordeValue = parseInt(this.currentHorde.texture.key.replace('horde', ''), 10);

        // Actualizar contador visual de hordas restantes
        const text = this.botonhordasRestantes.text;
        const current = parseInt(text.replace('x', ''), 10);
        this.botonhordasRestantes.setText('x' + Math.max(current - 1, 0));
    }


    // ============================================================
    // COLOCAR CARTA EMPTY
    // ============================================================
    colocarCartaEmpty(carta) {
        // Crear una nueva imagen empty en la posición de la carta
        const nuevaEmpty = this.add.image(carta.x, carta.y, 'empty')
            .setScale(0.35)
            .setVisible(true);
        
        // Guardar para poder atenuar después
        this.cartasEmpty.push(nuevaEmpty);
    }

    // ============================================================
    // INICIAR BATALLA
    // ============================================================
    iniciarBatalla() {
        console.log("Empieza la batalla...");
    }

    attack(carta) {
        return new Promise((resolve) => {
            console.log(`Atacar con la carta: ${carta.cardKey}`);
            this.resolveAttack = resolve;

            // Delegamos TODO al manager
            // Le pasamos una "callback" que el manager llamará cuando el jugador
            // haya elegido los banners o el territorio (el momento de mostrar "Attack/Cancel")
            this.attackManager.initiateAttack(carta.cardKey, (modo) => {
                this.setupAttackCancelButtons(modo);
            });
        });
    }


    regenerarCartasUsadas() {
        // Destruir todas las cartas empty
        console.log("Regenerando cartas usadas...");
        console
        this.cartasEmpty.forEach(e => e.destroy());
        this.cartasEmpty = [];
        
        // Regenerar las cartas de ataque que estaban ocultas
        this.attackCards.forEach(card => {
            if (!card.visible) {
                // Elegir una nueva carta aleatoria
                const randomKey = Phaser.Utils.Array.GetRandom(this.attackCardKeys);
                card.setTexture(randomKey);
                card.cardKey = randomKey;
                card.setVisible(true);
                card.clearTint();
            }
        });
    }

    setupAttackCancelButtons(modo) {
        const w = this.scale.width;
        const h = this.scale.height;

        // 1. PEDIR OBJETIVOS AL MANAGER
        const objetivos = this.attackManager.calculateTargets(
            this.territories, 
            this.cartaSeleccionada.cardKey
        );
        
        // 2. CÁLCULOS PREVIOS
        const costePrevisto = this.calcularCosteFlechas(objetivos);
        const textoOriginal = this.botonflechasRestantes.text;
        const flechasActuales = parseInt(textoOriginal.replace('x', ''), 10);

        // 3. ACTUALIZAR UI (PREVIEW)
        // Mostramos el coste en rojo al lado del carcaj
        this.botonflechasRestantes.setText(`${textoOriginal} -${costePrevisto}`);
        this.botonflechasRestantes.setStyle({ color: COLORES.TEXTO_ERROR }); // Rojo

        this.arrow.setVisible(true);
        this.botonFlechasGasto = this.add.text(
            w * 0.855, h * 0.485,
            `x${costePrevisto}`,
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '27px', color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // 4. CREAR BOTÓN CANCELAR (Siempre igual)
        this.botonCancel = this.add.text(
            w * 0.74, h * 0.555,
            'Cancel',
            { fontFamily: FUENTES.PRINCIPAL, fontSize: '27px', color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // Efectos Hover Cancelar
        this.botonCancel.on('pointerover', () => { this.botonCancel.setScale(1.1); this.botonCancel.setText(`>${this.botonCancel.text}<`); });
        this.botonCancel.on('pointerout', () => { this.botonCancel.setScale(1); this.botonCancel.setText(this.botonCancel.text.replace(/>/g, '').replace(/</g, '')); });

        // Listener Cancelar (Usando AttackManager)
        this.botonCancel.on('pointerdown', () => {
            this.limpiarInterfazAtaque(); // Función auxiliar para limpiar UI
            
            // LIMPIEZA DE LÓGICA (Delegada al Manager)
            this.attackManager.cleanUp();
            
            // Restaurar textos
            this.botonflechasRestantes.setText(textoOriginal);
            this.botonflechasRestantes.setStyle({ color: COLORES.TEXTO_PRINCIPAL });
            this.logoIngles.setVisible(true);

            if (this.resolveAttack) this.resolveAttack(false);
        });

        // 5. LÓGICA DE VALIDACIÓN (Botón Attack vs No Arrows)
        if (costePrevisto > flechasActuales) {
            // A) NO HAY FLECHAS SUFICIENTES
            this.botonAttackFinal = this.add.text(
                w * 0.88, h * 0.555,
                'NO ARROWS\nLEFT', 
                { fontFamily: FUENTES.PRINCIPAL, fontSize: '20px', color: COLORES.TEXTO_ERROR, align: 'center', padding: { x: 5, y: 5 } }
            ).setOrigin(0.5);
            // No añadimos listener, solo se puede cancelar.

        } else {
            // B) SÍ HAY FLECHAS -> Botón Attack funcional
            this.botonAttackFinal = this.add.text(
                w * 0.88, h * 0.555,
                'Attack',
                { fontFamily: FUENTES.PRINCIPAL, fontSize: '27px', color: COLORES.TEXTO_PRINCIPAL, padding: { x: 20, y: 10 } }
            ).setOrigin(0.5).setInteractive();

            // Efectos Hover Attack
            this.botonAttackFinal.on('pointerover', () => { this.botonAttackFinal.setScale(1.1); this.botonAttackFinal.setText(`>${this.botonAttackFinal.text}<`); });
            this.botonAttackFinal.on('pointerout', () => { this.botonAttackFinal.setScale(1); this.botonAttackFinal.setText(this.botonAttackFinal.text.replace(/>/g, '').replace(/</g, '')); });

            // Listener Atacar (Usando AttackManager)
            this.botonAttackFinal.on('pointerdown', () => {
                this.limpiarInterfazAtaque();

                // Restaurar estilo (el número se actualizará en danarTerritorios)
                this.botonflechasRestantes.setText(textoOriginal);
                this.botonflechasRestantes.setStyle({ color: COLORES.TEXTO_PRINCIPAL });

                // LIMPIEZA DE LÓGICA (Delegada al Manager)
                this.attackManager.cleanUp();

                // Ejecutar daño
                this.danarTerritorios(objetivos);

                this.logoIngles.setVisible(true);
                if (this.resolveAttack) this.resolveAttack(true);
            });
        }
    }

    // Helper pequeño para no repetir código de limpieza visual
    limpiarInterfazAtaque() {
        this.arrow.setVisible(false);
        if (this.botonFlechasGasto) this.botonFlechasGasto.destroy();
        if (this.botonCancel) this.botonCancel.destroy();
        if (this.botonAttackFinal) this.botonAttackFinal.destroy();
    }


    // ============================================================
    // APLICAR DAÑO
    // ============================================================
    danarTerritorios(territoriosObjetivo) {
        // 1. Calcular y restar flechas
        const coste = this.calcularCosteFlechas(territoriosObjetivo);
        
        // Actualizar UI
        let flechasActuales = parseInt(this.botonflechasRestantes.text.replace('x', ''), 10);
        flechasActuales = Math.max(0, flechasActuales - coste);
        this.botonflechasRestantes.setText('x' + flechasActuales);
        
        console.log(`Ataque a ${territoriosObjetivo.length} territorios. Coste: ${coste} flechas.`);

        let alMenosUnAcierto = false;

        // 2. Recorrer territorios y aplicar lógica
        territoriosObjetivo.forEach(territorio => {
            let impacto = false;

            // --- GESTIÓN DE ORCOS ---
            // removeLastUnit devuelve true si logró borrar algo
            if (territorio.removeLastUnit('orco')) {
                impacto = true;
                alMenosUnAcierto = true;
            }

            // --- GESTIÓN DE GUERREROS (Fuego amigo) ---
            if (territorio.removeLastUnit('guerrero')) {
                impacto = true;
                console.log(`¡Fuego amigo en ${territorio.key}! Guerrero eliminado.`);
            }

            // --- FEEDBACK VISUAL ---
            if (impacto) {
                // Si hubo daño: Parpadeo Rojo (Método de la clase Territory)
                territorio.hacerParpadeo(0xff0000);
            } else {
                // Si fue fallo: Parpadeo Gris (Transparencia)
                // Esto no está en la clase Territory, lo mantenemos aquí o podríamos añadir un método 'animarFallo()'
                this.tweens.add({
                    targets: territorio.list[0], // La imagen de fondo
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true
                });
            }
        });

        if (alMenosUnAcierto) {
            console.log("El ataque tuvo efecto en el enemigo.");
        }
    }

    // ============================================================
    // CALCULAR COSTE DE FLECHAS
    // ============================================================
    calcularCosteFlechas(territorios) {
        let costeTotal = 0;

        territorios.forEach(t => {
            // REFACTORIZADO: Usamos los métodos de la clase Territory
            const tieneOrcos = t.contarUnidades('orco') > 0;
            const tieneGuerreros = t.contarUnidades('guerrero') > 0;

            if (tieneOrcos && tieneGuerreros) {
                costeTotal += 4; // Fuego cruzado
            } else if (tieneGuerreros) {
                costeTotal += 3; // Fuego amigo
            } else if (tieneOrcos) {
                costeTotal += 1; // Tiro limpio
            } else {
                costeTotal += 2; // Disparo al aire
            }
        });

        return costeTotal;
    }


    // ============================================================
    // RESOLVER COMBATE (Actualizado con Efecto Visual)
    // ============================================================
    resolverCombate() {
        console.log("--- Resolviendo combate cuerpo a cuerpo ---");

        this.territories.forEach(territorio => {
            let orcos = territorio.list.filter(c => c.tipo === 'orco');
            let guerreros = territorio.list.filter(c => c.tipo === 'guerrero');
            let numOrcos = orcos.length;
            let numGuerreros = guerreros.length;

            if (numOrcos === 0 || numGuerreros === 0) return;

            // 1. EFECTO VISUAL: Parpadeo ROJO indicando batalla
            // Tintamos la imagen del territorio (index 0)
            this.tweens.add({
                targets: territorio.list[0],
                tint: 0xff0000,
                duration: 150,
                yoyo: true,
                repeat: 1 // Parpadeara 2 veces
            });

            // 2. CÁLCULO DE BAJAS
            const paresDeGuerreros = Math.floor(numGuerreros / 2);
            const orcosA_Eliminar = Math.min(paresDeGuerreros, numOrcos);
            const guerrerosA_Sacrificar = orcosA_Eliminar * 2;
            
            // Verificamos si sobra guerrero solitario
            let guerreroSolitarioMuere = false;
            let orcosRestantes = numOrcos - orcosA_Eliminar;
            let guerrerosRestantes = numGuerreros - guerrerosA_Sacrificar;
            
            if (orcosRestantes > 0 && guerrerosRestantes > 0) {
                guerreroSolitarioMuere = true;
            }

            // 3. APLICAR BAJAS (Con retraso para ver el parpadeo)
            this.time.delayedCall(400, () => {
                // Eliminar Orcos
                for (let i = 0; i < orcosA_Eliminar; i++) {
                    const o = orcos.pop(); 
                    if(o) o.destroy();
                }
                // Eliminar Guerreros Sacrificados
                for (let i = 0; i < guerrerosA_Sacrificar; i++) {
                    const g = guerreros.pop();
                    if(g) g.destroy();
                }
                // Eliminar Guerrero Solitario (si aplica)
                if (guerreroSolitarioMuere) {
                    const g = guerreros.pop();
                    if(g) g.destroy();
                }
            });
        });
    }

    moveWarrior() {
        return new Promise((resolve) => {
            console.log("Iniciando movimiento de guerrero...");
            
            this.isMovingWarrior = true;

            // 1. Crear Botón de Cancelar (Manual, como acordamos)
            const btnCancel = this.add.text(
                this.scale.width * 0.89, this.scale.height * 0.535, 'Cancel',
                { fontFamily: 'Diogenes', fontSize: '32px', color: '#395436'}
            ).setOrigin(0.5).setInteractive().setDepth(100);

            // Efectos visuales del botón
            btnCancel.on('pointerover', () => { btnCancel.setScale(1.1); btnCancel.setText(`>${btnCancel.text}<`); });
            btnCancel.on('pointerout', () => { btnCancel.setScale(1); btnCancel.setText(btnCancel.text.replace(/>/g, '').replace(/</g, '')); });

            // 2. Instrucciones
            const instrucciones = this.add.text(
                this.scale.width * 0.82, this.scale.height * 0.5,
                'Click on the origin territory\nof the warrior',
                { fontFamily: 'Diogenes', fontSize: '28px', color: '#395436', padding: { x: 20, y: 10 } }
            ).setOrigin(0.5).setDepth(100);

            let fase = 'origen';
            let territorioOrigen = null;

            // Función de limpieza
            const limpiarUI = () => {
                this.isMovingWarrior = false;
                btnCancel.destroy();
                instrucciones.destroy();
                
                this.territories.forEach(t => {
                    t.list[0].clearTint(); 
                    t.setAlpha(1);
                    if (t.tempMoveListener) {
                        t.off('pointerdown', t.tempMoveListener);
                        t.tempMoveListener = null;
                    }
                });
            };

            // Cancelar
            btnCancel.on('pointerdown', () => {
                limpiarUI();
                resolve(false); 
            });

            // === CONFIGURAR TERRITORIOS ===
            this.territories.forEach(territorio => {
                const moveListener = () => {
                    // --- FASE 1: ORIGEN ---
                    if (fase === 'origen') {
                        // REFACTORIZADO: Usamos contarUnidades
                        if (territorio.contarUnidades('guerrero') > 0) {
                            territorioOrigen = territorio;
                            fase = 'destino';
                            
                            // Visual: Marcar origen
                            territorio.list[0].setTint(0x00ff00); 
                            instrucciones.setText('Click on the destination territory\nof the warrior');
                            
                            // Oscurecer no válidos
                            const vecinos = this.adyacencias[territorio.key];
                            this.territories.forEach(t => {
                                if (!vecinos.includes(t.key)) t.setAlpha(0.5); 
                            });
                        } else {
                            console.log("Este territorio no tiene guerreros.");
                        }
                    } 
                    // --- FASE 2: DESTINO ---
                    else if (fase === 'destino') {
                        const esVecino = this.adyacencias[territorioOrigen.key].includes(territorio.key);
                        
                        if (esVecino) {
                            // === EJECUTAR MOVIMIENTO (Lógica encapsulada) ===
                            
                            // 1. Quitar del Origen
                            territorioOrigen.removeLastUnit('guerrero');
                            
                            // 2. Añadir al Destino
                            territorio.addWarrior();

                            // 3. Feedback Visual (Parpadeo de llegada)
                            this.tweens.add({
                                targets: territorio.list[0],
                                alpha: 0.2, yoyo: true, duration: 150, repeat: 2
                            });

                            limpiarUI();
                            resolve(true); 
                        }
                    }
                };

                territorio.tempMoveListener = moveListener;
                territorio.on('pointerdown', moveListener);
            });
        });
    }

    // ============================================================
    // CALCULAR PUNTUACIÓN FINAL
    // ============================================================
    calcularPuntuacionFinal() {
        // 1. Territorios no destruidos (+10 c/u)
        const territoriosVivos = this.territories.filter(t => !t.destruido).length;
        const puntosTerritorios = territoriosVivos * 10;

        // 2. Flechas restantes (+1 c/u)
        const textoFlechas = this.botonflechasRestantes.text.replace('x', '');
        const flechasRestantes = parseInt(textoFlechas, 10);
        const puntosFlechas = flechasRestantes * 1;

        // 3. Orcos en el mapa (-3 c/u)
        let totalOrcos = 0;
        this.territories.forEach(t => {
            totalOrcos += t.list.filter(c => c.tipo === 'orco').length;
        });
        const puntosOrcos = totalOrcos * -3;

        const total = puntosTerritorios + puntosFlechas + puntosOrcos;

        console.log(`Puntuación: Territorios(${puntosTerritorios}) + Flechas(${puntosFlechas}) - Orcos(${Math.abs(puntosOrcos)}) = ${total}`);

        return {
            total: total,
            desglose: `Territories: +${puntosTerritorios} | Arrows: +${puntosFlechas} | Orcs: ${puntosOrcos}`
        };
    }

}