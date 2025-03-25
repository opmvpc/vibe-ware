import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

export class ClickCircleGame extends BaseMiniGame {
  private x: number = 0;
  private y: number = 0;
  private targetImage: p5.Image | null = null;
  private successSound: any = null; // Type p5.SoundFile si tu utilises p5.sound

  constructor(p: p5) {
    super(p);
    // Commente temporairement le chargement des assets
    // this.loadAssets();
  }

  private loadAssets(): void {
    // Asynchrone, donc à faire avec précaution
    this.p.loadImage('./games/ClickCircle/assets/target.png', (img) => {
      this.targetImage = img;
    });

    // Si tu utilises p5.sound
    // this.successSound = this.p.loadSound('./games/ClickCircle/assets/success.mp3');
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    this.x = this.p.random(50, this.p.width - 50);
    this.y = this.p.random(50, this.p.height - 50);
    this.completed = false;
  }

  draw(): void {
    // Toujours utiliser le fallback puisque l'image n'existe pas encore
    this.p.fill(255, 0, 0);
    this.p.ellipse(this.x, this.y, 50, 50);

    this.p.fill(0);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("CLICK THE CIRCLE!", this.p.width / 2, 30);
  }

  mousePressed(): void {
    const d = this.p.dist(this.p.mouseX, this.p.mouseY, this.x, this.y);
    if (d < 25) {
      this.completed = true;
      // if (this.successSound) this.successSound.play();
    }
  }
}
