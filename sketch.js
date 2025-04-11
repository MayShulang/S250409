let font;

// Set the video capture as a global variable.
let capture;
let maskGraphic, maskedImg;
let selfieImg;
let leftX;
let overStartBtn = false;
let screenIndex = 1;

let n_fish = 33;
let fishes = [];
let scale_factor;
let minBlk = 5;

let imgs = [];
let startImg = 1;
let endImg = 33;
let mouseImg;

let gameChar_x, gameChar_y;
let gameChar_s = 30;
let cameraPosX, cameraPosY;
let gameGroundW, gameGroundH;
let gameWin = false, gameOver = false;
let gamePG;
let outImg;
let overSaveBtn = false;
let maxSelfieSize = 400;

let palette = ['#9e1628', '#623037', '#ff788e', '#ffffff', '#ffcccc', '#000000', '#4c9999'];

function preload() {
  font = loadFont('/assets/font/SuperPixel-m2L8j.ttf');

  for (let i = startImg; i <= endImg; i++) {
    imgs.push(loadImage('/assets/imgs/image (' + i + ').png'));
  }

  mouseImg = loadImage('/assets/imgs/mouse.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  imageMode(CENTER);

  mouseImg.resize(73, 98);
  noCursor();

  // Use the createCapture() function to access the device's
  // camera and start capturing video.
  capture = createCapture(VIDEO);
  capture.size(500, 500);

  // Use capture.hide() to remove the p5.Element object made
  // using createCapture(). The video will instead be rendered as
  // an image in draw().
  capture.hide();

  // create a mask shape
  maskGraphic = createGraphics(capture.width, capture.height);
  maskGraphic.noStroke();
  maskGraphic.fill('#DDDDDD');
  maskGraphic.rect(0, 0, capture.width, capture.height, capture.height / 20);

  gameChar_x = width / 2;
  gameChar_y = height / 2;
  cameraPosX = 0;
  cameraPosY = 0;

  gameGroundW = 2 * width;
  gameGroundH = 2 * height;
}

function draw() {
  background('#e9e9e9');

  if (screenIndex == 1) {
    showSelfieScreen();
  } else if (screenIndex == 2) {
    gameChar_x = lerp(gameChar_x, mouseX, 0.02);
    gameChar_y = lerp(gameChar_y, mouseY, 0.02);

    push();
    // image(selfieImg, gameChar_x, gameChar_y);
    fishes[0].pos.x = gameChar_x;
    fishes[0].pos.y = gameChar_y;
    fishes[0].render();

    translate(-cameraPosX, -cameraPosY);
    fishes[0].pos.x = gameChar_x + cameraPosX;
    fishes[0].pos.y = gameChar_y + cameraPosY;

    for (let i = 1; i < fishes.length; i++) {
      fishes[i].randomTrack(i);
      fishes[i].render();
    }
    pop();

    cameraPosX = -width / 2 + gameChar_x;
    cameraPosY = -height / 2 + gameChar_y;
    gameChar_s = fishes[0].fishSize;
    bigFishEatSmallFish();

    if (gameChar_s > fishes[0].fishSize) {
      gamePG = get();
      gameOver = true;
      screenIndex = 3;
    }

    if (fishes[0].fishSize > maxSelfieSize) {
      gamePG = get();
      gameWin = true;
      screenIndex = 3;

      outImg = fishes[0].img;
    }
  } else if (screenIndex == 3) {
    image(gamePG, width / 2, height / 2);
    if (gameOver) {
      showLoseScreen();
    }

    if (gameWin) {
      showWinScreen();
    }
  } else if (screenIndex == 4) {
    showPrintScreen();
  }

  image(mouseImg, mouseX + 10, mouseY + 40);
}

function showSelfieScreen() {
  let ts = 56;
  textSize(ts);

  let str = "START";
  let sw = textWidth(str);
  let gap = 30;
  leftX = (width - capture.width - sw - gap) / 2;

  // apply a mask to the image
  maskedImg = capture.get();
  maskedImg.mask(maskGraphic);
  image(maskGraphic, leftX + capture.width / 2, height / 2);
  image(maskedImg, leftX + capture.width / 2, height / 2);

  // start button
  push();
  if (overRect(leftX + capture.width + gap, height / 2 - ts / 2, sw, ts)) {
    drawingContext.shadowColor = color('#ecff0f');
    drawingContext.shadowBlur = 15;
    overStartBtn = true;
  } else {
    overStartBtn = false;
  }

  stroke('#ecff0f');
  strokeWeight(15);
  fill('#666666');
  textAlign(LEFT, CENTER);
  text(str, leftX + capture.width + gap, height / 2);
  pop();
}

function showWinScreen() {
  let str = "Congratulations! Become the biggest capitalist!";

  push();
  textSize(36);
  stroke('#ecff0f');
  strokeWeight(10);
  fill('#666666');
  textAlign(CENTER, CENTER);
  text(str, width / 2, height / 2);
  pop();
}

function showLoseScreen() {
  let str = "GAME OVER!";

  push();
  textSize(72);
  stroke('#ecff0f');
  strokeWeight(10);
  fill('#666666');
  textAlign(CENTER, CENTER);
  text(str, width / 2, height / 2);
  pop();
}

function showPrintScreen() {
  let ts = 56;
  textSize(ts);

  let str = "SAVE";
  let sw = textWidth(str);
  let gap = 30;
  leftX = (width - outImg.width - sw - gap) / 2;

  // apply a mask to the image
  maskedImg = outImg.get();
  // maskedImg.mask(maskGraphic);
  // image(maskGraphic, leftX + capture.width / 2, height / 2);
  image(maskedImg, leftX + maskedImg.width / 2, height / 2);

  // save button
  push();
  if (overRect(leftX + maskedImg.width + gap, height / 2 - ts / 2, sw, ts)) {
    drawingContext.shadowColor = color('#ecff0f');
    drawingContext.shadowBlur = 15;
    overSaveBtn = true;
  } else {
    overSaveBtn = false;
  }

  stroke('#ecff0f');
  strokeWeight(15);
  fill('#666666');
  textAlign(LEFT, CENTER);
  text(str, leftX + maskedImg.width + gap, height / 2);
  pop();
}

function getSelfieImg() {
  selfieImg = capture.get();

  scale_factor = min(width, height) / 1440;

  let gf = new Fish(0, selfieImg);
  gf.pos.x = gameChar_x;
  gf.pos.y = gameChar_y;
  gf.fishSize = gameChar_s;
  // gf.updateImg();
  fishes.push(gf);
  updateSelfie();

  for (let i = 0; i < imgs.length; i++) {
    let nf = new Fish(i, imgs[i]);
    fishes.push(nf);
  }
}

function overRect(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function mouseClicked() {
  if (screenIndex == 1 && overStartBtn) {
    getSelfieImg();
    screenIndex = 2;
  }

  if (screenIndex == 3) {
    screenIndex = 4;
  }

  if (screenIndex == 4 && overSaveBtn) {
    outImg.save();
  }
}

function quantize(value, steps) {
  return int(value / (256 / steps)) * (256 / steps);
}

function getNearestColor(r, g, b) {
  let closest = palette[0];
  let minDist = 999999;
  for (let i = 0; i < palette.length; i++) {
    let pr = red(palette[i]);
    let pg = green(palette[i]);
    let pb = blue(palette[i]);
    let d = dist(r, g, b, pr, pg, pb);
    if (d < minDist) {
      minDist = d;
      closest = palette[i];
    }
  }
  return color(closest);
}

function bigFishEatSmallFish() {
  // collision detection
  for (let i = fishes.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (i >= fishes.length || j >= fishes.length) continue;

      let fishA = fishes[i];
      let fishB = fishes[j];

      // distance squared detection
      let dx = fishA.pos.x - fishB.pos.x;
      let dy = fishA.pos.y - fishB.pos.y;
      let distSq = dx * dx + dy * dy;
      let radiusSum = (fishA.fishSize + fishB.fishSize) / 2;

      if (distSq < radiusSum * radiusSum) {
        // there is a collision and the larger fish eats the smaller fish
        if (fishA.fishSize > fishB.fishSize) {
          if (fishA.fishSize < maxSelfieSize) {
            fishA.fishSize += fishB.fishSize * 0.2;
          }
          if (i != 0) {
            fishA.updateImg();
          } else {
            updateSelfie();
          }
          fishB.reset(j);
        } else {
          if (fishB.fishSize < maxSelfieSize) {
            fishB.fishSize += fishA.fishSize * 0.2;
          }
          if (j != 0) {
            fishB.updateImg();
          } else {
            updateSelfie();
          }
          fishA.reset(i);
        }
        break;
      }
    }
  }
}

function updateSelfie() {
  let baseImg = selfieImg.get();
  baseImg.resize(fishes[0].fishSize, fishes[0].fishSize);
  fishes[0].img = createGraphics(baseImg.width, baseImg.height);
  fishes[0].img.noStroke();

  for (let y = 0; y < baseImg.height; y += minBlk) {
    for (let x = 0; x < baseImg.width; x += minBlk) {
      let col = baseImg.get(x, y);
      let newCol = getNearestColor(red(col), green(col), blue(col));
      // let r = quantize(red(col), 4);
      // let g = quantize(green(col), 4);
      // let b = quantize(blue(col), 4);

      // fishes[0].img.fill(r, g, b);
      fishes[0].img.fill(newCol);
      fishes[0].img.rect(x, y, minBlk, minBlk);
    }
  }
}

class Fish {
  constructor(i, mg) {
    this.srcImg = mg;
    this.reset(i);
  }

  reset(i) {
    let sizes = [16, 50];
    let spaces = [50, 42];
    let new_sizes = sizes.map(function (x) { return x * Math.max(scale_factor - 0.5 * noise(i), 0.3); });
    let new_spaces = spaces.map(function (x) { return x * Math.max(scale_factor - 0.5 * noise(0, i), 0.3) });
    this.sizes = new_sizes;
    this.spaces = new_spaces;
    this.fishSize = floor(random(1, 20)) * minBlk;
    this.pos = createVector(random(gameGroundW), random(gameGroundH));

    this.updateImg();
    this.constructLinks(this.pos.copy(), new_sizes, new_spaces);
  }

  constructLinks(head, sizes, spaces) {
    this.n_links = sizes.length;
    this.links = [];
    this.links[0] = { size: sizes[0], space: 0, pos: head };

    for (let i = 1; i < this.n_links; i++) {
      const p0 = this.links[i - 1].pos;
      const p1 = createVector(0, spaces[i]);
      const p2 = p5.Vector.add(p0, p1);
      this.links.push({ size: sizes[i], space: spaces[i], pos: p2 });
    }
  }

  randomTrack(i) {
    const d = p5.Vector.sub(this.links[0].pos, this.links[1].pos);
    const p = p5.Vector.add(d.setMag(10 * d.mag() * (0.03 + noise(frameCount / 300, i))).rotate(noise(frameCount / 150, i) - 0.5), this.links[0].pos);
    this.track(p, 0.04);
    this.pos.x = this.links[0].pos.x;
    this.pos.y = this.links[0].pos.y;
  }

  track(pos, f) {
    const DIST_THRESHOLD = 30 * scale_factor;
    const ANGLE_THRESHOLD = PI / 7;
    const d = p5.Vector.sub(pos, this.links[0].pos);
    d.setMag(Math.max(d.mag() - DIST_THRESHOLD, 0) * f);

    // This assumes there's at least two links in the chain
    const a = p5.Vector.sub(this.links[0].pos, this.links[1].pos);
    if (d.angleBetween(a) > ANGLE_THRESHOLD) {
      d.setHeading(a.heading() - ANGLE_THRESHOLD);
    }
    else if (d.angleBetween(a) < -ANGLE_THRESHOLD) {
      d.setHeading(a.heading() + ANGLE_THRESHOLD);
    }
    this.links[0].pos.add(d);
    this.constrain();
  }

  updateImg() {
    let baseImg = this.srcImg.get();
    baseImg.resize(this.fishSize, this.fishSize);
    this.img = createGraphics(baseImg.width, baseImg.height);
    this.img.noStroke();

    for (let y = 0; y < baseImg.height; y += minBlk) {
      for (let x = 0; x < baseImg.width; x += minBlk) {
        this.img.fill(baseImg.get(x, y));
        this.img.rect(x, y, minBlk, minBlk);
      }
    }
  }

  render() {
    push();
    translate(this.pos.x, this.pos.y);
    image(this.img, 0, 0);
    pop();
  }

  constrain() {
    this.wrap();

    for (let i = 1; i < this.n_links; i++) {
      const d = p5.Vector.sub(this.links[i].pos, this.links[i - 1].pos);
      d.setMag(this.links[i].space);
      this.links[i].pos = p5.Vector.add(this.links[i - 1].pos, d);
    }
  }

  wrap() {
    if (this.links[0].pos.x > gameGroundW * 1.3) {
      this.links.forEach((link) => {
        link.pos.x -= gameGroundW * 1.3;
      });
    }
    else if (this.links[0].pos.x < -gameGroundW * 0.3) {
      this.links.forEach((link) => {
        link.pos.x += gameGroundW * 1.3;
      });
    }
    if (this.links[0].pos.y > gameGroundH * 1.3) {
      this.links.forEach((link) => {
        link.pos.y -= gameGroundH * 1.3;
      });
    }
    else if (this.links[0].pos.y < -gameGroundH * 0.3) {
      this.links.forEach((link) => {
        link.pos.y += gameGroundH * 1.3;
      });
    }
  }
}