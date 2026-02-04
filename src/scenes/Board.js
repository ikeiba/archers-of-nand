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
        // --- SISTEMA DE ESTADOS DEL JUEGO ---
        this.estados = {
            COLOCAR_GUERRERO: 'colocar_guerrero',
            TIRAR_MONEDAS: 'tirar_monedas',
            SELECCIONAR_CARTA: 'seleccionar_carta',
            EJECUTAR_ACCION: 'ejecutar_accion',
            MELEE_FIGHT: 'melee_fight'
        };

        // --- MAPA DE ADYACENCIAS ---
        // Define quién es vecino de quién
        this.adyacencias = {
            'bekstenholm': ['klifstenvik', 'beknesvik', 'aenesholm', 'aestensand', 'bekdalsand', 'klifdalholm'],
            'klifstenvik': ['bekstenholm', 'klifdalholm', 'beknesvik'],
            'beknesvik':   ['bekstenholm', 'klifstenvik', 'aenesholm'],
            'aenesholm':   ['bekstenholm', 'beknesvik', 'aestensand'],
            'aestensand':  ['bekstenholm', 'aenesholm', 'bekdalsand'],
            'bekdalsand':  ['bekstenholm', 'aestensand', 'klifdalholm'],
            'klifdalholm': ['bekstenholm', 'bekdalsand', 'klifstenvik']
        };

        this.estadoActual = this.estados.COLOCAR_GUERRERO;
        this.cartasEmpty = [];
        this.cartasUsadas = 0;
        
        // --- FONDO ---
        this.add.image(595, 359, 'background');

        // --- LOGOS ---
        this.logoCastellano = this.add.image(this.scale.width * 0.82, this.scale.height * 0.5, 'logo_spanish').setScale(0.2).setVisible(false);
        this.logoIngles = this.add.image(this.scale.width * 0.795, this.scale.height * 0.5, 'logo_english').setScale(0.18).setVisible(false);
        
        // --- CONSTANTES DE DISEÑO ---
        const centerX = 500;
        const centerY = 357;
        const w = 241;
        const h = w / 1.30303;
        const territory_scale = 0.45;
        const ficha_scale = 0.25;

        // --- TERRITORIOS ---
        this.territories = this.crearTerritorios(centerX, centerY, w, h, territory_scale);

        // --- LISTENERS DE TERRITORIOS ---
        this.territories.forEach(t => {
            t.setSize(w * territory_scale, h * territory_scale);
            t.setInteractive();
            t.on('pointerdown', () => {
                if (this.estadoActual === this.estados.COLOCAR_GUERRERO) {
                    this.colocarGuerrero(t);
                    this.cambiarEstado(this.estados.TIRAR_MONEDAS);
                }
            });
        });


        // --- CARTAS DE ARQUERAS Y HORDAS ---
        const archer_orc_card_scale = 0.3;
        this.archerRight = this.add.image(this.scale.width * 0.12, this.scale.height * 0.24, 'archerRight').setScale(archer_orc_card_scale);
        this.archerBlank = this.add.image(this.scale.width * 0.12, this.scale.height * 0.24, 'archerBlank').setScale(archer_orc_card_scale).setVisible(false);
        this.horde3 = this.add.image(this.scale.width * 0.12, this.scale.height * 0.77, 'horde3').setScale(archer_orc_card_scale);
        this.horde4 = this.add.image(this.scale.width * 0.12, this.scale.height * 0.77, 'horde4').setScale(archer_orc_card_scale);
        this.horde5 = this.add.image(this.scale.width * 0.12, this.scale.height * 0.77, 'horde5').setScale(archer_orc_card_scale);

        // --- CARTAS DE ATAQUE ---
        const attack_card_scale = 0.35;

        // --- QUIVER ---
        this.quiver = this.add.image(this.scale.width * 0.12, this.scale.height * 0.5, 'quiver').setScale(archer_orc_card_scale);

        // --- TEXTOS/BOTONES UI ---
        this.botonPosicionarGuerrero = this.add.text(
            this.scale.width * 0.82, this.scale.height * 0.5,
            'Click on a territory to \nplace a warrior.',
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.botonflechasRestantes = this.add.text(
            this.scale.width * 0.09, this.scale.height * 0.55,
            'x50',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.botonhordasRestantes = this.add.text(
            this.scale.width * 0.185, this.scale.height * 0.866,
            'x10',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.botonDiscard = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.43,
            'Discard',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);

        this.botonMoveWarrior = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.50,
            'Move warrior',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);

        this.botonAttack = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.57,
            'Attack',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);
        
        this.botonesJuego = [];
        this.botonesJuego.push(this.botonDiscard);
        this.botonesJuego.push(this.botonMoveWarrior);
        this.botonesJuego.push(this.botonAttack);

        // Añadir listeners a todos los botones del array
        this.botonesJuego.forEach(boton => {
            // Efecto hover
            boton.on('pointerover', () => {
                boton.setScale(1.1);
                boton.setText(`>${boton.text}<`);
            });

            // Al salir el foco del ratón
            boton.on('pointerout', () => {
                boton.setScale(1);
                // Limpia el texto para quitar los '>'
                boton.setText(boton.text.replace(/>/g, '').replace(/</g, ''));
            });
        });

        // --- MONEDAS ---
        const coinScale = 0.26;
        const coinY = this.scale.height * 0.495;
        const coinX = this.scale.width * 0.785;
        this.coins = [];
        const coinKeys = ['coin_red', 'coin_green', 'coin_blue'];
        
        for (let i = 0; i < 3; i++) {
            const coin = this.add.image(coinX + i * 30, coinY, 'coin_empty')
                .setScale(coinScale)
                .setInteractive()
                .setVisible(false);
            coin.colorKey = coinKeys[i];
            coin.initialX = coin.x;
            coin.initialY = coin.y;
            this.coins.push(coin);
        }

        // --- LISTENER GLOBAL DE MONEDAS ---
        this.input.on('gameobjectdown', (pointer, obj) => {
            if (!this.coins.includes(obj)) return;
            if (this.estadoActual !== this.estados.TIRAR_MONEDAS) return;
            
            // --- NUEVO: PROTECCIÓN CONTRA CLICS RÁPIDOS ---
            if (this.monedasLanzandose) return; // Si ya se están moviendo, ignorar clic
            if (this.currentHordeValue <= 0) return; // Si ya no quedan tiradas, ignorar
            
            this.monedasLanzandose = true; // ACTIVAMOS EL BLOQUEO
            // ----------------------------------------------

            this.currentHordeValue--;
            this.barajarMonedas();
            
            // Si era la última tirada, esperar a que termine la animación
            if (this.currentHordeValue === 0) {
                this.time.delayedCall(1700, () => {
                    this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
                    // Importante: No hace falta poner monedasLanzandose = false aquí 
                    // porque cambiamos de estado y este listener ya no actuará.
                });
            }
        });

        // Boton para controlar si las monedas se estan lanzando
        this.monedasLanzandose = false;

        // --- SISTEMA DE HORDAS ---
        this.maxHordas = 10;
        this.hordeCards = [this.horde3, this.horde4, this.horde5];
        
        // Ocultar todas y mostrar una aleatoria
        this.hordeCards.forEach(c => c.setVisible(false));
        this.currentHorde = Phaser.Math.RND.pick(this.hordeCards);
        this.currentHorde.setVisible(true);
        
        // Valor numérico de la horda actual (3, 4 o 5)
        this.currentHordeValue = parseInt(this.currentHorde.texture.key.replace('horde', ''), 10);

        // --- BOTÓN FIGHT ---
        this.botonFight = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.54,
            'FIGHT',
            { fontFamily: 'Diogenes', fontSize: '28px', color: '#395436', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);

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

        // Efecto hover
        this.botonFight.on('pointerover', () => {
            this.botonFight.setScale(1.1);
            this.botonFight.setText(">FIGHT<")
        });

        // Al salir el foco del raton
        this.botonFight.on('pointerout', () => {
            this.botonFight.setScale(1);
            this.botonFight.setText("FIGHT")
        });
        
        // TEXTO MELEE FIGHT
        this.textoMelee = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.444,
            'Melee fight',
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive().setVisible(false);

        // === INICIALIZAR CARTAS DE ATAQUE ALEATORIAS (CON REPETICIÓN) ===
        this.attackCardKeys = ['and', 'or', 'xor', 'count', 'like', 'flare', 'not'];

        // Cuatro posiciones visibles
        this.attackCardPositions = [
            { x: this.scale.width * 0.74, y: this.scale.height * 0.24 },
            { x: this.scale.width * 0.88, y: this.scale.height * 0.24 },
            { x: this.scale.width * 0.74, y: this.scale.height * 0.74 },
            { x: this.scale.width * 0.88, y: this.scale.height * 0.74 }
        ];

        this.attackCards = [];
        for (let i = 0; i < 4; i++) {
            const randomKey = Phaser.Utils.Array.GetRandom(this.attackCardKeys);
            const pos = this.attackCardPositions[i];
            const card = this.add.image(pos.x, pos.y, randomKey)
                .setScale(attack_card_scale)
                .setInteractive();
            card.cardKey = randomKey;
            this.attackCards.push(card);
        }

        // === INTERACCIÓN CON LAS CARTAS DE ATAQUE ===
        this.attackCards.forEach(card => {
            card.on('pointerover', () => {
                if (this.estadoActual !== this.estados.SELECCIONAR_CARTA) return;
                card.setScale(attack_card_scale * 1.01);
            });

            card.on('pointerout', () => {
                if (this.estadoActual !== this.estados.SELECCIONAR_CARTA) return;
                card.setScale(attack_card_scale);
            });

            card.on('pointerdown', () => {
                if (this.estadoActual !== this.estados.SELECCIONAR_CARTA) return;
                
                // Deseleccionar todas y atenuar
                this.attackCards.forEach(c => {
                    c.selected = false;
                    c.setScale(attack_card_scale);
                    c.setTint(0x888888);
                });

                // Seleccionar la carta actual (sin tinte = brillo normal)
                card.selected = true;
                card.clearTint();
                this.cartaSeleccionada = card;

                // Mostrar botones de acción
                this.botonesJuego.forEach(b => b.setVisible(true));
                this.logoIngles.setVisible(false);
            });
        });

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
                }
            } else {
                console.log('Movimiento cancelado.');
                this.cartaSeleccionada.selected = false;
                this.cartaSeleccionada.clearTint();
                this.cartaSeleccionada = null;
                this.attackCards.forEach(c => c.setInteractive());
                this.logoIngles.setVisible(true);
                this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
            }
        });

        // Listener de Attack (Modificado para gestionar cancelación)
        this.botonAttack.on('pointerdown', async () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
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
                }
            } else {
                console.log('Ataque cancelado. Volviendo a selección.');
                // Canceló: Restauramos el estado visual
                this.cartaSeleccionada.selected = false;
                this.cartaSeleccionada.clearTint();
                this.cartaSeleccionada = null; // Limpiamos la selección
                this.attackCards.forEach(c => c.setInteractive()); // Reactivamos interactividad
                this.logoIngles.setVisible(true); // Restaurar logo si hace falta
                
                // Volvemos explícitamente al estado de seleccionar
                this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
            }
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
                this.coins.forEach(coin => coin.setVisible(false));
                this.logoIngles.setVisible(false);
                this.botonesJuego.forEach(b => b.setVisible(false));
                this.botonFight.setVisible(false);
                this.textoMelee.setVisible(false);
                break;
                
            case this.estados.TIRAR_MONEDAS:
                this.botonPosicionarGuerrero.setVisible(false);
                this.coins.forEach(coin => coin.setVisible(true));
                break;
                
            case this.estados.SELECCIONAR_CARTA:
                this.coins.forEach(coin => coin.setVisible(false));
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
                break;
        }
    }

    // ============================================================
    // CREAR TERRITORIOS
    // ============================================================
    crearTerritorios(centerX, centerY, w, h, s) {
        const crear = (x, y, key, keyDestroyed, colores) => {
            const contenedor = this.add.container(x, y);
            const normal = this.add.image(0, 0, key).setScale(s);
            const destroyed = this.add.image(0, 0, keyDestroyed).setScale(s).setVisible(false);
            contenedor.add([normal, destroyed]);
            contenedor.key = key;
            contenedor.colores = colores;
            return contenedor;
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
    // COLOCAR GUERRERO (Actualizado)
    // ============================================================
    colocarGuerrero(territorio) {
        // Cálculo inicial de posición (para que aparezca antes de animarse)
        const nombreArriba = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
        const yBase = nombreArriba.includes(territorio.key) ? 55 : -55;
        
        // Creamos la ficha en el centro (o donde quieras que nazca)
        const ficha = this.add.image(0, yBase, 'guerrero').setScale(0.47);
        ficha.tipo = 'guerrero';
        territorio.add(ficha);

        // Actualizamos la visualización (lineal o apilada)
        this.apilarFichasEnCentro(territorio, 'guerrero');

        const guerreros = territorio.list.filter(f => f.tipo === 'guerrero').length;
        const orcos = territorio.list.filter(f => f.tipo === 'orco').length;
        console.log(`${territorio.key}: Guerreros=${guerreros}, Orcos=${orcos}`);
    }

    // ============================================================
    // COLOCAR ORCO (Actualizado)
    // ============================================================
    colocarOrco(territorio) {
        if (this.estadoActual !== this.estados.TIRAR_MONEDAS) return;

        const nombreAbajo = ['klifstenvik', 'bekstenholm', 'aestensand'];
        const yBase = nombreAbajo.includes(territorio.key) ? -5 : 0;

        // Añadir ficha nueva
        const ficha = this.add.image(0, yBase, 'orco').setScale(0.42);
        ficha.tipo = 'orco';
        territorio.add(ficha);

        // Actualizar visualización (lineal o apilada)
        this.apilarFichasEnCentro(territorio, 'orco');

        // Lógica de Destrucción
        const orcosCount = territorio.list.filter(f => f.tipo === 'orco').length;
        
        // Si llegamos exactamente a 3, destruimos.
        // Si ya hay más de 3, sigue destruido (ya lo gestiona destruirTerritorio internamente)
        if (orcosCount === 3) {
            this.destruirTerritorio(territorio);
        }

        const guerreros = territorio.list.filter(f => f.tipo === 'guerrero').length;
        console.log(`${territorio.key}: Guerreros=${guerreros}, Orcos=${orcosCount}`);
    }

    // ============================================================
    // BARAJAR MONEDAS
    // ============================================================
    barajarMonedas() {
        const centerCoin = this.coins[1];
        const cx = centerCoin.x;
        const cy = centerCoin.y;

        // --- 1. CONVERGENCIA AL CENTRO ---
        this.coins.forEach(coin => {
            this.tweens.add({
                targets: coin,
                x: cx, y: cy,
                duration: 300,
                ease: 'Sine.easeInOut'
            });
        });

        // --- 2. PARPADEO ---
        this.time.delayedCall(300, () => {
            const flickerTimes = 6;
            this.time.addEvent({
                delay: 80,
                repeat: flickerTimes * 2 - 1,
                callback: () => {
                    this.coins.forEach(c => c.setVisible(!c.visible));
                }
            });

            // --- 3. CAMBIO DE CARAS Y DESPLIEGUE ---
            this.time.delayedCall(flickerTimes * 80, () => {
                const resultados = [];

                // Tirada aleatoria para cada moneda
                this.coins.forEach((coin, i) => {
                    const result = Phaser.Math.Between(0, 1);
                    const finalKey = result ? coin.colorKey : 'coin_empty';
                    coin.setTexture(finalKey);
                    
                    if (finalKey === 'coin_red') resultados.push('rojo');
                    if (finalKey === 'coin_green') resultados.push('verde');
                    if (finalKey === 'coin_blue') resultados.push('azul');
                });

                // Separar monedas horizontalmente
                const spacing = 111;
                const offsets = [-spacing, 0, spacing];
                this.coins.forEach((coin, i) => {
                    this.tweens.add({
                        targets: coin,
                        x: cx + offsets[i], y: cy,
                        duration: 300,
                        ease: 'Sine.easeInOut'
                    });
                });

                // --- 4. COLOCAR ORCO SEGÚN COMBINACIÓN ---
                // --- 4. COLOCAR ORCO SEGÚN COMBINACIÓN ---
                this.time.delayedCall(400, () => {
                    
                    // --- NUEVO: DESBLOQUEAR ---
                    // Permitimos volver a tirar (si quedan tiradas)
                    this.monedasLanzandose = false; 
                    // --------------------------

                    if (resultados.length === 0) {
                        if (this.archerBlank.visible) return;
                        const text = this.botonflechasRestantes.text;
                        const current = parseInt(text.replace('x', ''), 10);
                        this.botonflechasRestantes.setText('x' + Math.max(current - 1, 0));
                        this.archerBlank.setVisible(true);
                        this.tweens.add({
                            targets: this.archerBlank,
                            alpha: 0,
                            yoyo: true,
                            repeat: 2,
                            duration: 150
                        });
                        this.archerRight.setVisible(false);

                        return;
                    }

                    // Filtrar territorios con coincidencia exacta de colores
                    const territoriosCoincidentes = this.territories.filter(t => {
                        const coloresTerritorio = [...t.colores].sort().join(',');
                        const coloresResultado = [...resultados].sort().join(',');
                        return coloresTerritorio === coloresResultado;
                    });

                    // Colocar orco y hacer parpadeo visual
                    territoriosCoincidentes.forEach(t => {
                        this.colocarOrco(t);
                        const normal = t.list[0];
                        this.tweens.add({
                            targets: normal,
                            alpha: 0.3,
                            yoyo: true,
                            repeat: 3,
                            duration: 150
                        });
                    });

                    if (territoriosCoincidentes.length === 0)
                        console.log('Ningún territorio coincide con los colores:', resultados);
                });
            });
        });
    }

    // ============================================================
    // REALIZAR RONDA
    // ============================================================
    realizarRonda() {
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
    // DESTRUIR TERRITORIO (Animación y Cambio de Estado)
    // ============================================================
    destruirTerritorio(territorio) {
        // Si ya está destruido, no hacemos nada
        if (territorio.destruido) return;

        console.log(`¡El territorio ${territorio.key} ha sido destruido!`);
        territorio.destruido = true; // Marcamos el estado irreversible

        const normal = territorio.list[0];
        const destroyed = territorio.list[1];
        
        // Parpadeo alternando normal/destruido
        let count = 0;
        const maxFlickers = 6;
        
        const flicker = this.time.addEvent({
            delay: 150,
            repeat: maxFlickers - 1,
            callback: () => {
                count++;
                // Alternar visibilidad para efecto de parpadeo
                normal.setVisible(!normal.visible);
                destroyed.setVisible(!destroyed.visible);
                
                // En el último parpadeo, forzar el estado final
                if (count === maxFlickers) {
                    normal.setVisible(false);
                    destroyed.setVisible(true);
                }
            }
        });
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
            this.resolveAttack = resolve; // guardamos la función para llamarla luego

            switch(carta.cardKey) {
                case "and":
                case "or":
                case "xor":
                    console.log(`Lógica ${carta.cardKey.toUpperCase()} aplicada.`);
                    this.attackBool(carta);
                    break;
                    
                case "count":
                    console.log("Lógica COUNT aplicada.");
                    this.attackCount();
                    break;

                case "like":
                    console.log("Lógica LIKE aplicada.");
                    this.attackLike();
                    break;

                case "flare":
                    console.log("Lógica FLARE aplicada.");
                    this.attackFlare();
                    break;

                case "not":
                    console.log("Lógica NOT aplicada.");
                    this.attackNot();
                    break;
            }
        });
    }

    attackBool(carta) {
        console.log("Ataque lógico ejecutado.");

        this.textoBool = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.51,
            carta.cardKey.toUpperCase(),
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.bannerScale = 0.3; // 0.077
        this.banner_green_left = this.add.image(this.scale.width * 0.72, this.scale.height * 0.46, 'banner_green').setScale(this.bannerScale);
        this.banner_red_left = this.add.image(this.scale.width * 0.77, this.scale.height * 0.46, 'banner_red').setScale(this.bannerScale);
        this.banner_blue_left = this.add.image(this.scale.width * 0.745, this.scale.height * 0.54, 'banner_blue').setScale(this.bannerScale);
        
        this.leftBanners = [
            this.banner_green_left,
            this.banner_red_left,
            this.banner_blue_left
        ];

        this.banner_green_right = this.add.image(this.scale.width * 0.85, this.scale.height * 0.46, 'banner_green').setScale(this.bannerScale);
        this.banner_red_right = this.add.image(this.scale.width * 0.90, this.scale.height * 0.46, 'banner_red').setScale(this.bannerScale);
        this.banner_blue_right = this.add.image(this.scale.width * 0.875, this.scale.height * 0.54, 'banner_blue').setScale(this.bannerScale);

        this.rightBanners = [
        this.banner_green_right,
        this.banner_red_right,
        this.banner_blue_right
        ];

        this.selectedLeft = null;
        this.selectedRight = null;

        // Llamada a la función externa
        this.setupBannerGroup(this.leftBanners, 'left');
        this.setupBannerGroup(this.rightBanners, 'right');
    }

    attackCount() {
        const centerX = this.scale.width * 0.81;
        const centerY = this.scale.height * 0.49;
        const espaciadoX = 105;

        this.arrayCount = [];

        for (let i = 1; i <= 3; i++) {
            const x = centerX + (i - 2) * espaciadoX; // centra (1 2 3)
            const texto = this.add.text(x, centerY, `${i}`, {
                fontFamily: 'Diogenes',
                fontSize: '30px',
                color: '#395436'
            }).setOrigin(0.5).setInteractive();

            // Hover
            texto.on('pointerover', () => {
                texto.setScale(1.1);
                texto.setText(`>${texto.text}<`);
            });

            texto.on('pointerout', () => {
                texto.setScale(1);
                texto.setText(texto.text.replace(/>/g, '').replace(/</g, ''));
            });

            // Click
            texto.on('pointerdown', () => {
                this.arrayCount.forEach(t => t.destroy());
                this.setupAttackViewGeneric(texto.text.replace(/>/g, '').replace(/</g, ''));
            });

            this.arrayCount.push(texto);
        }

        console.log("Ataque COUNT ejecutado.");
    }


    attackLike() {
        console.log("Ataque LIKE ejecutado.");
        
        // === MATRIZ 3x3 PARA LIKE ===
        const matrizTextos = [
            ['KLIF', 'BEK', 'AE'],
            ['STEN', 'DAL', 'NES'],
            ['VIK', 'HOLM', 'SAND']
        ];
        
        const matrizCenterX = this.scale.width * 0.81;
        const matrizCenterY = this.scale.height * 0.49;
        const espaciadoX = 105;
        const espaciadoY = 50;
        
        this.matrizLike = [];
        
        for (let fila = 0; fila < 3; fila++) {
            for (let col = 0; col < 3; col++) {
                const x = matrizCenterX + (col - 1) * espaciadoX;
                const y = matrizCenterY + (fila - 1) * espaciadoY;
                
                const texto = this.add.text(x, y, matrizTextos[fila][col], {
                    fontFamily: 'Diogenes',
                    fontSize: '30px',
                    color: '#395436'
                }).setOrigin(0.5).setInteractive();
                
                // Listeners de hover
                texto.on('pointerover', () => {
                    texto.setScale(1.1);
                    texto.setText(`>${texto.text}<`);
                });
                
                texto.on('pointerout', () => {
                    texto.setScale(1);
                    texto.setText(texto.text.replace(/>/g, '').replace(/</g, ''));
                });
                
                // Listener de click
                texto.on('pointerdown', () => {
                    // Eliminar todos los textos de la matriz
                    this.matrizLike.forEach(t => t.destroy());
                    // Configurar la vista de ataque específica para LIKE
                    // En vez de pasar el texto, limpiamos los símbolos '>' y '<' y pasamos el boton seleccionado
                    this.setupAttackViewGeneric(texto.text.replace(/>/g, '').replace(/</g, ''));
                });
                
                this.matrizLike.push(texto);
            }
        }
    }

    attackFlare() {
        this.textoFlare = this.add.text(
            this.scale.width * 0.82, this.scale.height * 0.5,
            "Click on a territory to\nshoot the arrows.",
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5);

        // Hacer clicables los territorios
        this.territories.forEach(territory => {
            territory.setInteractive({ useHandCursor: true });

            territory.on('pointerover', () => {
                territory.setTint(0xffff88);
            });

            territory.on('pointerout', () => {
                territory.clearTint();
            });

            territory.on('pointerdown', () => {
                // Eliminar el texto de instrucciones
                this.textoFlare.destroy();
                // Llamar a la vista de ataque con el nombre del territorio
                this.setupAttackViewGeneric(territory.key);
            });
        });

        console.log("Ataque FLARE ejecutado.");
    }

    attackNot() {
        console.log("Ataque NOT ejecutado.");
        // Mostrar título
        this.textoBool = this.add.text(
            this.scale.width * 0.81, this.scale.height * 0.51,
            "NOT",
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // Mostrar solo 1 grupo de banners (al centro)
        this.bannerScale = 0.3;
        const banner_green = this.add.image(this.scale.width * 0.76, this.scale.height * 0.46, 'banner_green').setScale(this.bannerScale);
        const banner_red = this.add.image(this.scale.width * 0.81, this.scale.height * 0.46, 'banner_red').setScale(this.bannerScale);
        const banner_blue = this.add.image(this.scale.width * 0.785, this.scale.height * 0.54, 'banner_blue').setScale(this.bannerScale);

        const banners = [banner_green, banner_red, banner_blue];
        
        // Reutilizamos setupBannerGroup pero adaptado para selección simple
        banners.forEach(banner => {
            banner.setInteractive({ useHandCursor: true });
            banner.on('pointerdown', () => {
                // Efecto visual selección
                banners.forEach(b => b.clearTint().setAlpha(0.5));
                banner.setTint(0xffff88).setAlpha(1);
                
                // Guardamos la selección en una variable temporal
                this.selectedNotBanner = banner;
                
                // Limpiamos UI anterior si existe
                if (this.botonCancel) { this.botonCancel.destroy(); this.botonAttackFinal.destroy(); }
                
                // Mostramos botones de confirmar
                this.setupAttackCancelButtons("not");
            });
        });
        
        // Guardamos referencia para borrar luego
        this.notBanners = banners;
    }

    moveWarrior() {
        console.log("Mover guerrero seleccionado.");
    }


    // === FUNCIÓN REUTILIZABLE ===
    setupBannerGroup(banners, side) {
        banners.forEach(banner => {
            banner.setInteractive({ useHandCursor: true });

            banner.on('pointerdown', () => {
                // Reinicia brillos del grupo
                banners.forEach(b => b.clearTint().setAlpha(1));

                // Marca el seleccionado
                banner.setTint(0xffff88);
                banner.setAlpha(1);
                if (side === 'left') this.selectedLeft = banner;
                else this.selectedRight = banner;

                // Oscurece los no seleccionados
                banners.filter(b => b !== banner).forEach(b => b.setAlpha(0.5));

                // Si hay uno de cada lado, oculta todos
                if (this.selectedLeft && this.selectedRight) {
                    [...this.leftBanners, ...this.rightBanners].forEach(b => {
                    b.setVisible(false);
                    });
                    this.setupAttackViewBool();
                }
            });
        });
    }

    setupAttackViewBool() {
        // Cambiamos las coordenadas del texto
        this.textoBool.setPosition(this.scale.width * 0.745, this.scale.height * 0.49);
        // Creamos una copia de los estandartes seleccionados en el centro
        this.selectedLeft = this.add.image(this.scale.width * 0.68, this.scale.height * 0.49, this.selectedLeft.texture.key).setScale(this.bannerScale);
        this.selectedRight = this.add.image(this.scale.width * 0.795, this.scale.height * 0.49, this.selectedRight.texture.key).setScale(this.bannerScale);

        this.setupAttackCancelButtons("bool");
    }

    setupAttackViewGeneric(seleccionado) {
        // Lógica para mostrar la vista de ataque genérica
        this.textoGenerico = this.add.text(
            this.scale.width * 0.745, this.scale.height * 0.49,
            seleccionado.toUpperCase(),
            { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.setupAttackCancelButtons("generico");
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
        // Creamos los botones de cancel y attack
        this.botonCancel = this.add.text(
            this.scale.width * 0.74, this.scale.height * 0.555,
            'Cancel',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        this.botonAttackFinal = this.add.text(
            this.scale.width * 0.88, this.scale.height * 0.555,
            'Attack',
            { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive();

        // Efecto hover para ambos botones
        [this.botonCancel, this.botonAttackFinal].forEach(boton => {
            boton.on('pointerover', () => {
                boton.setScale(1.1);
                boton.setText(`>${boton.text}<`);
            });
            boton.on('pointerout', () => {
                boton.setScale(1);
                boton.setText(boton.text.replace(/>/g, '').replace(/</g, ''));
            });
        });

        // ==========================================
        // LISTENER: CANCELAR
        // ==========================================
        this.botonCancel.on('pointerdown', () => {
            // Eliminar botones UI
            this.botonCancel.destroy();
            this.botonAttackFinal.destroy();

            // Limpieza específica según el modo
            if (modo === "bool") {
                this.selectedLeft.destroy();
                this.selectedRight.destroy();
                this.textoBool.destroy();    
                this.selectedLeft = null;
                this.selectedRight = null;
            } else if (modo === "not") {
                // Si guardaste los banners en 'notBanners' en attackNot
                if (this.notBanners) this.notBanners.forEach(b => b.destroy());
                this.textoBool.destroy();
                this.selectedNotBanner = null;
            } else if (modo === "generico") {
                this.textoGenerico.destroy();
            }
            
            // RESOLVEMOS CON FALSE -> Indica que NO se gastó la carta
            if (this.resolveAttack) this.resolveAttack(false);
        });

        // ==========================================
        // LISTENER: ATACAR (LÓGICA PRINCIPAL)
        // ==========================================
        this.botonAttackFinal.on('pointerdown', () => {
            // 1. Eliminar botones UI
            this.botonCancel.destroy();
            this.botonAttackFinal.destroy();

            // 2. Definir mapa de colores y variables
            const colorMap = { 'banner_red': 'rojo', 'banner_green': 'verde', 'banner_blue': 'azul' };
            let objetivos = [];

            // 3. Ejecutar lógica según el modo
            if (modo === "bool") {
                // --- CARTAS: AND, OR, XOR ---
                const colorL = colorMap[this.selectedLeft.texture.key];
                const colorR = colorMap[this.selectedRight.texture.key];
                const operacion = this.textoBool.text; // "AND", "OR", "XOR"

                objetivos = this.territories.filter(t => {
                    const tieneL = t.colores.includes(colorL);
                    const tieneR = t.colores.includes(colorR);
                    
                    switch(operacion) {
                        case 'AND': return tieneL && tieneR;
                        case 'OR':  return tieneL || tieneR;
                        // XOR: (Uno u otro) Y (No ambos)
                        case 'XOR': return tieneL !== tieneR; 
                        default: return false;
                    }
                });

                // Limpieza visual
                this.selectedLeft.destroy();
                this.selectedRight.destroy();
                this.textoBool.destroy();    

            } else if (modo === "not") {
                // --- CARTA: NOT ---
                // Verifica que attackNot() defina this.selectedNotBanner
                const color = colorMap[this.selectedNotBanner.texture.key];
                
                // Objetivo: Territorios que NO tienen ese color
                objetivos = this.territories.filter(t => !t.colores.includes(color));
                
                // Limpieza visual
                if (this.notBanners) this.notBanners.forEach(b => b.destroy());
                this.textoBool.destroy();

            } else if (modo === "generico") {
                // --- CARTAS: COUNT, LIKE, FLARE ---
                const valor = this.textoGenerico.text; // Ej: "1", "KLIF", "BEKSTENHOLM"
                const cartaActual = this.cartaSeleccionada.cardKey; 

                if (cartaActual === 'count') {
                    // Ataca territorios con X colores exactos
                    const numero = parseInt(valor, 10);
                    objetivos = this.territories.filter(t => t.colores.length === numero);
                
                } else if (cartaActual === 'like') {
                    // Ataca territorios cuyo nombre contenga el texto (ej: "KLIF")
                    objetivos = this.territories.filter(t => t.key.toUpperCase().includes(valor));
                
                } else if (cartaActual === 'flare') {
                    // Ataca al territorio exacto seleccionado
                    objetivos = this.territories.filter(t => t.key.toUpperCase() === valor);
                }

                // Limpieza visual
                this.textoGenerico.destroy();
            }

            // 4. Aplicar daño a los territorios calculados
            this.danarTerritorios(objetivos);

            // RESOLVEMOS CON TRUE -> Indica que SÍ se gastó la carta
            if (this.resolveAttack) this.resolveAttack(true);
        });
    }


    // ============================================================
    // APLICAR DAÑO (Eliminar Orcos y Guerreros + Coste Flechas)
    // ============================================================
    danarTerritorios(territoriosObjetivo) {
        // 1. Calcular y restar flechas
        const coste = this.calcularCosteFlechas(territoriosObjetivo);
        
        // Obtener flechas actuales del texto
        let flechasActuales = parseInt(this.botonflechasRestantes.text.replace('x', ''), 10);
        
        // Actualizar UI (evitando negativos si quieres)
        flechasActuales = Math.max(0, flechasActuales - coste);
        this.botonflechasRestantes.setText('x' + flechasActuales);
        
        console.log(`Ataque a ${territoriosObjetivo.length} territorios. Coste: ${coste} flechas.`);

        // 2. Aplicar daño a las unidades
        let alMenosUnAcierto = false;

        territoriosObjetivo.forEach(territorio => {
            let impacto = false;

            // --- GESTIÓN DE ORCOS ---
            const orcos = territorio.list.filter(child => child.tipo === 'orco');
            if (orcos.length > 0) {
                const orcoEliminado = orcos[orcos.length - 1]; // Quitar el último añadido
                orcoEliminado.destroy();
                impacto = true;
                alMenosUnAcierto = true;

                // [NUEVO] Refrescar visualización tras eliminar
                // Pequeño delay para que Phaser procese el destroy
                this.time.delayedCall(50, () => {
                    this.apilarFichasEnCentro(territorio, 'orco');
                });
            }

            // --- GESTIÓN DE GUERREROS ---
            // Nota: Se eliminan TAMBIÉN si hay guerreros (fuego amigo)
            const guerreros = territorio.list.filter(child => child.tipo === 'guerrero');
            if (guerreros.length > 0) {
                const guerreroEliminado = guerreros[guerreros.length - 1];
                guerreroEliminado.destroy();
                impacto = true;
                console.log(`¡Fuego amigo en ${territorio.key}! Guerrero eliminado.`);

                // [NUEVO] Refrescar visualización tras eliminar
                this.time.delayedCall(50, () => {
                    this.apilarFichasEnCentro(territorio, 'guerrero');
                });
            }

            // --- FEEDBACK VISUAL ---
            if (impacto) {
                // Parpadeo rojo si golpeamos algo (orco o guerrero)
                this.tweens.add({
                    targets: territorio.list[0],
                    tint: 0xff0000,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => { territorio.list[0].clearTint(); }
                });
            } else {
                // Parpadeo gris/transparente si fue un fallo (territorio vacío)
                this.tweens.add({
                    targets: territorio.list[0],
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
            const tieneOrcos = t.list.some(child => child.tipo === 'orco');
            const tieneGuerreros = t.list.some(child => child.tipo === 'guerrero');

            if (tieneOrcos && tieneGuerreros) {
                costeTotal += 4; // Fuego cruzado (el peor caso)
            } else if (tieneGuerreros) {
                costeTotal += 3; // Fuego amigo
            } else if (tieneOrcos) {
                costeTotal += 1; // Tiro limpio (el mejor caso)
            } else {
                costeTotal += 2; // Disparo al aire (fallo)
            }
        });

        return costeTotal;
    }

    // ============================================================
    // APILAR FICHAS (Visualización > 3 unidades)
    // ============================================================
    apilarFichasEnCentro(territorio, tipo) {
        // Filtramos las unidades de ese tipo (orco o guerrero)
        const unidades = territorio.list.filter(child => child.tipo === tipo);
        const cantidad = unidades.length;

        // Si hay menos de 4, usamos la distribución normal (lineal) y borramos contadores si existen
        if (cantidad < 4) {
            this.distribuirFichasLinealmente(territorio, tipo);
            // Buscar y borrar texto de contador antiguo si existe
            const contadorAntiguo = territorio.list.find(c => c.name === `contador_${tipo}`);
            if (contadorAntiguo) contadorAntiguo.destroy();
            return;
        }

        // === MODO APILADO (4 o más) ===
        
        // 1. Ocultar todas las unidades visuales primero
        unidades.forEach(u => u.setVisible(false));

        // 2. Tomar las 3 primeras para hacer el "stack" visual
        const stackVisual = [unidades[0], unidades[1], unidades[2]];
        
        // Ajustes de posición para el apilamiento (centro ligeramente desplazado)
        // El centro es 0. Desplazamiento sutil para ver las fichas de atrás
        const offsets = [-10, 0, 10]; 
        
        // Dependiendo del territorio, la Y base cambia (como ya tenías)
        const nombreArriba = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
        const esArriba = nombreArriba.includes(territorio.key);
        // Si es guerrero y es territorio de arriba, y = 55. Si es orco, y = -5, etc.
        // Simplificamos usando la Y que ya tenían o calculándola de nuevo:
        let yBase = 0;
        if (tipo === 'guerrero') yBase = esArriba ? 55 : -55;
        else yBase = (['klifstenvik', 'bekstenholm', 'aestensand'].includes(territorio.key)) ? -5 : 0;

        stackVisual.forEach((ficha, i) => {
            ficha.setVisible(true);
            ficha.setDepth(i); // Asegurar que la última tape a la anterior
            
            // Animación de deslizamiento hacia el centro apilado
            this.tweens.add({
                targets: ficha,
                x: offsets[i],
                y: yBase,
                duration: 400,
                ease: 'Power2'
            });
        });

        // 3. Crear o Actualizar el Contador de Texto
        let contador = territorio.list.find(c => c.name === `contador_${tipo}`);
        
        // Posición del texto (esquina superior derecha relativa al stack)
        const textX = 35; 
        const textY = yBase - 20;

        if (!contador) {
            contador = this.add.text(textX, textY, `x${cantidad}`, {
                fontFamily: 'Diogenes',
                fontSize: '24px',
                color: (tipo === 'orco') ? '#ffffff' : '#000000',
                stroke: '#000000',
                strokeThickness: (tipo === 'orco') ? 2 : 0
            }).setOrigin(0, 0.5);
            contador.name = `contador_${tipo}`;
            territorio.add(contador);
        } else {
            contador.setText(`x${cantidad}`);
            // Traer al frente
            territorio.bringToTop(contador);
        }
    }

    // Función auxiliar para restaurar la vista normal (1, 2 o 3 fichas separadas)
    distribuirFichasLinealmente(territorio, tipo) {
        const unidades = territorio.list.filter(child => child.tipo === tipo);
        const cantidad = unidades.length;
        if (cantidad === 0) return;

        // Posiciones según cantidad: 
        // 1 ficha: [0]
        // 2 fichas: [-25, 25] (aprox)
        // 3 fichas: [-50, 0, 50]
        let posicionesX = [];
        if (cantidad === 1) posicionesX = [0];
        else if (cantidad === 2) posicionesX = [-30, 30];
        else posicionesX = [-52, 0, 52];

        const nombreArriba = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
        const esArriba = nombreArriba.includes(territorio.key);
        let yBase = 0;
        if (tipo === 'guerrero') yBase = esArriba ? 55 : -55;
        else yBase = (['klifstenvik', 'bekstenholm', 'aestensand'].includes(territorio.key)) ? -5 : 0;

        unidades.forEach((ficha, i) => {
            ficha.setVisible(true);
            this.tweens.add({
                targets: ficha,
                x: posicionesX[i],
                y: yBase,
                duration: 300,
                ease: 'Power2'
            });
        });
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

                // 4. REORGANIZAR VISTA
                this.apilarFichasEnCentro(territorio, 'orco');
                this.apilarFichasEnCentro(territorio, 'guerrero');
            });
        });
    }

    moveWarrior() {
        return new Promise((resolve) => {
            console.log("Iniciando movimiento de guerrero...");
            
            // 1. Crear Botón de Cancelar
            const btnCancel = this.add.text(
                this.scale.width * 0.5, this.scale.height * 0.55, 'Cancel',
                { fontFamily: 'Diogenes', fontSize: '27px', color: '#395436', backgroundColor: '#000000' }
            ).setOrigin(0.5).setInteractive().setDepth(100); // Depth alto para estar encima de todo

            // 2. Crear Texto de Instrucciones
            const instrucciones = this.add.text(
                this.scale.width * 0.5, this.scale.height * 0.5,
                'Click on the origin territory\nof the warrior',
                { fontFamily: 'Diogenes', fontSize: '30px', color: '#395436', align: 'center' }
            ).setOrigin(0.5).setDepth(100);

            // Variables de estado local para esta función
            let fase = 'origen'; // 'origen' o 'destino'
            let territorioOrigen = null;

            // Función de limpieza (Resetear tablero y UI)
            const limpiarUI = () => {
                btnCancel.destroy();
                instrucciones.destroy();
                this.territories.forEach(t => {
                    t.clearTint();
                    t.setAlpha(1);
                    t.off('pointerdown'); // Importante: quitar listeners temporales
                });
            };

            // === LISTENER CANCELAR ===
            btnCancel.on('pointerdown', () => {
                limpiarUI();
                resolve(false); // Retorna false (no gastar carta)
            });

            // === CONFIGURAR TERRITORIOS ===
            this.territories.forEach(territorio => {
                territorio.setInteractive();

                territorio.on('pointerdown', () => {
                    // --- FASE 1: SELECCIONAR ORIGEN ---
                    if (fase === 'origen') {
                        const guerreros = territorio.list.filter(c => c.tipo === 'guerrero');
                        
                        // Solo válido si tiene guerreros
                        if (guerreros.length > 0) {
                            territorioOrigen = territorio;
                            fase = 'destino';
                            
                            // Feedback Visual
                            territorio.setTint(0x00ff00); // Verde para el origen
                            instrucciones.setText('Click on the destination territory\nof the warrior');
                            
                            // Obtener vecinos válidos
                            const vecinos = this.adyacencias[territorio.key];

                            // Oscurecer los NO adyacentes y el propio origen
                            this.territories.forEach(t => {
                                if (!vecinos.includes(t.key)) {
                                    t.setAlpha(0.5); // Apagar los no válidos
                                }
                            });
                        } else {
                            // Feedback de error (opcional): Shake o sonido
                            console.log("Este territorio no tiene guerreros.");
                        }
                    } 
                    // --- FASE 2: SELECCIONAR DESTINO ---
                    else if (fase === 'destino') {
                        // Verificar si es vecino válido
                        const esVecino = this.adyacencias[territorioOrigen.key].includes(territorio.key);
                        
                        if (esVecino) {
                            // === EJECUTAR MOVIMIENTO ===
                            
                            // 1. Quitar del Origen
                            const listaGuerreros = territorioOrigen.list.filter(c => c.tipo === 'guerrero');
                            const guerreroA_Mover = listaGuerreros[listaGuerreros.length - 1]; // El último
                            guerreroA_Mover.destroy();
                            
                            // 2. Poner en Destino
                            // Usamos colocarGuerrero pero "manualmente" para evitar logs extra o restricciones
                            // Simplemente añadimos la imagen y actualizamos el stack
                            // Calculamos Y base (depende si es territorio de arriba o abajo)
                            const nombreArriba = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
                            const yBase = nombreArriba.includes(territorio.key) ? 55 : -55;
                            
                            const nuevoGuerrero = this.add.image(0, yBase, 'guerrero').setScale(0.47);
                            nuevoGuerrero.tipo = 'guerrero';
                            territorio.add(nuevoGuerrero);

                            // 3. Actualizar Pilas Visuales (Stacking)
                            this.apilarFichasEnCentro(territorioOrigen, 'guerrero'); // Refrescar origen
                            this.apilarFichasEnCentro(territorio, 'guerrero');       // Refrescar destino

                            // 4. Feedback Visual Final (Parpadeo Destino)
                            this.tweens.add({
                                targets: territorio.list[0], // Imagen de fondo del territorio
                                alpha: 0.2,
                                yoyo: true,
                                duration: 150,
                                repeat: 2
                            });

                            // 5. Finalizar
                            limpiarUI();
                            resolve(true); // Retorna true (gastar carta)
                        }
                    }
                });
            });
        });
    }

}