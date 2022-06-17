// równanie fali 2D


const S = 257;
const L = 15;

let img_pixels = new Array(S);

let u = new Array(L); // u(t)
let u_next = new Array(L); // u(t)
let u_prev = new Array(L); // u(t)

let sourceShadow = new Array(L);

let img;
let pg;

const SCALE = 2;
const A = 255;
const omega = 300;
let t = 0;
const steps_per_frame = 1;
const dt = 1 / 60 / steps_per_frame;
const v = 0.1; // prędkość fazowa
const dx = 1 / S;
const c2 = v * v * dt * dt / dx / dx;
const alpha = 0.5;
let eps = 2; // do zmiany prędkości fali w ośrodku
//source
const sLen = 15;
let sourceSliderX, sourceSliderY, sourceSliderAngle, sourceSpanX, sourceSpanY, sourceSpanAngle; 

let source;
let rect;

let n1 = 1.003
let n2 = 1.5

let line = [[0,128],[S,128]]

let dP, dp2, dp3; //debug spans

class Light {
  constructor(
    x,y, len, angle, index
  ) {
    this.x = x;
    this.y = y;
    this.len = len
    this.angle = angle;
    this.endLen = 0;
    this.index = index;
    this.angle2 = 0;
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
    let xs, ys, xl, yl;
    let angle = this.angle;
    let angle2 = this.angle;

    for (let i = 0; i < this.Len; ++i) {
      xs = this.x+floor(cos(angle)*i);
      ys = this.y-floor(sin(angle)*i)
      if ((0 < xs) && (xs < (S-1)) && (0 < ys) && (ys < (S-1)) ) {
        img_pixels[xs][ys] = [0,80,0, 255]
      }
    }

    let xi,yi;
    // for (let i = 0; i <S; ++i) {
    //     xs = this.x+floor(cos(270+angle)*i)
    //     ys = this.y-floor(sin(270+angle)*i)
    //     if ((0 < xs) && (xs < (S-1)) && (0 < ys) && (ys < (S-1)) && !this.checkOverlap([[this.x,this.y],[xs,ys]]) ) {
    //       img_pixels[xs][ys] = A
    //     }

    //     xl = this.x-floor(sin(270+angle)*this.len)
    //     yl = this.y-floor(cos(270+angle)*this.len)
    //     xi = xl+floor(cos(270+angle)*i)
    //     yi = yl-floor(sin(270+angle)*i)
    //     if (((0 < xi) && (xi < (S-1)) && (0 < yi) && (yi < (S-1)) && !this.checkOverlap([[xl,yl],[xi,yi]]) )) {
    //       img_pixels[xi][yi] = A
    //     }
    //   }

      for (let i = 0; i < this.len; ++i) {
        angle = this.angle;
        angle2 = this.angle
        let base = 0
        let ox = 0;
        let oy = 0;
        let overlap = false;
        for(let j = 0; j < S; ++j) {
          xl = this.x-floor(sin(270+angle)*i)
          yl = this.y-floor(cos(270+angle)*i)
          if(overlap) {
            xi = ox+floor(round(cos(angle2),10)*(j-base))
            yi = oy+floor(round(sin(angle2),10)*(j-base))
            dP3.html(`\t${xl+floor(cos(270+angle)*j)} | ${yl-floor(sin(270+angle)*(j))} | ${xi} | ${yi}`)
          } else {
            xi = xl+floor(cos(270+angle)*j)
            yi = yl-floor(sin(270+angle)*j)
          }
          dP.html(`\t${xl} ${yl} ${i} ${j} ${angle} ${angle2}`)
          dP2.html(`\t${xi} ${yi} ${i} ${j} ${base} ${ox} ${oy}`)
          if(this.checkOverlap([[xl,yl],[xi,yi]]) && !overlap ) {
            let a = this.calculateAngle([[xl,yl],[xi,yi]], line)
            angle2 = 90-a
            overlap = true
            ox = xi
            oy = yi
            base = round(Math.sqrt( Math.pow(xi - xl,2) + pow(yi - yl,2) ))
          }
          if ((0 < xi) && (xi < (S-1)) && (0 < yi) && (yi < (S-1)) ) {
            img_pixels[xi][yi] = u[i][j]
            if(i!=0 || i!= this.len -1)
            {
              img_pixels[xi-1][yi] = u[i][j]
              img_pixels[xi+1][yi] = u[i][j]
            }
          }
        }
      }

  }


