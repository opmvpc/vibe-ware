import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

export class TimingGame extends BaseMiniGame {
  private targetX: number = 0;
  private boxX: number = 0;
  private boxSpeed: number = 5;
  private attemptMade: boolean = false;
  private showFeedback: number = 0;

  constructor(p: p5) {
    super(p);
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    this.targetX = this.p.width / 2;
    this.boxX = 50;
    this.boxSpeed = 5;
    this.completed = false;
    this.attemptMade = false;
    this.showFeedback = 0;
  }

  draw(): void {
    // Ton code existant pour ce jeu
    this.boxX += this.boxSpeed;
    if (this.boxX > this.p.width - 50 || this.boxX < 50) {
      this.boxSpeed *= -1;
    }

    this.p.fill(255, 0, 0);
    this.p.rect(this.targetX - 5, 100, 10, 100);

    this.p.fill(0, 0, 255);
    this.p.rect(this.boxX - 25, 100, 50, 100);

    if (this.showFeedback > 0) {
      this.showFeedback--;
      if (this.completed) {
        this.p.fill(0, 255, 0, 200);
        this.p.text("PERFECT!", this.p.width / 2, 200);
      } else {
        this.p.fill(255, 0, 0, 200);
        this.p.text("RATÉ!", this.p.width / 2, 200);
      }
    }

    this.p.fill(0);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("PRESS SPACE WHEN ALIGNED!", this.p.width / 2, 30);
  }

  keyPressed(): void {
    if (this.p.keyCode === 32) {
      this.attemptMade = true;
      this.showFeedback = 60;

      if (Math.abs(this.boxX - this.targetX) < 30) {
        this.completed = true;
      }

      this.boxSpeed = 0;
    }
  }

  hasFailed(): boolean {
    return this.attemptMade && !this.completed;
  }
}
