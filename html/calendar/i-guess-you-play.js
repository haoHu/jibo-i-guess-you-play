"use strict";
var fs = require('fs');

var Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite;

var config = {
  titleEyeX: 30,
  titleEyeY: -215,
  itemScale: 0.66,
  bombX: 360,
  bombY: 30,
  fuseX: 507,
  fuseY: 38,
  sparkX: 890,
  sparkY: 70,
  sparkCount: 6,
  statisScale: 0.8
}
var style = {
  fontFamily: 'Arial',
  fontSize: '110px',
  fontStyle: 'bold',
  fill: '#BF002F',
  stroke: '#FFFFFF',
  strokeThickness: 6,
};
var scoreStyle = {
  fontFamily: 'Arial',
  fontSize: '80px',
  fontStyle: 'bold',
  fill: '#AB0000',
  stroke: '#FFFFFF',
  strokeThickness: 3,
};
var imagesPath = "animations/textures/i-guess-you-play/";

var renderer, stage, typeContainer, timeContainer, bombContainer, itemContainer;
var wordIndex, words = [];
var readySpr, startBkgSpr, titleSpr, titleEyeSpr, gameBkgSpr, bombSpr, fuseSpr,
  maskSpr, sparkSpr, statisticsSpr, scoreText;
var chooseTypeSprArr, typeSprArr, chooseTimeSprArr, timeSprArr;
var playItem = {};
var titleScale, blinkCount, titleEyeHeight, isEyeExpend, fuseLength, sparkScale,
  sparkRotation, sparkCount, isSparkExpend, statisScale, statisRotation;
var gameType, gameTime, gameState, gameScore, gameHandle;
var delay, tick, index;
var leftBtn, rightBtn;
var state;
var points = [{
  x: 890,
  y: 70
}, {
  x: 873,
  y: 67
}, {
  x: 843,
  y: 49
}, {
  x: 807,
  y: 51
}, {
  x: 786,
  y: 66
}, {
  x: 727,
  y: 124.5
}, {
  x: 672,
  y: 123
}, {
  x: 603,
  y: 76
}, {
  x: 561,
  y: 60
}, {
  x: 535,
  y: 60
}, {
  x: 506,
  y: 69
}, {
  x: 504,
  y: 69
}];

function init() {
  renderer = autoDetectRenderer(1280, 720, {
    backgroundColor: "#FFFFFF"
  });
  renderer.view.style.position = "absolute"
  renderer.view.style.bottom = '0';
  renderer.view.style.left = '0';
  document.body.appendChild(renderer.view);
  stage = new Container();
  gameType = undefined;
  gameTime = undefined;
  loader
    .add([imagesPath + "fuse.png",
      imagesPath + "title2.png",
      imagesPath + "title3.png"
    ])
    .load(loaded);
}

function loaded() {
  readySpr = Sprite.fromImage(imagesPath + 'ready.png');
  readySpr.position.set(renderer.width / 2, 300);
  readySpr.scale.set(0.5);
  readySpr.anchor.set(0.5);
  stage.addChild(readySpr);
  delay = 25;
  gameState = 0;
  state = getReady;
  animate();
}

function getReady() {
  delay--;
  if (delay === 0) {
    startBkgSpr = Sprite.fromImage(imagesPath + 'start.png');
    stage.addChild(startBkgSpr);
    startBkgSpr.alpha = 0;
    delay = 30;
    state = gameStart;
  }
}

function gameStart() {
  delay--;
  if (delay <= 0) {
    readySpr.alpha -= 0.02;
    startBkgSpr.alpha += 0.01;
  }
  if (startBkgSpr.alpha > 0.99) {
    stage.removeChild(readySpr);
    titleSpr = new Sprite(resources[imagesPath + "title2.png"].texture);
    titleEyeSpr = new Sprite(resources[imagesPath + "title3.png"].texture);
    titleSpr.anchor.set(0.5);
    titleEyeSpr.anchor.set(0.5);
    titleSpr.position.set(renderer.width / 2, renderer.height / 2);
    titleEyeSpr.position.set(config.titleEyeX, config.titleEyeY);
    titleSpr.addChild(titleEyeSpr);
    stage.addChild(titleSpr);
    blinkCount = 2;
    isEyeExpend = false;
    titleEyeHeight = titleEyeSpr.height;
    delay = 20;
    state = titleBlink;
  }
}

