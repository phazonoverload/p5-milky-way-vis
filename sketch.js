var planets = [],
    planetAngles = [],
    sunSize = 100;
  
var CalculatePlanetValues = {
  size: 0,
  distance: 0,
  speed: 0,

  _calculateSize: function() {
    var planetSizes = [];
    for (var i = 0; i < ControlZoom.numberVisible; i++) {
      planetSizes.push(planetData.milkyway[i].diameter);
    }
    CalculatePlanetValues.size = planetSizes.reduce(function(a, b) {
      if(a > b) { return a; } else { return b; }
    }, 0);
  },

  _calculateDistance: function() {
    var planetDistances = [];
    for (var i = 0; i < ControlZoom.numberVisible; i++) {
      planetDistances.push(planetData.milkyway[i].distance);
    }
    CalculatePlanetValues.distance = planetDistances.reduce(function(a, b) {
      if(a > b) { return a; } else { return b; }
    }, 0);
  },

  calculateAll: function() {
    CalculatePlanetValues._calculateDistance();
    CalculatePlanetValues._calculateSize();
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

var ControlAngleToggle = {
  input: "",
  value: false,
  createInput: function() {
    ControlAngleToggle.input = createButton("Click to toggle angles/years");
    ControlAngleToggle.input.position(38, 160);
    ControlAngleToggle.input.id("angle-toggle");
  },
  change: function() {
    planetAngles = [];
    for(var i = 0; i < planets.length; i++) {
      planetAngles.push(planets[i].angle); 
    }
    document.getElementById("angle-toggle").onclick = function() {
      ControlAngleToggle.value = !ControlAngleToggle.value;
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
    text("Zoom (restarts simulator)", 40, 125);
    pop();
  },
  createInputs: function() {
    ControlZoom.inputOut = createButton("-");
    ControlZoom.inputOut.position(400, 90);
    ControlZoom.inputOut.id("zoom-out");
    ControlZoom.inputIn = createButton("+");
    ControlZoom.inputIn.position(460, 90);
    ControlZoom.inputIn.id("zoom-in");
  },
  _threshold: function() {
    if(ControlZoom.numberVisible < 1) {
      ControlZoom.numberVisible = 1;
    }
    if(ControlZoom.numberVisible > planetData.milkyway.length) {
      ControlZoom.numberVisible = planetData.milkyway.length;
    }
  },
  _newPlanetValues: function() {
    ControlZoom._threshold();
    planets = [];
    CalculatePlanetValues.calculateAll();
    for (var i = 0; i < planetData.milkyway.length; i++) {
      var p = planetData.milkyway[i];
      planets[i] = new Planet(p.name, p.color, p.diameter, p.distance, p.period);
    }
  },
  change: function() {
    document.getElementById("zoom-in").onclick = function() {
      ControlZoom.numberVisible--;
      ControlZoom._newPlanetValues();
    };
    document.getElementById("zoom-out").onclick = function() {
      ControlZoom.numberVisible++;
      ControlZoom._newPlanetValues();
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
  this.years = 0;
  // this.yearSwitch is being used to factor in the possibility (for faster planets) that they don't hit the year-marker perfectly. It is altered in this._drawYear
  this.yearSwitch = false; 

  this._drawTrajectory = function() {
    stroke(this.color);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.distance * 2);
  }

  this._calculatePlanetPos = function() {
    this.posX = this.distance * cos(this.theta);
    this.posY = this.distance * sin(this.theta);
    this.speed = (360 / speed) * ControlSpeed.value;
    this.theta += this.speed;
  }

  this._drawPlanet = function() {
    fill(this.color);
    stroke("#2C354A");
    strokeWeight(2);
    ellipseMode(CENTER);
    ellipse(this.posX, this.posY, this.size, this.size);
  }

  this._drawAngle = function() {
    this.angle = parseInt(atan2(this.posX, this.posY)) + 180;
    fill("white");
    if(ControlAngleToggle.value) {
      stroke(this.color);
      line(0, 0, this.posX, this.posY); 
      noStroke();
      text(this.angle + "°", this.posX + this.size / 2, this.posY + this.size / 2);
    } 
  }

  this._drawYear = function() {
    if(this.angle > 270 && this.angle > 0 && this.yearSwitch === true) {
      this.yearSwitch = false;
    }
    if(this.angle < 270 && this.yearSwitch === false) {
      this.years++;
      this.yearSwitch = true;
    }
    fill("white");
    noStroke();
    text(this.years + " years", this.posX + this.size / 2, this.posY + this.size / 2);
  }
  
  this.display = function() {
    this._drawTrajectory();
    this._calculatePlanetPos();
    this._drawPlanet();
    this._drawAngle();
    this._drawYear();
  }
}

function setup() {
  createCanvas(2000, 2000);
  angleMode(DEGREES);
  ControlZoom._newPlanetValues();
  ControlSpeed.createInput();
  ControlAngleToggle.createInput();
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
  ControlAngleToggle.change();
  ControlZoom.createLabel();
  ControlZoom.change();
}