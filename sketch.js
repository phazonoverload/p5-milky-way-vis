///////////////////////////////////////////////////////////////////
// MUST RUN IN CHROME OR FIREFOX. P5 PREVIEW DOESN'T SUPPORT ES6 //
///////////////////////////////////////////////////////////////////

var planets = [];
var sunSize = 100;
var maxSize,
  maxDistance,
  maxSpeed,
  simSpeed = 1,
  slider;
  
function drawSlider() {
  slider = createSlider(0, 100, 50);
  slider.position(30, 30);
  slider.style("width", "400px");
}

function speedChange() {
  var val = slider.value();
  var displayText = "Current speed is " + val + "%";
  push();
  translate(-width/2, -height/2);
  textSize(40);
  noStroke();
  fill("#D4D4D4");
  text(displayText, 40, 120);
  pop();
  simSpeed = val / 10;
}

function drawSun() {
  fill("#EBC62C");
  stroke("white");
  strokeWeight(2);
  ellipse(width / 2, height / 2, sunSize);
}

function Planet(name, color, size, distance, speed) {
  this.name = name;
  this.color = color;
  this.size = size;
  this.sizeInSitu = map(size, 0, maxSize, 0, width / 15);
  this.distance = distance;
  this.distanceInSitu = map(distance, 0, maxDistance, 0, width / 2.25) + (sunSize / 2);
  this.speed = 0;
  this.theta = 0;
  this.posX = 0;
  this.posY = 0;

  this.trajectory = function() {
    stroke(this.color);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.distanceInSitu * 2);
  }

  this.drawPlanet = function() {
    fill(color);
    stroke("#2C354A");
    strokeWeight(2);

    ellipseMode(CENTER);
    this.posX = this.distanceInSitu * cos(this.theta);
    this.posY = this.distanceInSitu * sin(this.theta);
    ellipse(this.posX, this.posY, this.sizeInSitu, this.sizeInSitu);
    this.speed = (360 / speed) * (simSpeed / 10);
    this.theta += this.speed;
  }

  this.display = function() {
    this.trajectory();
    this.drawPlanet();
  }
}

function findMaxValues() {
  // Find planet with biggest size
  var planetSizes = [];
  for (var i = 0; i < planetData.milkyway.length; i++) {
    planetSizes.push(planetData.milkyway[i].diameter);
  }
  maxSize = Math.max(...planetSizes);

  // Find planet with biggest distance
  var planetDistances = [];
  for (var i = 0; i < planetData.milkyway.length; i++) {
    planetDistances.push(planetData.milkyway[i].distance);
  }
  maxDistance = Math.max(...planetDistances);

  // Find planet with biggest period
  var planetSpeeds = [];
  for (var i = 0; i < planetData.milkyway.length; i++) {
    planetSpeeds.push(planetData.milkyway[i].period);
  }
  maxSpeed = Math.max(...planetSpeeds);
}

function setup() {
  createCanvas(2000, 2000);
  findMaxValues();
  for (var i = 0; i < planetData.milkyway.length; i++) {
    var p = planetData.milkyway[i];
    planets[i] = new Planet(p.name, p.color, p.diameter, p.distance, p.period);
  }
  drawSlider();
}

function draw() {
  background("#2C354A");
  drawSun();
  translate(width / 2, height / 2);
  for (var i = 0; i < planets.length; i++) {
    planets[i].display();
  }
  speedChange();
}