function titleBlink() {
  delay--;
  if (delay < 0) {
    //close eye
    if (!isEyeExpend)
      if (titleEyeSpr.height > 0)
        titleEyeSpr.height -= 4;
      else isEyeExpend = true;
      //open eye
    else {
      if (titleEyeSpr.height < titleEyeHeight)
        titleEyeSpr.height += 4;
      else {
        if (--blinkCount > 0)
          isEyeExpend = false;
        else {
          titleScale = 1.5;
          state = gameTitle;
        }
      }
    }
  }
}

function gameTitle() {
  titleScale -= 0.03;
  if (titleScale > 1) {
    //wait
  } else if (titleScale > 0) {
    titleSpr.scale.set(titleScale);
    titleEyeSpr.scale.set(titleScale);
  } else {
    stage.removeChild(titleSpr);
    stage.removeChild(titleEyeSpr);
    chooseTypeSprArr = [];
    for (var i = 1; i < 8; i++) {
      chooseTypeSprArr.push(Sprite.fromImage(imagesPath + 'choosetype' + i +
        '.png'))
      chooseTypeSprArr[i - 1].alpha = 0;
      chooseTypeSprArr[i - 1].position.set(295, 0)
      stage.addChild(chooseTypeSprArr[i - 1])
    }
    typeSprArr = [];
    typeContainer = new Container();
    for (var i = 0; i < 2; i++) {
      typeSprArr.push(Sprite.fromImage(imagesPath + 'type.png'));
      typeSprArr[i].scale.set(0.95)
      typeSprArr[i].anchor.set(0.5)
      typeSprArr[i].alpha = 0;
      typeSprArr[i].interactive = true;
      typeSprArr[i].number = i;
      typeSprArr[i].on('mousedown', typeChosen);
      typeSprArr[i].on('touchstart', typeChosen);
      typeContainer.addChild(typeSprArr[i])
    }
    typeSprArr[0].position.set(635, 175)
    typeSprArr[1].position.set(635, 435)
    delay = 6;
    index = 0;
    state = gameChooseType;
  }
}

function gameChooseType() {
  delay--;
  if (delay <= 0 && index < 7) {
    delay = 6;
    if (index > 0)
      stage.removeChild(chooseTypeSprArr[index - 1]);
    if (index === 6) {
      gameState = 1;
      stage.addChild(typeContainer)
    }
    chooseTypeSprArr[index++].alpha = 1;
  }
}

function typeChosen(eventData) {
  // console.log(eventData.data.global)
  if (eventData.target.number === 0) {
    gameType = '1vs1'
  } else {
    gameType = 'multiplicity'
  }
  console.log(gameType)
  stage.removeChild(typeContainer);
  stage.removeChild(chooseTypeSprArr[6]);
  chooseTimeSprArr = [];
  timeSprArr = [];
  timeContainer = new Container();
  for (var i = 1; i < 8; i++) {
    chooseTimeSprArr.push(Sprite.fromImage(imagesPath + 'choosetime' + i +
      '.png'))
    chooseTimeSprArr[i - 1].alpha = 0;
    chooseTimeSprArr[i - 1].position.set(280, 0)
    stage.addChild(chooseTimeSprArr[i - 1])
  }
  for (var i = 0; i < 3; i++) {
    timeSprArr.push(Sprite.fromImage(imagesPath + 'time.png'));
    timeSprArr[i].scale.set(0.95)
    timeSprArr[i].anchor.set(0.5)
    timeSprArr[i].alpha = 0;
    timeSprArr[i].interactive = true;
    timeSprArr[i].number = i;
    timeSprArr[i].on('mousedown', timeChosen);
    timeSprArr[i].on('touchstart', timeChosen);
    timeContainer.addChild(timeSprArr[i])
  }
  timeSprArr[0].position.set(645, 128)
  timeSprArr[1].position.set(650, 345)
  timeSprArr[2].position.set(650, 555)
  delay = 6;
  index = 0;
  state = gameChooseTime;
}

function gameChooseTime() {
  delay--;
  if (delay <= 0 && index < 7) {
    delay = 6;
    if (index > 0)
      stage.removeChild(chooseTimeSprArr[index - 1]);
    if (index === 6) {
      gameState = 2;
      stage.addChild(timeContainer);
    }
    chooseTimeSprArr[index++].alpha = 1;
  }
}

