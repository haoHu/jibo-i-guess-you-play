"use strict";
var fs = require('fs');

var Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite;
// sprite的配置
var config = {
  eyeScale: 0.78,
  titleEyeX: 30,
  titleEyeY: -215,
  titleY: 290,
  titleScale: 0.85,
  readyX: 50,
  readyY: 300,
  barY: 688,
  //barTint = 0x6bdbf3,
  barFullTint: 0x049400,
  barHalfTint: 0x8ca53f,
  barQuarterTint: 0xa36f26,
  barLowTint: 0x8a1c0d,
  barBkgTint: 0x9f9f9f,
  snailX: 1070,
  snailY: 597,
  statisScale: 0.78,
  scoreTextX: 70,
  scoreTextY: -95,
  totalTextX: 70,
  totalTextY: 98
}

// 题板上文字样式
var style = {
  fontFamily: 'Arial',
  fontSize: '180px',
  fontStyle: 'bold',
  fill: '#F7EDCA',
  stroke: '#4a1850',
  strokeThickness: 5,
};
// 得分文字样式
var scoreStyle = {
  fontFamily: 'Arial',
  fontSize: '80px',
  fontStyle: 'bold',
  fill: '#20232d',
  stroke: '#FFFFFF',
  strokeThickness: 3,
};
// 游戏状态
var GAMELOADED = 0,
  GAMEREADY = 1,
  GAMESTART = 2,
  GAMEOVER = 3,
  GAMEOVERSHOW = 4,
  GAMEEXIT = 5;
// 材质路径
var imagesPath = "animations/textures/i-guess-you-play/";

var renderer, stage, audio, boardContainer;
var wordIndex, words = [];
var jiboEyeSpr, titleSpr, titleEyeSpr, readySpr, wordSpr, barSpr, barMaskSpr,
  barBkgSpr, snailSpr, statisticsSpr, scoreText, totalText;
var boardSprArr;
var titleScale, eyeScaleX, eyeScaleY, blinkCount, isEyeExpend, boardScale,
  barLength, statisScale;
var gameType, gameTime, gameState, gameScore, gameHandle;
var delay, tick, index, totalTick, currentTick;
var leftBtn, rightBtn;
var state;

// 游戏入口： 初始化渲染器，最外层容器，时间。加载材质
function init() {
  renderer = autoDetectRenderer(1280, 720, {
    transparent: true
  });
  renderer.view.style.position = "absolute";
  renderer.view.style.bottom = '0';
  renderer.view.style.left = '0';
  document.body.appendChild(renderer.view);
  stage = new Container();
  gameTime = 60;
  barLength = 1000;
  totalTick = barLength;
  tick = barLength / gameTime / 60;
  loader
    .add([imagesPath + "title1.png",
      imagesPath + "title2.png"
    ])
    .load(loaded);
}
// 初始化jibo的眼睛
function loaded() {
  jiboEyeSpr = Sprite.fromImage('animations/textures/white-eye.png');
  jiboEyeSpr.position.set(renderer.width / 2, renderer.height / 2);
  jiboEyeSpr.scale.set(config.eyeScale);
  jiboEyeSpr.anchor.set(0.5);
  stage.addChild(jiboEyeSpr);
  delay = 15;
  isEyeExpend = false;
  eyeScaleX = config.eyeScale;
  eyeScaleY = config.eyeScale;
  gameState = GAMELOADED;
  state = eyeBlink;
  animate();
}
// 眨眼
function eyeBlink() {
  delay--;
  if (delay < 0) {
    jibo.face.renderOnlyWhenDirty = false;
    jibo.animate.setEyeVisible(0);
    //close eye
    if (!isEyeExpend)
      if (eyeScaleY > 0.08) {
        eyeScaleY -= 0.1;
        eyeScaleX += 0.02;
        jiboEyeSpr.scale.set(eyeScaleX, eyeScaleY);
      } else isEyeExpend = true;
      //open eye
    else {
      if (eyeScaleY < config.eyeScale) {
        eyeScaleY += 0.1;
        eyeScaleX -= 0.02;
        jiboEyeSpr.scale.set(eyeScaleX, eyeScaleY);
      } else {
        delay = 20;
        eyeScaleX = config.eyeScale;
        eyeScaleY = config.eyeScale;
        isEyeExpend = false;
        state = eyeEscape;
      }
    }
  }
}

