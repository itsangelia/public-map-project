// =====================================================
// CAMPUS SOCIAL MAP
// EXPLORABLE MAP + STREETLIGHT GAME ENTRANCE
// p5.js v2
// =====================================================


// =====================================================
// BASIC STATE
// =====================================================

const displayMode = new URLSearchParams(location.search).get('mode') === 'display';
let page = "login";

let characterImages = [];

let mapImage;
let lightIcon;

let selectedCharacter = 0;
let hoverCharacter = -1;

let nameInput;


// =====================================================
// PLAYER
// =====================================================

// These are WORLD coordinates.
let playerX = 300;
let playerY = 450;

let playerSpeed = 3.2;


// =====================================================
// MAP WORLD
// =====================================================

const MAP_SCALE = 1.6;

let mapWorldWidth = 0;
let mapWorldHeight = 0;


// =====================================================
// CAMERA
// =====================================================

let cameraX = 0;
let cameraY = 0;


// Starting position on map
const SPAWN_X = 0.5;
const SPAWN_Y = 0.82;


// =====================================================
// MOVEMENT
// =====================================================

let keysDown = {
  left: false,
  right: false,
  up: false,
  down: false
};


// =====================================================
// STREETLIGHT GAME INTERACTION POINT
// =====================================================

let lightGameSpot = {

  // RIGHT / UPPER PART OF MAP
  // NOT IN THE CENTRE
  x: 1750,
  y: 520,

  // Width only.
  // Height will automatically follow
  // the ORIGINAL image ratio.
  width: 180,

  // Distance needed to activate
  interactionRadius: 155
};


let nearLightGame = false;

let lightPulse = 0;


// =====================================================
// COLOURS
// =====================================================

const COLORS = {

  background: "#FFF8F1",

  navy: "#303A68",

  purple: "#7C89D9",

  coral: "#F28C8C",

  mint: "#A8D8C5",

  yellow: "#F2C66D",

  white: "#FFFFFF",

  grey: "#DDD9D4",

  textGrey: "#737373",

  grass: "#DCEBD8",

  darkGrass: "#BDD8B9",

  path: "#E8D2B5"

};


// =====================================================
// CHARACTER DATA
// =====================================================

const characters = [

  {
    name: "Male Character",

    imageIndex: 0,

    cropX: 0.25,
    cropY: 0.10,

    cropW: 0.50,
    cropH: 0.80,

    shadowOffsetY: 0
  },


  {
    name: "Female Character",

    imageIndex: 1,

    cropX: 0.25,
    cropY: 0.10,

    cropW: 0.50,
    cropH: 0.80,

    shadowOffsetY: 0
  },


  {
    name: "Shopping Bag",

    imageIndex: 2,

    cropX: 0.23,
    cropY: 0.18,

    cropW: 0.54,
    cropH: 0.65,

    shadowOffsetY: 8
  }

];


// =====================================================
// SETUP
// =====================================================

async function setup() {

  createCanvas(600, 900);
  fitCanvasToScreen();

  textFont("Arial");


  // ===================================================
  // CHARACTER IMAGES
  // ===================================================

  characterImages[0] =
    await loadImage("男角色.png");


  characterImages[1] =
    await loadImage("女角色.png");


  characterImages[2] =
    await loadImage("购物袋.png");


  // ===================================================
  // MAP
  // ===================================================

  mapImage =
    await loadImage("map draft.png");


  // ===================================================
  // STREETLIGHT ICON
  // ===================================================

  lightIcon =
    await loadImage("light icon.png");


  // ===================================================
  // WORLD SIZE
  // ===================================================

  mapWorldWidth =
    mapImage.width * MAP_SCALE;


  mapWorldHeight =
    mapImage.height * MAP_SCALE;


  console.log(
    "Map size:",
    mapImage.width,
    mapImage.height
  );


  console.log(
    "World size:",
    mapWorldWidth,
    mapWorldHeight
  );


  // ===================================================
  // UI + CONTROLS
  // ===================================================

  createNicknameInput();

  setupKeyboardControls();
  setupTouchControls();
  if (displayMode) {
    page = 'display';
    nameInput.hide();
    resizeCanvas(windowWidth, windowHeight);
    fitCanvasToScreen();
  }
}


// =====================================================
// DRAW
// =====================================================

function draw() {
  updateTouchControls();
  if (page === 'display') {
    drawPublicDisplay();
    return;
  }

  // LOGIN
  if (page === "login") {

    drawLoginPage();

  }


  // PUBLIC MAP
  else if (page === "map") {

    movePlayer();

    updateCamera();

    checkLightGameDistance();

    if (window.mapNetwork) window.mapNetwork.move(playerX, playerY);
    drawMapPage();

  }


  // STREETLIGHT GAME
  else if (page === "lightGame") {

    drawStreetlightGame();

  }

}


// =====================================================
// NICKNAME INPUT
// =====================================================

