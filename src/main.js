import Board from './scenes/Board.js';
import Menu from './scenes/Menu.js';
import End from './scenes/End.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1190,
    height: 718,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Menu,
        Board,
        End
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            