import { POSICIONES } from '../config/GameConstants.js';

export default class CoinManager {
    constructor(scene) {
        this.scene = scene;
        this.coins = [];
        this.isShuffling = false; // Estado interno para bloquear clics
        
        // Configuración base
        this.coinKeys = ['coin_red', 'coin_green', 'coin_blue'];
        this.baseX = scene.scale.width * POSICIONES.MONEDAS_BASE.x;
        this.baseY = scene.scale.height * POSICIONES.MONEDAS_BASE.y;
        
        this.createCoins();
    }

    createCoins() {
        const coinScale = 0.26;
        const spacing = 30; // Distancia inicial cuando están apiladas

        for (let i = 0; i < 3; i++) {
            // Posición inicial (ligeramente desplazadas para efecto stack)
            const x = this.baseX + i * spacing;
            const y = this.baseY;

            const coin = this.scene.add.image(x, y, 'coin_empty')
                .setScale(coinScale)
                .setInteractive({ useHandCursor: true })
                .setVisible(false);
            
            coin.colorKey = this.coinKeys[i];
            
            // Guardamos posición inicial para los resets
            coin.initialX = x;
            coin.initialY = y;
            
            this.coins.push(coin);
        }
    }

    /**
     * Ejecuta la animación de lanzar monedas.
     * @returns {Promise<string[]>} Promesa que se resuelve con el array de resultados (ej: ['rojo', 'azul'])
     */
    lanzar() {
        return new Promise((resolve) => {
            if (this.isShuffling) return;
            this.isShuffling = true;

            // Punto central para la animación
            // Usamos la posición de la moneda central (índice 1) + un pequeño ajuste si quieres
            const centerCoin = this.coins[1];
            const centerX = centerCoin.initialX; 
            const centerY = centerCoin.initialY;

            // 1. CONVERGENCIA AL CENTRO
            this.coins.forEach(coin => {
                this.scene.tweens.add({
                    targets: coin,
                    x: centerX, 
                    y: centerY,
                    duration: 300,
                    ease: 'Sine.easeInOut'
                });
            });

            // 2. PARPADEO Y CAMBIO DE TEXTURA
            this.scene.time.delayedCall(300, () => {
                const flickerTimes = 6;
                
                // Efecto de parpadeo (visible/invisible)
                this.scene.time.addEvent({
                    delay: 80,
                    repeat: flickerTimes * 2 - 1,
                    callback: () => {
                        this.coins.forEach(c => c.setVisible(!c.visible));
                    }
                });

                // 3. RESULTADO Y DESPLIEGUE FINAL
                this.scene.time.delayedCall(flickerTimes * 80, () => {
                    const resultados = [];

                    // Decidir cara o cruz para cada moneda
                    this.coins.forEach((coin) => {
                        const result = Phaser.Math.Between(0, 1);
                        const finalKey = result ? coin.colorKey : 'coin_empty';
                        coin.setTexture(finalKey);
                        
                        if (finalKey === 'coin_red') resultados.push('rojo');
                        if (finalKey === 'coin_green') resultados.push('verde');
                        if (finalKey === 'coin_blue') resultados.push('azul');
                    });

                    // Separar monedas horizontalmente
                    const spreadSpacing = 111;
                    const offsets = [-spreadSpacing, 0, spreadSpacing];
                    
                    this.coins.forEach((coin, i) => {
                        this.scene.tweens.add({
                            targets: coin,
                            x: centerX + offsets[i], 
                            y: centerY,
                            duration: 300,
                            ease: 'Sine.easeInOut'
                        });
                    });

                    // 4. RESOLVER PROMESA (Dar tiempo a que termine el movimiento)
                    this.scene.time.delayedCall(400, () => {
                        this.isShuffling = false;
                        resolve(resultados);
                    });
                });
            });
        });
    }

    /**
     * Resetea las monedas a su estado inicial (ocultas, apiladas, vacías)
     */
    reset() {
        this.coins.forEach(coin => {
            coin.setVisible(false);
            coin.setPosition(coin.initialX, coin.initialY);
            coin.setTexture('coin_empty');
        });
        this.isShuffling = false;
    }

    setVisible(visible) {
        this.coins.forEach(c => c.setVisible(visible));
    }

    // Helper para saber si un objeto clicado es una de nuestras monedas
    isCoin(gameObject) {
        return this.coins.includes(gameObject);
    }
}