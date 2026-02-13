import { COLORES } from '../config/GameConstants.js';

export default class Territory extends Phaser.GameObjects.Container {
    
    // Listas estáticas para saber cómo posicionar las fichas según el nombre
    static NOMBRES_ARRIBA = ['klifdalholm', 'beknesvik', 'aenesholm', 'bekdalsand'];
    static NOMBRES_ABAJO = ['klifstenvik', 'bekstenholm', 'aestensand'];

    constructor(scene, x, y, key, keyDestroyed, colors, scale) {
        super(scene, x, y);
        this.scene = scene;
        this.key = key;           // Nombre del territorio (ej: 'bekstenholm')
        this.colores = colors;    // Array de colores (ej: ['rojo', 'verde'])
        this.destruido = false;   // Estado interno

        // --- 1. IMÁGENES ---
        this.imgNormal = scene.add.image(0, 0, key).setScale(scale);
        this.imgDestroyed = scene.add.image(0, 0, keyDestroyed).setScale(scale).setVisible(false);
        
        // Añadimos al contenedor (importante el orden: normal abajo, fichas encima)
        this.add([this.imgNormal, this.imgDestroyed]);

        // Ajustar tamaño del contenedor para la Hitbox
        const anchoReal = this.imgNormal.width * this.imgNormal.scaleX;
        const altoReal = this.imgNormal.height * this.imgNormal.scaleY;
        this.setSize(anchoReal, altoReal);

        // --- 2. HITBOX HEXAGONAL ---
        // Copiada exactamente de tu lógica anterior
        const hexagono = new Phaser.Geom.Polygon([
            0, altoReal / 2,                
            anchoReal * 0.25, 0,            
            anchoReal * 0.75, 0,            
            anchoReal, altoReal / 2,        
            anchoReal * 0.75, altoReal,     
            anchoReal * 0.25, altoReal      
        ]);
        this.setInteractive(hexagono, Phaser.Geom.Polygon.Contains);

        // Añadir a la escena
        scene.add.existing(this);
    }

    // ============================================================
    // GESTIÓN DE UNIDADES
    // ============================================================

    addWarrior() {
        // Calcular posición Y base
        const yBase = Territory.NOMBRES_ARRIBA.includes(this.key) ? 55 : -55;
        
        // Crear sprite
        const ficha = this.scene.add.image(0, yBase, 'guerrero').setScale(0.47);
        ficha.tipo = 'guerrero';
        this.add(ficha);

        this.actualizarVisualizacion('guerrero');
    }

    addOrc() {
        // Calcular posición Y base (Lógica específica de orcos)
        const yBase = Territory.NOMBRES_ABAJO.includes(this.key) ? -5 : 5; // Nota: en tu código original era 5 o 15 según versión, he puesto 5 estándar. Ajusta si quieres.

        // Crear sprite
        const ficha = this.scene.add.image(0, yBase, 'orco').setScale(0.42);
        ficha.tipo = 'orco';
        this.add(ficha);

        this.actualizarVisualizacion('orco');

        // Comprobación interna de destrucción
        const numOrcos = this.contarUnidades('orco');
        if (numOrcos === 3) {
            this.destruirse();
        }
    }

    removeLastUnit(tipo) {
        const unidades = this.list.filter(c => c.tipo === tipo);
        if (unidades.length > 0) {
            const unidad = unidades[unidades.length - 1]; // La última añadida
            unidad.destroy();
            
            // Actualizar visualización tras un breve delay para que Phaser procese la destrucción
            this.scene.time.delayedCall(50, () => {
                this.actualizarVisualizacion(tipo);
            });
            return true;
        }
        return false;
    }

    contarUnidades(tipo) {
        return this.list.filter(c => c.tipo === tipo).length;
    }

    // ============================================================
    // LÓGICA VISUAL
    // ============================================================
    
