// Een array om bommen bij te houden
var bommenArray = [];
// Een array om appels bij te houden
var appels = [];

// Definitie van de Bom klasse
class Bom {
  constructor(kolom) {
    this.x = round(random(10, 18)) * raster.celGrootte;
    this.y = 0;
    this.snelheden = [raster.celGrootte, raster.celGrootte * 1.25, raster.celGrootte * 0.5, raster.celGrootte * 0.25];
    this.snelheid = random(this.snelheden);
    this.omlaag = true;
  }

  // Methode om de bom te tonen
  toon() {
    image(bomPlaatje, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }

  // Methode om de bom te laten bewegen
  beweeg() {
    if (this.omlaag) {
      this.y += this.snelheid;
    } else {
      this.y -= this.snelheid;
    }

    if (this.y > 525) {
      this.omlaag = false;
    } else if (this.y < 0) {
      this.omlaag = true;
    }
  }
}

// Definitie van de Appel klasse
class Appel {
  constructor() {
    this.x = floor(random(1, Raster.aantalKolommen - 1)) * Raster.celGrootte;
    this.y = floor(random(1, Raster.aantalRijen - 1)) * Raster.celGrootte;
    this.sprite = loadImage("images/apple.png");
  }

  // Methode om de appel te tonen
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }

  // Methode om te controleren of de appel wordt gegeten door de speler
  wordtGegeten(speler) {
    if (speler.x == this.x && speler.y == this.y) {
      return true;
    } else {
      return false;
    }
  }
}

// Definitie van de Raster klasse
class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k;
    this.celGrootte = null;
  }

  // Methode om de grootte van een cel te berekenen op basis van de canvasgrootte en het aantal kolommen
  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }

  // Methode om het raster te tekenen
  teken() {
    push();
    noFill();
    stroke('grey');
    for (var rij = 0; rij < this.aantalRijen; rij++) {
      for (var kolom = 0; kolom < this.aantalKolommen; kolom++) {
        rect(kolom * this.celGrootte, rij * this.celGrootte, this.celGrootte, this.celGrootte);
      }
    }
    pop();
  }
}

// Definitie van de Jos klasse (speler)
class Jos {
  constructor() {
    this.x = 0;
    this.y = 200;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
    this.gehaald = false;
    this.staOpBom = false;
    this.levens = 3;
  }

  // Methode om de speler te laten bewegen op basis van wasd toetsen
  beweeg() {
    if (keyIsDown(65)) {
      this.x -= this.stapGrootte;
      this.frameNummer = 2;
    }
    if (keyIsDown(68)) {
      this.x += this.stapGrootte;
      this.frameNummer = 1;
    }
    if (keyIsDown(87)) {
      this.y -= this.stapGrootte;
      this.frameNummer = 4;
    }
    if (keyIsDown(83)) {
      this.y += this.stapGrootte;
      this.frameNummer = 5;
    }

    // Begrens de positie van de speler binnen het canvas
    this.x = constrain(this.x, 0, canvas.width);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);

    // Controleer of de speler het doel heeft bereikt
    if (this.x == canvas.width) {
      this.gehaald = true;
    }
  }

  // Methode om te controleren of de speler geraakt wordt door een vijand
  wordtGeraakt(vijand) {
    if (this.x == vijand.x && this.y == vijand.y) {
      return true;
    } else {
      return false;
    }
  }

  // Methode om het leven van de speler te verminderen bij een botsing met een bom
  raakBom() {
    this.levens--;
  }

  // Methode om te controleren of de speler op een bom staat
  staatOp(bommenLijst) {
    for (var b = 0; b < bommenLijst.length; b++) {
      if (bommenLijst[b].x == this.x && bommenLijst[b].y == this.y) {
        this.staOpBom = true;
        this.raakBom();
      }
    }
    return this.staOpBom;
  }

  // Methode om het aantal levens te tonen
  toon() {
    image(this.animatie[this.frameNummer], this.x, this.y, raster.celGrootte, raster.celGrootte);
    fill('red'); // Maakt de tekst rood
    textSize(20);
    text("Levens: " + this.levens, 10, 20);
  }
}

