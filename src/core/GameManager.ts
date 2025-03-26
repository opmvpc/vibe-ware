import p5 from "p5";
import { MiniGame } from "../types/MiniGame";
import { GameState } from "./GameState";
import backgroundImg from "../assets/background.jpeg";

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
  private backgroundImage: p5.Image | null = null;
  private debugMenuScroll: number = 0;
  private debugItemHeight: number = 50;
  private visibleItems: number = 5; // Nombre d'éléments visibles à la fois
  private isDebugMode: boolean = false; // Nouvelle propriété pour le mode debug

  constructor(private p: p5, games: MiniGame[]) {
    this.games = games;
    // Chargement de l'image de fond
    this.p.loadImage(backgroundImg, (img) => {
      this.backgroundImage = img;
    });
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
    // Fond avec image ou couleur de secours
    if (this.backgroundImage) {
      this.p.image(this.backgroundImage, 0, 0, this.p.width, this.p.height);

      // Overlay semi-transparent pour mieux voir le texte
      this.p.fill(20, 20, 30, 180);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else {
      // Fallback si l'image n'est pas chargée
      this.p.background(40, 40, 60);
    }

    // Titre avec effet de lumière
    this.p.fill(255, 50, 50);
    this.p.textSize(42);
    this.p.textStyle(this.p.BOLD);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("VIBE-WARE", this.p.width / 2, this.p.height / 3);

    // Effet de halo autour du titre
    this.p.drawingContext.shadowOffsetX = 0;
    this.p.drawingContext.shadowOffsetY = 0;
    this.p.drawingContext.shadowBlur = 15;
    this.p.drawingContext.shadowColor = "rgba(255, 50, 50, 0.5)";

    // Sous-titre avec style plus léger
    this.p.drawingContext.shadowBlur = 0;
    this.p.fill(200, 200, 210);
    this.p.textSize(16);
    this.p.textStyle(this.p.NORMAL);
    this.p.text(
      "Un jeu si basique que même toi tu peux y jouer",
      this.p.width / 2,
      this.p.height / 3 + 40
    );

    // Bouton JOUER modernisé avec effet de survol
    const btnX = this.p.width / 2 - 75;
    const btnY = this.p.height / 2 + 20;
    const btnWidth = 150;
    const btnHeight = 50;

    // Vérifier si la souris est sur le bouton pour l'effet de survol
    const isHovering = this.isMouseOverButton(btnX, btnY, btnWidth, btnHeight);

    // Fond du bouton avec effet de glassmorphism
    this.p.drawingContext.shadowBlur = isHovering ? 15 : 8;
    this.p.drawingContext.shadowColor = "rgba(60, 220, 60, 0.6)";

    // Fond semi-transparent
    this.p.fill(isHovering ? 'rgba(70, 230, 70, 0.9)' : 'rgba(60, 220, 60, 0.8)');

    // Bordures arrondies et fines
    this.p.strokeWeight(isHovering ? 2 : 1);
    this.p.stroke(255, 255, 255, 100);
    this.p.rect(btnX, btnY, btnWidth, btnHeight, 25); // Coins plus arrondis

    // Texte du bouton
    this.p.drawingContext.shadowBlur = 0;
    this.p.fill(255);
    this.p.noStroke();
    this.p.textSize(isHovering ? 26 : 24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("JOUER", this.p.width / 2, btnY + btnHeight/2);

    // Instructions avec effet plus subtil
    this.p.fill(200, 200, 210, 150);
    this.p.textSize(14);
    this.p.text(
      "Mini-jeux rapides • 3 vies • Ne sois pas nul",
      this.p.width / 2,
      this.p.height / 2 + 120
    );

    // Redesign du bouton debug pour qu'il soit plus discret mais élégant
    if (this.debugButtonVisible) {
      const debugBtnX = this.p.width - 75;
      const debugBtnY = this.p.height - 35;
      const debugBtnWidth = 65;
      const debugBtnHeight = 25;

      const isDebugHovering = this.isMouseOverButton(
        debugBtnX, debugBtnY, debugBtnWidth, debugBtnHeight
      );

      // Effet de glassmorphism subtil
      this.p.fill(isDebugHovering ? 'rgba(100, 100, 120, 0.8)' : 'rgba(80, 80, 100, 0.6)');
      this.p.strokeWeight(1);
      this.p.stroke(255, 255, 255, 70);
      this.p.rect(debugBtnX, debugBtnY, debugBtnWidth, debugBtnHeight, 12);

      // Texte du bouton debug
      this.p.noStroke();
      this.p.fill(isDebugHovering ? 255 : 220);
      this.p.textSize(12);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("DEBUG", debugBtnX + debugBtnWidth/2, debugBtnY + debugBtnHeight/2);
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

    this.drawGameUI();
  }

  private drawGameUI(): void {
    this.p.push();

    // Affiche le score, vies, etc.
    // ...

    // LE BOUTON PAUSE - CORRIGÉ:
    // Dessiner le bouton pause en BAS À GAUCHE!
    const pauseBtnSize = 30;
    const pauseBtnX = 30; // Position en BAS À GAUCHE
    const pauseBtnY = this.p.height - 30; // Position en BAS À GAUCHE

    // Dessiner le fond du bouton pause
    this.p.fill(60, 60, 80, 180);
    this.p.noStroke();
    this.p.rect(pauseBtnX - pauseBtnSize/2, pauseBtnY - pauseBtnSize/2, pauseBtnSize, pauseBtnSize, 5);

    // Dessiner l'icône pause
    this.p.fill(220);
    this.p.rect(pauseBtnX - 7, pauseBtnY - 7, 4, 14, 1);
    this.p.rect(pauseBtnX + 3, pauseBtnY - 7, 4, 14, 1);

    this.p.pop();
  }

  private drawGameOver(): void {
    this.p.push();
    this.p.imageMode(this.p.CORNER);

    // Fond semi-transparent pour le game over
    this.p.fill(0, 0, 0, 200);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Titre Game Over
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(255, 50, 50);
    this.p.textSize(48);
    this.p.text("GAME OVER", this.p.width / 2, this.p.height / 3);

    // Score
    this.p.fill(255);
    this.p.textSize(24);
    this.p.text(`Score: ${this.score}`, this.p.width / 2, this.p.height / 2);

    // Remplacer le code du bouton par:
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = this.p.width / 2 - buttonWidth / 2;
    const buttonY = this.p.height * 0.7;

    this.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, "RETOUR AU MENU");

    this.p.pop();
  }

  // Nouveau mode DEBUG pour les développeurs en herbe comme toi
  private drawDebugMenu(): void {
    // SAUVEGARDER l'état graphique
    this.p.push();

    // FORCER les modes par défaut
    this.p.imageMode(this.p.CORNER);
    this.p.rectMode(this.p.CORNER);
    this.p.textAlign(this.p.LEFT, this.p.BASELINE);

    // Fond
    this.p.background(20, 20, 40);

    // Titre
    this.p.fill(255);
    this.p.textSize(32);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("MODE DEBUG", this.p.width/2, 40);

    // Sous-titre
    this.p.fill(180, 180, 200);
    this.p.textSize(14);
    this.p.text("(Pour les développeurs qui ne savent pas ce qu'ils font)",
               this.p.width/2, 70);

    // Conteneur de liste avec glassmorphism
    const listX = 40;
    const listY = 100;
    const listWidth = this.p.width - 80;
    const listHeight = this.debugItemHeight * this.visibleItems;

    // Conteneur principal
    this.p.fill(60, 60, 100, 100);
    this.p.stroke(255, 255, 255, 30);
    this.p.strokeWeight(1);
    this.p.rect(listX, listY, listWidth, listHeight, 10);

    // Calculer le nombre d'éléments total
    const totalItems = this.games.length + 1; // +1 pour le bouton retour

    // Calculer les limites de défilement
    const maxScroll = Math.max(0, totalItems - this.visibleItems);
    this.debugMenuScroll = this.p.constrain(this.debugMenuScroll, 0, maxScroll);

    // Dessiner les éléments visibles avec décalage de scroll
    for (let i = 0; i < totalItems; i++) {
      const displayIndex = i - this.debugMenuScroll;

      // Ne dessiner que les éléments visibles
      if (displayIndex >= 0 && displayIndex < this.visibleItems) {
        const itemY = listY + displayIndex * this.debugItemHeight;

        // Vérifier si la souris est sur cet élément
        const isHovering = this.p.mouseY > itemY &&
                          this.p.mouseY < itemY + this.debugItemHeight &&
                          this.p.mouseX > listX &&
                          this.p.mouseX < listX + listWidth;

        // Dessiner le fond de l'élément
        this.p.fill(isHovering ? 'rgba(80, 80, 120, 0.9)' : 'rgba(60, 60, 100, 0.7)');
        this.p.noStroke();
        this.p.rect(listX + 5, itemY + 5, listWidth - 10, this.debugItemHeight - 10, 5);

        // Déterminer le texte à afficher
        let buttonText = "";
        if (i < this.games.length) {
          // Extraire le nom du jeu sans "Game" à la fin
          buttonText = this.games[i].constructor.name.replace("Game", "");
        } else {
          buttonText = "Retour au Menu Principal";
          // Style différent pour le bouton de retour
          if (isHovering) {
            this.p.fill('rgba(200, 60, 60, 0.9)');
          } else {
            this.p.fill('rgba(180, 60, 60, 0.7)');
          }
          this.p.rect(listX + 5, itemY + 5, listWidth - 10, this.debugItemHeight - 10, 5);
        }

        // Dessiner le texte
        this.p.fill(255);
        this.p.textSize(16);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text(buttonText, listX + listWidth/2, itemY + this.debugItemHeight/2);
      }
    }

    // Flèches de défilement
    if (this.debugMenuScroll > 0) {
      // Flèche vers le haut
      this.drawScrollArrow(listX + listWidth/2, listY - 20, true);
    }

    if (this.debugMenuScroll < maxScroll) {
      // Flèche vers le bas
      this.drawScrollArrow(listX + listWidth/2, listY + listHeight + 20, false);
    }

    // RESTAURER l'état à la fin
    this.p.pop();
  }

  private drawScrollArrow(x: number, y: number, pointingUp: boolean): void {
    this.p.push();
    this.p.translate(x, y);
    if (!pointingUp) this.p.rotate(this.p.PI);

    this.p.fill(200, 200, 220);
    this.p.noStroke();
    this.p.triangle(-10, 5, 10, 5, 0, -10);

    this.p.pop();
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
  private isMouseOverButton(x: number, y: number, width: number, height: number, centered: boolean = false): boolean {
    let left, top;

    if (centered) {
      // Si le bouton est centré, x/y sont les coordonnées du centre
      left = x - width/2;
      top = y - height/2;
    } else {
      // Sinon x/y sont les coordonnées du coin supérieur gauche
      left = x;
      top = y;
    }

    return (
      this.p.mouseX > left &&
      this.p.mouseX < left + width &&
      this.p.mouseY > top &&
      this.p.mouseY < top + height
    );
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
    // Position du bouton en bas à gauche
    const btnX = 15;
    const btnY = this.p.height - 45;
    const btnSize = 30;

    const isHovering = this.isMouseOverButton(btnX, btnY, btnSize, btnSize);

    // Effet glassmorphism pour le bouton
    this.p.drawingContext.shadowBlur = isHovering ? 10 : 5;
    this.p.drawingContext.shadowColor = "rgba(0, 0, 0, 0.5)";

    this.p.fill(isHovering ? 'rgba(100, 100, 100, 0.9)' : 'rgba(80, 80, 80, 0.7)');
    this.p.stroke(255, 255, 255, isHovering ? 80 : 40);
    this.p.strokeWeight(1);
    this.p.rect(btnX, btnY, btnSize, btnSize, 8);

    // Icône de pause (deux barres verticales)
    this.p.noStroke();
    this.p.fill(isHovering ? 255 : 230);
    this.p.rect(btnX + 10, btnY + 8, 3, 14, 1);
    this.p.rect(btnX + 17, btnY + 8, 3, 14, 1);

    this.p.drawingContext.shadowBlur = 0;
  }

  // Affiche le menu de pause
  private drawPauseMenu(): void {
    this.p.push();

    // Fond semi-transparent pour le menu de pause
    this.p.fill(40, 40, 60, 220);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Titre PAUSE
    this.p.fill(255);
    this.p.textSize(36);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("PAUSE", this.p.width / 2, this.p.height * 0.25);

    // LARGEURS DIFFÉRENCIÉES pour chaque bouton selon leur contenu! (⌐■_■)
    const resumeBtnWidth = 150;
    const menuBtnWidth = 200; // Plus large pour "MENU PRINCIPAL"
    const debugBtnWidth = 150;
    const btnHeight = 40;

    // Bouton REPRENDRE
    const resumeBtnX = this.p.width / 2;
    const resumeBtnY = this.p.height / 2 - 30;

    // Dessiner le bouton REPRENDRE
    this.drawButton(resumeBtnX - resumeBtnWidth/2, resumeBtnY - btnHeight/2, resumeBtnWidth, btnHeight, "REPRENDRE");

    // Bouton MENU PRINCIPAL - PLUS LARGE!
    const menuBtnX = this.p.width / 2;
    const menuBtnY = this.p.height / 2 + 30;

    // Dessiner le bouton MENU PRINCIPAL avec largeur adaptée
    this.drawButton(menuBtnX - menuBtnWidth/2, menuBtnY - btnHeight/2, menuBtnWidth, btnHeight, "MENU PRINCIPAL");

    // Bouton MENU DEBUG
    if (this.previousState === GameState.DEBUG_GAME) {
      const debugBtnX = this.p.width / 2;
      const debugBtnY = this.p.height / 2 + 90;

      // Dessiner le bouton MENU DEBUG
      this.drawButton(debugBtnX - debugBtnWidth/2, debugBtnY - btnHeight/2, debugBtnWidth, btnHeight, "MENU DEBUG");
    }

    this.p.pop();
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
    // Si on est sur l'écran game over
    if (this.gameState === GameState.GAME_OVER) {
      const buttonWidth = 200;
      const buttonHeight = 60;
      const buttonX = this.p.width / 2 - buttonWidth / 2;
      const buttonY = this.p.height * 0.7;

      // Vérifier si le clic est sur le bouton
      if (
        this.p.mouseX > buttonX &&
        this.p.mouseX < buttonX + buttonWidth &&
        this.p.mouseY > buttonY &&
        this.p.mouseY < buttonY + buttonHeight
      ) {
        // Retour au menu
        this.gameState = GameState.MENU;
        this.resetGame();
      }
    }
    // POUR LE BOUTON PAUSE - CORRECTION:
    else if (this.gameState === GameState.PLAYING || this.gameState === GameState.DEBUG_GAME) {
      // Vérifier le clic sur le bouton pause EN BAS À GAUCHE!!!
      const pauseBtnSize = 30;
      const pauseBtnX = 30; // Même position qu'au dessin
      const pauseBtnY = this.p.height - 30; // Même position qu'au dessin

      // Utiliser la même zone de détection que pour le dessin
      if (
        this.p.mouseX > pauseBtnX - pauseBtnSize/2 &&
        this.p.mouseX < pauseBtnX + pauseBtnSize/2 &&
        this.p.mouseY > pauseBtnY - pauseBtnSize/2 &&
        this.p.mouseY < pauseBtnY + pauseBtnSize/2
      ) {
        this.pauseGame();
        return;
      }

      // Si pas sur le bouton pause, passer l'événement au jeu
      if (!this.isTransitioning) {
        this.games[this.currentGameIndex].mousePressed();
      }
    }
    // POUR LE MENU DE PAUSE - CORRECTION:
    else if (this.gameState === GameState.PAUSED) {
      // LARGEURS DIFFÉRENCIÉES pour chaque bouton selon leur contenu!
      const resumeBtnWidth = 150;
      const menuBtnWidth = 200; // Plus large pour "MENU PRINCIPAL"
      const debugBtnWidth = 150;
      const btnHeight = 40;

      // Bouton reprendre
      const resumeBtnX = this.p.width / 2;
      const resumeBtnY = this.p.height / 2 - 30;

      // Vérifier si on clique sur le bouton REPRENDRE
      if (this.isMouseOverButton(resumeBtnX - resumeBtnWidth/2, resumeBtnY - btnHeight/2, resumeBtnWidth, btnHeight)) {
        this.resumeGame();
        return;
      }

      // Bouton MENU PRINCIPAL - PLUS LARGE!
      const menuBtnX = this.p.width / 2;
      const menuBtnY = this.p.height / 2 + 30;

      // Vérifier si on clique sur le bouton MENU PRINCIPAL
      if (this.isMouseOverButton(menuBtnX - menuBtnWidth/2, menuBtnY - btnHeight/2, menuBtnWidth, btnHeight)) {
        this.gameState = GameState.MENU;
        return;
      }

      // Bouton MENU DEBUG
      if (this.previousState === GameState.DEBUG_GAME) {
        const debugBtnX = this.p.width / 2;
        const debugBtnY = this.p.height / 2 + 90;

        // Vérifier si on clique sur le bouton MENU DEBUG
        if (this.isMouseOverButton(debugBtnX - debugBtnWidth/2, debugBtnY - btnHeight/2, debugBtnWidth, btnHeight)) {
          this.gameState = GameState.DEBUG_MENU;
          return;
        }
      }
    }
    else if (this.gameState === GameState.DEBUG_MENU) {
      const listX = 40;
      const listY = 100;
      const listWidth = this.p.width - 80;
      const listHeight = this.debugItemHeight * this.visibleItems;

      // Vérifier les clics sur les flèches de défilement
      if (this.debugMenuScroll > 0 &&
         this.isMouseOverButton(listX + listWidth/2 - 15, listY - 30, 30, 20)) {
        // Défilement vers le haut
        this.debugMenuScroll--;
        return;
      }

      const maxScroll = Math.max(0, this.games.length + 1 - this.visibleItems);
      if (this.debugMenuScroll < maxScroll &&
         this.isMouseOverButton(listX + listWidth/2 - 15, listY + listHeight + 10, 30, 20)) {
        // Défilement vers le bas
        this.debugMenuScroll++;
        return;
      }

      // Vérifier les clics sur les éléments visibles
      for (let i = 0; i < this.games.length + 1; i++) {
        const displayIndex = i - this.debugMenuScroll;

        if (displayIndex >= 0 && displayIndex < this.visibleItems) {
          const itemY = listY + displayIndex * this.debugItemHeight;

          if (this.p.mouseY > itemY &&
             this.p.mouseY < itemY + this.debugItemHeight &&
             this.p.mouseX > listX &&
             this.p.mouseX < listX + listWidth) {

            if (i < this.games.length) {
              // Lancer le jeu sélectionné
              this.currentGameIndex = i;
              this.games[this.currentGameIndex].reset();
              this.gameState = GameState.DEBUG_GAME;
            } else {
              // Retour au menu principal
              this.gameState = GameState.MENU;
            }
            return;
          }
        }
      }
    }
    else if (this.gameState === GameState.MENU) {
      // Vérifier le clic sur le bouton JOUER (avec les nouvelles coordonnées)
      const btnX = this.p.width / 2 - 75;
      const btnY = this.p.height / 2 + 20;
      const btnWidth = 150;
      const btnHeight = 50;

      if (this.isMouseOverButton(btnX, btnY, btnWidth, btnHeight)) {
        this.startGame();
        return;
      }

      // Vérifier le clic sur le bouton DEBUG (avec les nouvelles coordonnées)
      if (this.debugButtonVisible) {
        const debugBtnX = this.p.width - 75;
        const debugBtnY = this.p.height - 35;
        const debugBtnWidth = 65;
        const debugBtnHeight = 25;

        if (this.isMouseOverButton(debugBtnX, debugBtnY, debugBtnWidth, debugBtnHeight)) {
          this.enterDebugMode();
          return;
        }
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

    // Code existant pour le jeu normal
    if (this.gameState === GameState.PLAYING && !this.isTransitioning) {
      this.games[this.currentGameIndex].keyPressed();
    } else if (this.gameState === GameState.DEBUG_GAME) {
      // Supprimer la condition pour quitter avec 'Q', seul le menu pause est utilisé maintenant
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
    this.score = 0;
    this.lives = 3;
    this.currentGameIndex = 0;
    this.timer = 180;
    this.games[this.currentGameIndex].reset();
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

  // Ajouter la gestion de la molette de souris pour le défilement
  mouseWheel(event: WheelEvent): void {
    if (this.gameState === GameState.DEBUG_MENU) {
      // Pour un comportement cohérent, on inverse le signe car event.delta est positif
      // quand on défile vers le bas et négatif vers le haut, ce qui est contre-intuitif
      this.debugMenuScroll += Math.sign(event.delta);

      // Limiter les valeurs de scroll
      const maxScroll = Math.max(0, this.games.length + 1 - this.visibleItems);
      this.debugMenuScroll = this.p.constrain(this.debugMenuScroll, 0, maxScroll);

      // Empêcher le défilement de la page
      return false;
    }
    return true;
  }

  loadGames(): void {
    // Code existant...

    // Ajouter ceci après avoir instancié chaque jeu:
    // Exemple si tu as un tableau games qui stocke tes jeux
    this.games.forEach(game => {
      // Transmet l'état du mode debug à chaque jeu
      game.setDebugMode(this.isDebugMode);
    });

    // Ou lors de l'ajout d'un jeu spécifique:
    // const game = new SomeGame(this.p);
    // game.setDebugMode(this.isDebugMode);
    // this.games.push(game);
  }

  // Ajoute aussi cette méthode pour mettre à jour le mode debug
  // quand il change pendant l'exécution
  toggleDebug(): void {
    this.isDebugMode = !this.isDebugMode;
    console.log(`GameManager: Mode debug ${this.isDebugMode ? 'activé' : 'désactivé'}`);

    // Met à jour tous les jeux
    this.games.forEach(game => {
      game.setDebugMode(this.isDebugMode);
    });

    // S'assurer spécifiquement que le jeu actuel est mis à jour
    if (this.currentGameIndex >= 0 && this.currentGameIndex < this.games.length) {
      this.games[this.currentGameIndex].setDebugMode(this.isDebugMode);
    }
  }

  // Ajouter cette méthode pour un bouton plus élégant
  drawButton(x: number, y: number, width: number, height: number, text: string): boolean {
    const mouseOver =
      this.p.mouseX > x &&
      this.p.mouseX < x + width &&
      this.p.mouseY > y &&
      this.p.mouseY < y + height;

    // Ombre du bouton
    this.p.noStroke();
    this.p.fill(0, 0, 0, 100);
    this.p.rect(x + 5, y + 5, width, height, 8);

    // Corps du bouton avec dégradé
    this.p.fill(mouseOver ? 70 : 50, mouseOver ? 130 : 100, mouseOver ? 210 : 180);
    this.p.rect(x, y, width, height, 8);

    // Reflet sur le bouton
    this.p.fill(255, 255, 255, 50);
    this.p.rect(x, y, width, height / 2, 8, 8, 0, 0);

    // Texte du bouton
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(20);
    this.p.text(text, x + width / 2, y + height / 2);

    return mouseOver;
  }
}
