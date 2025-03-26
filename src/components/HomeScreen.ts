draw(): void {
  // SAUVEGARDER l'état graphique au début
  this.p.push();

  // Toujours commencer par définir le mode par défaut
  this.p.imageMode(this.p.CORNER);

  // Dessiner le fond d'écran
  if (this.backgroundImage) {
    this.p.image(this.backgroundImage, 0, 0, this.p.width, this.p.height);
  } else {
    // Fallback avec un dégradé
    this.p.background(30, 30, 40);
  }

  // Si besoin de changer pour le mode CENTER pour d'autres éléments
  this.p.imageMode(this.p.CENTER);

  // ... autres éléments centrés ...

  // RESTAURER l'état à la fin (pas besoin de reset manuellement)
  this.p.pop();
}
