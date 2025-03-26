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

  // Méthode pour sauvegarder et restaurer les paramètres graphiques
  protected saveGraphicsState(): void {
    this.p.push(); // Sauvegarde l'état actuel
    // Définir les valeurs par défaut
    this.p.imageMode(this.p.CORNER);
    this.p.rectMode(this.p.CORNER);
    this.p.textAlign(this.p.LEFT, this.p.BASELINE);
  }

  protected restoreGraphicsState(): void {
    this.p.pop(); // Restaure l'état précédent
  }

  // Méthode que les sous-classes doivent implémenter
  protected abstract drawGame(): void;

  // Méthode finale qui GARANTIT que l'état est restauré
  public draw(): void {
    this.p.push();
    this.drawGame();
    this.p.pop();
  }
}
