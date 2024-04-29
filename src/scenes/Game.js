//#region Imports
import Phaser from '../lib/phaser.js';
import localization_manager from '../localization/localization_manager.js';
const localization_file_path = 'src/localization/localization.json';
const localization_settings_path = 'src/localization/localization_settings.json';

//#endregion

//#region Variables

let localizationManager;

let handImage;
let backgroundImage;
let wordPanelImage;
let headerImage;

// Words
let wordPanelWordImageList = [];

let headerText;
let wordsList;
let charLists;

let charTextsList = [];
let wordsListLength;

// Grid
const gridX = 7;
const gridY = 12;
let gridslist = [];

// Input 
let isMouseClicked = false;
let hoveredGrids = [];


// Colors & Tints

const greenColor = '#00FF00';
const redColor = '#FF0000';
const yellowColor = '#FFFF00';
const whiteColor = '#FFFFFF';

const whiteTint = 0xFFFFFF;
const greenTint = 0x00FF00;
const redTint = 0xFF0000;
const yellowTint = 0xFFFF00;

// End Level Screen

let completeBg;
let playNowButton;
let gameNameTxtString;
let gameNameTxt;
let playNowTxtString;
let playNowTxt;

const maxPlayTime = 60;

// CLicking
let canClick = true;
let isGameStarted = false;
//#endregion

export default class Game extends window.Phaser.Scene {
    //#region Base Functions
    constructor() {
        super('game');
    }

    preload() {

        this.load.image('hand', '../../assets/hand.png');
        this.load.image('background', '../../assets/background_white.png');
        this.load.image('board_cat', '../../assets/board-cat.png');
        this.load.image('empty_rectangle', '../../assets/empty_rectangle.png');
        this.load.image('green_rectangle', '../../assets/green_rectangle.png');
        this.load.image('header', '../../assets/header.png');
        this.load.image('words_panel', '../../assets/words_panel.png');
        this.load.image('reference', '../../assets/reference.png');
        this.load.image('single_grid', '../../assets/single_grid.png');
        this.load.image('complete_bg', '../../assets/complete_bg_empty.png');
        this.load.image('play_now', '../../assets/play_now_button.png');
        this.load.atlas('confettie', '../../assets/particles-0.png', '../../assets/particles.json');
    }
    async create() {


        var localization_settings = await fetchJSON(localization_settings_path);
        var localization_file = await fetchJSON(localization_file_path);
        localizationManager = new localization_manager(localization_settings["language"], localization_file);

        gameNameTxtString = localizationManager.getWord('gameName');
        playNowTxtString = localizationManager.getWord('playTxt');
        headerText = localizationManager.getWord('headerTxt');
        wordsList = localizationManager.getWord('wordList');
        charLists = localizationManager.getWord('charList');
        wordsListLength = wordsList.length;

        this.createBackground();
        this.createWordPanel();
        this.createWordList();
        this.createHeader();
        this.createGrids();
        this.createCompleteBg();
        // Events
        this.input.on('pointerdown', this.handlePointerDown, this);

        this.input.on('pointermove', this.handlePointerMove, this);

        this.input.on('pointerover', this.handlePointerOver, this);

        this.input.on('pointerup', this.handlePointerUp, this);
    }
    update() {}

    //#endregion

    //#region Input Funcs

    handlePointerDown(event, gameObjects) {
        if (!canClick) return;

        if (!isGameStarted) {
            isGameStarted = true;
            this.countDownTimer();
        }

        console.log('Pointer down')

        var clickedObject = gameObjects[0];
        if (clickedObject instanceof Phaser.GameObjects.Image && clickedObject.getData('letter') && !hoveredGrids.includes(clickedObject)) {

            this.onGridSelected(clickedObject);
            //console.log(grid.getData('letter'));
        }

        isMouseClicked = true;

    }
    handlePointerMove(pointer) {}