// 眼睛逃跑并初始化title
function eyeEscape() {
  delay--;
  if (delay < 0) {
    if (!isEyeExpend) {
      eyeScaleX += 0.025;
      eyeScaleY -= 0.025;
      jiboEyeSpr.scale.set(eyeScaleX, eyeScaleY);
      if (eyeScaleX > 0.92)
        isEyeExpend = true;
    } else {
      if (eyeScaleX > 0.6) {
        eyeScaleX -= 0.03;
        eyeScaleY += 0.03;
        jiboEyeSpr.scale.set(eyeScaleX, eyeScaleY);
        jiboEyeSpr.y -= (0.08 * jiboEyeSpr.height);
      } else {
        jiboEyeSpr.y -= (0.15 * jiboEyeSpr.height);
        if (jiboEyeSpr.y < -jiboEyeSpr.height) {
          //stage.removeChild(jiboEyeSpr);
          titleSpr = new Sprite(resources[imagesPath + "title1.png"].texture);
          titleEyeSpr = new Sprite(resources[imagesPath + "title2.png"].texture);
          titleSpr.anchor.set(0.5);
          titleEyeSpr.anchor.set(0.5);
          titleSpr.position.set(renderer.width / 2, renderer.height / 2);
          titleEyeSpr.position.set(config.titleEyeX, config.titleEyeY);
          titleSpr.addChild(titleEyeSpr);
          titleScale = 0.3;
          titleSpr.scale.set(titleScale);
          titleSpr.rotation = -0.1;
          titleSpr.y = -titleSpr.height;
          stage.addChild(titleSpr);
          state = showTitle1;
        }
      }
    }
  }
}
// 显示title动画1
function showTitle1() {
  if (titleSpr.y <= config.titleY) {
    titleSpr.y += 15;
    titleSpr.rotation -= 0.003;
  } else {
    if (titleScale < 0.95) {
      titleSpr.y += 3;
      titleScale += 0.04;
      titleSpr.scale.set(titleScale);
      titleSpr.rotation += 0.04;
    } else {
      state = showTitle2;
    }
  }
}
// 显示title动画2
function showTitle2() {
  if (titleScale > config.titleScale) {
    titleScale -= 0.015;
    titleSpr.scale.set(titleScale);
    titleSpr.rotation -= 0.065;
  } else {
    if (titleSpr.rotation < 0) {
      titleSpr.rotation += 0.03;
    } else {
      delay = 20;
      blinkCount = 2;
      isEyeExpend = false
      state = titleBlink;
    }
  }
}
// title上的jibo眨眼
function titleBlink() {
  delay--;
  if (delay < 0) {
    //close eye
    if (!isEyeExpend)
      if (titleEyeSpr.scale.y > 0.1)
        titleEyeSpr.scale.y -= 0.1;
      else isEyeExpend = true;
      //open eye
    else {
      if (titleEyeSpr.scale.y < config.titleScale)
        titleEyeSpr.scale.y += 0.1;
      else {
        if (--blinkCount > 0)
          isEyeExpend = false;
        else {
          jiboEyeSpr.scale.set(config.eyeScale);
          jiboEyeSpr.y = -jiboEyeSpr.height / 2;
          readySpr = Sprite.fromImage(imagesPath + 'ready.png');
          readySpr.position.set(config.readyX, config.readyY);
          readySpr.anchor.set(0.5);
          readySpr.scale.set(0.3)
          readySpr.alpha = 0;
          titleSpr.addChild(readySpr);
          audio = document.createElement('audio');
          document.body.appendChild(audio);
          delay = 20;
          state = showReady;
        }
      }
    }
  }
}

function showReady() {
  delay--;
  if (delay < 0) {
    if (readySpr.alpha < 0.9) {
      readySpr.alpha += 0.2;
    } else {
      gameState = GAMEREADY;
    }
  }
}

