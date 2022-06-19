// DANIEL LIPNIACKI (INDEX: 304067)


const S = 500;
const L = 15;

const lightLen = 900;

let img_pixels = new Array(S);
let img;
let pg;
let SCALE = 2;

//source

let sourceSliderX, sourceSliderY, sourceSliderAngle, sourceSpanX, sourceSpanY, sourceSpanAngle; 

const sLen = 15;
let source;
let yR = 0;
let moveSize = 30;
let sourceX = 2;
let sourceY = 2;
let locked = false;
let objectColor = [255, 40, 40]


let xOffset = 0.0;
let yOffset = 0.0;
let sourceAngle = 70;

let totalReflection = false;
let totalReflectionP;

let rect;
let rStartPoints = [[100,100],[100,200],[200,200],[200,100]];
let rectX = 100;
let rectY = 100;
let size = 100;
let lockedObject = false;
let objectHover = false

let n1 = 1.003
let n2 = 3

let line = [[0,128],[S,128]]


class Rect {
    constructor(
      points
    ) {
      this.points = points;
    }
    move(x,y){
        this.points[0][0] = x
        this.points[0][1] = y
        this.points[1][0] = x
        this.points[1][1] = y + size
        this.points[2][0] = x + size
        this.points[2][1] = y + size
        this.points[3][0] = x + size
        this.points[3][1] = y
    }

    draw() {
        pg.color(255,255,255);
        pg.stroke(...objectColor);
        pg.strokeWeight(1);
        pg.line(this.points[0][0],this.points[0][1],this.points[1][0],this.points[1][1]);
        pg.line(this.points[1][0],this.points[1][1],this.points[2][0],this.points[2][1]);
        pg.line(this.points[2][0],this.points[2][1],this.points[3][0],this.points[3][1]);
        pg.line(this.points[3][0],this.points[3][1],this.points[0][0],this.points[0][1]);
        pg.fill(135,206,235)
        pg.rect(this.points[0][0]+1,this.points[0][1]+1,size-1,size-1)
        pg.noFill()
      }


    checkOverlap(l) {
      let index = 0
      for(let i = 0; i < 4; ++i) {
        let plain;
        if(i == 3) {
          plain = [...this.points[0],...this.points[3] ]
          index = 3
        } else if(i == 2) {
          plain = [...this.points[3],...this.points[2] ]
          index = 3
        }
        else {
          plain = [...this.points[i],...this.points[i+1] ]
          index = i
        }

        if(lineclip(l, plain).length  != 0) {
          return [true, plain, index]
        }
      }
      return [false, [], index] 
    }
}

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
    let xl, yl, base, xi,yi, xi2, yi2;
    let angle = this.angle;
    let angle2 = this.angle;
    let overlapPoints = [[this.x, this.y]];
    base = 0;
    let waitCounter = 4;
    let inside = false;

    for(let j = 0; j < lightLen; ++j) {
      xl = overlapPoints[overlapPoints.length-1][0]
      yl = overlapPoints[overlapPoints.length-1][1]
      xi = xl+floor(round(cos(angle),10)*(j-base))
      yi = yl+floor(round(sin(angle),10)*(j-base))
      if ( !((0 < xi) && (xi < (S-1)) && (0 < yi) && (yi < (S-1))) ) {
        break
      }

      let [rO, plain, index] = rect.checkOverlap([[xl,yl],[xi,yi]])
      if( rO && waitCounter == 0 ) {
        let a, a2;
        if(inside) {
          [a, a2] = this.calculateAngle([[xl,yl],[xi,yi]], plain, n2, n1)
          if(!totalReflection) {
            inside = false
          }
        } else {
          [a, a2] = this.calculateAngle([[xl,yl],[xi,yi]], plain, n1, n2)
          if(!totalReflection) {
            inside = true
          }
        }
        
        angle = 90-a
        angle2 = a2

        if(totalReflection) {
          if(index == 0) {
            xi2 = xl+floor(round(cos(270 - angle2),10)*(j))
            yi2 = yl+floor(round(sin(270 - angle2),10)*(j))
            xi2 = xl+floor(round(cos(250 - angle2),10)*(j))
            yi2 = yl+floor(round(sin(250 - angle2),10)*(j))
          } else {
            xi2 = xl+floor(round(cos(angle2),10)*(j))
            yi2 = yl+floor(round(sin(angle2),10)*(j))
          }

          overlapPoints.push([xi+1,yi-2])
          waitCounter = 4
        } else {
          overlapPoints.push([xi+1,yi+1])
          waitCounter = 4
        }

        
        base += round(Math.sqrt( Math.pow(xi - xl,2) + pow(yi - yl,2) ))
      } else {
        totalReflection = false
      }
      
      if(waitCounter != 0)
        --waitCounter
    }

    pg.color(255,255,255);
    pg.stroke(30,30,0);
    pg.strokeWeight(1);

    for(let i = 0; i < overlapPoints.length - 1; ++i) {
      pg.line(overlapPoints[i][0], overlapPoints[i][1], overlapPoints[i+1][0], overlapPoints[i+1][1])
    }
    
    if(totalReflection)
      pg.line(overlapPoints[overlapPoints.length-1][0],overlapPoints[overlapPoints.length-1][1], xi2, yi2)
    else
      pg.line(overlapPoints[overlapPoints.length-1][0],overlapPoints[overlapPoints.length-1][1], xi, yi)

  }

  calculateAngle(points, plane, m1, m2) {
    let vn1 = createVector(points[1][0] - points[0][0], points[1][1] - points[0][1]).normalize();
    let vn2 = createVector(plane[2] - plane[0], plane[3] - plane[1]).normalize();
    let sin = round(vn1.dot(vn2),5);
    let sin2 = (sin * m1) / m2;
    if(sin2 > 1) {
      totalReflection = true
    } else {
      totalReflection = false
    }
    return [round(asin(sin2)), round(asin(sin))] ;
  }

}

