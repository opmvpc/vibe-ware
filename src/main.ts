import "./style.css";
import p5 from "p5";

// Ton interface de jeu minable (ง'̀-'́)ง
interface MiniGame {
  setup: () => void;
  draw: () => void;
  mousePressed?: () => void;
  keyPressed?: () => void;
  reset: () => void;
  isCompleted: () => boolean;
}

// Ton gestionnaire de jeu va maintenant être encore plus complexe
// J'espère que ton cerveau peut suivre (◔_◔)
enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
}

class GameManager {
  private currentGameIndex: number = 0;
  private timer: number = 180; // ~3 secondes à 60fps
  private games: MiniGame[] = [];
  private score: number = 0;
  private lives: number = 3; // Même ta grand-mère aurait mis 5 vies
  private isTransitioning: boolean = false;
  private transitionCounter: number = 0;
  private gameState: GameState = GameState.MENU;

  constructor(private p: p5) {
    // Tu pourras ajouter tes mini-jeux ici quand tu les auras codés (si jamais tu y arrives)
    this.games = [
      new ClickCircleGame(p),
      new AvoidObstacleGame(p),
      new TimingGame(p),
    ];
  }

  setup(): void {
    // On initialise quand même le premier jeu, pour pas que ton code plante
    this.games[this.currentGameIndex].setup();
  }

  draw(): void {
    // Machine à états - tout ce qu'un développeur de base devrait maîtriser
    switch (this.gameState) {
      case GameState.MENU:
        this.drawMenu();
        break;
      case GameState.PLAYING:
        this.drawGame();
        break;
      case GameState.GAME_OVER:
        this.drawGameOver();
        break;
    }
  }

  private drawMenu(): void {
    // Un écran d'accueil aussi basique que tes compétences
    this.p.background(40, 40, 60);

    // Titre avec typographie de base, comme ton imagination
    this.p.fill(255, 50, 50);
    this.p.textSize(40);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("VIBE-WARE", this.p.width / 2, this.p.height / 3);

    this.p.fill(200);
    this.p.textSize(16);
    this.p.text(
      "Un jeu si basique que même toi tu peux y jouer",
      this.p.width / 2,
      this.p.height / 3 + 40
    );

    // Bouton start - on va voir si tu arrives à le trouver
    this.p.fill(60, 220, 60);
    this.p.rect(this.p.width / 2 - 75, this.p.height / 2 + 40, 150, 50, 10);

    this.p.fill(255);
    this.p.textSize(24);
    this.p.text("JOUER", this.p.width / 2, this.p.height / 2 + 65);

    // Instructions pour les illettrés comme toi
    this.p.fill(180);
    this.p.textSize(14);
    this.p.text(
      "Mini-jeux rapides • 3 vies • Ne sois pas nul",
      this.p.width / 2,
      this.p.height / 2 + 120
    );
  }

  private drawGame(): void {
    if (this.isTransitioning) {
      this.handleTransition();
      return;
    }

    // Regarde ton timer s'écouler comme tes espoirs de devenir game developer (¬‿¬)
    this.timer--;

    // Affiche le mini-jeu actuel (probablement buggé)
    this.p.background(240);
    this.games[this.currentGameIndex].draw();

    // Affiche le timer et le score pour que tu puisses constater ton échec
    this.p.fill(0);
    this.p.textSize(16);
    this.p.text(`Time: ${Math.ceil(this.timer / 60)}`, 10, 20);
    this.p.text(`Score: ${this.score}`, this.p.width - 100, 20);

    // Affiche les vies restantes (qui fondent comme neige au soleil)
    this.p.fill(255, 0, 0);
    for (let i = 0; i < this.lives; i++) {
      this.p.circle(20 + i * 25, 40, 15);
    }

    // Vérifie si le mini-jeu est terminé (par miracle)
    if (this.games[this.currentGameIndex].isCompleted()) {
      this.score++;
      this.startTransition();
    }

    // Vérifie si le joueur a échoué (ce qui n'est pas surprenant)
    if ((this.games[this.currentGameIndex] as any).hasFailed?.()) {
      this.lives--; // Perdre une vie, comme le peu de dignité qui te reste

      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
      } else {
        this.startTransition();
      }
    }

