// równanie fali 2D

const H = 128;
const L = 2 * H + 1;
let u = new Array(L); // u(t)
let u_next = new Array(L); // u(t)
let u_prev = new Array(L); // u(t)

let sourceShadow = new Array(L);

let img;
const SCALE = 2;
const A = 127;
const omega = 20;
let t = 0;
const steps_per_frame = 10;
const dt = 1 / 60 / steps_per_frame;
const v = 0.1; // prędkość fazowa
const dx = 1 / L;
const c2 = v * v * dt * dt / dx / dx;
const alpha = 0.5;

//source
const sLen = 30;
let sourceSliderX, sourceSliderY, sourceSliderAngle, sourceSpanX, sourceSpanY, sourceSpanAngle; 


function setup() {
  createCanvas(500, 500).parent("canvasContainer");
  createCanvas(L * SCALE, L * SCALE);

  createP("Source X:");
  sourceSliderX = createSlider(0, L, H, 1);
  sourceSpanX = createSpan(`\t${sourceSliderX.value()}`);

  createP("Source Y:");
  sourceSliderY = createSlider(0, L, H, 1);
  sourceSpanY = createSpan(`\t${sourceSliderY.value()}`);

  createP("Source angle:");
  sourceSliderAngle = createSlider(0, 180, 0, 1);
  sourceSpanAngle = createSpan(`\t${sourceSliderAngle.value()}`);

  angleMode(DEGREES);

  for (let i = 0; i < L; ++i) {
    u[i] = new Array(L);
    u_next[i] = new Array(L);
    u_prev[i] = new Array(L);
    sourceShadow[i] = new Array(L);
  }

  for (let x = 0; x < L; ++x)
    for (let y = 0; y < L; ++y) {
      u[x][y] = 0;
      u_next[x][y] = 0;
      u_prev[x][y] = 0;
      sourceShadow[x][y] = 0;
    }
}

function shouldUpdate(angle, x, y) {
  

}

function draw() {

  const d = 20;

  //update spans
  sourceSpanX.html(`\t${sourceSliderX.value()}`)
  sourceSpanY.html(`\t${sourceSliderY.value()}`)
  sourceSpanAngle.html(`\t${sourceSliderAngle.value()}`)

  for (let step = 0; step < steps_per_frame; ++step) {

    // source
    sourceMove(u, sourceSliderX.value(), sourceSliderX.value(), sourceSliderAngle.value())

    //update()
    t += dt;
  }
  img.loadPixels();
  for (let x = 0; x < L; ++x)
    for (let y = 0; y < L; ++y)
      img.set(x, y, 127 + u[x][y]);

  img.updatePixels();
  image(img, 0, 0, L * SCALE, L * SCALE);
}


function sourceMove(u, x, y, angle) {
  //TODO checks for safety
  for (let i = 0; i < sLen; ++i)
      u[x+floor(cos(angle)*i)][y-floor(sin(angle)*i)] = A
      //A * sin(omega * t * 57.2958)
  
  let xi,yi;
  for (let i = 0; i < L; ++i) {
      xi = x+floor(cos(270+angle)*i)
      yi = y-floor(sin(270+angle)*i)
      if ((0 < xi) && (xi < (L-1)) && (0 < yi) && (yi < (L-1)) ) {
        u[xi][yi] = A
      }
      xi = x+sLen+floor(cos(270+angle)*i)
      yi = y-floor(sin(270+angle)*i)
      if ((0 < xi) && (xi < (L-1)) && (0 < yi) && (yi < (L-1)) ) {
        u[xi][yi] = A
      }
  }
  
}


// równanie fali 2D

const H = 128;
const L = 2 * H + 1;
let u = new Array(L); // u(t)
let u_next = new Array(L); // u(t)
let u_prev = new Array(L); // u(t)

let sourceShadow = new Array(L);

let img;
const SCALE = 2;
const A = 127;
const omega = 20;
let t = 0;
const steps_per_frame = 10;
const dt = 1 / 60 / steps_per_frame;
const v = 0.1; // prędkość fazowa
const dx = 1 / L;
const c2 = v * v * dt * dt / dx / dx;
const alpha = 0.5;