function createNicknameInput() {

  nameInput =
    createInput("");


  nameInput.attribute(
    "placeholder",
    "Enter your nickname..."
  );


  nameInput.attribute(
    "maxlength",
    "18"
  );


  nameInput.position(
    100,
    230
  );


  nameInput.size(
    400,
    62
  );


  nameInput.style(
    "font-size",
    "18px"
  );


  nameInput.style(
    "font-family",
    "Arial"
  );


  nameInput.style(
    "padding",
    "0 18px"
  );


  nameInput.style(
    "border",
    "2px solid #DDD9D4"
  );


  nameInput.style(
    "border-radius",
    "14px"
  );


  nameInput.style(
    "outline",
    "none"
  );


  nameInput.style(
    "background",
    "#FAFAFA"
  );


  nameInput.style(
    "color",
    "#303A68"
  );


  nameInput.style(
    "box-sizing",
    "border-box"
  );


  nameInput.elt.addEventListener(

    "keydown",

    function(event) {

      if (event.key === "Enter") {

        event.preventDefault();

        event.stopPropagation();

        enterMap();

      }

    }

  );

}


// =====================================================
// KEYBOARD CONTROLS
// =====================================================

function setupKeyboardControls() {

  window.addEventListener(

    "keydown",

    function(event) {
      if (event.isComposing || event.target.closest?.('#chat-panel')) return;


      // =================================================
      // LOGIN
      // =================================================

      if (page === "login") {

        if (
          document.activeElement ===
          nameInput.elt
        ) {

          return;

        }


        if (event.key === "ArrowLeft") {

          event.preventDefault();

          selectPreviousCharacter();

        }


        else if (
          event.key === "ArrowRight"
        ) {

          event.preventDefault();

          selectNextCharacter();

        }


        else if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          enterMap();

        }

      }


      // =================================================
      // MAP
      // =================================================

      else if (page === "map") {


        // LEFT

        if (
          event.key === "ArrowLeft" ||
          event.key === "a" ||
          event.key === "A"
        ) {

          event.preventDefault();

          keysDown.left = true;

        }


        // RIGHT

        else if (
          event.key === "ArrowRight" ||
          event.key === "d" ||
          event.key === "D"
        ) {

          event.preventDefault();

          keysDown.right = true;

        }


        // UP

        else if (
          event.key === "ArrowUp" ||
          event.key === "w" ||
          event.key === "W"
        ) {

          event.preventDefault();

          keysDown.up = true;

        }


        // DOWN

        else if (
          event.key === "ArrowDown" ||
          event.key === "s" ||
          event.key === "S"
        ) {

          event.preventDefault();

          keysDown.down = true;

        }


        // =================================================
        // ENTER STREETLIGHT GAME
        // =================================================

        else if (
          event.key === "e" ||
          event.key === "E"
        ) {

          if (nearLightGame) {

            event.preventDefault();

            enterStreetlightGame();

          }

        }

      }


      // =================================================
      // STREETLIGHT GAME
      // =================================================

      else if (page === "lightGame") {

        if (event.key === "Escape") {

          event.preventDefault();

          exitStreetlightGame();

        }

      }

    }

  );


  // ===================================================
  // KEY RELEASE
  // ===================================================

  window.addEventListener(

    "keyup",

    function(event) {


      if (
        event.key === "ArrowLeft" ||
        event.key === "a" ||
        event.key === "A"
      ) {

        keysDown.left = false;

      }


      if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {

        keysDown.right = false;

      }


      if (
        event.key === "ArrowUp" ||
        event.key === "w" ||
        event.key === "W"
      ) {

        keysDown.up = false;

      }


      if (
        event.key === "ArrowDown" ||
        event.key === "s" ||
        event.key === "S"
      ) {

        keysDown.down = false;

      }

    }

  );

}


// =====================================================
// LOGIN PAGE
// =====================================================

