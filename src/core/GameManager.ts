import p5 from "p5";
import { MiniGame } from "../types/MiniGame";
import { GameState } from "./GameState";

export class GameManager {
  private currentGameIndex: number = 0;
  private timer: number = 180; // ~3 secondes à 60fps
  private games: MiniGame[] = [];
  private score: number = 0;
  private lives: number = 3;
  private isTransitioning: boolean = false;
  private transitionCounter: number = 0;
  private gameState: GameState = GameState.MENU;

  constructor(private p: p5, games: MiniGame[]) {
    this.games = games;
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
