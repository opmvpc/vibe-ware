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
  private debugButtonVisible: boolean = true; // Affiche ou non le bouton de debug
  private previousState: GameState = GameState.MENU; // Pour stocker l'état avant la pause

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
        this.drawPauseButton(); // Affiche le bouton pause pendant le jeu
        break;
      case GameState.GAME_OVER:
        this.drawGameOver();
        break;
      case GameState.DEBUG_MENU:
        this.drawDebugMenu();
        break;
      case GameState.DEBUG_GAME:
        this.drawDebugGame();
        this.drawPauseButton(); // Affiche le bouton pause aussi en mode debug
        break;
      case GameState.PAUSED:
        this.drawPauseMenu();
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

    // Ajoute un bouton de debug en bas à droite
    if (this.debugButtonVisible) {
      this.p.textSize(12);
      this.p.textAlign(this.p.RIGHT);
      this.p.fill(100); // Gris discret

      // Dessine le bouton
      this.p.rect(this.p.width - 70, this.p.height - 30, 60, 20);
      this.p.fill(200); // Texte plus clair
      this.p.text("DEBUG", this.p.width - 40, this.p.height - 18);

      // Vérifie si le bouton est cliqué
      if (this.p.mouseIsPressed &&
          this.p.mouseX > this.p.width - 70 &&
          this.p.mouseX < this.p.width - 10 &&
          this.p.mouseY > this.p.height - 30 &&
          this.p.mouseY < this.p.height - 10) {
        this.enterDebugMode();
      }
    }
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

  // Nouveau mode DEBUG pour les développeurs en herbe comme toi
  private drawDebugMenu(): void {
    this.p.background(40, 40, 80); // Un fond un peu différent pour ne pas confondre

    this.p.fill(255);
    this.p.textSize(32);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("MODE DEBUG", this.p.width / 2, 40);

    this.p.textSize(14);
    this.p.text("(Pour les développeurs qui ne savent pas ce qu'ils font)", this.p.width / 2, 70);

    // Liste des mini-jeux disponibles
    for (let i = 0; i < this.games.length; i++) {
      // Calcule la position de chaque bouton de jeu
      const y = 120 + i * 60;

      // Dessine le fond du bouton
      if (this.isMouseOverButton(this.p.width / 2 - 120, y - 20, 240, 40)) {
        this.p.fill(80, 80, 120); // Highlight quand la souris est dessus
      } else {
        this.p.fill(60, 60, 100);
      }
      this.p.rect(this.p.width / 2 - 120, y - 20, 240, 40, 5);

      // Texte du mini-jeu
      this.p.fill(255);
      this.p.textSize(18);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);

      // Nom du jeu (on extrait le nom de la classe)
      const gameName = this.games[i].constructor.name.replace('Game', '');
      this.p.text(gameName, this.p.width / 2, y);
    }

    // Bouton pour revenir au menu principal
    this.p.fill(200, 60, 60);
    this.p.rect(this.p.width / 2 - 100, this.p.height - 60, 200, 40, 5);
    this.p.fill(255);
    this.p.text("Retour au Menu Principal", this.p.width / 2, this.p.height - 40);
  }

  private drawDebugGame(): void {
    // Applique un fond par défaut qui sera écrasé par le jeu si nécessaire
    this.p.background(240);

    // Affiche le jeu actuel
    this.games[this.currentGameIndex].draw();

    // Bannière en haut avec le nom du jeu en cours
    this.p.fill(0, 0, 0, 200);
    this.p.rect(0, 0, this.p.width, 20);

    // Extrait le nom de la classe sans le "Game" à la fin
    const gameName = this.games[this.currentGameIndex].constructor.name.replace("Game", "");

    this.p.fill(255);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.textSize(12);
    this.p.text(`DEBUG: ${gameName}`, 10, 10);

    // Instructions pour quitter
    this.p.textAlign(this.p.RIGHT, this.p.CENTER);
    this.p.text("Appuyer sur 'Q' pour quitter", this.p.width - 10, 10);

    // Si le jeu est terminé ou échoué, on affiche un message et on le relance après un délai
    if (this.games[this.currentGameIndex].isCompleted()) {
      this.showSuccessMessage();
      this.resetDebugGameAfterDelay();
    } else if (
      this.games[this.currentGameIndex].hasFailed &&
      this.games[this.currentGameIndex].hasFailed()
    ) {
      this.showFailureMessage();
      this.resetDebugGameAfterDelay();
    }
  }

  // Méthode utilitaire pour vérifier si la souris est sur un bouton
  private isMouseOverButton(x: number, y: number, width: number, height: number): boolean {
    return this.p.mouseX >= x && this.p.mouseX <= x + width &&
           this.p.mouseY >= y && this.p.mouseY <= y + height;
  }

  // Entrer en mode debug
  private enterDebugMode(): void {
    this.gameState = GameState.DEBUG_MENU;
  }

  // Lancer un jeu spécifique en mode debug
  private startDebugGame(index: number): void {
    this.currentGameIndex = index;
    this.games[this.currentGameIndex].reset();
    this.gameState = GameState.DEBUG_GAME;
  }

  // Quitter le mode debug pour revenir au menu
  private exitDebugMode(): void {
    this.gameState = GameState.MENU;
  }

  // Dessine le bouton de pause en bas à gauche
  private drawPauseButton(): void {
    // Carré gris semi-transparent
    this.p.fill(100, 100, 100, 180);
    this.p.rect(10, this.p.height - 40, 30, 30, 5);

    // Icône de pause (deux barres verticales)
    this.p.fill(240);
    this.p.rect(18, this.p.height - 32, 4, 14);
    this.p.rect(28, this.p.height - 32, 4, 14);
  }

  // Affiche le menu de pause
  private drawPauseMenu(): void {
    // Garde le jeu visible en arrière-plan mais assombri
    this.p.fill(0, 0, 0, 150); // Overlay semi-transparent
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Titre du menu
    this.p.fill(255);
    this.p.textSize(30);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("PAUSE", this.p.width / 2, 80);

    // Bouton "Reprendre"
    if (this.isMouseOverButton(this.p.width / 2 - 100, 150, 200, 50)) {
      this.p.fill(80, 180, 80); // Vert plus vif au survol
    } else {
      this.p.fill(60, 160, 60); // Vert normal
    }
    this.p.rect(this.p.width / 2 - 100, 150, 200, 50, 10);
    this.p.fill(255);
    this.p.textSize(20);
    this.p.text("REPRENDRE", this.p.width / 2, 175);

    // Bouton "Menu Principal"
    if (this.isMouseOverButton(this.p.width / 2 - 100, 220, 200, 50)) {
      this.p.fill(180, 80, 80); // Rouge plus vif au survol
    } else {
      this.p.fill(160, 60, 60); // Rouge normal
    }
    this.p.rect(this.p.width / 2 - 100, 220, 200, 50, 10);
    this.p.fill(255);
    this.p.text("MENU PRINCIPAL", this.p.width / 2, 245);

    // Si on est en mode debug, afficher aussi un bouton pour retourner au menu debug
    if (this.previousState === GameState.DEBUG_GAME) {
      if (this.isMouseOverButton(this.p.width / 2 - 100, 290, 200, 50)) {
        this.p.fill(80, 80, 180); // Bleu plus vif au survol
      } else {
        this.p.fill(60, 60, 160); // Bleu normal
      }
      this.p.rect(this.p.width / 2 - 100, 290, 200, 50, 10);
      this.p.fill(255);
      this.p.text("MENU DEBUG", this.p.width / 2, 315);
    }
  }

  // Entre dans le menu pause
  private pauseGame(): void {
    this.previousState = this.gameState; // Mémorise l'état actuel
    this.gameState = GameState.PAUSED;
  }

  // Reprend le jeu là où il en était
  private resumeGame(): void {
    this.gameState = this.previousState; // Restaure l'état précédent
  }

  // Gérer les clics de souris partout dans le jeu
  mousePressed(): void {
    // Vérifier si on a cliqué sur le bouton pause
    if ((this.gameState === GameState.PLAYING || this.gameState === GameState.DEBUG_GAME) &&
        this.isMouseOverButton(10, this.p.height - 40, 30, 30)) {
      this.pauseGame();
      return;
    }

    // Gestion des clics dans le menu pause
    if (this.gameState === GameState.PAUSED) {
      // Bouton "Reprendre"
      if (this.isMouseOverButton(this.p.width / 2 - 100, 150, 200, 50)) {
        this.resumeGame();
        return;
      }

      // Bouton "Menu Principal"
      if (this.isMouseOverButton(this.p.width / 2 - 100, 220, 200, 50)) {
        this.gameState = GameState.MENU;
        return;
      }

      // Bouton "Menu Debug" (si disponible)
      if (this.previousState === GameState.DEBUG_GAME &&
          this.isMouseOverButton(this.p.width / 2 - 100, 290, 200, 50)) {
        this.gameState = GameState.DEBUG_MENU;
        return;
      }

      return; // Ne pas traiter d'autres clics si on est dans le menu pause
    }

    // Code existant pour les autres états
    if (this.gameState === GameState.PLAYING && !this.isTransitioning) {
      // Code existant pour le jeu normal
      this.games[this.currentGameIndex].mousePressed();
    } else if (this.gameState === GameState.DEBUG_MENU) {
      // Vérifier si on a cliqué sur un mini-jeu
      for (let i = 0; i < this.games.length; i++) {
        const y = 120 + i * 60;
        if (this.isMouseOverButton(this.p.width / 2 - 120, y - 20, 240, 40)) {
          this.startDebugGame(i);
          return;
        }
      }

      // Vérifier si on a cliqué sur le bouton retour
      if (this.isMouseOverButton(this.p.width / 2 - 100, this.p.height - 60, 200, 40)) {
        this.exitDebugMode();
      }
    } else if (this.gameState === GameState.DEBUG_GAME) {
      // Passe l'événement mousePressed au jeu en cours
      this.games[this.currentGameIndex].mousePressed();
    } else if (this.gameState === GameState.MENU) {
      // Code existant pour gérer les clics dans le menu
      if (this.isMouseOverButton(this.p.width / 2 - 100, this.p.height / 2, 200, 50)) {
        this.startGame();
      }
    } else if (this.gameState === GameState.GAME_OVER) {
      // Code existant pour gérer les clics sur l'écran de game over
      if (this.isMouseOverButton(this.p.width / 2 - 100, this.p.height / 2 + 50, 200, 50)) {
        this.resetGame();
      }
    }
  }

  // Gérer les appuis sur les touches
  keyPressed(): void {
    // Utiliser Échap pour ouvrir/fermer le menu pause
    if (this.p.keyCode === 27) { // Code de la touche Échap
      if (this.gameState === GameState.PLAYING || this.gameState === GameState.DEBUG_GAME) {
        this.pauseGame();
        return;
      } else if (this.gameState === GameState.PAUSED) {
        this.resumeGame();
        return;
      }
    }

    // Code existant
    if (this.gameState === GameState.PLAYING && !this.isTransitioning) {
      // Code existant pour le jeu normal
      this.games[this.currentGameIndex].keyPressed();
    } else if (this.gameState === GameState.DEBUG_GAME) {
      // Si on appuie sur 'Q', on quitte le jeu et retourne au menu de debug
      if (this.p.keyCode === 81) { // 'Q' key
        this.gameState = GameState.DEBUG_MENU;
      } else {
        // Sinon on passe l'événement au jeu en cours
        this.games[this.currentGameIndex].keyPressed();
      }
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

  private showSuccessMessage(): void {
    // Affiche un message de succès
    this.p.fill(0, 0, 0, 150);
    this.p.rect(0, this.p.height/2 - 20, this.p.width, 40);
    this.p.fill(0, 255, 0);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("SUCCÈS! Redémarrage...", this.p.width/2, this.p.height/2);
  }

  private showFailureMessage(): void {
    // Affiche un message d'échec
    this.p.fill(0, 0, 0, 150);
    this.p.rect(0, this.p.height/2 - 20, this.p.width, 40);
    this.p.fill(255, 0, 0);
    this.p.textSize(18);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("ÉCHEC! Redémarrage...", this.p.width/2, this.p.height/2);
  }

  private resetDebugGameAfterDelay(): void {
    // Redémarre le jeu après un délai
    if (this.p.frameCount % 120 === 0) { // environ 2 secondes à 60fps
      this.games[this.currentGameIndex].reset();
    }
  }
}
