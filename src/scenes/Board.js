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
            
            this.currentHordeValue--;
            this.barajarMonedas();
            
            // Si era la última tirada, esperar a que termine la animación
            if (this.currentHordeValue === 0) {
                this.time.delayedCall(1700, () => {
                    this.cambiarEstado(this.estados.SELECCIONAR_CARTA);
                });
            }
        });

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
            this.realizarRonda();
            this.regenerarCartasUsadas();
            this.cambiarEstado(this.estados.COLOCAR_GUERRERO);
            
            // Reset visual
            this.archerBlank.setVisible(false);
            this.archerRight.setVisible(true);
            this.cartasUsadas = 0;
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

        // Move Warrior hace lo mismo por ahora
        this.botonMoveWarrior.on('pointerdown', () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
            this.botonesJuego.forEach(b => b.setVisible(false));
            
            this.moveWarrior();

            this.colocarCartaEmpty(this.cartaSeleccionada);
            this.cartaSeleccionada.setVisible(false);            
            
            this.attackCards.forEach(c => c.clearTint());
            this.cartasUsadas++;
            
            if (this.cartasUsadas === 2) {
                this.cambiarEstado(this.estados.MELEE_FIGHT);
            }
        });

        // Attack hace lo mismo por ahora
        this.botonAttack.on('pointerdown', async () => {
            if (!this.cartaSeleccionada || this.cartasUsadas >= 2) return;
            
            this.botonesJuego.forEach(b => b.setVisible(false));
            
            await this.attack(this.cartaSeleccionada); // espera hasta que el jugador termine el ataque
            
            console.log('Ataque completado.');
            this.colocarCartaEmpty(this.cartaSeleccionada);
            this.cartaSeleccionada.setVisible(false);            
            
            this.attackCards.forEach(c => c.clearTint());
            this.cartasUsadas++;
            
            if (this.cartasUsadas === 2) {
                this.cambiarEstado(this.estados.MELEE_FIGHT);
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
    // COLOCAR GUERRERO
    // ============================================================
    colocarGuerrero(territorio) {
        const nombreArriba = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
        const yBase = nombreArriba.includes(territorio.key) ? 55 : -55;
        const guerreros = territorio.list.filter(f => f.tipo === 'guerrero');
        const posicionesX = [-50, 0, 50];

        if (guerreros.length >= 3) return;

        const ficha = this.add.image(posicionesX[guerreros.length], yBase, 'guerrero').setScale(0.47);
        ficha.tipo = 'guerrero';
        territorio.add(ficha);

        const orcos = territorio.list.filter(f => f.tipo === 'orco').length;
        console.log(`${territorio.key}: Guerreros=${guerreros.length + 1}, Orcos=${orcos}`);
    }

    // ============================================================
    // COLOCAR ORCO
    // ============================================================
    colocarOrco(territorio) {
        if (this.estadoActual !== this.estados.TIRAR_MONEDAS) return;

        const nombreAbajo = ['klifstenvik', 'bekstenholm', 'aestensand'];
        const yBase = nombreAbajo.includes(territorio.key) ? -5 : 0;
        const posicionesX = [-52, 0, 52];
        const orcos = territorio.list.filter(f => f.tipo === 'orco');
        
        if (orcos.length >= 3) {
            this.parpadearDestruirTerritorio(territorio);
        }

        if (orcos.length >= 3) return;

        const ficha = this.add.image(posicionesX[orcos.length], yBase, 'orco').setScale(0.42);
        ficha.tipo = 'orco';
        territorio.add(ficha);

        const guerreros = territorio.list.filter(f => f.tipo === 'guerrero').length;
        console.log(`${territorio.key}: Guerreros=${guerreros}, Orcos=${orcos.length + 1}`);
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
                this.time.delayedCall(400, () => {
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
    // DESTRUIR TERRITORIO
    // ============================================================
    destruirTerritorio(territorio) {
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
                normal.setVisible(!normal.visible);
                destroyed.setVisible(!destroyed.visible);
                
                // En el último parpadeo, dejar destruido visible
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
        // Implementación de botones de cancelar ataque
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

        // Efecto hover
        [this.botonCancel, this.botonAttackFinal].forEach(boton => {
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

        // Listener de Cancel
        this.botonCancel.on('pointerdown', () => {
            // Eliminar botones
            this.botonCancel.destroy();
            this.botonAttackFinal.destroy();

            if (modo === "bool") {
                // Eliminar banners centrales
                this.selectedLeft.destroy();
                this.selectedRight.destroy();
                this.textoBool.destroy();    
                // Resetear selecciones
                this.selectedLeft = null;
                this.selectedRight = null;

            } else if (modo === "generico") {
                this.textoGenerico.destroy();
            }
        });

        // Listener de Attack
        this.botonAttackFinal.on('pointerdown', () => {
            // Eliminar botones
            this.botonCancel.destroy();
            this.botonAttackFinal.destroy();

            if (modo === "bool") {
                // Eliminar banners centrales
                this.selectedLeft.destroy();
                this.selectedRight.destroy();
                this.textoBool.destroy();    
                // Resetear selecciones
                this.selectedLeft = null;
                this.selectedRight = null;
                console.log("Ataque final ejecutado con banners seleccionados:", this.selectedLeft.texture.key, this.selectedRight.texture.key);

            } else if (modo === "generico") {
                this.textoGenerico.destroy();
            }

            if (this.resolveAttack) this.resolveAttack();
        });
    }

}