function drawLoginPage() {

  background(
    COLORS.background
  );


  // MAIN CARD

  noStroke();

  fill(
    COLORS.white
  );

  rect(
    45,
    30,
    510,
    840,
    28
  );


  // JOIN PAGE

  fill(
    "#AAAAAA"
  );

  textAlign(
    LEFT
  );

  textStyle(
    NORMAL
  );

  textSize(
    13
  );

  text(
    "JOIN PAGE",
    75,
    70
  );


  // SKIP

  fill(
    COLORS.textGrey
  );

  textAlign(
    RIGHT
  );

  textSize(
    16
  );

  text(
    "Skip",
    520,
    70
  );


  // TITLE

  fill(
    COLORS.navy
  );

  textAlign(
    CENTER
  );

  textStyle(
    BOLD
  );

  textSize(
    32
  );

  text(
    "JOIN THE MAP",
    width / 2,
    125
  );


  textStyle(
    NORMAL
  );

  fill(
    COLORS.textGrey
  );

  textSize(
    15
  );

  text(
    "Choose a character and enter a nickname",
    width / 2,
    158
  );


  // NICKNAME

  fill(
    COLORS.navy
  );

  textAlign(
    LEFT
  );

  textStyle(
    BOLD
  );

  textSize(
    14
  );

  text(
    "NICKNAME",
    100,
    215
  );


  // DIVIDER

  stroke(
    "#E4E1DD"
  );

  strokeWeight(
    1
  );

  line(
    100,
    330,
    235,
    330
  );

  line(
    365,
    330,
    500,
    330
  );


  noStroke();

  fill(
    "#999999"
  );

  textAlign(
    CENTER
  );

  textStyle(
    NORMAL
  );

  textSize(
    12
  );

  text(
    "CHOOSE A CHARACTER",
    width / 2,
    330
  );


  // ===================================================
  // CHARACTER CARDS
  // ===================================================

  let positions = [
    150,
    300,
    450
  ];


  let cardY =
    480;


  hoverCharacter =
    -1;


  for (
    let i = 0;
    i < characters.length;
    i++
  ) {

    let x =
      positions[i];


    // HOVER

    if (
      mouseX > x - 65 &&
      mouseX < x + 65 &&
      mouseY > cardY - 115 &&
      mouseY < cardY + 115
    ) {

      hoverCharacter =
        i;

    }


    // SELECTED

    if (
      i ===
      selectedCharacter
    ) {

      stroke(
        COLORS.navy
      );

      strokeWeight(
        4
      );

      fill(
        "#F3F4FF"
      );

    }


    // HOVER

    else if (
      i ===
      hoverCharacter
    ) {

      stroke(
        COLORS.purple
      );

      strokeWeight(
        2
      );

      fill(
        "#FAFAFF"
      );

    }


    // NORMAL

    else {

      stroke(
        COLORS.grey
      );

      strokeWeight(
        2
      );

      fill(
        COLORS.white
      );

    }


    rectMode(
      CENTER
    );


    rect(
      x,
      cardY,
      130,
      230,
      22
    );


    drawCharacterImage(
      x,
      cardY - 25,
      characters[i],
      115,
      170
    );


    noStroke();

    fill(
      COLORS.navy
    );

    textAlign(
      CENTER
    );

    textStyle(
      BOLD
    );

    textSize(
      12
    );


    text(
      characters[i].name,
      x,
      cardY + 90
    );

  }


  rectMode(
    CORNER
  );


  // HELP

  noStroke();

  fill(
    COLORS.textGrey
  );

  textAlign(
    CENTER
  );

  textStyle(
    NORMAL
  );

  textSize(
    14
  );

  text(
    "Use ← → or click a character to select",
    width / 2,
    630
  );


  // SELECTED

  fill(
    COLORS.navy
  );

  textStyle(
    BOLD
  );

  text(
    "Selected: " +
    characters[selectedCharacter].name,
    width / 2,
    660
  );


  // ENTER BUTTON

  noStroke();

  fill(
    COLORS.navy
  );

  rect(
    125,
    710,
    350,
    70,
    18
  );


  fill(
    COLORS.white
  );

  textAlign(
    CENTER,
    CENTER
  );

  textStyle(
    BOLD
  );

  textSize(
    18
  );

  text(
    "ENTER THE MAP",
    width / 2,
    745
  );


  fill(
    COLORS.textGrey
  );

  textStyle(
    NORMAL
  );

  textSize(
    13
  );

  text(
    "or press ENTER",
    width / 2,
    815
  );

}


// =====================================================
// DRAW CHARACTER IMAGE
// =====================================================

function drawCharacterImage(
  x,
  y,
  character,
  maxWidth,
  maxHeight
) {

  let img =
    characterImages[
      character.imageIndex
    ];


  if (!img) {
    return;
  }


  let sourceX =
    img.width *
    character.cropX;


  let sourceY =
    img.height *
    character.cropY;


  let sourceWidth =
    img.width *
    character.cropW;


  let sourceHeight =
    img.height *
    character.cropH;


  let ratio =
    sourceWidth /
    sourceHeight;


  let drawHeight =
    maxHeight;


  let drawWidth =
    drawHeight *
    ratio;


  if (
    drawWidth >
    maxWidth
  ) {

    drawWidth =
      maxWidth;


    drawHeight =
      drawWidth /
      ratio;

  }


  push();


  // SHADOW

  noStroke();

  fill(
    0,
    18
  );

  ellipse(
    x,
    y +
    drawHeight / 2 +
    4 +
    (
      character.shadowOffsetY ||
      0
    ),
    drawWidth * 0.75,
    14
  );


  // CHARACTER

  imageMode(
    CENTER
  );


  image(
    img,
    x,
    y,
    drawWidth,
    drawHeight,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight
  );


  pop();

}


// =====================================================
// CHARACTER SELECTION
// =====================================================

function selectPreviousCharacter() {

  selectedCharacter--;


  if (
    selectedCharacter < 0
  ) {

    selectedCharacter =
      characters.length - 1;

  }

}


function selectNextCharacter() {

  selectedCharacter++;


  if (
    selectedCharacter >=
    characters.length
  ) {

    selectedCharacter =
      0;

  }

}


// =====================================================
// MOUSE
// =====================================================

