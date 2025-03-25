import { ClickCircleGame } from "./ClickCircle/ClickCircleGame";
import { AvoidObstacleGame } from "./AvoidObstacle/AvoidObstacleGame";
import { FingerNoseGame } from "./FingerNose/FingerNoseGame";
import { LickFeetGame } from "./LickFeet/LickFeetGame";
import { BackPopperGame } from "./BackPopper/BackPopperGame";
import { CatchPoopGame } from "./CatchPoop/CatchPoopGame";

export const GAMES = {
  ClickCircle: ClickCircleGame,
  AvoidObstacle: AvoidObstacleGame,
  FingerNose: FingerNoseGame,
  LickFeet: LickFeetGame,
  BackPopper: BackPopperGame,
  CatchPoop: CatchPoopGame
};

// Type pour tester l'exhaustivité
type GameKey = keyof typeof GAMES;

// Pour sélectionner un jeu aléatoire
export function getRandomGame(): GameKey {
  const gameKeys = Object.keys(GAMES) as GameKey[];
  const randomIndex = Math.floor(Math.random() * gameKeys.length);
  return gameKeys[randomIndex];
}
