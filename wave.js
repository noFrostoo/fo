// DANIEL LIPNIACKI (INDEX: 304067)


const S = 257;
const L = 15;

const lightLen = 800;

let img_pixels = new Array(S);
let img;
let pg;


// fizyka
let u = new Array(L); // u(t)
let u_next = new Array(L); // u(t)
let u_prev = new Array(L); // u(t)

let u2 = new Array(L); // u(t)
let u_next2 = new Array(L); // u(t)
let u_prev2 = new Array(L); // u(t)

let SCALE = 2;
let A = 127;
let omega = 600;
let t = 0;
let steps_per_frame = 10;
let dt = 1 / 60 / steps_per_frame;
let v = 0.07; // prędkość fazowa
let dx = 1 / 200;
let c2 = v * v * dt * dt / dx / dx;
let alpha = 0.1;
let eps = 1.003; // do zmiany prędkości fali w ośrodku


let sourceSliderX, sourceSliderY, sourceSliderAngle, sourceSpanX, sourceSpanY, sourceSpanAngle; 
const sLen = 15;
let source;
let yR = 0;
let moveSize = 30;
let sourceX = 100;
let sourceY = 100;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;
let sourceAngle = 90;

let incitedAngle = 0;
let reflectionAngle = 0;
let totalReflection = false;
let totalReflectionP;
let loss = 0;

let waveCheckbox;
let wave = false;

let rect;

let n1 = 1.003
let n2 = 3

let line = [[0,128],[S,128]]

class Light {
  constructor(
    x,y, len, angle
  ) {
    this.x = x;
    this.y = y;
    this.len = len
    this.angle = angle;
  }
  move(x,y,angle){
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  modify(x,y,angle,Len) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.len = Len
  }

  draw() {
    let xs, ys, xl, yl, first, last;
    let angle = this.angle;
    let angle2 = this.angle;
    let angle3 = this.angle;
    first = [];
    last = [];

    for (let i = 0; i < this.Len; ++i) {
      xs = this.x+floor(cos(angle)*i);
      ys = this.y-floor(sin(angle)*i)
      if ((0 < xs) && (xs < (S-1)) && (0 < ys) && (ys < (S-1)) ) {
        img_pixels[xs][ys] = [0,80,0, 255]
      }
    }

    let xi,yi, xi2, yi2;
      for (let i = 0; i < this.len; ++i) {
        angle = this.angle;
        angle2 = this.angle;
        angle3 = this.angle;
        let base = 0
        let ox = 0;
        let oy = 0;
        let overlap = false;
        for(let j = 0; j < lightLen; ++j) {

          xl = this.x-floor(sin(270+angle)*i)
          yl = this.y-floor(cos(270+angle)*i)
          if(overlap) {
            xi = ox+floor(round(cos(angle2),10)*(j-base))
            yi = oy+floor(round(sin(angle2),10)*(j-base))
            xi2 = ox+floor(round(cos(-angle3),10)*(j-base))
            yi2 = oy+floor(round(sin(-angle3),10)*(j-base))
          } else {
            xi = xl+floor(cos(270+angle)*j)
            yi = yl-floor(sin(270+angle)*j)
          }
          if(this.checkOverlap([[xl,yl],[xi,yi]]) && !overlap ) {
            yR = j
            let [a, a2] = this.calculateAngle([[xl,yl],[xi,yi]], line)
            angle2 = 90-a
            angle3 = 90 - a2
            incitedAngle = 90 - a2;
            reflectionAngle = 90-a;
            overlap = true
            ox = xi
            oy = yi
            base = round(Math.sqrt( Math.pow(xi - xl,2) + pow(yi - yl,2) ))
            if(first.length == 0) {
              first = [xi, yi]
            } else{
              last = [xi, yi]
            }
          } 
          if (angle2 != 0 && (0 < xi) && (xi < (S-1)) && (0 < yi) && (yi < (S-1)) ) {
            let v = [255,255,0,255]
            if(wave) 
              v = [127+u[i][j],127+u[i][j],127+u[i][j],255]
            img_pixels[xi][yi] = v
            if(i!=0 || i!= this.len -1)
            {
              img_pixels[xi-1][yi] = v
              img_pixels[xi+1][yi] = v
            }
          } else if (overlap && incitedAngle == 0) {
            xi = xl+floor(cos(270+angle)*j)
            yi = yl-floor(sin(270+angle)*j)
            if ((0 < xi) && (xi < (S-1)) && (0 < yi) && (yi < (S-1)))
              img_pixels[xi][yi] = [255,255,0,255]
          }

          if (angle2 != 0 && overlap && (0 < xi2) && (xi2 < (S-1)) && (0 < yi2) && (yi2 < (S-1)) ) {
            let v = [250,250,210,255]
            if(wave) 
              v = [127+u2[i][j],127+u2[i][j],127+u2[i][j],255]
            img_pixels[xi2][yi2] = v
            if(i!=0 || i!= this.len -1)
            {
              img_pixels[xi2-1][yi2] = v
              img_pixels[xi2+1][yi2] = v
            } 
          }
        }
      }

      if(last.length != 0 && first.length != 0) {
        pg.drawingContext.setLineDash([5, 10, 30, 10]);
        let xm = (last[0]*SCALE+first[0]*SCALE) / 2 
        let ym = (last[1]*SCALE+first[1]*SCALE) / 2
        pg.line(xm, ym+70, xm, ym-70)
      }
  }