function mousePressed() {


  // ===================================================
  // STREETLIGHT GAME
  // ===================================================

  if (
    page === "lightGame"
  ) {

    if (
      mouseX > 180 &&
      mouseX < 420 &&
      mouseY > 765 &&
      mouseY < 830
    ) {

      exitStreetlightGame();

    }


    return;

  }


  // ===================================================
  // MAP
  // ===================================================

  if (
    page === "map"
  ) {

    return;

  }


  // ===================================================
  // LOGIN
  // ===================================================

  if (
    page !== "login"
  ) {

    return;

  }


  // CHARACTER

  hoverCharacter = characters.findIndex((_, i) =>
    mouseX > [150, 300, 450][i] - 65 &&
    mouseX < [150, 300, 450][i] + 65 &&
    mouseY > 365 && mouseY < 595
  );

  if (
    hoverCharacter !== -1
  ) {

    selectedCharacter =
      hoverCharacter;


    nameInput.elt.blur();

  }


  // ENTER

  if (
    mouseX > 125 &&
    mouseX < 475 &&
    mouseY > 710 &&
    mouseY < 780
  ) {

    enterMap();

  }


  // SKIP

  if (
    mouseX > 455 &&
    mouseX < 535 &&
    mouseY > 40 &&
    mouseY < 90
  ) {

    nameInput.value(
      "Guest"
    );


    enterMap();

  }

}


// =====================================================
// ENTER MAP
// =====================================================

let enteringMap = false;
let joinFeedback;
function showJoinFeedback(text) {
  if (!joinFeedback) {
    joinFeedback = document.createElement('div');
    joinFeedback.id = 'join-feedback';
    joinFeedback.setAttribute('role', 'status');
    document.body.appendChild(joinFeedback);
  }
  joinFeedback.textContent = text;
  joinFeedback.hidden = !text;
}

async function enterMap() {
  if (enteringMap || page !== 'login') return;
  enteringMap = true;
  const currentName = nameInput.value().trim() || 'Guest';
  const chosenCharacter = selectedCharacter;
  nameInput.value(currentName);
  const spawnX = mapWorldWidth * SPAWN_X;
  const spawnY = mapWorldHeight * SPAWN_Y;
  stopMovement();
  try {
    if (window.PUBLIC_MAP_CONFIG?.firebase) {
      showJoinFeedback('Connecting to shared map…');
      if (!window.mapNetwork) throw new Error('Connection code did not load. Please reload this page.');
      // Stay on the join screen until both write acknowledgement and shared read
      // succeed. Local drawing must not masquerade as multiplayer membership.
      window.mapNetwork.join(currentName, chosenCharacter, spawnX, spawnY).catch(error => showJoinFeedback(error.message));
      await window.mapNetwork.waitForJoined();
    }
    nameInput.value(currentName);
    selectedCharacter = chosenCharacter;
    playerX = spawnX;
    playerY = spawnY;
    page = 'map';
    fitCanvasToScreen();
    nameInput.hide();
    showJoinFeedback('');
    updateCamera();
  } catch (error) {
    showJoinFeedback(error.message);
  } finally {
    enteringMap = false;
  }
}


// =====================================================
// STOP MOVEMENT
// =====================================================

function stopMovement() {
  resetJoystick();

  keysDown.left = false;

  keysDown.right = false;

  keysDown.up = false;

  keysDown.down = false;

}


// =====================================================
// MAP PAGE
// =====================================================

function drawMapPage() {

  background(
    COLORS.grass
  );


  // ===================================================
  // MAP IMAGE
  // ===================================================

  if (mapImage) {

    imageMode(
      CORNER
    );


    image(
      mapImage,
      -cameraX,
      -cameraY,
      mapWorldWidth,
      mapWorldHeight
    );

  }


  // ===================================================
  // GAME INTERACTION POINT
  // ===================================================

  drawLightGameSpot();


  // ===================================================
  // PLAYER
  // ===================================================

  drawRemotePlayers();
  drawMapPlayer();
  const localSpeech = window.mapNetwork?.state.players[window.mapNetwork.ownKey]?.speech;
  drawSpeechBubble(playerX - cameraX, playerY - cameraY, localSpeech);


  // ===================================================
  // FIXED UI
  // ===================================================

  // Keep the existing header size while the phone's world view is enlarged.
  push();
  scale(width / 600);
  drawMapHeader();
  pop();

  // The fixed joystick supplies touch input; keyboard controls remain available.


  // ===================================================
  // INTERACTION PROMPT
  // ===================================================

  if (
    nearLightGame
  ) {

    push();
    const uiScale = width / 600;
    translate(width / 2, height - 900 * uiScale);
    scale(uiScale);
    translate(-width / 2, 0);
    drawLightGamePrompt();
    pop();

  }

}


// =====================================================
// MAP HEADER
// =====================================================

function drawMapHeader() {

  push();


  noStroke();


  fill(
    255,
    248
  );


  rect(
    20,
    20,
    560,
    76,
    18
  );


  fill(
    COLORS.navy
  );


  textAlign(
    LEFT
  );


  textStyle(
    BOLD
  );


  textSize(
    20
  );


  text(
    "SHARED CAMPUS MAP",
    42,
    52
  );


  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    13
  );


  text(
    "",
    42,
    76
  );


  pop();

}


