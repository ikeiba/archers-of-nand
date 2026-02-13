export default class End extends Phaser.Scene {
    constructor() {
        super('End');
    }

    // Recibimos los datos desde la escena Board
    init(data) {
        this.resultado = data; // { win: true/false, score: 120, breakdown: "..." }
    }

    preload() {
        this.load.image('background', 'assets/others/background.png');
        this.load.image('logo_english', 'assets/logos/logo_english.png');
    }

    create() {
        // --- FONDO ---
        const width = this.scale.width;
        const height = this.scale.height;

        // --- 1. FONDO (Aparición suave) ---
        // Lo creamos transparente (alpha 0) y lo hacemos aparecer
        this.add.image(595, 359, 'background').setAlpha(0);
        this.tweens.add({
            targets: this.children.list[0], // El fondo es el primer hijo añadido
            alpha: 1,
            duration: 800,
            ease: 'Linear'
        });
        
        this.logoIngles = this.add.image(width * 0.5, -150, 'logo_english').setScale(0.36);

        this.tweens.add({
            targets: this.logoIngles,
            y: height * 0.32, // Destino final
            duration: 1200,
            delay: 300,       // Espera un poco antes de empezar
            ease: 'Bounce.easeOut' // Efecto de rebote al caer
        });


        // --- TÍTULO (GAME OVER / VICTORY) ---
        const tituloTexto = 'GAME OVER';
        const tituloColor = '#395436'; // Verde oscuro en ambos queda bien, o dorado para victoria

        // Posición final deseada: height * 0.55
        // Posición inicial: -50 (justo encima del borde)
        const tituloObj = this.add.text(
            width * 0.5, 
            -50, 
            tituloTexto,
            { fontFamily: 'Diogenes', fontSize: '60px', color: tituloColor }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: tituloObj,
            y: height * 0.62, // Destino final
            duration: 800,
            delay: 700,       // Empieza después del logo
            ease: 'Back.easeOut.0.8' // Llega un poco más abajo y retrocede suavemente
        });

        // --- SUBTÍTULO  ---
        let subtitulo = '';
        let colorSub = '#FF0000'; // Rojo por defecto (derrota)

        if (this.resultado.win) {
            subtitulo = "You win!";
            colorSub = '#395436'; 
            
            // Detalle opcional (aparece suavemente)
            if (this.resultado.details) {
               this.add.text(width * 0.5, height * 0.86, 
                    `SCORE: ${this.resultado.score}`, 
                    { fontFamily: 'Diogenes', fontSize: '32px', color: '#395436' }
                ).setOrigin(0.5).setAlpha(0);

                // Animación simple de fade-in para el detalle
                this.tweens.add({
                    targets: this.children.list[this.children.list.length-1],
                    alpha: 1, duration: 500, delay: 1500
                });
            }
        } else {
            subtitulo = 'You lost';
        }


        // Posición final X: width * 0.5
        // Posición inicial X: -300 (fuera de pantalla a la izquierda)
        const subtituloObj = this.add.text(
            -300, 
            height * 0.75,
            subtitulo,
            { fontFamily: 'Diogenes', fontSize: '47px', color: colorSub }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: subtituloObj,
            x: width * 0.5, // Destino final (centro)
            duration: 700,
            delay: 1100,    // Empieza después del título
            ease: 'Cubic.easeOut' // Desaceleración suave
        });


        // --- BOTÓN PLAY AGAIN ---

        // --- 5. BOTÓN PLAY AGAIN (Sube desde abajo y aparece) ---
        // Posición final Y: height * 0.87
        // Posición inicial Y: height + 100 (fuera por abajo)
        const botonPlayAgain = this.add.text(
            width * 0.83, 
            height + 100, 
            'Play Again',
            { fontFamily: 'Diogenes', fontSize: '40px', color: '#395436' }
        ).setOrigin(0.5).setInteractive().setAlpha(0); // Empieza transparente

        this.tweens.add({
            targets: botonPlayAgain,
            y: height * 0.87, // Destino final
            alpha: 1,         // Se hace visible mientras sube
            duration: 800,
            delay: 1600,      // El último en aparecer
            ease: 'Cubic.easeOut'
        });

        botonPlayAgain.on('pointerdown', () => {
            this.scene.start('Board');
        });

        botonPlayAgain.on('pointerover', () => {
            botonPlayAgain.setScale(1.1);
            botonPlayAgain.setText(">Play Again<");
        });

        botonPlayAgain.on('pointerout', () => {
            botonPlayAgain.setScale(1);
            botonPlayAgain.setText("Play Again");
        });
    }
}