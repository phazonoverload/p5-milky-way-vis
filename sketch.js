///////////////////////////////////////////////////////////////////
// MUST RUN IN CHROME OR FIREFOX. P5 PREVIEW DOESN'T SUPPORT ES6 //
///////////////////////////////////////////////////////////////////

var planets = [],
    planetAngles = [],
    sunSize = 100;
  
var CalculatePlanetValues = {
  size: 0,
  distance: 0,
  speed: 0,

  calculateSize: function() {
    var planetSizes = [];
    for (var i = 0; i < ControlZoom.numberVisible; i++) {
      planetSizes.push(planetData.milkyway[i].diameter);
    }
    CalculatePlanetValues.size = planetSizes.reduce(function(a, b) {
      if(a > b) { return a; } else { return b; }
    }, 0);
  },

  calculateDistance: function() {
    var planetDistances = [];
    for (var i = 0; i < ControlZoom.numberVisible; i++) {
      planetDistances.push(planetData.milkyway[i].distance);
    }
    CalculatePlanetValues.distance = planetDistances.reduce(function(a, b) {
      if(a > b) { return a; } else { return b; }
    }, 0);
  },

  calculateAll: function() {
    CalculatePlanetValues.calculateDistance();
    CalculatePlanetValues.calculateSize();
  }
}

var ControlSpeed = {
  input: "",
  value: 1,
  createInput: function() {
    ControlSpeed.input = createSlider(0, 100, 10);
    ControlSpeed.input.position(30, 30);
    ControlSpeed.input.style("width", "400px");
  },
  change: function() {
    var val = ControlSpeed.input.value();
    var displayText = val + "% Speed";
    push();
    textSize(30);
    noStroke();
    fill("#D4D4D4");
    text(displayText, 475, 60);
    pop();
    ControlSpeed.value = val / 10;
  }
}

var ControlAngleVisibility = {
  input: "",
  value: false,
  createInput: function() {
    ControlAngleVisibility.input = createButton("Click to toggle angles");
    ControlAngleVisibility.input.position(38, 160);
    ControlAngleVisibility.input.id("angle-toggle");
  },
  change: function() {
    planetAngles = [];
    for(var i = 0; i < planets.length; i++) {
      planetAngles.push(planets[i].angle); 
    }
    document.getElementById("angle-toggle").onclick = function() {
      ControlAngleVisibility.value = !ControlAngleVisibility.value;
    }
  }
}

var ControlZoom = {
  numberVisible: planetData.milkyway.length,
  inputOut: "",
  inputIn: "",
  createLabel: function() {
    push();
    textSize(30);
    noStroke();
    fill("#D4D4D4");
    text("Zoom level", 40, 125);
    pop();
  },
  createInputs: function() {
    ControlZoom.inputOut = createButton("-");
    ControlZoom.inputOut.position(220, 90);
    ControlZoom.inputOut.id("zoom-out");
    ControlZoom.inputIn = createButton("+");
    ControlZoom.inputIn.position(280, 90);
    ControlZoom.inputIn.id("zoom-in");
  },
  buttonClick: function() {

  },
  threshold: function() {
    // Don't let it go below 1, or above the array length 
  },
  newPlanetValues: function() {

  },
  change: function() {
    // document.getElementById("zoom-out").onclick = function() {
    //   console.log("Zoom out clicked");
    //   ControlZoom.numberVisible++;
    //   CalculatePlanetValues.calculateAll();
    //   // Call threshold
    // };
    document.getElementById("zoom-in").onclick = function() {
      console.log("Zoom in clicked");
      ControlZoom.numberVisible--;
      CalculatePlanetValues.calculateAll();
      // Call threshold
      for(var i = 0; i < ControlZoom.numberVisible; i++) {
        planets[i].size = map(this.sizeOriginal, 0, CalculatePlanetValues.size, 0, width / 20);
        planets[i].distance = map(this.distanceOriginal, 0, CalculatePlanetValues.distance, 0, width / 2.25) + (sunSize / 2);
      }
    };
  }
}

function drawSun() {
  fill("#FECD52");
  stroke("white");
  strokeWeight(2);
  ellipse(width / 2, height / 2, sunSize);
}

function Planet(name, color, size, distance, speed) {
  this.name = name;
  this.color = color;
  this.sizeOriginal = size;
  this.size = map(size, 0, CalculatePlanetValues.size, 0, width / 20);
  this.distanceOriginal = distance;
  this.distance = map(distance, 0, CalculatePlanetValues.distance, 0, width / 2.25) + (sunSize / 2);
  this.speed = speed;
  this.theta = 0;
  this.angle = 0;
  this.posX = 0;
  this.posY = 0;

  this.drawTrajectory = function() {
    stroke(this.color);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.distance * 2);
  }

  this.calculatePlanetPos = function() {
    this.posX = this.distance * cos(this.theta);
    this.posY = this.distance * sin(this.theta);
    this.speed = (360 / speed) * ControlSpeed.value;
    this.theta += this.speed;
  }

  this.drawPlanet = function() {
    fill(this.color);
    stroke("#2C354A");
    strokeWeight(2);
    ellipseMode(CENTER);
    ellipse(this.posX, this.posY, this.size, this.size);
  }

  this.drawAngle = function() {
    this.angle = parseInt(atan2(-this.posX, -this.posY));
    fill("white");
    if(ControlAngleVisibility.value) {
      stroke(this.color);
      line(0, 0, this.posX, this.posY); 
      noStroke();
      text(this.angle + "°", this.posX + this.size / 2, this.posY + this.size / 2);
    } 
  }
  
  this.display = function() {
    this.drawTrajectory();
    this.calculatePlanetPos();
    this.drawPlanet();
    this.drawAngle();
  }
}

function setup() {
  createCanvas(2000, 2000);
  angleMode(DEGREES);
  CalculatePlanetValues.calculateAll();
  for (var i = 0; i < planetData.milkyway.length; i++) {
    var p = planetData.milkyway[i];
    planets[i] = new Planet(p.name, p.color, p.diameter, p.distance, p.period);
  }
  ControlSpeed.createInput();
  ControlAngleVisibility.createInput();
  ControlZoom.createInputs();
}

function draw() {
  background("#2C354A");
  drawSun();
  push();
  translate(width / 2, height / 2);
  for (var i = 0; i < planets.length; i++) {
    planets[i].display();
  }
  pop();
  ControlSpeed.change();
  ControlAngleVisibility.change();
  ControlZoom.createLabel();
  ControlZoom.change();
}