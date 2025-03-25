import p5 from "p5";
import { BaseMiniGame } from "../../types/MiniGame";

export class AvoidObstacleGame extends BaseMiniGame {
  private obstacleX: number = 0;
  private obstacleY: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private failed: boolean = false;

  constructor(p: p5) {
    super(p);
  }

  setup(): void {
    this.reset();
  }

  reset(): void {
    this.obstacleX = this.p.width / 2;
    this.obstacleY = 0;
    this.playerX = this.p.width / 2;
    this.playerY = this.p.height - 50;
    this.completed = false;
    this.failed = false;
  }

  draw(): void {
    // Code existant pour ce jeu
    this.obstacleY += 5;
    this.playerX = this.p.mouseX;

    this.p.fill(255, 0, 0);
    this.p.rect(this.obstacleX - 25, this.obstacleY - 25, 50, 50);

    this.p.fill(0, 255, 0);
    this.p.ellipse(this.playerX, this.playerY, 30, 30);

    if (
      !this.failed &&
      this.p.abs(this.obstacleX - this.playerX) < 30 &&
      this.p.abs(this.obstacleY - this.playerY) < 30
    ) {
      this.failed = true;
    }

    if (this.obstacleY > this.p.height && !this.failed) {
      this.completed = true;
    }

    this.p.fill(0);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("AVOID THE RED SQUARE!", this.p.width / 2, 30);
  }

  hasFailed(): boolean {
    return this.failed;
  }
}
