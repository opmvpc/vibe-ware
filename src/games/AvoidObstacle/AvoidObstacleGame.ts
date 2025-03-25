import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

// Importation des assets - COMME ÇA ON FAIT LES CHOSES CORRECTEMENT!
import catImg from "./assets/cat.png";
import vanImg from "./assets/van.png";
import roadImg from "./assets/road.jpeg";

export class AvoidObstacleGame extends BaseMiniGame {
  // Position de la camionnette
  private vanX: number = 0;
  private vanY: number = 0;
  private vanSpeed: number = 4;
  private vanWidth: number = 100;
  private vanHeight: number = 120;
  private vanRatio: number = 0.75;

  // Position du chat
  private catX: number = 0;
  private catY: number = 0;
  private catWidth: number = 60;
  private catHeight: number = 40;
  private catRatio: number = 0.67;
  private catSpeed: number = 6;

  // Images
  private catImage: p5.Image | null = null;
  private vanImage: p5.Image | null = null;
  private roadImage: p5.Image | null = null;

  // État du jeu
  private failed: boolean = false;
  private timer: number = 0;
  private VICTORY_TIME: number = 180; // ~3 secondes à 60fps

  constructor(p: p5) {
    super(p);
    this.loadAssets();
  }

  private loadAssets(): void {
    console.log("AvoidObstacleGame: chargement des assets...");

    this.p.loadImage(
      roadImg,
      (img) => {
        console.log("AvoidObstacleGame: route chargée");
        this.roadImage = img;
      },
      () => {
        console.error("AvoidObstacleGame: ÉCHEC chargement route");
      }
    );

    this.p.loadImage(
      catImg,
      (img) => {
        console.log("AvoidObstacleGame: chat chargé");
        this.catImage = img;
        if (img.width > 0) {
          this.catRatio = img.height / img.width;
          this.catHeight = this.catWidth * this.catRatio;
        }
      },
      () => {
        console.error("AvoidObstacleGame: ÉCHEC chargement chat");
      }
    );

    this.p.loadImage(
      vanImg,
      (img) => {
        console.log("AvoidObstacleGame: camionnette chargée");
        this.vanImage = img;
        if (img.width > 0) {
          this.vanRatio = img.height / img.width;
          this.vanHeight = this.vanWidth * this.vanRatio;
        }
      },
      () => {
        console.error("AvoidObstacleGame: ÉCHEC chargement camionnette");
      }
    );
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    // Positions initiales
    this.catX = this.p.width / 2;
    this.catY = this.p.height - 60;

    // La camionnette part du haut
    this.vanX = this.p.random(
      this.vanWidth / 2,
      this.p.width - this.vanWidth / 2
    );
    this.vanY = -this.vanHeight;

    this.failed = false;
    this.completed = false;
    this.timer = 0;

    // Vitesse variable pour adapter la difficulté
    this.vanSpeed = this.p.random(3, 6);
  }

  draw(): void {
    // FORCER UN FOND UNI D'ABORD POUR ÉVITER LES ZONES TRANSPARENTES
    this.p.background(80, 80, 80); // Gris foncé pour l'asphalte

    // On dessine notre route ENSUITE
    if (this.roadImage) {
      // On force l'image à couvrir TOUT l'écran
      this.p.imageMode(this.p.CORNER);
      this.p.image(this.roadImage, 0, 0, this.p.width, this.p.height);

      // Vérifie si l'image est bien chargée et a une taille
      if (this.roadImage.width <= 1) {
        console.error("AvoidObstacleGame: L'IMAGE DE LA ROUTE EST INVALIDE!");
      }
    } else {
      // Fallback amélioré - dessinons une route basique
      this.p.fill(60, 60, 60);
      this.p.rect(0, 0, this.p.width, this.p.height);

      // Lignes blanches de la route
      this.p.fill(255);
      const lineWidth = 40;
      const lineHeight = 10;
      const gap = 30;

      for (
        let y = -lineHeight;
        y < this.p.height + lineHeight;
        y += lineHeight + gap
      ) {
        this.p.rect(this.p.width / 2 - lineWidth / 2, y, lineWidth, lineHeight);
      }
    }

    // Logique de déplacement
    this.updateGameLogic();

    // Dessiner le chat
    if (this.catImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.catImage,
        this.catX,
        this.catY,
        this.catWidth,
        this.catHeight
      );
    } else {
      // Fallback - un cercle orange
      this.p.fill(255, 165, 0);
      this.p.ellipse(this.catX, this.catY, this.catWidth, this.catHeight);
    }