// =====================================================
// MAP CONTROLS
// =====================================================

function drawMapControls() {

  // Hide this panel while interaction prompt is open.

  if (
    nearLightGame
  ) {

    return;

  }


  push();


  noStroke();


  fill(
    255,
    245
  );


  rect(
    145,
    790,
    310,
    75,
    22
  );


  fill(
    COLORS.navy
  );


  textAlign(
    CENTER
  );


  textStyle(
    BOLD
  );


  textSize(
    16
  );


  text(
    "EXPLORE THE MAP",
    width / 2,
    818
  );


  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    13
  );


  text(
    "↑   ↓   ←   →   Move",
    width / 2,
    844
  );


  pop();

}


// =====================================================
// MAP PLAYER
// =====================================================

function drawMapPlayer() {

  let nickname =
    nameInput.value();


  // WORLD -> SCREEN

  let screenX =
    playerX -
    cameraX;


  let screenY =
    playerY -
    cameraY;


  // NAME

  textAlign(
    CENTER
  );


  textStyle(
    BOLD
  );


  textSize(
    13
  );


  let labelWidth =
    textWidth(
      nickname
    ) +
    30;


  rectMode(
    CENTER
  );


  noStroke();


  fill(
    COLORS.navy
  );


  rect(
    screenX,
    screenY - 64,
    labelWidth,
    28,
    14
  );


  fill(
    COLORS.white
  );


  text(
    nickname,
    screenX,
    screenY - 60
  );


  rectMode(
    CORNER
  );


  // CHARACTER

  drawCharacterImage(
    screenX,
    screenY,
    characters[selectedCharacter],
    95,
    135
  );

}


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function movePlayer() {

  let dx =
    0;


  let dy =
    0;


  if (
    keysDown.left
  ) {

    dx -=
      playerSpeed;

  }


  if (
    keysDown.right
  ) {

    dx +=
      playerSpeed;

  }


  if (
    keysDown.up
  ) {

    dy -=
      playerSpeed;

  }


  if (
    keysDown.down
  ) {

    dy +=
      playerSpeed;

  }


  // Both keyboard and joystick use the same fixed movement speed.
  if (joystickInput.x || joystickInput.y) {
    dx = joystickInput.x * playerSpeed;
    dy = joystickInput.y * playerSpeed;
  } else {
    const length = Math.hypot(dx, dy);
    if (length) {
      dx = dx / length * playerSpeed;
      dy = dy / length * playerSpeed;
    }
  }

  const frameScale = Math.min(deltaTime, 50) / (1000 / 60);

  playerX +=
    dx * frameScale;


  playerY +=
    dy * frameScale;


  // MAP LIMITS

  playerX =
    constrain(
      playerX,
      45,
      mapWorldWidth - 45
    );


  playerY =
    constrain(
      playerY,
      80,
      mapWorldHeight - 60
    );

}


// =====================================================
// CAMERA
// =====================================================

function updateCamera() {

  cameraX =
    playerX -
    width / 2;


  cameraY =
    playerY -
    height / 2;


  let maxCameraX =
    max(
      0,
      mapWorldWidth -
      width
    );


  let maxCameraY =
    max(
      0,
      mapWorldHeight -
      height
    );


  cameraX =
    constrain(
      cameraX,
      0,
      maxCameraX
    );


  cameraY =
    constrain(
      cameraY,
      0,
      maxCameraY
    );

}


// =====================================================
// STREETLIGHT GAME SPOT
// =====================================================

function drawLightGameSpot() {

  if (
    !lightIcon
  ) {

    return;

  }


  // ===================================================
  // WORLD -> SCREEN
  // ===================================================

  let screenX =
    lightGameSpot.x -
    cameraX;


  let screenY =
    lightGameSpot.y -
    cameraY;


  // ===================================================
  // KEEP ORIGINAL IMAGE RATIO
  // ===================================================

  let iconWidth =
    lightGameSpot.width;


  let iconHeight =
    iconWidth *
    (
      lightIcon.height /
      lightIcon.width
    );


  // ===================================================
  // DON'T DRAW IF FAR OFFSCREEN
  // ===================================================

  if (
    screenX < -250 ||
    screenX > width + 250 ||
    screenY < -250 ||
    screenY > height + 250
  ) {

    return;

  }


  push();


  imageMode(
    CENTER
  );


  // ===================================================
  // PULSE
  // ===================================================

  lightPulse +=
    0.05;


  let pulse =
    sin(
      lightPulse
    );


  // ===================================================
  // GLOW WHEN NEAR
  // ===================================================

  if (
    nearLightGame
  ) {

    noStroke();


    fill(
      255,
      219,
      105,
      45
    );


    let glowWidth =
      iconWidth +
      40 +
      pulse * 8;


    let glowHeight =
      iconHeight +
      40 +
      pulse * 8;


    ellipse(
      screenX,
      screenY,
      glowWidth,
      glowHeight
    );

  }


  // ===================================================
  // ICON
  // ===================================================

  let displayWidth =
    iconWidth;


  let displayHeight =
    iconHeight;


  // Slight animation while keeping ratio.

  if (
    nearLightGame
  ) {

    let scaleAmount =
      1.03 +
      pulse * 0.01;


    displayWidth *=
      scaleAmount;


    displayHeight *=
      scaleAmount;

  }


  image(
    lightIcon,
    screenX,
    screenY,
    displayWidth,
    displayHeight
  );


  // ===================================================
  // SMALL ! MARKER
  // ===================================================

  if (
    !nearLightGame
  ) {

    let markerX =
      screenX +
      displayWidth *
      0.36;


    let markerY =
      screenY -
      displayHeight *
      0.36;


    fill(
      255
    );


    stroke(
      COLORS.navy
    );


    strokeWeight(
      3
    );


    ellipse(
      markerX,
      markerY,
      32,
      32
    );


    noStroke();


    fill(
      COLORS.navy
    );


    textAlign(
      CENTER,
      CENTER
    );


    textStyle(
      BOLD
    );


    textSize(
      15
    );


    text(
      "!",
      markerX,
      markerY - 1
    );

  }


  pop();

}