//source
const sLen = 30;
let sourceSliderX, sourceSliderY, sourceSliderAngle, sourceSpanX, sourceSpanY, sourceSpanAngle; 


function setup() {
  createCanvas(L * SCALE, L * SCALE);
  img = createImage(L, L);

  createP("Source X:");
  sourceSliderX = createSlider(0, 500, H, 1);
  sourceSpanX = createSpan(`\t${sourceSliderX.value()}`);

  createP("Source Y:");
  sourceSliderY = createSlider(0, 500, H, 1);
  sourceSpanY = createSpan(`\t${sourceSliderY.value()}`);

  createP("Source angle:");
  sourceSliderAngle = createSlider(0, 180, 0, 1);
  sourceSpanAngle = createSpan(`\t${sourceSliderAngle.value()}`);

  angleMode(DEGREES);

  for (let i = 0; i < L; ++i) {
    u[i] = new Array(L);
    u_next[i] = new Array(L);
    u_prev[i] = new Array(L);
    sourceShadow[i] = new Array(L);
  }

  for (let x = 0; x < L; ++x)
    for (let y = 0; y < L; ++y) {
      u[x][y] = 0;
      u_next[x][y] = 0;
      u_prev[x][y] = 0;
      sourceShadow[x][y] = 0;
    }
}

function update() {
  let eps = 10; // do zmiany prędkości fali w ośrodku
  for (let x = 1; x < L - 1; ++x)
    for (let y = 1; y < L - 1; ++y) {
      if (y < H) eps = 2;
      else eps = 1;
      u_next[x][y] = 2 * u[x][y] - u_prev[x][y];
      u_next[x][y] += eps * c2 * (u[x + 1][y] - 2 * u[x][y] + u[x - 1][y]);
      u_next[x][y] += eps * c2 * (u[x][y + 1] - 2 * u[x][y] + u[x][y - 1]);
      u_next[x][y] -= alpha * dt * (u[x][y] - u_prev[x][y]);
    }

  // brzegi
  for (let x = 0; x < L; ++x) {
    u_next[x][0] = u_next[x][1];
    u_next[0][x] = u_next[1][x];
    u_next[x][L - 1] = u_next[x][L - 2];
    u_next[L - 1][x] = u_next[L - 2][x];
  }

  for (let x = 0; x < L; ++x) {
    u_prev[x] = u[x].slice();
    u[x] = u_next[x].slice();
  }
}

function shouldUpdate(angle, x, y) {
  

}

function draw() {
  const d = 20;


  for (let x = 0; x < L; ++x)
    for (let y = 0; y < L; ++y)
      u[x][y] = 0;

  //update spans
  sourceSpanX.html(`\t${sourceSliderX.value()}`)
  sourceSpanY.html(`\t${sourceSliderY.value()}`)
  sourceSpanAngle.html(`\t${sourceSliderAngle.value()}`)

  for (let step = 0; step < steps_per_frame; ++step) {

    // source
    sourceMove(u, sourceSliderX.value(), sourceSliderY.value(), sourceSliderAngle.value())

    //update()
    t += dt;
  }
  img.loadPixels();
  for (let x = 0; x < L; ++x)
    for (let y = 0; y < L; ++y)
      img.set(x, y, 127 + u[x][y]);

  img.updatePixels();
  image(img, 0, 0, L * SCALE, L * SCALE);
}


function sourceMove(u, x, y, angle) {
  //TODO chekchs for safty
  for (let i = 0; i < sLen; ++i)
      u[x+floor(cos(angle)*i)][y-floor(sin(angle)*i)] = A
      //A * sin(omega * t * 57.2958)
  
  let xi,yi;
  for (let i = 0; i < L; ++i) {
      xi = x+floor(cos(270+angle)*i)
      yi = y-floor(sin(270+angle)*i)
      if ((0 < xi) && (xi < (L-1)) && (0 < yi) && (yi < (L-1)) ) {
        u[xi][yi] = A
      }
      xi = x+sLen+floor(cos(270+angle)*i)
      yi = y-floor(sin(270+angle)*i)
      if ((0 < xi) && (xi < (L-1)) && (0 < yi) && (yi < (L-1)) ) {
        u[xi][yi] = A
      }
  }
  
}
