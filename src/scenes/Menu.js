export default class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    preload() {
        // Carga tu imagen de fondo
        this.load.image('game_cover', 'assets/others/game_cover.png');
    }

    create() {
        // Añade el fondo
        this.add.image(595, 359, 'game_cover');

        // Crea el botón START
        const botonStart = this.add.text(
            this.scale.width * 0.86,   // % del ancho (centro horizontal)
            this.scale.height * 0.7,  // % del alto (cerca del borde inferior)
            'START',
            {
                fontFamily: 'Diogenes',
                fontSize: '48px',
                color: '#ffffff',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();

        // Acción al hacer clic
        botonStart.on('pointerdown', () => {
            // Aquí irá el código para iniciar el juego
            this.scene.start('Board');
        });

        // Efecto hover
        botonStart.on('pointerover', () => {
            botonStart.setScale(1.1);
            botonStart.setText(">START<")
        });

        // Al salir el foco del raton
        botonStart.on('pointerout', () => {
            botonStart.setScale(1);
            botonStart.setText("START")
        });
    }
}