// Definitie van de Vijand klasse
class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
  }

  // Methode om de vijand te laten bewegen
  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    // Begrens de positie van de vijand binnen het canvas
    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  // Methode om de vijand te laten zien
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

// Preload-functie om afbeeldingen te laden
function preload() {
  brug = loadImage("images/backgrounds/dame_op_brug_1800.jpg");
  bomPlaatje = loadImage("images/sprites/bom_100px.png");
}

// Setup-functie om het canvas en het spel in te stellen
function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent();
  frameRate(10);
  textFont("Verdana");
  textSize(90);

  raster = new Raster(12, 18);
//Laat het raster zien
  raster.berekenCelGrootte();

  // laar de bommen van bommenArray met 5 bommen zien
  for (var b = 0; b < 5; b++) {
    let kolom = floor(random(1, raster.aantalKolommen));
    bommenArray.push(new Bom(kolom));
  }
  // maak een speler aan
  eve = new Jos();
  eve.stapGrootte = 0.5 * raster.celGrootte;

  // Initialisatie van de animatieframes voor de speler
  for (var b = 0; b < 6; b++) {
    frameEve = loadImage("images/sprites/Eve100px/Eve_" + b + ".png");
    eve.animatie.push(frameEve);
  }

  // Initialisatie van vijanden (Alice en Bob)
  alice = new Vijand(700, 200);
  alice.stapGrootte = 1 * eve.stapGrootte;
  alice.sprite = loadImage("images/sprites/Alice100px/Alice.png");

  bob = new Vijand(600, 400);
  bob.stapGrootte = 1 * eve.stapGrootte;
  bob.sprite = loadImage("images/sprites/Bob100px/Bob.png");

  // Initialisatie van appels
  for (var b = 0; b < 3; b++) {
    appels.push(new Appel());
  }
}

// Draw-functie om het spel te tekenen en bij te werken
function draw() {
  background(brug);
  fill('orange');
  rect(0, 0, 50, 600);
  rect(0, 550, 900, 50);
  raster.teken();

  // Beweging en weergave van bommen
  for (var b = 0; b < bommenArray.length; b++) {
    bommenArray[b].beweeg();
    bommenArray[b].toon();
  }

  // Weergave en controle van appels
  for (var a = 0; a < appels.length; a++) {
    appels[a].toon();
    if (appels[a].wordtGegeten(eve)) {
      eve.levens++;
      appels.splice(a, 1);
      appels.push(new Appel());
    }
  }

  // Controleer welke speler of vijand beweegt en laat deze bewegen
  if (eve.aanDeBeurt) {
    eve.beweeg();
  } else {
    alice.beweeg();
    bob.beweeg();
    eve.aanDeBeurt = true;
  }

  // Controleer of Alice en Bob op dezelfde positie zijn en laat Bob bewegen
  if (alice.x == bob.x && alice.y == bob.y) {
    bob.beweeg();
  }

  // Weergave van de speler en vijanden
  eve.toon();
  eve.beweeg();
  alice.toon();
  alice.beweeg();
  bob.toon();
  bob.beweeg();

  // Controleer op botsingen en einde van het spel
  if (eve.wordtGeraakt(alice) || eve.wordtGeraakt(bob) || eve.staatOp(bommenArray)) {
    eve.raakBom();
    if (eve.levens > 0) {
      resetGame();
    } else {
      background('red');
      fill('white');
      text("Je hebt verloren! Levens: " + eve.levens, 30, 300);
      noLoop();
    }
  }

  // Controleer op het halen van het doel en einde van het spel
  if (eve.gehaald) {
    background('green');
    fill('white');
    text("Je hebt gewonnen! Levens: " + eve.levens, 30, 300);
    noLoop();
  }
}

// Functie om het spel te resetten
function resetGame() {
  eve.x = 0;
  eve.y = 200;
  alice.x = 700;
  alice.y = 200;
  bob.x = 600;
  bob.y = 400;

  // Laat de bommen spawnen
  bommenArray = [];
  for (var b = 0; b < 5; b++) {
    let kolom = floor(random(1, raster.aantalKolommen));
    bommenArray.push(new Bom(kolom));
  }
//Tekent de appels
  appels = [];
  for (var b = 0; b < 3; b++) {
    appels.push(new Appel());
  }

  loop();
}