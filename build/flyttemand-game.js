"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BrickType = function BrickType() {
    _classCallCheck(this, BrickType);
};

BrickType.Exit_2 = 1;
BrickType.Wide_2 = 2;
BrickType.Wide_3 = 3;
BrickType.High_2 = 4;
BrickType.High_3 = 5;


var gridSize = 60;
var marginBrick = 6;
var brickCornerRadius = 10;
var brickSlownes = 4;

var HORIZONTAL = "horizontal";
var VERTICAL = "vertical";

var brickColor = "#006600";
var brickExitColor = "#770000";
var brickStrokeColor = "#ff0000";
var brickStrokeExit = "#00dd00";
var lineColor = "#006600";
var lineColorBright = "#00aa00";
var lineBorderColor = "#009900";
var backgroundExitColor = "#330000";

var currentGame = [];
var brickTypeArray = [];
var brickPositions = [];

var canvas;

var dragState = "";
var gameState = "";

var currentDragGridStartX;
var currentDragGridStartY;

var currentGridX;
var currentGridY;

var currentDragBrickSize;

var currentDragGridMin;
var currentDragGridMax;

var currentGameNr;

var currentScore;

var Brick = function Brick(x, y, brickType) {

    this.x = x;
    this.y = y;

    this.w;
    this.h;

    this.color = brickType == 1 ? brickExitColor : brickColor;
    this.stroke = brickType == 1 ? brickStrokeColor : brickStrokeExit;

    switch (brickType) {
        case BrickType.Exit_2:
            this.w = 2 * gridSize;
            this.h = gridSize;
            break;

        case BrickType.Wide_2:
            this.w = 2 * gridSize;
            this.h = gridSize;
            break;

        case BrickType.Wide_3:
            this.w = 3 * gridSize;
            this.h = gridSize;
            break;

        case BrickType.High_2:
            this.w = gridSize;
            this.h = 2 * gridSize;
            break;

        case BrickType.High_3:
            this.w = gridSize;
            this.h = 3 * gridSize;
            break;
    }

    this.render = function (ctx) {
        roundRect(ctx, this.x + marginBrick, this.y + marginBrick, this.w - 2 * marginBrick, this.h - 2 * marginBrick, brickCornerRadius, this.color, this.stroke);
    };
};

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

function init() {

    //to reset local storage
    //Settings.done = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    //Settings.save()    

    Settings.load();
    currentGameNr = Settings.findFirstUnsolved();
    loadGame();
    addEventListeners();
}

function loadGame() {
    generateBrickPositionsArray();
    generateButtons();
    var clonedArray = JSON.parse(JSON.stringify(games));
    currentGame = clonedArray[currentGameNr];
    calcBrickTypeArray();
    draw();
    gameState = "running";
    dragState = "";
    currentScore = 0;
}

function generateBrickPositionsArray() {
    brickPositions = [];
    for (var i = 0; i < 41; i++) {
        brickPositions.push([specialRand(), specialRand()]);
    }
}

function specialRand() {
    var val = (Math.random() < 0.5 ? Math.random() * 1000 - 1500 : Math.random() * 1000 + 1000) + gridSize / 2;
    return val;
}

function generateButtons() {

    document.getElementById("ul-bar").innerHTML = "";

    for (var row = 0; row < 10; row++) {
        var ul = document.getElementById("ul-bar");

        var divRow = document.createElement("DIV");
        divRow.className = "div-row";

        for (var col = 0; col < 4; col++) {

            var divBtn = document.createElement("DIV");
            divBtn.className = "div-btn ";

            var btn = 1 + col * 10 + row;

            var button = document.createElement("BUTTON");
            button.innerHTML = btn;
            button.className = "button-gamenr ";

            //current game
            if (currentGameNr == btn) {
                divBtn.className += "thick ";
            }

            //darker number color for solved puzzles
            if (Settings.done[btn] > 0) {
                button.className += "solved ";
            }

            //click
            button.id = btn;
            button.onclick = function (id) {
                currentGameNr = this.id;
                loadGame(this.id);
            };

            //score label
            var pBtn = document.createElement("P");
            pBtn.className = "p-btn";
            var done = Settings.done[btn];
            var txt = "";
            if (done == true) {
                txt = "done";
            } else if (done > 0) {
                txt = done;
            }

            pBtn.innerHTML = txt;

            divBtn.appendChild(button);
            divBtn.appendChild(pBtn);
            divRow.appendChild(divBtn);
        }
        ul.appendChild(divRow);
    }
}