  checkOverlap(points) {
    let r = lineclip(points, [...line[0],...line[1]]).length
    return r != 0
  }

  calculateAngle(points, plane) {
    let vn1 = createVector(points[1][0] - points[0][0], points[1][1] - points[0][1]).normalize();
    let vn2 = createVector(plane[1][0] - plane[0][0], plane[1][1] - plane[0][1]).normalize();
    let sin = round(vn1.dot(vn2),5);
    let sin2 = (sin * n1) / n2;
    if(sin2 > 1) {
      totalReflection = true
    } else {
      totalReflection = false
    }
    return [round(asin(sin2)+2, 2), round(asin(sin)+2, 2)] ;
  }

}

function setup() {
  createCanvas(SCALE*S, SCALE*S).parent("canvasContainer");
  img = createImage(S, S);
  pg = createGraphics(SCALE*S, SCALE*S);

  createP("Medium 1:").parent("leftPanel");
  sourceSliderX = createSlider(0, 3, 1.003, 0).parent("leftPanel");
  sourceSpanX = createSpan(`\t${sourceSliderX.value()}`).parent("leftPanel");

  createP("Medium 2:").parent("rightPanel");
  sourceSliderY = createSlider(0, 3, 2.003, 0).parent("rightPanel");
  sourceSpanY = createSpan(`\t${sourceSliderY.value()}`).parent("rightPanel");

  createP("Source angle:").parent("leftPanel");
  sourceSliderAngle = createSlider(0, 180, sourceAngle, 1).parent("leftPanel");
  sourceSpanAngle = createSpan(`\t${sourceSliderAngle.value()}`).parent("leftPanel");

  createP("Show wave: ").parent("rightPanel");
  waveCheckbox = createCheckbox("Wave", wave).parent("rightPanel");

  totalReflectionP = createP(`Not total reflection. <br/> Incite angle ${incitedAngle} <br/> Reflection angle ${reflectionAngle} <br/>`).parent("infobox");

  ellipseMode(CORNERS)

  angleMode(DEGREES);

  for(let i = 0; i<S; ++i) {
    img_pixels[i] = new Array(S);
  }

  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y) {
      img_pixels[x][y] = 0;
    }
  
  for (let i = 0; i < L; ++i) {
    u[i] = new Array(lightLen);
    u_next[i] = new Array(lightLen);
    u_prev[i] = new Array(lightLen);
    u2[i] = new Array(lightLen);
    u_next2[i] = new Array(lightLen);
    u_prev2[i] = new Array(lightLen);
  }

  for (let x = 0; x < L; ++x)
    for (let y = 0; y < lightLen; ++y) {
      u[x][y] = 0;
      u_next[x][y] = 0;
      u_prev[x][y] = 0;
      u2[x][y] = 0;
      u_next2[x][y] = 0;
      u_prev2[x][y] = 0;
    }
  
    

  source = new Light(sourceX, sourceY, sLen, sourceSliderAngle.value()) 
}