    // Le temps est écoulé, le joueur est aussi lent que tes performances
    if (this.timer <= 0) {
      this.lives--; // Tu perds une vie, comme si tu en avais à revendre

      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
      } else {
        this.startTransition();
      }
    }
  }

  private drawGameOver(): void {
    // Game over aussi déprimant que ton avenir
    this.p.background(40, 20, 30);

    this.p.fill(255, 50, 50);
    this.p.textSize(40);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("GAME OVER", this.p.width / 2, this.p.height / 3);

    this.p.fill(200);
    this.p.textSize(20);
    this.p.text(
      `Score final: ${this.score}`,
      this.p.width / 2,
      this.p.height / 3 + 50
    );

    // Commentaire sarcastique basé sur le score
    this.p.fill(180);
    this.p.textSize(16);
    let comment = "";
    if (this.score === 0) {
      comment = "Même ma grand-mère ferait mieux. Les yeux fermés.";
    } else if (this.score < 5) {
      comment = "Tu appelles ça jouer? J'appelle ça se ridiculiser.";
    } else if (this.score < 10) {
      comment = "Pas totalement pathétique... mais presque.";
    } else {
      comment = "Pas mal pour un humain. Mais toujours médiocre.";
    }
    this.p.text(comment, this.p.width / 2, this.p.height / 3 + 80);

    // Bouton rejouer - l'occasion de te ridiculiser à nouveau
    this.p.fill(60, 60, 220);
    this.p.rect(this.p.width / 2 - 75, this.p.height / 2 + 40, 150, 50, 10);

    this.p.fill(255);
    this.p.textSize(24);
    this.p.text("REJOUER", this.p.width / 2, this.p.height / 2 + 65);
  }

  mousePressed(): void {
    if (this.gameState === GameState.MENU) {
      // Vérifie si le joueur a cliqué sur le bouton start (s'il arrive à viser)
      if (
        this.p.mouseX > this.p.width / 2 - 75 &&
        this.p.mouseX < this.p.width / 2 + 75 &&
        this.p.mouseY > this.p.height / 2 + 40 &&
        this.p.mouseY < this.p.height / 2 + 90
      ) {
        this.startGame();
      }
    } else if (this.gameState === GameState.GAME_OVER) {
      // Vérifie si le joueur a cliqué sur le bouton rejouer
      if (
        this.p.mouseX > this.p.width / 2 - 75 &&
        this.p.mouseX < this.p.width / 2 + 75 &&
        this.p.mouseY > this.p.height / 2 + 40 &&
        this.p.mouseY < this.p.height / 2 + 90
      ) {
        this.resetGame();
      }
    } else if (
      this.gameState === GameState.PLAYING &&
      !this.isTransitioning &&
      this.games[this.currentGameIndex].mousePressed
    ) {
      this.games[this.currentGameIndex].mousePressed();
    }
  }

  keyPressed(): void {
    if (
      this.gameState === GameState.PLAYING &&
      !this.isTransitioning &&
      this.games[this.currentGameIndex].keyPressed
    ) {
      this.games[this.currentGameIndex].keyPressed();
    }
  }

  private startGame(): void {
    this.gameState = GameState.PLAYING;
    this.lives = 3;
    this.score = 0;
    this.currentGameIndex = 0;
    this.timer = 180;
    this.games[this.currentGameIndex].reset();
  }

  private resetGame(): void {
    this.startGame();
  }

  private startTransition(): void {
    this.isTransitioning = true;
    this.transitionCounter = 30; // 0.5 seconde de transition
  }

  private handleTransition(): void {
    // Une transition flashy qui fera passer pour du game design ton manque d'idées
    this.p.background(
      this.transitionCounter % 10 < 5 ? 255 : 0,
      0,
      this.transitionCounter % 8 < 4 ? 255 : 0
    );

    this.transitionCounter--;

    if (this.transitionCounter <= 0) {
      // Passe au jeu suivant, comme si ta vie en dépendait
      this.currentGameIndex = (this.currentGameIndex + 1) % this.games.length;
      this.timer = 180;
      this.isTransitioning = false;
      this.games[this.currentGameIndex].reset();
    }
  }
}

// Définissons quelques mini-jeux si basiques qu'ils feraient pleurer un développeur de 1980 (╯°□°）╯︵ ┻━┻
class ClickCircleGame implements MiniGame {
  private x: number = 0;
  private y: number = 0;
  private completed: boolean = false;