  checkOverlap(points) {
    let r = lineclip(points, [...line[0],...line[1]]).length
    return r != 0
  }

  calculateAngle(points, plane) {
    let angleAdd = 1;
    let vn1 = createVector(points[1][0] - points[0][0], points[1][1] - points[0][1]).normalize();
    let vn2 = createVector(plane[1][0] - plane[0][0], plane[1][1] - plane[0][1]).normalize();
    let d = round(vn1.dot(vn2),3);
    let sin = round(sqrt(1 - d*d),3);
    let sin2 = (sin * n1) / n2;
    let a = angleAdd *  round(asin(sin2))
    return a;
  }

}


class Rect {
  constructor(
    points
  ) {
    this.points = points;
  }
  move(x,y,angle){
  }
  draw() {
      pg.color(255,255,255);
      pg.stroke(255, 40, 40);
      pg.line(this.points[0][0],this.points[0][1],this.points[1][0],this.points[1][1]);
      pg.line(this.points[1][0],this.points[1][1],this.points[2][0],this.points[2][1]);
      pg.line(this.points[2][0],this.points[2][1],this.points[3][0],this.points[3][1]);
      pg.line(this.points[3][0],this.points[3][1],this.points[0][0],this.points[0][1]);
  }

}


function setup() {
  createCanvas(SCALE*S, SCALE*S);
  img = createImage(S, S);
  pg = createGraphics(SCALE*S, SCALE*S);

  createP("Source X:");
  sourceSliderX = createSlider(0, 500, 100, 1);
  sourceSpanX = createSpan(`\t${sourceSliderX.value()}`);

  createP("Source Y:");
  sourceSliderY = createSlider(0, 500, 100, 1);
  sourceSpanY = createSpan(`\t${sourceSliderY.value()}`);

  createP("Source angle:");
  sourceSliderAngle = createSlider(0, 180, 90, 1);
  sourceSpanAngle = createSpan(`\t${sourceSliderAngle.value()}`);

  createP("Debug:")
  dP = createSpan(`\tdebug`);
  createP("Debug2:")
  dP2 = createSpan(`\tdebug`);
  createP("Debug2:")
  dP3 = createSpan(`\tdebug`);

  angleMode(DEGREES);

  for(let i = 0; i<S; ++i) {
    img_pixels[i] = new Array(S);
  }

  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y) {
      img_pixels[x][y] = 0;
    }
  
  for (let i = 0; i < L; ++i) {
    u[i] = new Array(S);
    u_next[i] = new Array(S);
    u_prev[i] = new Array(S);
    sourceShadow[i] = new Array(S);
  }

  for (let x = 0; x < L; ++x)
    for (let y = 0; y < S; ++y) {
      u[x][y] = 0;
      u_next[x][y] = 0;
      u_prev[x][y] = 0;
      sourceShadow[x][y] = 0;
    }

  source = new Light(sourceSliderX.value(), sourceSliderY.value(), sLen, sourceSliderAngle.value(), -1) 
  rect = new Rect([[10,10],[10,100],[100,100],[100,10]],10,10)
}

function update() {
  for(let i = 0; i < L; ++i){
    u_next[i][0] = A * sin(omega * t);
  }

  for (let x = 1; x < L - 1; ++x)
    for (let y = 1; y < S - 1; ++y) {
      u_next[x][y] = 2 * u[x][y] - u_prev[x][y];
      u_next[x][y] += eps * c2 * (u[x + 1][y] - 2 * u[x][y] + u[x - 1][y]);
      u_next[x][y] += eps * c2 * (u[x][y + 1] - 2 * u[x][y] + u[x][y - 1]);
      u_next[x][y] -= alpha * dt * (u[x][y] - u_prev[x][y]);
    }

  // brzegi
  for (let x = 0; x < L; ++x) {
    u_prev[x] = u[x].slice();
    u[x] = u_next[x].slice();
  }
}