    actualizarVisualizacion(tipo) {
        const unidades = this.list.filter(c => c.tipo === tipo);
        const cantidad = unidades.length;

        // Limpiar contador antiguo si existe
        const contadorNombre = `contador_${tipo}`;
        const contadorAntiguo = this.list.find(c => c.name === contadorNombre);
        if (contadorAntiguo) contadorAntiguo.destroy();

        if (cantidad < 4) {
            this._distribuirLinealmente(unidades, tipo);
        } else {
            this._apilarEnCentro(unidades, tipo, cantidad);
        }
    }

    _distribuirLinealmente(unidades, tipo) {
        const cantidad = unidades.length;
        if (cantidad === 0) return;

        let posicionesX = [];
        if (cantidad === 1) posicionesX = [0];
        else if (cantidad === 2) posicionesX = [-30, 30];
        else posicionesX = [-52, 0, 52];

        const yBase = this._obtenerYBase(tipo);

        unidades.forEach((ficha, i) => {
            ficha.setVisible(true);
            // Usamos tween para movimiento suave
            this.scene.tweens.add({
                targets: ficha,
                x: posicionesX[i],
                y: yBase,
                duration: 300,
                ease: 'Power2'
            });
        });
    }

    _apilarEnCentro(unidades, tipo, cantidad) {
        // 1. Ocultar todas
        unidades.forEach(u => u.setVisible(false));

        // 2. Mostrar solo las 3 primeras (Stack visual)
        const stackVisual = [unidades[0], unidades[1], unidades[2]];
        const offsets = [-10, 0, 10]; 
        const yBase = this._obtenerYBase(tipo);

        stackVisual.forEach((ficha, i) => {
            ficha.setVisible(true);
            ficha.setDepth(i + 10); // +10 para asegurar que están encima de la base
            
            this.scene.tweens.add({
                targets: ficha,
                x: offsets[i],
                y: yBase,
                duration: 400,
                ease: 'Power2'
            });
        });

        // 3. Crear Texto Contador
        const textX = 35; 
        const textY = yBase - 20;

        const contador = this.scene.add.text(textX, textY, `x${cantidad}`, {
            fontFamily: 'Diogenes',
            fontSize: '24px',
            color: (tipo === 'orco') ? '#ffffff' : '#000000',
            stroke: '#000000',
            strokeThickness: (tipo === 'orco') ? 2 : 0
        }).setOrigin(0, 0.5);
        
        contador.name = `contador_${tipo}`;
        this.add(contador);
        this.bringToTop(contador);
    }

    _obtenerYBase(tipo) {
        const esArriba = Territory.NOMBRES_ARRIBA.includes(this.key);
        
        if (tipo === 'guerrero') {
            return esArriba ? 55 : -55;
        } else {
            // Orcos: Ajuste fino para los de abajo
            const esAbajo = Territory.NOMBRES_ABAJO.includes(this.key);
            return esAbajo ? -5 : 5;
        }
    }

    // ============================================================
    // ESTADO Y DESTRUCCIÓN
    // ============================================================

    destruirse() {
        if (this.destruido) return;

        console.log(`¡El territorio ${this.key} ha sido destruido!`);
        this.destruido = true;

        // Efecto visual de parpadeo antes de cambiar la imagen
        let count = 0;
        const maxFlickers = 6;
        
        this.scene.time.addEvent({
            delay: 150,
            repeat: maxFlickers - 1,
            callback: () => {
                count++;
                this.imgNormal.setVisible(!this.imgNormal.visible);
                this.imgDestroyed.setVisible(!this.imgDestroyed.visible);
                
                if (count === maxFlickers) {
                    this.imgNormal.setVisible(false);
                    this.imgDestroyed.setVisible(true);
                }
            }
        });
    }

    hacerParpadeo(colorInt = 0xff0000) {
        this.scene.tweens.add({
            targets: this.imgNormal, // Tintamos la imagen base
            tint: colorInt,
            duration: 100,
            yoyo: true,
            repeat: 1,
            onComplete: () => { this.imgNormal.clearTint(); }
        });
    }
}