function gameReady() {
  delay = 20;
  state = gameStart;
}
// 游戏开始并初始化素材
function gameStart() {
  delay--;
  if (delay < 0) {
    if (titleSpr.y < (renderer.height + titleSpr.height / 2)) {
      titleSpr.y += 20;
    } else {
      if (jiboEyeSpr.y < renderer.height / 2)
        jiboEyeSpr.y += 30;
      else {
        wordSpr = new PIXI.Text('', style);
        wordSpr.anchor.set(0.5);
        wordSpr.position.set(renderer.width / 2, renderer.height / 2 + 50);
        boardSprArr = [];
        boardContainer = new Container();
        for (var i = 1; i < 11; i++) {
          boardSprArr.push(Sprite.fromImage(imagesPath + 'eyetoboard' + i +
            '.png'));
          boardSprArr[i - 1].alpha = 0;
          boardSprArr[i - 1].anchor.set(0.5);
          boardSprArr[i - 1].position.set(renderer.width / 2, renderer.height /
            2);
          boardContainer.addChild(boardSprArr[i - 1]);
        }
        stage.addChild(boardContainer);
        barSpr = Sprite.fromImage(imagesPath + 'bar.png');
        barBkgSpr = Sprite.fromImage(imagesPath + 'bar.png');
        barMaskSpr = Sprite.fromImage(imagesPath + 'bar.png');
        barSpr.position.set(renderer.width / 2, config.barY);
        barBkgSpr.position.set(renderer.width / 2, config.barY);
        barMaskSpr.position.set(renderer.width / 2, config.barY);
        barSpr.anchor.x = 0.5;
        barBkgSpr.anchor.x = 0.5;
        barMaskSpr.anchor.x = 0.5;
        barSpr.tint = config.barFullTint;
        barBkgSpr.tint = config.barBkgTint;
        barSpr.mask = barMaskSpr;
        snailSpr = Sprite.fromImage(imagesPath + 'snail.png');
        snailSpr.position.set(config.snailX, config.snailY);
        index = 0;
        delay = 10;
        currentTick = 0;
        gameState = GAMESTART;
        state = eyeToBoard;
      }
    }
  }
}

function eyeToBoard() {
  delay--
  if (delay < 0) {
    if (index < 6) {
      if (index > 0) {
        boardContainer.removeChild(boardSprArr[index - 1]);
      }
      //delay = 1;
      boardSprArr[index++].alpha = 1;
    } else {
      leftBtn = keyboard(37);
      rightBtn = keyboard(39);
      leftBtn.press = gameSkip;
      rightBtn.press = gameRight;
      stage.removeChild(jiboEyeSpr);
      getWords();
      words.length = 10;
      wordIndex = 0;
      wordSpr.alpha = 0;
      stage.addChild(wordSpr);
      stage.addChild(barBkgSpr);
      stage.addChild(barSpr);
      stage.addChild(snailSpr);
      state = showWord;
    }
  }
}
// 计时动画
function timeTick() {
  if (currentTick > totalTick) {
    gameOver();
  } else {
    //tick = 1;
    currentTick += tick;
    snailSpr.x -= tick;
    barMaskSpr.x -= tick;
    if (currentTick / totalTick > 0.8) {
      barSpr.tint = config.barLowTint;
    } else if (currentTick / totalTick > 0.5) {
      barSpr.tint = config.barQuarterTint;
    } else if (currentTick / totalTick > 0.3) {
      barSpr.tint = config.barHalfTint;
    }
  }
  // if (snailSpr.x < 75) {
  //   gameOver();
  // } else {
  //   // snailSpr.x -= tick;
  //   // barMaskSpr.x -= tick;
  //   snailSpr.x -= 1;
  //   barMaskSpr.x -= 1;
  // }
}

function showWord() {
  wordSpr.text = words[wordIndex];
  if (wordSpr.alpha < 0.9) {
    wordSpr.alpha += 0.1;
  }
  timeTick();
}
// 翻页动画
function boardAnimation() {
  delay--;
  if (delay < 0) {
    if (index < 10) {
      if (index > 6) {
        boardSprArr[index - 1].alpha = 0;
      }
      boardSprArr[index++].alpha = 1;
      delay = 4;
      timeTick();
    } else {
      showWord();
    }
  } else
    timeTick();
}

function gameSkip() {
  wordIndex++;
  if (wordIndex === words.length) {
    gameOver();
    return;
  }
  index = 6;
  delay = 4;
  wordSpr.alpha = 0;
  boardSprArr[9].alpha = 0;
  audio.src = 'audio/i-guess-you-play/skip.mp3'
  audio.play();
  state = boardAnimation;
}

function gameRight() {
  gameScore++;
  wordIndex++;
  if (wordIndex === words.length) {
    gameOver();
    return;
  }
  index = 6;
  delay = 4;
  wordSpr.alpha = 0;
  boardSprArr[9].alpha = 0;
  audio.src = 'audio/i-guess-you-play/good.mp3'
  audio.play();
  state = boardAnimation;
}

