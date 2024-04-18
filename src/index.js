import { Scale } from 'phaser';
import Phaser from './lib/phaser.js';
import Game from './scenes/Game.js';


export default new Phaser.Game({
    type : Phaser.AUTO,
    scale : {
        width : '1080',
        height: '1920',
        mode : Scale.ScaleModes.FIT,
    },
    fps : 60,
    scene : Game,
});