    // Dessiner la camionnette
    if (this.vanImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.vanImage,
        this.vanX,
        this.vanY,
        this.vanWidth,
        this.vanHeight
      );
    } else {
      // Fallback - un rectangle rouge
      this.p.fill(255, 0, 0);
      this.p.rect(
        this.vanX - this.vanWidth / 2,
        this.vanY - this.vanHeight / 2,
        this.vanWidth,
        this.vanHeight
      );
    }

    // Vérifier collision
    this.checkCollision();

    // Vérifier si le temps de survie est atteint
    if (!this.failed && !this.completed) {
      this.timer++;
      if (this.timer >= this.VICTORY_TIME) {
        this.completed = true;
      }
    }

    // Instructions
    this.p.fill(255);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("SAUVE LE CHAT DE LA CAMIONNETTE!", this.p.width / 2, 30);
    this.p.textSize(14);
    this.p.text("Déplace le chat avec les flèches ← →", this.p.width / 2, 55);

    // Message de victoire ou défaite
    if (this.completed) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height / 2 - 40, this.p.width, 80);
      this.p.fill(0, 255, 0);
      this.p.textSize(32);
      this.p.text("CHAT SAUVÉ!", this.p.width / 2, this.p.height / 2);
    } else if (this.failed) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height / 2 - 40, this.p.width, 80);
      this.p.fill(255, 0, 0);
      this.p.textSize(32);
      this.p.text("CHAT ÉCRASÉ!", this.p.width / 2, this.p.height / 2);
    }
  }

  private updateGameLogic(): void {
    if (this.failed || this.completed) return;

    // Déplacement de la camionnette
    this.vanY += this.vanSpeed;

    // Si la camionnette sort de l'écran, elle réapparaît en haut
    if (this.vanY > this.p.height + this.vanHeight) {
      this.vanY = -this.vanHeight;
      this.vanX = this.p.random(
        this.vanWidth / 2,
        this.p.width - this.vanWidth / 2
      );
      this.vanSpeed = this.p.random(3, 6); // Vitesse aléatoire à chaque passage
    }

    // Déplacement du chat avec les flèches
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) {
      this.catX = Math.max(this.catWidth / 2, this.catX - this.catSpeed);
    }
    if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
      this.catX = Math.min(
        this.p.width - this.catWidth / 2,
        this.catX + this.catSpeed
      );
    }
  }

  private checkCollision(): void {
    // Calcul des hitbox avec réduction pour être moins punitif
    const hitboxReduction = 0.7; // On réduit la taille de la hitbox pour plus de tolérance

    const catLeft = this.catX - (this.catWidth * hitboxReduction) / 2;
    const catRight = this.catX + (this.catWidth * hitboxReduction) / 2;
    const catTop = this.catY - (this.catHeight * hitboxReduction) / 2;
    const catBottom = this.catY + (this.catHeight * hitboxReduction) / 2;

    const vanLeft = this.vanX - (this.vanWidth * hitboxReduction) / 2;
    const vanRight = this.vanX + (this.vanWidth * hitboxReduction) / 2;
    const vanTop = this.vanY - (this.vanHeight * hitboxReduction) / 2;
    const vanBottom = this.vanY + (this.vanHeight * hitboxReduction) / 2;

    // Détection de collision entre les rectangles
    if (
      catRight > vanLeft &&
      catLeft < vanRight &&
      catBottom > vanTop &&
      catTop < vanBottom
    ) {
      this.failed = true;
    }
  }

  hasFailed(): boolean {
    return this.failed;
  }
}