// =====================================================
// CHECK PLAYER DISTANCE TO STREETLIGHT
// =====================================================

function checkLightGameDistance() {

  let distanceToLight =
    dist(
      playerX,
      playerY,
      lightGameSpot.x,
      lightGameSpot.y
    );


  nearLightGame =
    distanceToLight <
    lightGameSpot.interactionRadius;

}


// =====================================================
// STREETLIGHT INTERACTION PROMPT
// =====================================================

function drawLightGamePrompt() {

  push();


  let boxWidth =
    390;


  let boxHeight =
    105;


  let boxX =
    width / 2 -
    boxWidth / 2;


  let boxY =
    745;


  // BOX

  noStroke();


  fill(
    255,
    252
  );


  rect(
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    22
  );


  // TITLE

  fill(
    COLORS.navy
  );


  textAlign(
    CENTER
  );


  textStyle(
    BOLD
  );


  textSize(
    17
  );


  text(
    "BROKEN STREETLIGHT",
    width / 2,
    boxY + 31
  );


  // DESCRIPTION

  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    13
  );


  text(
    "A two-player cooperative game",
    width / 2,
    boxY + 55
  );


  // E

  fill(
    COLORS.navy
  );


  textStyle(
    BOLD
  );


  textSize(
    14
  );


  text(
    "Press E to play",
    width / 2,
    boxY + 81
  );


  pop();

}


// =====================================================
// ENTER STREETLIGHT GAME
// =====================================================

function enterStreetlightGame() {

  stopMovement();


  page =
    "lightGame";

  fitCanvasToScreen();


  console.log(
    "Entered Streetlight Game"
  );

}


// =====================================================
// EXIT STREETLIGHT GAME
// =====================================================

function exitStreetlightGame() {

  stopMovement();


  page =
    "map";

  fitCanvasToScreen();


  updateCamera();


  console.log(
    "Returned to public map"
  );

}


// =====================================================
// STREETLIGHT GAME PAGE
// =====================================================

function drawStreetlightGame() {

  background(
    "#EEF2FF"
  );


  // ===================================================
  // TOP BAR
  // ===================================================

  noStroke();


  fill(
    255
  );


  rect(
    20,
    20,
    560,
    82,
    18
  );


  fill(
    COLORS.navy
  );


  textAlign(
    LEFT
  );


  textStyle(
    BOLD
  );


  textSize(
    21
  );


  text(
    "STREETLIGHT REPAIR",
    42,
    52
  );


  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    13
  );


  text(
    "Two-player cooperative game",
    42,
    77
  );


  // ===================================================
  // STREETLIGHT IMAGE
  // KEEP ORIGINAL RATIO
  // ===================================================

  if (
    lightIcon
  ) {

    let gameIconWidth =
      280;


    let gameIconHeight =
      gameIconWidth *
      (
        lightIcon.height /
        lightIcon.width
      );


    imageMode(
      CENTER
    );


    image(
      lightIcon,
      width / 2,
      330,
      gameIconWidth,
      gameIconHeight
    );

  }


  // ===================================================
  // WAITING PANEL
  // ===================================================

  noStroke();


  fill(
    255
  );


  rect(
    85,
    510,
    430,
    175,
    24
  );


  fill(
    COLORS.navy
  );


  textAlign(
    CENTER
  );


  textStyle(
    BOLD
  );


  textSize(
    21
  );


  text(
    "WAITING FOR A PARTNER",
    width / 2,
    555
  );


  // LOADING DOTS

  let dots =
    floor(
      frameCount /
      30
    ) %
    4;


  let loadingText =
    "";


  for (
    let i = 0;
    i < dots;
    i++
  ) {

    loadingText +=
      "• ";

  }


  fill(
    COLORS.purple
  );


  textSize(
    27
  );


  text(
    loadingText,
    width / 2,
    600
  );


  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    14
  );


  text(
    "Another player needs to join this game.",
    width / 2,
    638
  );


  // ===================================================
  // BACK BUTTON
  // ===================================================

  noStroke();


  fill(
    COLORS.navy
  );


  rect(
    180,
    765,
    240,
    65,
    18
  );


  fill(
    COLORS.white
  );


  textAlign(
    CENTER,
    CENTER
  );


  textStyle(
    BOLD
  );


  textSize(
    16
  );


  text(
    "BACK TO MAP",
    width / 2,
    797
  );


  fill(
    COLORS.textGrey
  );


  textStyle(
    NORMAL
  );


  textSize(
    12
  );


  text(
    "or press ESC",
    width / 2,
    855
  );

}