/*
function generateButtonsOld() {
    //40 knapper
    document.getElementById("ul-bar").innerHTML = ""
    
    for (var btn=1; btn<41; btn++) {
        var button = document.createElement("BUTTON");
        button.innerHTML = btn
        button.className = "button-gamenr "

        //current game
        if ( currentGameNr == btn ) {
            button.className += "thick "
        }

        //darker number color for solved puzzles
        if (Settings.done[btn] == true) {
            button.className += "solved "    
        }
        
        button.id = btn
        button.onclick = function(id) {
            currentGameNr = this.id
            loadGame(this.id)
        }
        var ul = document.getElementById("ul-bar")
        ul.appendChild(button)
    }
}
*/

function setBrickPos(gridX, gridY) {
    if (getCurrentDraggingBrickOrientation() == HORIZONTAL) {
        var newGridX = gridX + 1 - getCurrentDraggingClickOffset();
        currentGame[getCurrentDraggingBrickIndex()][0] = newGridX;
    } else if (getCurrentDraggingBrickOrientation() == VERTICAL) {
        var newGridY = gridY + 1 - getCurrentDraggingClickOffset();
        currentGame[getCurrentDraggingBrickIndex()][1] = newGridY;
    }
    draw();
}

function draw() {
    canvas = document.getElementById("canvas");
    canvas.width = gridSize * 6;
    canvas.height = gridSize * 6;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //lodrette streger
    for (var x = 0; x < 7; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, 6 * gridSize);
        ctx.lineWidth = x == 0 || x == 6 ? 2 : 1;
        ctx.strokeStyle = x == 0 || x == 6 ? lineBorderColor : lineColor;
        ctx.stroke();
    }

    //vandrette streger
    for (var y = 0; y < 7; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(6 * gridSize, y * gridSize);
        ctx.lineWidth = y == 0 || y == 6 ? 2 : 1;
        ctx.strokeStyle = y == 0 || y == 6 ? lineBorderColor : lineColor;
        ctx.stroke();
    }

    //mørkerødt exit felt
    var margin = 1;
    ctx.beginPath();
    ctx.rect(gridSize * 4 + margin, gridSize * 2 + margin, 2 * gridSize - 2 * margin, gridSize - 2 * margin);
    ctx.fillStyle = backgroundExitColor;
    ctx.fill();

    //brikker
    currentGame.forEach(function (brick, index) {
        brickPositions[index][0] += ((brick[0] - 1) * gridSize - brickPositions[index][0]) / brickSlownes;
        brickPositions[index][1] += ((brick[1] - 1) * gridSize - brickPositions[index][1]) / brickSlownes;
        var brickType = brick[2];
        var brick = new Brick(brickPositions[index][0], brickPositions[index][1], brickType);
        brick.render(ctx);
    });
}

function getGridBrickXY(gridX, gridY) {
    var gridBrickX = 0;
    var gridBrickY = 0;

    if (currentDraggingBrickDirection == HORIZONTAL) {
        gridBrickX = gridX + 1 - currentDraggingClickOffset;
        gridBrickY = gridY + 1;
    } else if (currentDraggingBrickDirection == VERTICAL) {
        gridBrickX = gridX + 1;
        gridBrickY = gridY + 1 - currentDraggingClickOffset;
    }
    return [gridBrickX, gridBrickY];
}

function getGridBrickX(gridX) {
    var gridBrickX = 0;
    if (getCurrentDraggingBrickOrientation() == HORIZONTAL) {
        gridBrickX = gridX + 1 - getCurrentDraggingClickOffset();
    }
    return gridBrickX;
}

function getGridBrickY(gridY) {
    var gridBrickY = 0;
    if (getCurrentDraggingBrickOrientation() == VERTICAL) {
        gridBrickY = gridY + 1 - getCurrentDraggingClickOffset();
    }
    return gridBrickY;
}

