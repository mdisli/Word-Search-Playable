//#region Imports

import hand from '../../assets/hand.png' // 205x216
import background from '../../assets/background_white.png'
import board_cat from '../../assets/board-cat.png' // 1080x1408
import empty_rectange from '../../assets/empty_rectangle.png' // 213x65
import green_rectangle from '../../assets/green_rectangle.png' // 214x65
import header from '../../assets/header.png' // 1080x325
import words_panel from '../../assets/words_panel.png' // 250x1314
import reference from '../../assets/reference.png' // 1080x1920
import single_grid from '../../assets/single_grid.png' // 111x111
import {
    randInt
} from 'three/src/math/MathUtils'

//#endregion

//#region Variables

let handImage;
let backgroundImage;
let wordPanelImage;
let boardImg;
let headerImage;

let wordPanelWordImageList = [];

// Debug
let debugGraphics;

const headerText = "Can you clear the board?"
const wordsList = ['PLANE', 'ACADEMY', 'CABIN', 'APPLE', 'DAMAGE', 'DOOR', 'LADY', 'DOCTOR', 'CAN', 'ACE', 'FOX', 'ARM', 'CAMPUS', 'BOX', 'BUTTON', 'LAUGH', 'HORSE', 'IRONY']
const charLists = [
    ['P', 'A', 'C', 'A', 'B', 'I', 'N'],
    ['L', 'P', 'D', 'L', 'A', 'D', 'Y'],
    ['A', 'P', 'O', 'A', 'C', 'A', 'N'],
    ['N', 'L', 'O', 'R', 'A', 'C', 'E'],
    ['E', 'E', 'R', 'M', 'F', 'O', 'X'],
    ['A', 'D', 'O', 'C', 'T', 'O', 'R'],
    ['C', 'B', 'O', 'X', 'B', 'D', 'C'],
    ['A', 'L', 'I', 'H', 'U', 'A', 'A'],
    ['D', 'A', 'R', 'O', 'T', 'M', 'M'],
    ['E', 'U', 'O', 'R', 'T', 'A', 'P'],
    ['M', 'G', 'N', 'S', 'O', 'G', 'U'],
    ['Y', 'H', 'Y', 'E', 'N', 'E', 'S'],
];
const wordsListLength = wordsList.length;

const gridX = 7;
const gridY = 12;
let gridslist = [];

// Input 
let hoveringGrid;
let isMouseClicked = false;
let hoveredGrids = [];


var whiteTint = 0xFFFFFF;
var greenColor = 0x00FF00;
//#endregion

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    preload() {
        this.load.image('hand', hand);
        this.load.image('background', background);
        this.load.image('board_cat', board_cat);
        this.load.image('empty_rectangle', empty_rectange);
        this.load.image('green_rectangle', green_rectangle);
        this.load.image('header', header);
        this.load.image('words_panel', words_panel);
        this.load.image('reference', reference);
        this.load.image('single_grid', single_grid);
    }
    create() {

        debugGraphics = this.add.graphics()

        this.createBackground();
        this.createHand();
        this.createWordPanel();
        this.createWordList();
        this.createHeader();
        this.createGrids();

        // Events
        // click event
        this.input.on('pointerdown', this.handlePointerDown, this);

        this.input.on('pointermove', this.handlePointerMove, this);

        this.input.on('pointerover', this.handlePointerOver, this);

        this.input.on('pointerup', this.handlePointerUp, this);


    }
    update() {}

    //#region Input Funcs

    handlePointerDown() {
        console.log('Pointer down')
        //hoveredGrids.clear();
        //hoveredGrids.push(hoveringGrid);
        if(hoveringGrid != null && hoveringGrid !=undefined)
            this.onGridSelected(hoveringGrid);
        
        isMouseClicked = true;

    }
    handlePointerMove(pointer) {}

    handlePointerOver(event, gameObjects) {
        // Eğer tıklanan nesne bir grid ise ve harf verisi varsa
        var grid = gameObjects[0];
        if (grid instanceof Phaser.GameObjects.Image && grid.getData('letter') && !hoveredGrids.includes(grid)) {
            hoveringGrid = grid;
            if (!isMouseClicked) return;

            var lastGrid = hoveredGrids[hoveredGrids.length - 1];
            var neighbours = lastGrid.getData('neighbours');
            if (!neighbours.includes(grid)) {
                console.log('Not neighbour');
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

        boardImg = this.add.image(540, 1050, 'board_cat').setDepth(0).setOrigin(.5, .5);

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

            var image = this.add.image(startX, startY + (incrementY * index), 'green_rectangle');
            this.add.text(startX, startY + (incrementY * index), wordsList[index], {
                fontSize: 45,
                color: '#000000',
                align: 'center'
            }).setDepth(2).setOrigin(0.5, 0.5);
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


                this.add.text(337 + (index2 * 109), 436 + (index * 109), letter, {
                    fontSize: 45,
                    color: '#000000',
                    align: 'center'
                }).setDepth(5).setOrigin(0.5, 0.5);

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
        this.selectGridTween(grid);
    }

    onGridUnselected(grid) {
        grid.setDepth(2);
        this.unmatchedGridTween(grid);
    }

    checkWord() {

        var letters = '';
        for (let index = 0; index < hoveredGrids.length; index++) {
            const element = hoveredGrids[index];

            letters += element.getData('letter');
        }
        console.log(letters);

        if (wordsList.includes(letters)) {
            console.log('Matched');

            hoveredGrids.forEach(element => {
                this.removeGridTween(element, 0);
            });

            var img = wordPanelWordImageList.indexOf(letters);
            this.openGreenRectangleTween(img);

        } else {
            console.log('Not Matched');
            hoveredGrids.forEach(element => {
                this.onGridUnselected(element);
            });
        }

        hoveredGrids = [];
    }
    //#endregion

    //#region Tweens

    openGreenRectangleTween(index) {
        return this.tweens.add({
            targets: wordPanelWordImageList[index],
            alpha: 1,
            duration: 200,
            ease: 'Linear'
        });
    }

    selectGridTween(grid) {
        //this.colorChangeTween(whiteTint, greenColor, 200, grid);
        return this.tweens.add({
            targets: grid,
            scaleX: 1.1,
            scaleY: 1.1,
            //tint : greenColor,
            duration: 100,
            ease: 'Linear'
        });
    }

    unmatchedGridTween(grid) {
        return this.tweens.add({
            targets: grid,
            scaleX: 1,
            scaleY: 1,
            //tint : whiteTint
            duration: 100,
            ease: 'Linear'
        });
    }

    colorChangeTween(from, to, duration, grid) {
        return this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: duration,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, value);
                const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);
                grid.setTint(color);
            }
        });
    }

    removeGridTween(grid, delay) {

        return this.tweens.add({
            targets: grid,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 100,
            ease: 'Linear',
            delay: delay
        });


    }
    //#endregion

}