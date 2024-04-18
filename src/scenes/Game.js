export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  preload() {
  }
  create() {
    this.add.text(100, 100, 'Hello Phaser!', { fill: '#0f0' });
  }
  update() {
  }
  
}