function getBrickType(gridX, gridY) {
    if (gridX < 0 || gridX > 5 || gridY < 0 || gridY > 5) {
        return "error";
    }
    var brickType = 0;
    brickType = brickTypeArray[gridX][gridY][0];
    if (brickType == undefined) {
        brickType = 0;
    }
    return brickType;
}

function getDragBrickIndex(gridX, gridY) {
    return brickTypeArray[gridX][gridY][1];
}

function getDragBrickClickOffset(gridX, gridY) {
    return brickTypeArray[gridX][gridY][2];
}

function getDragBrickDirection(gridX, gridY) {
    var brickType = getBrickType(gridX, gridY);
    var dir = "";
    if (brickType == 1 || brickType == 2 || brickType == 3) {
        dir = HORIZONTAL;
    } else if (brickType == 4 || brickType == 5) {
        dir = VERTICAL;
    }
    return dir;
}

function setCurrentDragBrickSize() {
    currentDragBrickSize = [1, 2, 4].includes(getCurrentDraggingBrickType()) ? 2 : 3;
}

function getCurrentDraggingBrickIndex() {
    return brickTypeArray[currentDragGridStartX][currentDragGridStartY][1];
}

function getCurrentDraggingClickOffset() {
    return brickTypeArray[currentDragGridStartX][currentDragGridStartY][2];
}

function getCurrentDraggingBrickOrientation() {
    var brickType = getBrickType(currentDragGridStartX, currentDragGridStartY);
    var orientation = "";
    if (brickType == 1 || brickType == 2 || brickType == 3) {
        orientation = HORIZONTAL;
    }
    if (brickType == 4 || brickType == 5) {
        orientation = VERTICAL;
    }
    return orientation;
}

function getCurrentDraggingBrickType() {
    return getBrickType(currentDragGridStartX, currentDragGridStartY);
}

//array for current game to get brickType and index for each grid tile 
function calcBrickTypeArray() {
    brickTypeArray = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    currentGame.forEach(function (brick, index) {
        var x = brick[0] - 1;
        var y = brick[1] - 1;
        var brickType = brick[2];
        brickTypeArray[x][y] = [brickType, index, 0];
        switch (brickType) {

            case BrickType.Exit_2:
                brickTypeArray[x + 1][y] = [brickType, index, 1];
                break;

            case BrickType.Wide_2:
                brickTypeArray[x + 1][y] = [brickType, index, 1];
                break;

            case BrickType.Wide_3:
                brickTypeArray[x + 1][y] = [brickType, index, 1];
                brickTypeArray[x + 2][y] = [brickType, index, 2];
                break;

            case BrickType.High_2:
                brickTypeArray[x][y + 1] = [brickType, index, 1];
                break;

            case BrickType.High_3:
                brickTypeArray[x][y + 1] = [brickType, index, 1];
                brickTypeArray[x][y + 2] = [brickType, index, 2];
                break;
        }
    });
}

function checkIfSolved() {
    var ret = false;
    currentGame.forEach(function (brick, index) {
        var brickType = brick[2];
        if (brickType == 1 && brick[0] == 5 && brick[1] == 3) {
            ret = true;
        }
    });
    return ret;
}

function calcDragConstraints(gridX, gridY) {

    if (getCurrentDraggingBrickOrientation() == HORIZONTAL) {
        var brickGridX = gridX - getDragBrickClickOffset(gridX, gridY);

        // max
        currentDragGridMax = brickGridX;
        var done = false;

        while (done == false) {
            var next = currentDragGridMax + currentDragBrickSize;
            if (next < 6) {
                if (brickTypeArray[next][gridY] == 0) {
                    currentDragGridMax++;
                } else {
                    done = true;
                }
            } else {
                done = true;
            }
        }

        // min
        currentDragGridMin = brickGridX;
        var done = false;

        while (done == false) {
            var next = currentDragGridMin - 1;
            if (next > -1) {
                if (brickTypeArray[next][gridY] == 0) {
                    currentDragGridMin--;
                } else {
                    done = true;
                }
            } else {
                done = true;
            }
        }
    }

    if (getCurrentDraggingBrickOrientation() == VERTICAL) {
        var brickGridY = gridY - getDragBrickClickOffset(gridX, gridY);

        // max
        currentDragGridMax = brickGridY;
        var done = false;

        while (done == false) {
            var next = currentDragGridMax + currentDragBrickSize;
            if (next < 6) {
                if (brickTypeArray[gridX][next] == 0) {
                    currentDragGridMax++;
                } else {
                    done = true;
                }
            } else {
                done = true;
            }
        }

        // min
        currentDragGridMin = brickGridY;
        var done = false;

        while (done == false) {
            var next = currentDragGridMin - 1;
            if (next > -1) {
                if (brickTypeArray[gridX][next] == 0) {
                    currentDragGridMin--;
                } else {
                    done = true;
                }
            } else {
                done = true;
            }
        }
    }
}