function timeChosen(eventData) {
  stage.removeChild(timeContainer);
  stage.removeChild(chooseTimeSprArr[6]);
  if (eventData.target.number === 0) {
    gameTime = 90;
  } else if (eventData.target.number === 1) {
    gameTime = 180;
  } else {
    gameTime = 300;
  }
  console.log(gameTime)
  initGame()
}

function initBomb() {
  bombSpr = Sprite.fromImage(imagesPath + 'bomb.png');
  maskSpr = Sprite.fromImage(imagesPath + 'write.png');
  sparkSpr = Sprite.fromImage(imagesPath + 'spark.png');
  fuseSpr = new Sprite(resources[imagesPath + "fuse.png"].texture);
  sparkScale = 0.18;
  sparkRotation = 0;
  isSparkExpend = false;
  sparkCount = config.sparkCount;
  fuseLength = fuseSpr.width * config.itemScale;

  tick = fuseLength / gameTime / 60;
  // tick = 1;
  bombSpr.scale.set(config.itemScale);
  fuseSpr.scale.set(config.itemScale);
  maskSpr.scale.set(config.itemScale);
  sparkSpr.scale.set(sparkScale);
  sparkSpr.anchor.set(0.5);
  bombSpr.position.set(config.bombX, config.bombY);
  fuseSpr.position.set(config.fuseX, config.fuseY);
  maskSpr.position.set(config.fuseX, config.fuseY);
  sparkSpr.position.set(config.sparkX, config.sparkY);
  fuseSpr.mask = maskSpr;
  bombContainer = new Container();
  bombContainer.addChild(maskSpr);
  bombContainer.addChild(bombSpr);
  bombContainer.addChild(fuseSpr);
  bombContainer.addChild(sparkSpr);
  stage.addChild(bombContainer);
}

function getWords() {
  gameScore = 0;
  var wordlibrary = JSON.parse(fs.readFileSync('./src/wordlibrary.json', 'utf8'));
  var count = randomInt(0, 22);
  for (var element in wordlibrary) {
    if (count-- == 0) break;
  }
  words = wordlibrary[element];
  // console.log(words)
  // words = ["Sheep", "Horse", "monkey", "dolphin", "panda", "tiger", "fox",
  //   "snake", "rabbit", "lion", "shark", "goat", "dog", "cock", "hen",
  //   "chicken", "duck", "elephant", "camel", "bird", "wolf", "polar bear",
  //   "giraffe", "koala", "penguin", "camel", "seal", "rabbit", "octopus",
  //   "kangaroo", "parrot", "turtle", "ant", "mouse", "spider", "hamster",
  //   "manatee", "goldfish", "chimpanzee", "cheetah"
  // ];
}

function gameSkip() {
  delay = 20;
  state = showSkip;
}

function gameRight() {
  delay = 20;
  state = showRight;
}

function initGame() {
  gameBkgSpr = Sprite.fromImage(imagesPath + 'background.png');
  stage.addChild(gameBkgSpr);
  initBomb();
  getWords();
  gameState = 3;
  leftBtn = keyboard(37);
  rightBtn = keyboard(39);
  leftBtn.press = gameSkip;
  rightBtn.press = gameRight;

  playItem['rightBtn'] = Sprite.fromImage(imagesPath + 'right.png');
  playItem['skip'] = Sprite.fromImage(imagesPath + 'skip.png');
  playItem['board'] = Sprite.fromImage(imagesPath + 'board.png');
  playItem['text'] = new PIXI.Text('', style);
  itemContainer = new Container();
  for (var item in playItem) {
    playItem[item].scale.set(config.itemScale);
    playItem[item].position.set(renderer.width / 2, renderer.height / 2);
    playItem[item].anchor.set(0.5);
    playItem[item].alpha = 0;
    itemContainer.addChild(playItem[item]);
  }
  stage.addChild(itemContainer);
  wordIndex = 0;
  index = 0;
  state = gameShowBoard;
}

function gameShowBoard() {
  playItem['text'].text = words[wordIndex];
  playItem['text'].alpha = 1;
  playItem['board'].alpha = 1;
  playItem['rightBtn'].alpha = 0;
  playItem['skip'].alpha = 0;
  twinkleSpark();
}