function gameOver() {
  leftBtn.press = undefined;
  rightBtn.press = undefined;
  boardSprArr[5].alpha = 0;
  boardScale = 1;
  stage.removeChild(barSpr);
  statisScale = 0;
  statisticsSpr = Sprite.fromImage(imagesPath + 'statistics.png');
  statisticsSpr.scale.set(0);
  statisticsSpr.anchor.set(0.5);
  statisticsSpr.position.set(renderer.width / 2, renderer.height / 2);
  scoreText = new PIXI.Text('', scoreStyle);
  scoreText.position.set(config.scoreTextX, config.scoreTextY);
  scoreText.anchor.set(0.5);
  scoreText.text = gameScore + '';
  scoreText.style.fill = '#ab0000';
  statisticsSpr.addChild(scoreText);
  totalText = new PIXI.Text('', scoreStyle);
  totalText.position.set(config.totalTextX, config.totalTextY);
  totalText.anchor.set(0.5);
  totalText.text = words.length + '';
  statisticsSpr.addChild(totalText);
  stage.addChild(statisticsSpr);
  gameState = GAMEOVER;
  state = showGameOver;
}

function showGameOver() {
  snailSpr.x -= 10;
  if (boardScale > 0.08) {
    boardScale -= 0.08;
    for (var i = 0; i < boardSprArr.length; i++)
      boardSprArr[i].scale.set(boardScale);
    wordSpr.scale.set(boardScale);
    barBkgSpr.scale.set(boardScale);
  } else {
    barBkgSpr.alpha -= 0.2;
    if (statisticsSpr.scale.x < config.statisScale) {
      statisScale += 0.03;
      statisticsSpr.scale.set(statisScale);
    } else {
      if (snailSpr.x < -snailSpr.width) {
        gameState = GAMEOVERSHOW;
        gameHandle = setTimeout(function() {
          exitGame();
          var rate = gameScore / words.length;
          if (rate < 0.6) {
            playAnimation("keep-up0" + randomInt(1, 3));
          } else if (rate > 0.8) {
            playAnimation("good0" + randomInt(1, 2));
          } else {
            init();
          }
        }, 5000);
      }
    }
  }
}
// 播放jibo的animation
function playAnimation(animation) {
  var animPath = "animations/i-guess-you-play/" + animation + ".keys";
  console.log(animation)
  jibo.animate.createAnimationBuilderFromKeysPath(animPath, "", function(
    builder) {
    builder.on(jibo.animate.AnimationEventType.STOPPED, function(eventType,
      instance, payload) {
      //jibo.animate.blink();
      init();
      console.log("stop")
    });
    builder.play();
  })
}

function exitGame() {
  if (gameHandle) {
    clearTimeout(gameHandle);
  }
  if (gameState >= GAMEREADY) {
    document.body.removeChild(audio);
  }
  state = fun;
  gameState = GAMEEXIT;
  stage.removeChild();
  loader.reset();
  document.body.removeChild(renderer.view);
  jibo.animate.setEyeVisible(1);
  jibo.face.renderOnlyWhenDirty = true;
  jibo.face.update();
  jibo.animate.blink();
}
// 空函数，解决结束后的bug
function fun() {

}

function animate() {
  state();
  renderer.render(stage);
  if (gameState < 4) {
    requestAnimationFrame(animate);
  }
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
  words = ["sheep", "monkey", "panda", "tiger", "fox", "chicken", "duck",
    "elephant", "snake", "rabbit", "bird", "shark", "dog", "cat", "cock",
    "hen", "camel", "wolf", "polar bear", "giraffe", "koala", "lion",
    "penguin", "camel", "seal", "octopus", "kangaroo", "parrot", "turtle",
    "ant", "mouse", "spider", "hamster", "manatee", "goldfish", "chimpanzee",
    "cheetah", "horse", "dolphin", "goat"
  ];
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
module.exports.gameReady = gameReady;
module.exports.getType = getType;
module.exports.getTime = getTime;
module.exports.chooseType = chooseType;
module.exports.chooseTime = chooseTime;
module.exports.gameRight = gameRight;
module.exports.gameSkip = gameSkip;
module.exports.getCurrentWord = getCurrentWord;
module.exports.gameOver = gameOver;
module.exports.exitGame = exitGame;
