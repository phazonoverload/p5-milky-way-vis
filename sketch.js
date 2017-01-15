/*****
 * planets: will store the Planet objects 
 * planetAngles: will store the current angles of the planets
 * sunSize: a configuration option, all planet positions will change to ensure they do not collide with the sun
*****/
var planets = [],
    planetAngles = [],
    sunSize = 100;

/*****
 * This variable contains an object - which contains values, and also relevant functions in altering those values 
 * CalculatePlanetValues.size contains the value for the largest planet in the dataset
 * CalculatePlanetValues.distance contains the value for the furthest planet in the dataset
 * CalculatePlanetValues._calculateSize() only gets called within this function and sets CalculatePlanetValues.size to the largest value in the first n planets where n is the value of ControlZoom.numberVisible (set by the zoom button)
 * CalculatePlanetValues._calculateDistance() only gets called within this function and sets CalculatePlanetValues.distance to the largest value in the first n planets where n is the value of ControlZoom.numberVisivle (set by the zoom button)
 * CalculatePlanetValues.calculateAll() is a shorthand function to call both CalculatePlanetValues._calculateSize() and CalculatePlanetValues._calculateDistance()
*****/
var CalculatePlanetValues = {
  size: 0,
  distance: 0,

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

/*****
 * This variable contains an object - which contains the speed value, the input which alters it, and functions to handle the change
 * ControlSpeed.input contains the slider, which is populated by ControlSpeed.createInput()
 * ControlSpeed.change takes the value of the slider, displays it on the screen, and changes ControlSpeed.value
*****/
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

/*****
 * Like the previous function, this variable contains the input, the value, and a function to handle the changes
 * ControlAngleToggle.createInput() creates the button which toggles angle visibility and stores it in ControlAngleToggle.input
 * ControlAngleToggle.change() empties out the planetAngles array, and then populates it with the angles. It also changes ControlAngleToggle.value to be it's opposite boolean value
*****/
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

/*****
 * ControlZoom is slightly more complex as there are a couple of buttons, and failsafes that required implementing. 
 * Like before, it contains a value (in this case how many planets should be visible), and one property per input
 * ControlZoom.createLabel() and ControlZoom.createInputs() do exactly as their names would suggest
 * ControlZoom._threshold() doesn't allow ControlZoom.numberVisible to drop below 1, or the above the number of planets in data.js
 * ControlZoom._newPlanetValues() empties out the planets array, runs CalculatePlanetValues.calculateAll(), and repopulates the planets array with new objects. As we'll see later, the size and sitance of these items are relative to the number of planets and the canvas size
 * ControlZoom.change() handles the [+] or [-] buttons being clicked
*****/
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

// This function is boring, and just draws the sun in the center of the screen
function drawSun() {
  fill("#FECD52");
  stroke("white");
  strokeWeight(2);
  ellipse(width / 2, height / 2, sunSize);
}

// This is a function which we'll call to create new planet objects. It takes arguments given by the data in data.js
function Planet(name, color, size, distance, speed) {
  this.name = name;
  this.color = color;
  // sizeOriginal is the actual size of the planet in the dataset, size maps that value where each value is suitable to the canvas size
  this.sizeOriginal = size;
  this.size = map(size, 0, CalculatePlanetValues.size, 0, width / 20);
  // distanceOriginal and distance is also about mapping values to be suitable for the canvase
  this.distanceOriginal = distance;
  this.distance = map(distance, 0, CalculatePlanetValues.distance, 0, width / 2.25) + (sunSize / 2);
  this.speed = speed;
  this.theta = 0;
  this.angle = 0;
  this.posX = 0;
  this.posY = 0;
  this.years = 0;
  // yearSwitch is being used to factor in the possibility (for faster planets) that they don't hit the year-marker perfectly. It is altered in _drawYear
  this.yearSwitch = false; 

  // This function draws the line which outlines where the planet will go
  this._drawTrajectory = function() {
    stroke(this.color);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.distance * 2);
  }

  // Here we use some trigonometry - woo, trig!
  // This is used to calculate planets' x and y positions
  this._calculatePlanetPos = function() {
    this.posX = this.distance * cos(this.theta);
    this.posY = this.distance * sin(this.theta);
    this.speed = (360 / speed) * ControlSpeed.value;
    this.theta += this.speed;
  }

  // This function simply draws each planet at it's x and y position, and at the correct size
  this._drawPlanet = function() {
    fill(this.color);
    stroke("#2C354A");
    strokeWeight(2);
    ellipseMode(CENTER);
    ellipse(this.posX, this.posY, this.size, this.size);
  }

  // This function will calculate the angle of the planet, and then display it if the trigger value is true
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

  // This function calculates and displays the number of year cycles that a planet has taken
  // Originally I was going to use some collision detection, but this broke for particularly slow/fast planets that either missed the mark, or hit it too many times in quick succession
  // Jack helped me with the implementation of this by suggesting the additional of a switch whose value changes (true/false) when the planet's value is greater than x.
  // When the planet passes the year mark, we check if the switch is true, and then increment, then changing the switch again. Works like a charm!
  this._drawYear = function() {
    if(this.angle > 270 && this.angle > 0 && this.yearSwitch === true) {
      this.yearSwitch = false;
    }
    if(this.angle < 270 && this.yearSwitch === false) {
      this.years++;
      this.yearSwitch = true;
    }
    if(!ControlAngleToggle.value) {
      fill("white");
      noStroke();
      text(this.years + " years", this.posX + this.size / 2, this.posY + this.size / 2);
    }
  }

  // This function is a shorthand to execute a group of functions together
  this.display = function() {
    this._drawTrajectory();
    this._calculatePlanetPos();
    this._drawPlanet();
    this._drawAngle();
    this._drawYear();
  }
}

// Create the canvas, get the initial planet values, create inputs
function setup() {
  createCanvas(2000, 2000);
  angleMode(DEGREES);
  ControlZoom._newPlanetValues();
  ControlSpeed.createInput();
  ControlAngleToggle.createInput();
  ControlZoom.createInputs();
}

// Run the planet functions, and handle changes to speed/angles/zoom
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