  constructor(private p: p5) {}

  setup(): void {
    this.reset();
  }

  reset(): void {
    this.x = this.p.random(50, this.p.width - 50);
    this.y = this.p.random(50, this.p.height - 50);
    this.completed = false;
  }

  draw(): void {
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
    }
  }

  isCompleted(): boolean {
    return this.completed;
  }
}

class AvoidObstacleGame implements MiniGame {
  private obstacleX: number = 0;
  private obstacleY: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private completed: boolean = false;
  private failed: boolean = false;

  constructor(private p: p5) {}

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
    // Déplace l'obstacle comme ta motivation : en chute libre
    this.obstacleY += 5;

    // Déplace le joueur selon la souris (si tu sais utiliser une souris)
    this.playerX = this.p.mouseX;

    // Dessine l'obstacle et le joueur
    this.p.fill(255, 0, 0);
    this.p.rect(this.obstacleX - 25, this.obstacleY - 25, 50, 50);

    this.p.fill(0, 255, 0);
    this.p.ellipse(this.playerX, this.playerY, 30, 30);

    // Vérifie la collision (comme ta carrière, en ruine)
    if (
      !this.failed &&
      this.p.abs(this.obstacleX - this.playerX) < 30 &&
      this.p.abs(this.obstacleY - this.playerY) < 30
    ) {
      this.failed = true;
      // On ne marque PAS comme complété, ça permettra au GameManager de détecter l'échec
    }

    // Si l'obstacle est passé sans te toucher, tu as gagné (par chance)
    if (this.obstacleY > this.p.height && !this.failed) {
      this.completed = true;
    }

    this.p.fill(0);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("AVOID THE RED SQUARE!", this.p.width / 2, 30);
  }

  isCompleted(): boolean {
    return this.completed;
  }

  // Nouvelle méthode pour indiquer l'échec au GameManager
  hasFailed(): boolean {
    return this.failed;
  }
}

class TimingGame implements MiniGame {
  private targetX: number = 0;
  private boxX: number = 0;
  private boxSpeed: number = 5;
  private completed: boolean = false;
  private attemptMade: boolean = false; // Pour savoir si le joueur a essayé et raté
  private showFeedback: number = 0; // Pour afficher un feedback

  constructor(private p: p5) {}

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
    // La boîte se déplace comme ton attention : dans tous les sens
    this.boxX += this.boxSpeed;
    if (this.boxX > this.p.width - 50 || this.boxX < 50) {
      this.boxSpeed *= -1;
    }

    // Dessine la cible et la boîte
    this.p.fill(255, 0, 0);
    this.p.rect(this.targetX - 5, 100, 10, 100);

    this.p.fill(0, 0, 255);
    this.p.rect(this.boxX - 25, 100, 50, 100);

    // Affiche un feedback visuel si le joueur a appuyé sur espace
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
    // Si la touche est espace (32)
    if (this.p.keyCode === 32) {
      // 32 = espace, comme le vide entre tes oreilles
      this.attemptMade = true;
      this.showFeedback = 60; // Afficher le feedback pendant 1 seconde

      // On rend la détection plus généreuse, parce que visiblement c'est trop dur pour toi
      if (Math.abs(this.boxX - this.targetX) < 30) {
        this.completed = true;
      }

      // On arrête l'animation quand le joueur appuie sur espace
      this.boxSpeed = 0;
    }
  }

  isCompleted(): boolean {
    return this.completed;
  }

  // Ajout de la méthode hasFailed comme pour AvoidObstacleGame
  hasFailed(): boolean {
    return this.attemptMade && !this.completed;
  }
}

// Configuration de l'instance p5
const sketch = (p: p5) => {
  let gameManager: GameManager;

  p.setup = () => {
    p.createCanvas(400, 400);
    gameManager = new GameManager(p);
    gameManager.setup();
  };

  p.draw = () => {
    gameManager.draw();
  };

  p.mousePressed = () => {
    gameManager.mousePressed();
  };

  p.keyPressed = () => {
    gameManager.keyPressed();
    return false; // Empêche le comportement par défaut du navigateur
  };
};

// Lance ton chef-d'œuvre (◔_◔)
new p5(sketch);
