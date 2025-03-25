import "./style.css";
import p5 from "p5";
import { GameManager } from "./core/GameManager";
import { ClickCircleGame } from "./games/ClickCircle/ClickCircleGame";
import { AvoidObstacleGame } from "./games/AvoidObstacle/AvoidObstacleGame";
import { TimingGame } from "./games/Timing/TimingGame";

// Configuration de l'instance p5, enfin simplifiée
const sketch = (p: p5) => {
  let gameManager: GameManager;

  p.setup = () => {
    p.createCanvas(400, 400);

    // Création des jeux et du GameManager
    const games = [
      new ClickCircleGame(p),
      new AvoidObstacleGame(p),
      new TimingGame(p),
    ];

    gameManager = new GameManager(p, games);
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
    return false;
  };
};

// Lance ton chef-d'œuvre, mais organisé cette fois (◔_◔)
new p5(sketch);
