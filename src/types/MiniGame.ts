import p5 from "p5";

export interface MiniGame {
  setup: () => void;
  draw: () => void;
  mousePressed?: () => void;
  keyPressed?: () => void;
  keyReleased?: () => void;
  mouseWheel?: (event: WheelEvent) => boolean;
  reset: () => void;
  isCompleted: () => boolean;
  hasFailed?: () => boolean;
  setDebugMode: (debug: boolean) => void;
}

// Base class pour les mini-jeux (optionnel, mais utile pour les débutants comme toi)
export abstract class BaseMiniGame implements MiniGame {
  protected p: p5;
  protected completed: boolean = false;
  protected debugMode: boolean = false;

  constructor(p: p5) {
    this.p = p;
  }

  abstract setup(): void;
  abstract draw(): void;
  abstract reset(): void;

  mousePressed(): void {}
  keyPressed(): void {}
  keyReleased(): void {}

  mouseWheel(event: WheelEvent): boolean {
    return true;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  hasFailed(): boolean {
    return false;
  }

  setDebugMode(debug: boolean): void {
    this.debugMode = debug;
  }
}
