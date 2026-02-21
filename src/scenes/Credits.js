import { FUENTES } from '../config/GameConstants.js';
import TextButton from '../components/TextButton.js';

export default class Credits extends Phaser.Scene {
    constructor() {
        super('Credits');
    }

    init(data) {
        // Recibimos de dónde venimos. Si no hay nada, por defecto es 'Menu'
        this.originScene = data.origin || 'Menu';
    }

    // ¡Ya no necesitamos preload() porque no cargamos el game_cover aquí!

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // 1. Fondo oscurecedor que cubre toda la pantalla para apagar la escena de debajo
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6); 

        // 2. Panel oscuro semitransparente central
        this.add.rectangle(w / 2, h / 2, w * 0.65, h * 0.85, 0x000000, 0.85);

        // 3. Título Principal
        this.add.text(w / 2, h * 0.18, '- CREDITS -', {
            fontFamily: FUENTES.PRINCIPAL, fontSize: '48px', color: '#ffffff'
        }).setOrigin(0.5);

        // --- ESTILOS DE TEXTO ---
        const styleRol = { fontFamily: FUENTES.PRINCIPAL, fontSize: '28px', color: '#ffcc00' };
        const styleNombre = { fontFamily: FUENTES.PRINCIPAL, fontSize: '24px', color: '#ffffff' };
        
        const startY = h * 0.32;
        const spacing = 80;

        // --- BLOQUES DE CRÉDITOS ---
        // Mecánicas
        this.add.text(w / 2, startY, 'Game Mechanics', styleRol).setOrigin(0.5);
        this.add.text(w / 2, startY + 33, 'Pablo Garaizar Sagarminaga', styleNombre).setOrigin(0.5);

        // Grafismo
        this.add.text(w / 2, startY + spacing, 'Graphics & Artwork', styleRol).setOrigin(0.5);
        this.add.text(w / 2, startY + spacing + 33, 'Pedro Soto', styleNombre).setOrigin(0.5);

        // Primera Versión App
        this.add.text(w / 2, startY + spacing * 2, 'Original App Version', styleRol).setOrigin(0.5);
        this.add.text(w / 2, startY + spacing * 2 + 33, 'Ekaitz Polledo', styleNombre).setOrigin(0.5);

        // Versión Actual
        this.add.text(w / 2, startY + spacing * 3, 'Current App Version', styleRol).setOrigin(0.5);
        this.add.text(w / 2, startY + spacing * 3 + 33, 'Iker Ibarrola Huarte', styleNombre).setOrigin(0.5);

        // 4. Botón dinámico para volver
        const btnText = this.originScene === 'End' ? 'Back to Result' : 'Back to Menu';
        
        new TextButton(this, w / 2, h * 0.86, btnText, '32px', () => {
            this.scene.stop('Credits'); // Detenemos la escena de créditos
            this.scene.resume(this.originScene); // Despausamos la escena que había debajo
        }).setColor('#ffffff');
    }
}