function showRight() {
  delay--;
  playItem['board'].alpha = 0;
  playItem['text'].alpha = 0;
  playItem['rightBtn'].alpha = 1;
  if (delay === 0) {
    wordIndex++;
    gameScore++;
    if (wordIndex === words.length) {
      gameOver();
      return;
    }
    state = gameShowBoard;
  }
  twinkleSpark();
}

function showSkip() {
  delay--;
  playItem['board'].alpha = 0;
  playItem['text'].alpha = 0;
  playItem['skip'].alpha = 1;
  if (delay === 0) {
    wordIndex++;
    if (wordIndex === words.length) {
      gameOver();
      return;
    }
    state = gameShowBoard;
  }
  twinkleSpark();
}

function twinkleSpark() {
  if (maskSpr.x <= (config.fuseX - fuseLength)) {
    gameOver();
  }
  if (isSparkExpend) {
    sparkScale += 0.003;
    sparkRotation += 0.01;
  } else {
    sparkScale -= 0.003;
    sparkRotation -= 0.01;
  }
  if (!(--sparkCount)) {
    sparkCount = config.sparkCount;
    isSparkExpend = !isSparkExpend;
  }
  sparkSpr.scale.set(sparkScale);
  sparkSpr.rotation = sparkRotation;
  sparkSpr.x -= tick;
  maskSpr.x -= tick;
  if (sparkSpr.x > points[index].x) {
    sparkSpr.y -= (points[index - 1].y - points[index].y) / (points[index - 1].x -
      points[index].x) * tick;
  } else {
    index++;
  }
}

function gameOver() {
  leftBtn.press = undefined;
  rightBtn.press = undefined;
  stage.removeChild(bombContainer);
  stage.removeChild(itemContainer);
  gameState = 4;
  statisScale = 0;
  statisRotation = 0;
  statisticsSpr = Sprite.fromImage(imagesPath + 'statistics.png');
  statisticsSpr.scale.set(0);
  statisticsSpr.anchor.set(0.5);
  statisticsSpr.rotation = -PIXI.PI_2 / 4;
  statisticsSpr.position.set(renderer.width / 2, renderer.height / 2);
  scoreText = new PIXI.Text('', scoreStyle);
  scoreText.position.set(145, -70)
  scoreText.anchor.set(0.5)
  scoreText.text = gameScore + '';
  statisticsSpr.addChild(scoreText);
  stage.addChild(statisticsSpr);
  state = showGameOver;
}

function showGameOver() {
  if (statisticsSpr.scale.x < config.statisScale) {
    statisScale += 0.016;
    statisticsSpr.rotation += PIXI.PI_2 / 40;
    statisticsSpr.scale.set(statisScale);
  } else {
    gameState = 5;
    gameHandle = setTimeout(function() {
      exitGame();
    }, 30000)
  }
}

function exitGame() {
  if (gameHandle) {
    clearTimeout(gameHandle);
  }
  gameState = 6;
  stage.removeChild();
  loader.reset();
  document.body.removeChild(renderer.view);
  jibo.face.renderOnlyWhenDirty = true;
  jibo.face.update();
}

function animate() {
  state();
  renderer.render(stage);
  if (gameState < 5) {
    requestAnimationFrame(animate);
  }
}

//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function getGameState() {
  return gameState;
}

function getType() {
  return gameType;
}

function getTime() {
  return gameTime;
}

function chooseType(type) {
  var data = {};
  data.target = {};
  data.target.number = type.charCodeAt() - 'a'.charCodeAt();
  typeChosen(data);
}

function chooseTime(time) {
  var data = {};
  data.target = {}
  data.target.number = time.charCodeAt() - 'a'.charCodeAt();
  timeChosen(data);
}

function getCurrentWord() {
  return words[wordIndex];
}
module.exports.init = init;
module.exports.getGameState = getGameState;
module.exports.getType = getType;
module.exports.getTime = getTime;
module.exports.chooseType = chooseType;
module.exports.chooseTime = chooseTime;
module.exports.gameRight = gameRight;
module.exports.gameSkip = gameSkip;
module.exports.getCurrentWord = getCurrentWord;
module.exports.gameOver = gameOver;
module.exports.exitGame = exitGame;
