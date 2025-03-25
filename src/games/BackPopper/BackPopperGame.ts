import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

// Importation des assets
import backImg from "./assets/back.png";
import buttonImg from "./assets/button.png";
import buttonPoppedImg from "./assets/button_popped.png";
import backgroundImg from "./assets/background.jpg";

export class BackPopperGame extends BaseMiniGame {
  // Images
  private backImage: p5.Image | null = null;
  private buttonImage: p5.Image | null = null;
  private buttonPoppedImage: p5.Image | null = null;
  private backgroundImage: p5.Image | null = null;

  // Configuration des boutons
  private buttons: Array<{
    x: number;
    y: number;
    popped: boolean;
    size: number;
    angle: number;
  }> = [];

  // Paramètres du jeu
  private numButtons: number = 0;
  private buttonBaseSize: number = 40;
  private buttonVariation: number = 10;

  constructor(p: p5) {
    super(p);
    this.loadAssets();
  }

  private loadAssets(): void {
    console.log("BackPopperGame: chargement des assets...");

    this.p.loadImage(backgroundImg, (img) => {
      console.log("BackPopperGame: background.jpg chargé");
      this.backgroundImage = img;
    }, () => {
      console.error("BackPopperGame: ÉCHEC chargement du background");
    });

    this.p.loadImage(backImg, (img) => {
      console.log("BackPopperGame: back.png chargé");
      this.backImage = img;
    }, () => {
      console.error("BackPopperGame: ÉCHEC chargement du dos");
    });

    this.p.loadImage(buttonImg, (img) => {
      console.log("BackPopperGame: button.png chargé");
      this.buttonImage = img;
    }, () => {
      console.error("BackPopperGame: ÉCHEC chargement du bouton");
    });

    this.p.loadImage(buttonPoppedImg, (img) => {
      console.log("BackPopperGame: buttonPopped.png chargé");
      this.buttonPoppedImage = img;
    }, () => {
      console.error("BackPopperGame: ÉCHEC chargement du bouton éclaté");
    });
  }

  setup(): void {
    // Nombre aléatoire de boutons entre 3 et 7
    this.numButtons = this.p.floor(this.p.random(3, 8));
    this.generateButtonLayout();
  }

