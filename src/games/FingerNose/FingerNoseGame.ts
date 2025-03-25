import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

export class FingerNoseGame extends BaseMiniGame {
  private fingerX: number = 0;
  private fingerY: number = 0;
  private noseX: number = 0;
  private noseY: number = 0;
  private fingerImg: p5.Image | null = null;
  private noseImg: p5.Image | null = null;
  private faceImg: p5.Image | null = null;
  private successSound: any = null;
  private completed: boolean = false;
  private noseHitbox: { x: number, y: number, radius: number } = { x: 0, y: 0, radius: 20 };
  private fingerTipOffset: { x: number, y: number } = { x: 0, y: 0 };

  constructor(p: p5) {
    super(p);
    this.loadAssets();
  }

  private loadAssets(): void {
    // Ajoute cet affichage pour vérifier si la méthode est appelée
    console.log("FingerNoseGame: tentative de chargement des assets...");

    this.p.loadImage('./games/FingerNose/assets/finger.png', (img) => {
      console.log("FingerNoseGame: finger.png chargé avec succès!");
      this.fingerImg = img;
      this.fingerTipOffset = { x: img.width / 2, y: 10 };
    }, () => {
      console.error("FingerNoseGame: ÉCHEC chargement de finger.png");
    });

    this.p.loadImage('./games/FingerNose/assets/nose.png', (img) => {
      console.log("FingerNoseGame: nose.png chargé avec succès!");
      this.noseImg = img;
    }, () => {
      console.error("FingerNoseGame: ÉCHEC chargement de nose.png");
    });

    this.p.loadImage('./games/FingerNose/assets/face.png', (img) => {
      this.faceImg = img;
    }, () => {
      // C'est OK si la face n'existe pas
    });

    // Si tu utilises p5.sound
    // this.p.loadSound('./games/FingerNose/assets/success.mp3', (sound) => {
    //   this.successSound = sound;
    // });
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    // Position aléatoire du nez
    this.noseX = this.p.random(100, this.p.width - 100);
    this.noseY = this.p.random(100, this.p.height - 100);

    // Met à jour la hitbox du nez
    this.noseHitbox = {
      x: this.noseX,
      y: this.noseY,
      radius: 30 // Ajuste selon la taille de ton image
    };

    this.completed = false;
  }

  draw(): void {
    // Avec des images à fond noir, on utilise un fond noir aussi
    this.p.background(0);

    // Si on a une image de visage, on la dessine
    if (this.faceImg) {
      this.p.image(this.faceImg, 0, 0, this.p.width, this.p.height);
    } else {
      // Sinon on dessine un arrière-plan sombre stylisé
      this.p.fill(20, 20, 30);
      this.p.rect(0, 0, this.p.width, this.p.height);

      // Ajout d'un peu de texture
      for (let i = 0; i < 50; i++) {
        this.p.fill(30 + this.p.random(20), 30 + this.p.random(20), 40 + this.p.random(20));
        this.p.noStroke();
        this.p.ellipse(
          this.p.random(this.p.width),
          this.p.random(this.p.height),
          this.p.random(5, 10)
        );
      }
    }

    // Dessine le nez
    if (this.noseImg) {
      // Centre l'image sur les coordonnées
      const noseWidth = 100;
      const noseHeight = 100;
      this.p.image(this.noseImg, this.noseX - noseWidth/2, this.noseY - noseHeight/2, noseWidth, noseHeight);
    } else {
      // Fallback pour le nez (plus sombre pour aller avec le thème noir)
      this.p.fill(150, 50, 50);
      this.p.ellipse(this.noseX, this.noseY, 60, 60);
    }

    // Dessine le doigt qui suit la souris
    this.fingerX = this.p.mouseX;
    this.fingerY = this.p.mouseY;

    if (this.fingerImg) {
      // Dimensions du doigt
      const fingerWidth = 60;
      const fingerHeight = 120;

      // On dessine le doigt avec son bout au niveau de la souris
      this.p.push();
      // Translation pour pouvoir faire la rotation autour du point de la souris
      this.p.translate(this.fingerX, this.fingerY);

      // Calcule l'angle entre le doigt et le nez
      const angle = this.p.atan2(this.noseY - this.fingerY, this.noseX - this.fingerX);
      // Rotation pour que le doigt pointe vers le nez
      this.p.rotate(angle + this.p.PI/2); // +90° car l'image pointe vers le haut

      // Dessine l'image centrée et au bon endroit
      this.p.image(
        this.fingerImg,
        -fingerWidth/2,
        -this.fingerTipOffset.y,
        fingerWidth,
        fingerHeight
      );
      this.p.pop();

      // DEBUG: point de collision du doigt
      // this.p.fill(255, 0, 0);
      // this.p.ellipse(this.fingerX, this.fingerY, 5, 5);
    } else {
      // Fallback pour le doigt
      this.p.fill(200, 180, 160);
      this.p.rect(this.fingerX - 10, this.fingerY - 40, 20, 40);
      this.p.fill(255);
      this.p.ellipse(this.fingerX, this.fingerY, 15, 15);
    }

    // Vérifie si le doigt est dans le nez
    const distance = this.p.dist(this.fingerX, this.fingerY, this.noseHitbox.x, this.noseHitbox.y);
    if (distance < this.noseHitbox.radius) {
      this.completed = true;
      // if (this.successSound) this.successSound.play();
    }

    // Instructions
    this.p.fill(255); // Texte blanc pour fond noir
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("METS TON DOIGT DANS LE NEZ!", this.p.width / 2, 30);

    // Texte de réussite
    if (this.completed) {
      this.p.fill(0, 255, 0);
      this.p.textSize(40);
      this.p.text("BIEN JOUÉ!", this.p.width / 2, this.p.height / 2);
    }
  }

  mousePressed(): void {
    // Pas besoin de gérer le clic car on détecte en temps réel
  }

  isCompleted(): boolean {
    return this.completed;
  }
}