function update() {
  for(let i = 0; i < L; ++i){
    u_next[i][0] = A * sin(omega * t);
    u_next2[i][0] = A * sin(omega * t);
  }

  for (let x = 1; x < L - 1; ++x)
    for (let y = 1; y < lightLen - 1; ++y) {
      if(yR != 0 && yR < y){
        eps = n2;
      } else {
        eps = n1;
      }
      u_next[x][y] = 2 * u[x][y] - u_prev[x][y];
      u_next[x][y] += eps * c2 * (u[x + 1][y] - 2 * u[x][y] + u[x - 1][y]);
      u_next[x][y] += eps * c2 * (u[x][y + 1] - 2 * u[x][y] + u[x][y - 1]);
      u_next[x][y] -= alpha * dt * (u[x][y] - u_prev[x][y]);
      u_next2[x][y] = 2 * u2[x][y] - u_prev2[x][y];
      u_next2[x][y] += n1 * c2 * (u2[x + 1][y] - 2 * u2[x][y] + u2[x - 1][y]);
      u_next2[x][y] += n1 * c2 * (u2[x][y + 1] - 2 * u2[x][y] + u2[x][y - 1]);
      u_next2[x][y] -= alpha * dt * (u2[x][y] - u_prev2[x][y]);
    }

  
  for (let x = 0; x < L; ++x) {
    u_prev[x] = u[x].slice();
    u[x] = u_next[x].slice();
    u_prev2[x] = u2[x].slice();
    u2[x] = u_next2[x].slice();
  }

}

function draw() {
  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y) {
      if(y<line[0][1])
        img_pixels[x][y] = [220,220,220,255];
      else
        img_pixels[x][y] = [135,206,235,255];
    }
  
  pg.clear()

  //update spans
  sourceSpanX.html(`\t${sourceSliderX.value()}`)
  sourceSpanY.html(`\t${sourceSliderY.value()}`)
  sourceSpanAngle.html(`\t${sourceSliderAngle.value()}`)

  if(totalReflection) {
    totalReflectionP.html(` total reflection. \n 
    Incite angle ${incitedAngle} \n 
    Reflection angle ${reflectionAngle} \n
    Reflection Loss ${loss}
    
    Reflected Light Intensity ${loss}
    Passed Light Intensity ${100-loss}`);
  } else {
    totalReflectionP.html(`No total reflection. \n 
    Incite angle ${incitedAngle} \n 
    Reflection angle ${reflectionAngle} \n
    Reflection Loss ${loss}
    Reflected Light Intensity ${loss}
    Passed Light Intensity ${100-loss}
    `);
  }

  n1 = sourceSliderX.value();
  n2 = sourceSliderY.value()
  wave = waveCheckbox.checked();

  for (let step = 0; step < steps_per_frame; ++step) {
    update()
    t += dt;
  }

  source.draw();
  source.move(sourceX, sourceY, sourceSliderAngle.value())

  loss = calculateReflectionLoss();
  if(loss == NaN)
    loss = 0

  img.loadPixels();
  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y)
      img.set(x, y, img_pixels[x][y]);
  img.updatePixels();

  image(img, 0, 0, SCALE*S, SCALE*S);
  image(pg, 0, 0);
  image(pg, 0, S*SCALE);
}

function mouseDragged() {
  if (locked) {
    sourceX = mouseX - xOffset
    sourceY = mouseY - yOffset
    source.move(mouseX - xOffset, mouseY - yOffset, sourceSliderAngle.value())
  }
}

function mouseReleased() {
  locked = false
}

function mousePressed() {
  if (
    mouseX > sourceX * SCALE- moveSize &&
    mouseX < sourceX * SCALE + moveSize &&
    mouseY > sourceY * SCALE - moveSize &&
    mouseY < sourceY * SCALE + moveSize
  ) {
    locked = true
  }
  xOffset = mouseX - source.x;
  yOffset = mouseY - source.y;
}


function calculateReflectionLoss() {
  rs = Math.pow(sin(incitedAngle-reflectionAngle)/sin(incitedAngle+reflectionAngle),2)
  rp = Math.pow(tan(incitedAngle-reflectionAngle)/tan(incitedAngle+reflectionAngle),2)
  r = (rs + rp) / 2
  return r*100; 
}