    handlePointerOver(event, gameObjects) {
        // Eğer tıklanan nesne bir grid ise ve harf verisi varsa
        var grid = gameObjects[0];
        if (grid instanceof Phaser.GameObjects.Image && grid.getData('letter') && !hoveredGrids.includes(grid)) {
            if (!isMouseClicked) return;

            var lastGrid = hoveredGrids[hoveredGrids.length - 1];
            var neighbours = lastGrid.getData('neighbours');
            if (!neighbours.includes(grid)) {
                //console.log('Not neighbour');
                return;
            }

            this.onGridSelected(grid);
            //console.log(grid.getData('letter'));
        }
    }

    handlePointerUp() {

        console.log('Pointer Up')

        this.checkWord();

        isMouseClicked = false;

    }


    createBackground() {
        backgroundImage = this.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);
        backgroundImage.depth = 0;

        this.add.image(540, 1050, 'board_cat').setDepth(0).setOrigin(.5, .5);

    }


    //#endregion

    //#region Create Image Functions

    createHeader() {
        headerImage = this.add.image(540, 250, 'header');
        headerImage.setOrigin(0.5, 0.5);
        headerImage.depth = 1;

        this.add.text(540, 250, headerText, {
            fontSize: 60,
            color: '#000000',
            align: 'center'
        }).setDepth(2).setOrigin(0.5, 0.5);


    }

    createCompleteBg() {
        completeBg = this.add.image(540, 960, 'complete_bg');
        completeBg.setOrigin(0.5, 0.5);
        completeBg.depth = -2;
        completeBg.setAlpha(0);

        playNowButton = this.add.image(540, 1235, 'play_now');
        playNowButton.setOrigin(0.5, 0.5);
        playNowButton.setAlpha(1);
        playNowButton.depth = -2;

        playNowTxt = this.add.text(540, 1235, playNowTxtString, {
            font: 'bold 55px Arial',
            fill: '#5E5E5E',
            align: 'center'
        });

        playNowTxt.setOrigin(0.5, 0.5);
        playNowTxt.depth = -1;

        gameNameTxt = this.add.text(540, 1070, gameNameTxtString, {

            font: 'bold 65px Arial',
            fill: '#5E5E5E',
            align: 'center'
        });

        gameNameTxt.depth = -1;
        gameNameTxt.setOrigin(0.5, 0.5);


        //this.openCompleteBg();
    }

    createHand() {
        handImage = this.add.image(0, 0, 'hand');
        handImage.setOrigin(0, 0);
        handImage.depth = 2;
    }

    createWordPanel() {

        wordPanelImage = this.add.image(32, 380, 'words_panel');
        wordPanelImage.setOrigin(0, 0);
        wordPanelImage.depth = 0;
    }

    createWordList() {
        var startX = 160;
        var startY = 430;
        var incrementY = 71;

        for (let index = 0; index < wordsListLength; index++) {

            var word = wordsList[index];
            var image = this.add.image(startX, startY + (incrementY * index), 'green_rectangle');
            this.add.text(startX, startY + (incrementY * index), word, {
                    fontSize: 45,
                    color: '#000000',
                    align: 'center'
                })
                .setDepth(2)
                .setOrigin(0.5, 0.5)

            image
                .setDataEnabled(true)
                .setData('word', word);
            wordPanelWordImageList.push(image);

            image.setAlpha(0);
        }

    }

    createGrids() {

        var id = 0;
        for (let index = 0; index < gridY; index++) {
            for (let index2 = 0; index2 < gridX; index2++) {
                var letter = charLists[index][index2];
                var grid = this.add.image(337 + (index2 * 109), 436 + (index * 109), 'single_grid');
                grid.setOrigin(0.5, 0.5);
                grid.setDepth(1);
                grid.setScale(.99, .99);
                grid.setInteractive();
                grid.setDataEnabled(true);
                grid.setData('letter', letter);
                grid.setData('id', id);
                grid.setData('coordinate', [index2, index]);
                gridslist.push(grid);


                var text = this.add.text(337 + (index2 * 109), 436 + (index * 109), letter, {
                        fontSize: 45,
                        color: '#000000',
                        align: 'center'
                    }).setDepth(5)
                    .setOrigin(0.5, 0.5)
                    .setDataEnabled(true)
                    .setData('id', id);

                charTextsList.push(text);

                id++;
            }
        }

        this.adjustNeighbours();

    }

    adjustNeighbours() {
        for (let index = 0; index < gridslist.length; index++) {
            const singleGrid = gridslist[index];

            var neighbours = [];
            var coordinate = singleGrid.getData('coordinate');
            var x = coordinate[0];
            var y = coordinate[1];


            var neighbourXProbs = [x - 1, x + 1];
            var neighbourYProb = [y - 1, y + 1]

            for (let index = 0; index < gridslist.length; index++) {
                const grid = gridslist[index];

                var gridCoordinate = grid.getData('coordinate');

                if ((gridCoordinate[0] == x && neighbourYProb.includes(gridCoordinate[1])) ||
                    (gridCoordinate[1] == y && neighbourXProbs.includes(gridCoordinate[0]))) {
                    neighbours.push(grid);
                }
            }

            singleGrid.setData('neighbours', neighbours);

        }
    }

    //#endregion

    //#region Selecting Grids

    onGridSelected(grid) {

        hoveredGrids.push(grid);
        grid.setDepth(2);
        grid.setTint(yellowTint);
        this.selectGridTween(grid);
    }

    onGridUnselected(grid) {
        grid.setDepth(2);
        this.unmatchedGridTween(grid);
    }
    //#endregion

    //#region Checking


    async checkWord() {

        var word = '';
        for (let index = 0; index < hoveredGrids.length; index++) {
            const element = hoveredGrids[index];

            word += element.getData('letter');
        }
        console.log(word);

        if (wordsList.includes(word)) {

            console.log('Matched');

            var averageX = 0;
            var averageY = 0;
            var count = 0;

            for (let index = 0; index < hoveredGrids.length; index++) {
                const element = hoveredGrids[index];
                averageX += element.x;
                averageY += element.y;
                count++;
                this.removeGridTween(element, index * 50);
            }

            for (let index = 0; index < wordPanelWordImageList.length; index++) {
                const element = wordPanelWordImageList[index];
                //console.log(element.getData('word'));
            }
            var img = wordPanelWordImageList.find(x => x.getData('word') == word);
            //console.log(img);
            this.openGreenRectangleTween(img);

            // Floating Text
            await this.sleep(200);
            averageX /= count;
            averageY /= count;
            this.createFloatingText(averageX, averageY, word);

            this.checkForComplete(word);

        } else {
            console.log('Not Matched');

            hoveredGrids.forEach(element => {
                this.onGridUnselected(element);
            });
        }

        hoveredGrids = [];
    }

    checkForComplete(matchedWord) {

        wordsList.splice(wordsList.indexOf(matchedWord), 1);
        console.log(wordsList.length);
        if (wordsList.length == 0) {
            console.log('Game Completed');
            this.openCompleteBg(true);
        }



    }

    //#endregion

    //#region Tweens

    async openCompleteBg(isCompleted) {

        canClick = false;

        if (isCompleted) {
            this.gameCompleteParticleCeremony();

            await this.sleep(2000);
        }

        completeBg.setDepth(10);
        playNowButton.setDepth(11);
        playNowTxt.setDepth(12);
        gameNameTxt.setDepth(12);

        this.tweens.add({
            targets: completeBg,
            alpha: 1,
            duration: 300,
            ease: 'Linear'
        });

        playNowButton.setInteractive();
        playNowButton.setAlpha(1);
        playNowButton.on('pointerdown', (pointer) => {
            mraid.open("https://apps.apple.com/us/app/word-search-colorful/id543054341");
        });

    }

    openGreenRectangleTween(index) {
        return this.tweens.add({
            targets: index,
            alpha: 1,
            duration: 200,
            ease: 'Linear'
        });
    }

    selectGridTween(grid) {

        return this.tweens.add({
            targets: grid,
            scaleX: 1,
            scaleY: 1,
            //tint : greenColor,
            duration: 100,
            ease: 'Linear'
        });
    }

    async unmatchedGridTween(grid) {

        grid.setTint(redTint);
        await this.sleep(150);
        grid.setTint(whiteTint);

        await this.sleep(150);
        grid.setTint(redTint);
        await this.sleep(150);
        grid.setTint(whiteTint);

        return this.tweens.add({
            targets: grid,
            scaleX: 1,
            scaleY: 1,
            //tint : whiteTint
            duration: 100,
            ease: 'Linear'
        });
    }
    async removeGridTween(grid, delay) {

        grid.setTint(greenTint);
        await this.sleep(150);

        var gridId = grid.getData('id');
        const txt = charTextsList.find(x => x.getData('id') == gridId);
        this.tweens.add({
            targets: txt,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 350,
            ease: 'Linear'
        });
        return this.tweens.add({
            targets: grid,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 350,
            ease: 'Linear',
            delay: delay,
        });


    }
    //#endregion

    //#region Floating Text

    createFloatingText(x, y, text) {

        var text = this.add.text(x, y, text, {
            fontSize: 45,
            color: greenColor,
            stroke: whiteColor,
            strokeThickness: 10,
            align: 'center'
        }).setDepth(5).setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: text,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Linear'
        });

    }

    //#endregion

    //#region Particle

    gameCompleteParticleCeremony() {

        const particle0 = this.confettieParticle2(560, 960);
        particle0.explode(50);

        const particle1 = this.confettieParticle2(220, 350);
        particle1.explode(50);

        const particle2 = this.confettieParticle2(860, 350);
        particle2.explode(50);

        const particle3 = this.confettieParticle2(220, 1580);
        particle3.explode(50);

        const particle4 = this.confettieParticle2(860, 1580);
        particle4.explode(50);

    }

    confettieParticle(x, y, minSpeed, maxSpeed) {

        const particle = this.add.particles(x, y, 'confettie', {
            frame: ['blue_particle.png', 'green_particle.png', 'orange_particle.png', 'purple_particle.png', 'red_particle.png', 'yellow_particle.png'],
            lifespan: 4000,
            angle: {
                min: 0,
                max: 360
            },
            speedY: {
                start: -1000,
                end: 0
            },
            speedX: {
                min: minSpeed,
                max: maxSpeed
            },
            scale: {
                start: 0.8,
                end: 0
            },
            gravityY: 350,
            rotate: {
                start: 0,
                end: 360,
                ease: 'Linear'
            },
            quantity: 1,
            frequency: 10,
            stopAfter: 200,

            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, 100, 100),

                yoyo: true,
                gravityY: 1000,
                angle: {
                    min: 0,
                    max: 360
                },
                speed: {
                    min: 200,
                    max: 600
                },
                lifespan: 2000,
                blendMode: 'ADD',

            },
        });

        particle.setDepth(15);

        return particle;
    }

    confettieParticle2(x, y) {
        const emitter = this.add.particles(x, y, 'confettie', {
            frame: ['blue_particle.png', 'green_particle.png', 'orange_particle.png', 'purple_particle.png', 'red_particle.png', 'yellow_particle.png'],
            lifespan: 2000,
            speed: {
                min: 150,
                max: 250
            },
            scale: {
                start: 0.8,
                end: 0
            },
            gravityY: 150,
            emitting: false,
            rotate: {
                start: 0,
                end: 360
            },
        });

        emitter.setDepth(15);

        return emitter;
    }

    //#endregion

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async countDownTimer() {


        console.log('Countdown started');
        var curTime = 0;

        while (curTime < maxPlayTime) {
            await this.sleep(1000);
            curTime++;
            console.log(curTime);
        }

        console.log('Time is up');
        this.openCompleteBg(false);

    }

}

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}