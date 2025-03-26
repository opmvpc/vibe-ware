import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

// Importation des assets
import headImg from "./assets/head.png";
import feetImg from "./assets/feet.png";
import backgroundImg from "./assets/background.jpeg";

export class LickFeetGame extends BaseMiniGame {
  // Position de la tête
  private headX: number = 0;
  private headY: number = 0;

  // Position des pieds
  private feetX: number = 0;
  private feetY: number = 0;
  private feetSpeed: number = 5;

  // Langue - position spécifique par rapport à la tête
  private tongueBaseX: number = 0; // Position de la base de la langue (ajustée automatiquement)
  private tongueBaseY: number = 0;
  private tongueEndX: number = 0;  // Position du bout de la langue
  private tongueEndY: number = 0;
  private tongueLength: number = 70; // Longueur fixe de la langue
  private tongueOffset = { x: -10, y: 10 }; // Décalage par rapport au centre de la tête (en bas à gauche)

  // Images et échelle
  private headImage: p5.Image | null = null;
  private feetImage: p5.Image | null = null;
  private backgroundImage: p5.Image | null = null;
  private headScale: number = 0.15;
  private feetScale: number = 0.12;

  // Zones de collision OPTIMISÉES
  private feetCollisionRadius: number = 50;  // Légèrement réduite
  private tongueCollisionRadius: number = 15; // TRÈS réduite pour plus de challenge

  // Debug
  private debugText: string = "";

  constructor(p: p5) {
    super(p);
    this.loadAssets();
  }

  private loadAssets(): void {
    console.log("LickFeetGame: chargement des assets...");

    // Chargement du fond
    this.p.loadImage(backgroundImg, (img) => {
      console.log("LickFeetGame: background.jpeg chargé");
      this.backgroundImage = img;
    }, () => {
      console.error("LickFeetGame: ÉCHEC chargement de background.jpeg");
    });

    this.p.loadImage(headImg, (img) => {
      console.log("LickFeetGame: head.png chargé");
      this.headImage = img;
    }, () => {
      console.error("LickFeetGame: ÉCHEC chargement de head.png");
    });

    this.p.loadImage(feetImg, (img) => {
      console.log("LickFeetGame: feet.png chargé");
      this.feetImage = img;
    }, () => {
      console.error("LickFeetGame: ÉCHEC chargement de feet.png");
    });
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    // Position ALÉATOIRE de la tête dans la moitié inférieure de l'écran
    this.headX = this.p.random(100, this.p.width - 100);
    this.headY = this.p.random(this.p.height / 2, this.p.height - 100);

    // Position ALÉATOIRE des pieds dans la moitié supérieure
    this.feetX = this.p.random(100, this.p.width - 100);
    this.feetY = this.p.random(50, this.p.height / 2 - 50);

    this.completed = false;
  }

  drawGame(): void {
    // SAUVEGARDER L'ÉTAT
    this.p.push();

    // Fond
    this.p.imageMode(this.p.CORNER);
    if (this.backgroundImage) {
      this.p.image(this.backgroundImage, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(120, 220, 220);
    }

    // Mise à jour de la logique
    this.updateGameLogic();

    // CALCULER LA POSITION DE LA LANGUE (on garde le calcul pour la collision)
    this.tongueBaseX = this.headX + this.tongueOffset.x;
    this.tongueBaseY = this.headY + this.tongueOffset.y;
    const tongueAngle = Math.PI / 4; // 45 degrés
    this.tongueEndX = this.tongueBaseX - Math.cos(tongueAngle) * this.tongueLength;
    this.tongueEndY = this.tongueBaseY + Math.sin(tongueAngle) * this.tongueLength;

    // Dessiner les pieds d'abord
    if (this.feetImage) {
      const scaledWidth = this.feetImage.width * this.feetScale;
      const scaledHeight = this.feetImage.height * this.feetScale;
      this.p.image(
        this.feetImage,
        this.feetX - scaledWidth / 2,
        this.feetY - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
    } else {
      this.p.fill(255, 200, 200);
      this.p.ellipse(this.feetX, this.feetY, 40, 20);
    }

    // Dessiner la tête
    if (this.headImage) {
      const scaledWidth = this.headImage.width * this.headScale;
      const scaledHeight = this.headImage.height * this.headScale;
      this.p.image(
        this.headImage,
        this.headX - scaledWidth / 2,
        this.headY - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      // LIGNE ROUGE SUPPRIMÉE - PLUS DE LANGUE VISIBLE
      // La langue existe toujours pour la collision, mais n'est plus visible
    }

    // DÉTECTION ENTRE PIEDS ET BOUT DE LA LANGUE
    const distance = this.p.dist(this.feetX, this.feetY, this.tongueEndX, this.tongueEndY);

    // Si la distance est inférieure à la somme des rayons, il y a collision
    if (distance < (this.feetCollisionRadius + this.tongueCollisionRadius)) {
      console.log("LANGUE TOUCHÉE! VICTOIRE!");
      this.completed = true;
    }

    // Instructions
    this.p.fill(0);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("APPROCHE LES PIEDS DE LA LANGUE!", this.p.width / 2, 30);
    this.p.textSize(14);
    this.p.text("Déplace les pieds avec ZQSD ou les flèches", this.p.width / 2, 55);

    // Message de victoire
    if (this.completed) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height/2 - 40, this.p.width, 80);
      this.p.fill(0, 255, 0);
      this.p.textSize(32);
      this.p.text("BIEN LÉCHÉ!", this.p.width / 2, this.p.height / 2);
    }

    // RESTAURER À LA FIN
    this.p.pop();
  }

  private updateGameLogic(): void {
    if (!this.completed) {
      // Gérer le mouvement des PIEDS avec ZQSD ou flèches directionnelles
      if (this.p.keyIsDown(90) || this.p.keyIsDown(this.p.UP_ARROW)) { // Z ou Flèche Haut
        this.feetY -= this.feetSpeed;
      }
      if (this.p.keyIsDown(83) || this.p.keyIsDown(this.p.DOWN_ARROW)) { // S ou Flèche Bas
        this.feetY += this.feetSpeed;
      }
      if (this.p.keyIsDown(81) || this.p.keyIsDown(this.p.LEFT_ARROW)) { // Q ou Flèche Gauche
        this.feetX -= this.feetSpeed;
      }
      if (this.p.keyIsDown(68) || this.p.keyIsDown(this.p.RIGHT_ARROW)) { // D ou Flèche Droite
        this.feetX += this.feetSpeed;
      }

      // MODIFICATION CRUCIALE: permettre aux pieds de descendre jusqu'à la tête
      this.feetX = this.p.constrain(this.feetX, 30, this.p.width - 30);
      this.feetY = this.p.constrain(this.feetY, 30, this.p.height - 30); // Avant: -100, maintenant: -30
    }
  }

  keyPressed(): void {
    // Méthode vidée car la langue a maintenant une position fixe
  }

  keyReleased(): void {
    // Méthode vidée car la langue a maintenant une position fixe
  }

  // Pour s'assurer que le mode debug est bien activé
  setDebugMode(debug: boolean): void {
    this.debugMode = debug;
    console.log(`LickFeetGame: Mode debug ${debug ? 'activé' : 'désactivé'}`);
  }
}
