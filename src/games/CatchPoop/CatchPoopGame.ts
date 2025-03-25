import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

// Importation des assets - PARFAITEMENT ORGANISÉS!
import handImg from "./assets/hand.png";
import poopyHandImg from "./assets/poopy-hand.png";
import poopImg from "./assets/poop.png";
import plateImg from "./assets/plate.jpeg";

export class CatchPoopGame extends BaseMiniGame {
  // Position de la cible (caca)
  private poopX: number = 0;
  private poopY: number = 0;
  private poopSize: number = 60;

  // Position de la main
  private handX: number = 0;
  private handY: number = 0;
  private handWidth: number = 100;
  private handHeight: number = 115;
  private handSpeed: number = 10;
  private handDirection: number = 1; // 1 = droite, -1 = gauche

  // État du jeu
  private attemptMade: boolean = false;
  private showFeedback: number = 0;
  private handStopX: number = 0; // Position où la main s'arrête

  // Images
  private handImage: p5.Image | null = null;
  private poopImage: p5.Image | null = null;
  private plateImage: p5.Image | null = null;
  private poopyHandImage: p5.Image | null = null;

  constructor(p: p5) {
    super(p);
    this.loadAssets();
  }

  private loadAssets(): void {
    console.log("CatchPoopGame: chargement des assets...");

    this.p.loadImage(
      plateImg,
      (img) => {
        console.log("CatchPoopGame: assiette chargée");
        this.plateImage = img;
      },
      () => {
        console.error("CatchPoopGame: ÉCHEC chargement assiette");
      }
    );

    this.p.loadImage(
      poopImg,
      (img) => {
        console.log("CatchPoopGame: caca chargé");
        this.poopImage = img;
      },
      () => {
        console.error("CatchPoopGame: ÉCHEC chargement caca");
      }
    );

    this.p.loadImage(
      handImg,
      (img) => {
        console.log("CatchPoopGame: main chargée");
        this.handImage = img;
      },
      () => {
        console.error("CatchPoopGame: ÉCHEC chargement main");
      }
    );

    this.p.loadImage(
      poopyHandImg,
      (img) => {
        console.log("CatchPoopGame: main souillée chargée");
        this.poopyHandImage = img;
      },
      () => {
        console.error("CatchPoopGame: ÉCHEC chargement main souillée");
      }
    );
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    // Position aléatoire du caca (respecte les marges)
    this.poopX = this.p.random(
      this.poopSize,
      this.p.width - this.poopSize
    );
    this.poopY = this.p.height * 0.5;

    // Position initiale de la main (MÊME NIVEAU QUE LE CACA!)
    this.handX = this.handWidth/2;
    this.handY = this.poopY - 20;

    // Réinitialisation des états
    this.attemptMade = false;
    this.completed = false;
    this.handDirection = 1; // Commence par aller vers la droite
    this.showFeedback = 0;
  }

  draw(): void {
    // Fond blanc
    this.p.background(255);

    // Assiette en background
    if (this.plateImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.plateImage,
        this.p.width / 2,
        this.p.height / 2,
        this.p.width * 0.9,
        this.p.height * 0.9
      );
    }

    // Dessiner le caca (notre cible)
    if (this.poopImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.poopImage,
        this.poopX,
        this.poopY,
        this.poopSize,
        this.poopSize
      );
    } else {
      // Fallback si l'image n'est pas chargée
      this.p.fill(139, 69, 19);
      this.p.ellipse(this.poopX, this.poopY, this.poopSize, this.poopSize);
    }

    // Si la tentative n'a pas été faite, DÉPLACER la main
    if (!this.attemptMade) {
      this.handX += this.handSpeed * this.handDirection;

      // Rebondir sur les bords CORRECTEMENT
      if (this.handX > this.p.width - this.handWidth/2 || this.handX < this.handWidth/2) {
        this.handDirection *= -1;
      }
    }

    // Dessiner la main selon l'état du jeu
    if (this.attemptMade) {
      // Si le joueur a réussi à attraper le caca, main avec caca
      if (this.completed && this.poopyHandImage) {
        this.p.imageMode(this.p.CENTER);
        this.p.image(
          this.poopyHandImage,
          this.handStopX,
          this.handY,
          this.handWidth,
          this.handHeight
        );
      }
      // Sinon main normale mais arrêtée
      else if (this.handImage) {
        this.p.imageMode(this.p.CENTER);
        this.p.image(
          this.handImage,
          this.handStopX,
          this.handY,
          this.handWidth,
          this.handHeight
        );
      }
    }
    // Main normale en mouvement
    else if (this.handImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        this.handImage,
        this.handX,
        this.handY,
        this.handWidth,
        this.handHeight
      );
    }

    // Vérifier la réussite quand la tentative est faite
    if (this.attemptMade && !this.completed) {
      const hitDistance = this.p.dist(this.handStopX, this.handY, this.poopX, this.poopY);
      const hitThreshold = (this.poopSize + this.handWidth) / 2;

      if (hitDistance < hitThreshold * 0.7) {
        this.completed = true;
      }

      if (this.showFeedback > 0) {
        this.showFeedback--;
      }
    }

    // Texte d'instructions
    this.p.fill(0);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("ATTRAPE LE CACA AU BON MOMENT", this.p.width / 2, 30);
    this.p.textSize(14);
    this.p.text("Appuie sur ESPACE quand la main est au-dessus", this.p.width / 2, 55);

    // Message de victoire ou échec
    if (this.completed) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height / 2 - 40, this.p.width, 80);
      this.p.fill(0, 255, 0);
      this.p.textSize(32);
      this.p.text("BIEN ATTRAPÉ!", this.p.width / 2, this.p.height / 2);
    } else if (this.attemptMade && this.showFeedback <= 0) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height / 2 - 40, this.p.width, 80);
      this.p.fill(255, 0, 0);
      this.p.textSize(32);
      this.p.text("RATÉ!", this.p.width / 2, this.p.height / 2);
    }
  }

  keyPressed(): void {
    // Si l'espace est appuyé et qu'aucune tentative n'a été faite
    if (this.p.keyCode === 32 && !this.attemptMade) {
      this.attemptMade = true;
      this.handStopX = this.handX;
      this.showFeedback = 60; // Durée du feedback visuel
    }
  }

  hasFailed(): boolean {
    return this.attemptMade && !this.completed && this.showFeedback <= 0;
  }
}