function draw() {
  const d = 20;

  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y) {
      img_pixels[x][y] = 0;
    }
  
  pg.noFill();
  pg.color(255,255,255);
  pg.stroke(255, 40, 40);
  pg.line(line[0][0]*SCALE,line[0][1]*SCALE,line[1][0]*SCALE,line[1][1]*SCALE);
  
  //update spans
  sourceSpanX.html(`\t${sourceSliderX.value()}`)
  sourceSpanY.html(`\t${sourceSliderY.value()}`)
  sourceSpanAngle.html(`\t${sourceSliderAngle.value()}`)

  for (let step = 0; step < steps_per_frame; ++step) {

    // source
    update()

    source.move(sourceSliderX.value(), sourceSliderY.value(), sourceSliderAngle.value())
    source.draw();
    
    //rect.draw();

    t += dt;
  }

  img.loadPixels();
  for (let x = 0; x < S; ++x)
    for (let y = 0; y < S; ++y)
      img.set(x, y, img_pixels[x][y]);
  img.updatePixels();
  image(img, 0, 0, SCALE*S, SCALE*S);
  image(pg, 0, 0);
  image(pg, 0, S*SCALE);
}

//TAKEN FROM https://github.com/mapbox/lineclip

// Cohen-Sutherland line clippign algorithm, adapted to efficiently
// handle polylines rather than just segments

function lineclip(points, bbox, result) {

    var len = points.length,
        codeA = bitCode(points[0], bbox),
        part = [],
        i, a, b, codeB, lastCode;

    if (!result) result = [];

    for (i = 1; i < len; i++) {
        a = points[i - 1];
        b = points[i];
        codeB = lastCode = bitCode(b, bbox);

        while (true) {

            if (!(codeA | codeB)) { // accept
                part.push(a);

                if (codeB !== lastCode) { // segment went outside
                    part.push(b);

                    if (i < len - 1) { // start a new line
                        result.push(part);
                        part = [];
                    }
                } else if (i === len - 1) {
                    part.push(b);
                }
                break;

            } else if (codeA & codeB) { // trivial reject
                break;

            } else if (codeA) { // a outside, intersect with clip edge
                a = intersect(a, b, codeA, bbox);
                codeA = bitCode(a, bbox);

            } else { // b outside
                b = intersect(a, b, codeB, bbox);
                codeB = bitCode(b, bbox);
            }
        }

        codeA = lastCode;
    }

    if (part.length) result.push(part);

    return result;
}

// Sutherland-Hodgeman polygon clipping algorithm

function polygonclip(points, bbox) {

    var result, edge, prev, prevInside, i, p, inside;

    // clip against each side of the clip rectangle
    for (edge = 1; edge <= 8; edge *= 2) {
        result = [];
        prev = points[points.length - 1];
        prevInside = !(bitCode(prev, bbox) & edge);

        for (i = 0; i < points.length; i++) {
            p = points[i];
            inside = !(bitCode(p, bbox) & edge);

            // if segment goes through the clip window, add an intersection
            if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));

            if (inside) result.push(p); // add a point if it's inside

            prev = p;
            prevInside = inside;
        }

        points = result;

        if (!points.length) break;
    }

    return result;
}

// intersect a segment against one of the 4 lines that make up the bbox

function intersect(a, b, edge, bbox) {
    return edge & 8 ? [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]] : // top
        edge & 4 ? [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]] : // bottom
        edge & 2 ? [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])] : // right
        edge & 1 ? [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])] : null; // left
}

// bit code reflects the point position relative to the bbox:

//         left  mid  right
//    top  1001  1000  1010
//    mid  0001  0000  0010
// bottom  0101  0100  0110

function bitCode(p, bbox) {
    var code = 0;

    if (p[0] < bbox[0]) code |= 1; // left
    else if (p[0] > bbox[2]) code |= 2; // right

    if (p[1] < bbox[1]) code |= 4; // bottom
    else if (p[1] > bbox[3]) code |= 8; // top

    return code;
}