function setup() {
    createCanvas(S, S).parent("canvasContainer");
    img = createImage(S, S);
    pg = createGraphics(S, S);
  
    createP("Medium 1:").parent("leftPanel");
    sourceSliderX = createSlider(0, 3, 1.003, 0).parent("leftPanel");
    sourceSpanX = createSpan(`\t${sourceSliderX.value()}`).parent("leftPanel");
  
    createP("Medium 2:").parent("rightPanel");
    sourceSliderY = createSlider(0, 3, 2.003, 0).parent("rightPanel");
    sourceSpanY = createSpan(`\t${sourceSliderY.value()}`).parent("rightPanel");
  
    createP("Source angle:").parent("leftPanel");
    sourceSliderAngle = createSlider(0, 180, sourceAngle, 1).parent("leftPanel");
    sourceSpanAngle = createSpan(`\t${sourceSliderAngle.value()}`).parent("leftPanel");
  
    totalReflectionP = createP(`No total reflection`).parent("infobox");
  
    angleMode(DEGREES);
  
    for(let i = 0; i<S; ++i) {
      img_pixels[i] = new Array(S);
    }
  
    for (let x = 0; x < S; ++x)
      for (let y = 0; y < S; ++y) {
        img_pixels[x][y] = 0;
      }
  
    source = new Light(sourceX, sourceY, sLen, sourceSliderAngle.value(), -1) 
    rect = new Rect(rStartPoints)
  }

  function draw() {
    for (let x = 0; x < S; ++x)
      for (let y = 0; y < S; ++y) {
        img_pixels[x][y] = [220,220,220,255];
      }

    pg.noFill()
    pg.clear()
  
    //update spans
    sourceSpanX.html(`\t${sourceSliderX.value()}`)
    sourceSpanY.html(`\t${sourceSliderY.value()}`)
    sourceSpanAngle.html(`\t${sourceSliderAngle.value()}`)
  
    n1 = sourceSliderX.value();
    n2 = sourceSliderY.value();

    rect.draw();

    source.draw();
    source.move(sourceX, sourceY, sourceSliderAngle.value())

  
    checkObjectHover();

    if(totalReflection) {
      totalReflectionP.html(`Total Reflection`)
    } else {
      totalReflectionP.html(`No total Reflection`)
    }

    img.loadPixels();
    for (let x = 0; x < S; ++x)
      for (let y = 0; y < S; ++y)
        img.set(x, y, img_pixels[x][y]);
    img.updatePixels();
  
    image(img, 0, 0, S, S);
    image(pg, 0, 0);
    image(pg, 0, S);
  }


  function mouseDragged() {
    if (locked) {
      source.move(mouseX - xOffset, by = mouseY - yOffset, sourceSliderAngle.value())
    }
    if(lockedObject){
        rect.move(mouseX - xOffset, mouseY - yOffset)
        rectX =  rect.points[0][0]
        rectY =  rect.points[0][1]
    }
  }
  
  function mousePressed() {
    if(objectHover){
        lockedObject = true
    }
  }

  function mouseReleased() {
    lockedObject = false;
  }

  function checkObjectHover() {
    if (
        mouseX > rectX - size &&
        mouseX < rectX + size &&
        mouseY > rectY - size &&
        mouseY < rectY + size
      ) {
        objectHover = true
        objectColor = [156, 39, 176]
      } else {
        objectColor = [255, 40, 40]
        objectHover = false
      }
      xOffset = mouseX - rectX;
      yOffset = mouseY - rectY;
  }