// Responsive presentation keeps the original 600 x 900 artwork coordinates.
function syncControlViewport() {
  const viewport = window.visualViewport;
  const width = viewport ? viewport.width : document.documentElement.clientWidth;
  const height = viewport ? viewport.height : document.documentElement.clientHeight;
  const left = viewport ? viewport.offsetLeft : 0;
  const top = viewport ? viewport.offsetTop : 0;
  document.documentElement.style.setProperty('--control-center', `${left + width / 2}px`);
  document.documentElement.style.setProperty('--visible-bottom', `${top + height}px`);
  document.documentElement.style.setProperty('--chat-height', `${Math.min(370, height * .82)}px`);
}

function fitCanvasToScreen() {
  syncControlViewport();
  if (displayMode) {
    const canvas = document.querySelector('canvas');
    if (canvas) { canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; }
    return;
  }
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const phoneMap = page === 'map' && viewportWidth <= 900;
  const canvas = document.querySelector('canvas');
  if (phoneMap) {
    // A narrower world viewport gives the requested 35% phone zoom.
    // Fill the phone viewport down behind the fixed joystick, with no bottom gap.
    const mapViewWidth = 600 / 1.35;
    const visibleHeight = Math.max(1, viewportHeight);
    const mapViewHeight = mapViewWidth * visibleHeight / viewportWidth;
    if (width !== mapViewWidth || Math.abs(height - mapViewHeight) > .5) {
      resizeCanvas(mapViewWidth, mapViewHeight);
    }
    if (canvas) {
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${visibleHeight}px`;
    }
    updateCamera();
    return;
  }
  if (width !== 600 || height !== 900) resizeCanvas(600, 900);
  const scale = Math.min(viewportWidth / 600, viewportHeight / 900);
  document.documentElement.style.setProperty('--game-scale', scale);
  if (canvas) {
    canvas.style.width = `${600 * scale}px`;
    canvas.style.height = `${900 * scale}px`;
  }
  if (nameInput) {
    nameInput.position(100 * scale, 230 * scale);
    nameInput.size(400 * scale, 62 * scale);
    nameInput.style('font-size', `${18 * scale}px`);
  }
}

function windowResized() {
  if (displayMode) resizeCanvas(windowWidth, windowHeight);
  fitCanvasToScreen();
}

// Temporary tuning defaults; independent of character size and camera zoom.
const JOYSTICK_SETTINGS = { deadZone: 0.15, thumbTravel: 0.32 };
const joystickInput = { x: 0, y: 0, pointerId: null };
let touchPanel;
let joystickThumb;
let lightAction;

function resetJoystick() {
  const pointerId = joystickInput.pointerId;
  joystickInput.x = 0;
  joystickInput.y = 0;
  joystickInput.pointerId = null;
  if (joystickThumb) joystickThumb.style.transform = 'translate(-50%, -50%)';
  if (touchPanel) touchPanel.classList.remove('is-dragging');
  if (touchPanel && pointerId !== null && touchPanel.hasPointerCapture(pointerId)) {
    touchPanel.releasePointerCapture(pointerId);
  }
}

function setupTouchControls() {
  touchPanel = document.createElement('button');
  touchPanel.type = 'button';
  touchPanel.id = 'movement-controls';
  touchPanel.setAttribute('aria-label', 'Drag joystick to move; arrow keys also supported');
  const directions = document.createElement('span');
  directions.className = 'joystick-directions';
  directions.setAttribute('aria-hidden', 'true');
  for (const direction of ['up', 'right', 'down', 'left']) {
    const marker = document.createElement('span');
    marker.className = `joystick-direction ${direction}`;
    directions.appendChild(marker);
  }
  joystickThumb = document.createElement('span');
  joystickThumb.className = 'joystick-thumb';
  joystickThumb.setAttribute('aria-hidden', 'true');
  touchPanel.append(directions, joystickThumb);

  const drag = (event) => {
    if (event.pointerId !== joystickInput.pointerId) return;
    event.preventDefault();
    const bounds = touchPanel.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy);
    const radius = bounds.width * JOYSTICK_SETTINGS.thumbTravel;
    const travel = Math.min(distance, radius);
    const nx = distance ? dx / distance : 0;
    const ny = distance ? dy / distance : 0;
    const active = distance > radius * JOYSTICK_SETTINGS.deadZone;
    joystickInput.x = active ? nx : 0;
    joystickInput.y = active ? ny : 0;
    joystickThumb.style.transform = `translate(calc(-50% + ${nx * travel}px), calc(-50% + ${ny * travel}px))`;
  };
  touchPanel.addEventListener('pointerdown', (event) => {
    if (page !== 'map' || joystickInput.pointerId !== null || event.button !== 0) return;
    touchPanel.classList.add('is-dragging');
    joystickInput.pointerId = event.pointerId;
    touchPanel.setPointerCapture(event.pointerId);
    drag(event);
  });
  touchPanel.addEventListener('pointermove', drag);
  const release = (event) => {
    if (event.pointerId === joystickInput.pointerId) resetJoystick();
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    touchPanel.addEventListener(type, release);
  }
  document.querySelector('main').appendChild(touchPanel);
  lightAction = document.createElement('button');
  lightAction.id = 'light-action';
  lightAction.textContent = 'Enter streetlight';
  lightAction.addEventListener('click', () => {
    if (page === 'map' && nearLightGame) enterStreetlightGame();
  });
  document.querySelector('main').appendChild(lightAction);
  const reset = () => stopMovement();
  window.addEventListener('blur', reset);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncControlViewport);
    window.visualViewport.addEventListener('scroll', syncControlViewport);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  fitCanvasToScreen();
  updateTouchControls();
}

function updateTouchControls() {
  if (touchPanel) touchPanel.hidden = page !== 'map';
  if (window.mapChat) window.mapChat.setVisible(page === 'map');
  if (page !== 'map' && joystickInput.pointerId !== null) resetJoystick();
  if (lightAction) lightAction.hidden = page !== 'map' || !nearLightGame;
}


const remotePositions = new Map();
function drawRemotePlayers() {
  const network = window.mapNetwork;
  if (!network) return;
  const players = network.state.players;
  for (const key of remotePositions.keys()) if (!players[key]) remotePositions.delete(key);
  for (const [key, player] of Object.entries(players)) {
    if (!displayMode && key === network.ownKey) continue;
    const position = remotePositions.get(key) || { x: player.x, y: player.y };
    const blend = 1 - Math.exp(-Math.min(deltaTime, 100) / 90);
    position.x += (player.x - position.x) * blend;
    position.y += (player.y - position.y) * blend;
    remotePositions.set(key, position);
    push();
    drawCharacterImage(position.x - cameraX, position.y - cameraY, characters[player.avatar], 95, 135);
    textAlign(CENTER);
    textSize(13);
    fill(COLORS.navy);
    text(String(player.nickname || 'Guest'), position.x - cameraX, position.y - cameraY - 50);
    drawSpeechBubble(position.x - cameraX, position.y - cameraY, player.speech);
    pop();
  }
}

function drawPublicDisplay() {
  background(COLORS.background);
  const fit = Math.min(width / mapWorldWidth, height / mapWorldHeight);
  push();
  translate((width - mapWorldWidth * fit) / 2, (height - mapWorldHeight * fit) / 2);
  scale(fit);
  imageMode(CORNER);
  image(mapImage, 0, 0, mapWorldWidth, mapWorldHeight);
  cameraX = 0;
  cameraY = 0;
  drawLightGameSpot();
  drawRemotePlayers();
  pop();
}


// Shared speech is short-lived; persistent chat history is intentionally not stored.
function drawSpeechBubble(x, y, speech) {
  if (!speech || typeof speech.text !== 'string' || !Number.isFinite(speech.sentAt)) return;
  const age = (window.mapNetwork?.now() || Date.now()) - speech.sentAt;
  if (age < -1000 || age >= 5000) return;
  push();
  textSize(15);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  const maxLineWidth = 190;
  const lines = [];
  let line = '';
  for (const character of speech.text.slice(0, 80)) {
    if (character === '\n' || textWidth(line + character) > maxLineWidth) {
      lines.push(line); line = character === '\n' ? '' : character;
    } else line += character;
  }
  lines.push(line);
  const bubbleWidth = Math.max(44, Math.min(maxLineWidth, Math.max(...lines.map(item => textWidth(item)))) + 24);
  const bubbleHeight = lines.length * 20 + 18;
  // Keep phone bubbles inside its camera viewport; on the display use world bounds.
  const left = constrain(x - bubbleWidth / 2, 4, Math.max(4, (displayMode ? mapWorldWidth : width) - bubbleWidth - 4));
  const top = Math.max(4, y - 88 - bubbleHeight);
  noStroke(); fill(255, 252, 245, 245);
  rectMode(CORNER); rect(left, top, bubbleWidth, bubbleHeight, 12);
  triangle(x - 5, top + bubbleHeight - 1, x + 5, top + bubbleHeight - 1, x, top + bubbleHeight + 7);
  fill(COLORS.navy);
  lines.forEach((item, index) => text(item, left + 12, top + 9 + index * 20));
  pop();
}
