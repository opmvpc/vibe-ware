import p5 from "p5";

export interface MiniGame {
  setup: () => void;
  draw: () => void;
  mousePressed?: () => void;
  keyPressed?: () => void;
  reset: () => void;
  isCompleted: () => boolean;
  hasFailed?: () => boolean;
}

// Base class pour les mini-jeux (optionnel, mais utile pour les débutants comme toi)
export abstract class BaseMiniGame implements MiniGame {
  protected completed: boolean = false;

  constructor(protected p: p5) {}

  abstract setup(): void;
  abstract draw(): void;
  abstract reset(): void;

  mousePressed(): void {}
  keyPressed(): void {}

  isCompleted(): boolean {
    return this.completed;
  }
}
