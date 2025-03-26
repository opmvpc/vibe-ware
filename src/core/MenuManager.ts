draw(): void {
  // SAUVEGARDER l'état au début
  this.p.push();

  // Fond
  this.p.imageMode(this.p.CORNER);
  this.p.image(this.backgroundImage, 0, 0, this.p.width, this.p.height);

  // Éléments de UI
  this.p.imageMode(this.p.CENTER);
  // ... boutons et autres éléments centrés ...

  // RESTAURER l'état à la fin
  this.p.pop();
}