function doDragging(x, y) {
    var gridX = Math.floor(x / gridSize);
    var gridY = Math.floor(y / gridSize);

    if (currentGridX != gridX || currentGridY != gridY) {
        currentGridX = gridX;
        currentGridY = gridY;

        var gridBrickX = getGridBrickX(gridX);
        var gridBrickY = getGridBrickY(gridY);

        if (getCurrentDraggingBrickOrientation() == HORIZONTAL) {
            var brickGridX = gridX - getCurrentDraggingClickOffset();
            if (brickGridX < currentDragGridMin || brickGridX > currentDragGridMax || gridBrickX < 1 || gridBrickX + currentDragBrickSize > 7) {
                return;
            }
        }

        if (getCurrentDraggingBrickOrientation() == VERTICAL) {
            var brickGridY = gridY - getCurrentDraggingClickOffset();
            if (brickGridY < currentDragGridMin || brickGridY > currentDragGridMax || gridBrickY < 1 || gridBrickY + currentDragBrickSize > 7) {
                return;
            }
        }
        setBrickPos(gridX, gridY);
    }
}

function startDrag(x, y) {
    var gridX = Math.floor(x / gridSize);
    var gridY = Math.floor(y / gridSize);
    currentDragGridStartX = gridX;
    currentDragGridStartY = gridY;
    setCurrentDragBrickSize();
    calcDragConstraints(gridX, gridY);
}

function stopDrag() {
    currentScore++;
    if (gameState == "running" && checkIfSolved() == true) {
        gameState = "solved";
        alert("Du løste banen med " + currentScore + " træk");
        if (currentScore < Settings.done[currentGameNr] || Settings.done[currentGameNr] == 0 || Settings.done[currentGameNr] == true) {
            Settings.done[currentGameNr] = currentScore;
            Settings.save();
        }
        currentGameNr = Settings.findFirstUnsolved();
        generateButtons();

        currentGameNr = currentGameNr % 40;
        loadGame(currentGameNr);
    }
    calcBrickTypeArray();
}

function selectCursor(x, y) {
    var gridX = Math.floor(x / gridSize);
    var gridY = Math.floor(y / gridSize);
    if (gridX > 5 || gridY > 5) {
        return;
    }
    if (brickTypeArray[gridX][gridY] != 0) {
        document.getElementById("canvas").style.cursor = "pointer";
    } else {
        document.getElementById("canvas").style.cursor = "default";
    }
}

/*-------------- mouse events -------------------*/
function mouseDownHandler(event) {
    if (gameState == "running" && dragState != "dragging") {
        dragState = "dragging";
        startDrag(event.offsetX, event.offsetY);
    }
}

function mouseUpHandler(event) {
    selectCursor(event.offsetX, event.offsetY);
    stopDrag();
    dragState = "";
}

function mouseMoveHandler(event) {
    if (dragState === "dragging") {
        doDragging(event.offsetX, event.offsetY);
    }

    if (dragState === "" && gameState === "running") {
        selectCursor(event.offsetX, event.offsetY);
    }
}

function addEventListeners() {
    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);

    canvas.addEventListener("touchstart", touchHandler, true);
    canvas.addEventListener("touchmove", touchHandler, true);
    canvas.addEventListener("touchend", touchHandler, true);
    canvas.addEventListener("touchcancel", touchHandler, true);
}
/*-------------- mouse events -------------------*/

function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch (event.type) {
        case "touchstart":
            type = "mousedown";break;
        case "touchmove":
            type = "mousemove";break;
        case "touchend":
            type = "mouseup";break;
        default:
            return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function gameTimer() {
    if (gameState == "running") {
        draw();
    }
}

setInterval(gameTimer, 20);