  private generateButtonLayout(): void {
    this.buttons = [];

    // MARGES DE SÉCURITÉ pour éviter les boutons inaccessibles (╯°□°）╯︵ ┻━┻
    const marginX = 50; // Marge horizontale de 50px sur chaque côté
    const marginY = 60; // Marge verticale de 60px (plus grande en haut pour les instructions)

    // Diviser l'espace UTILISABLE du dos en grille virtuelle
    const gridCols = 3;
    const gridRows = 3;
    const cellWidth = (this.p.width - 2 * marginX) / gridCols;
    const cellHeight = (this.p.height - 2 * marginY) / gridRows;

    // Position de départ (coin supérieur gauche) de la zone de jeu
    const startX = marginX;
    const startY = marginY;

    // Créer des positions semi-aléatoires dans chaque cellule de la grille
    let buttonIndex = 0;

    // Continuer jusqu'à avoir le nombre de boutons souhaité
    while (buttonIndex < this.numButtons) {
      // Choisir une cellule aléatoire
      const col = Math.floor(this.p.random(0, gridCols));
      const row = Math.floor(this.p.random(0, gridRows));

      // Détecter si on a déjà un bouton dans cette cellule
      const existingButton = this.buttons.find(b =>
        Math.floor((b.x - startX) / cellWidth) === col &&
        Math.floor((b.y - startY) / cellHeight) === row
      );

      // Si la cellule est déjà occupée, on essaie une autre
      if (existingButton) continue;

      // Position du centre de la cellule
      const cellCenterX = startX + (col + 0.5) * cellWidth;
      const cellCenterY = startY + (row + 0.5) * cellHeight;

      // Variation aléatoire, mais pas trop pour rester dans la cellule et éviter les bords
      const maxOffset = Math.min(cellWidth, cellHeight) * 0.3; // Max 30% de décalage
      const randomOffsetX = this.p.random(-maxOffset, maxOffset);
      const randomOffsetY = this.p.random(-maxOffset, maxOffset);

      // Position finale du bouton
      const buttonX = cellCenterX + randomOffsetX;
      const buttonY = cellCenterY + randomOffsetY;

      // Taille aléatoire du bouton (pas trop petit pour rester cliquable)
      const buttonSize = this.buttonBaseSize + this.p.random(-this.buttonVariation/2, this.buttonVariation);

      // Rotation aléatoire pour plus de naturel
      const buttonAngle = this.p.random(-0.3, 0.3);

      // Ajouter le bouton à la liste
      this.buttons.push({
        x: buttonX,
        y: buttonY,
        popped: false,
        size: buttonSize,
        angle: buttonAngle
      });

      buttonIndex++;
    }
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  draw(): void {
    // Fond
    if (this.backgroundImage) {
      this.p.image(this.backgroundImage, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(200, 200, 220);
    }

    // Dos qui prend tout l'écran (adapté au ratio)
    if (this.backImage) {
      // On calcule les dimensions pour que le dos prenne tout l'écran
      const imgRatio = this.backImage.width / this.backImage.height;
      const screenRatio = this.p.width / this.p.height;

      let drawWidth, drawHeight;

      if (imgRatio > screenRatio) {
        // Image plus large que l'écran
        drawHeight = this.p.height;
        drawWidth = drawHeight * imgRatio;
      } else {
        // Image plus haute que l'écran
        drawWidth = this.p.width;
        drawHeight = drawWidth / imgRatio;
      }

      // Centrer l'image
      const x = (this.p.width - drawWidth) / 2;
      const y = (this.p.height - drawHeight) / 2;

      this.p.image(this.backImage, x, y, drawWidth, drawHeight);
    }

    // Dessiner les boutons
    this.buttons.forEach(button => {
      const img = button.popped ? this.buttonPoppedImage : this.buttonImage;
      if (img) {
        this.p.push();
        this.p.translate(button.x, button.y);
        this.p.rotate(button.angle);
        this.p.imageMode(this.p.CENTER);
        this.p.image(img, 0, 0, button.size, button.size);
        this.p.pop();
      } else {
        // Fallback si image non chargée
        this.p.push();
        this.p.translate(button.x, button.y);
        this.p.rotate(button.angle);
        this.p.fill(button.popped ? 255 : 200, 50, 50);
        this.p.ellipse(0, 0, button.size, button.size);
        this.p.pop();
      }
    });

    // Vérifier si tous les boutons sont éclatés
    const allPopped = this.buttons.every(button => button.popped);
    if (allPopped && this.buttons.length > 0) {
      this.completed = true;
    }

    // Instructions
    this.p.fill(0);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("ÉCLATE TOUS LES BOUTONS!", this.p.width / 2, 30);

    // Message de victoire
    if (this.completed) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(0, this.p.height/2 - 40, this.p.width, 80);
      this.p.fill(0, 255, 0);
      this.p.textSize(32);
      this.p.text("BIEN NETTOYÉ!", this.p.width / 2, this.p.height / 2);
    }
  }

  mousePressed(): void {
    if (this.completed) return;

    // Vérifier si un bouton est cliqué
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      if (!button.popped) {
        const d = this.p.dist(this.p.mouseX, this.p.mouseY, button.x, button.y);
        if (d < button.size / 2) {
          button.popped = true;
          // Ajouter du son ici si désiré
          break; // On ne peut éclater qu'un bouton à la fois
        }
      }
    }
  }

  reset(): void {
    this.completed = false;
    this.numButtons = this.p.floor(this.p.random(3, 8));
    this.generateButtonLayout();
  }
}
