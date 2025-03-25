// Fonction utilitaire pour charger les assets statiques avec Vite
export function getAssetUrl(path: string): string {
  return new URL(`../assets/${path}`, import.meta.url).href;
}

// Pour charger tous les assets d'un jeu en une fois
export function getGameAssets(gameName: string): Record<string, string> {
  const assets: Record<string, string> = {};

  try {
    // Fonction qui charge dynamiquement tous les assets d'un jeu
    const gameAssets = import.meta.glob('../games/*/assets/**/*.*', { eager: true });

    // Filtre pour ne garder que les assets du jeu spécifié
    Object.entries(gameAssets).forEach(([path, module]) => {
      if (path.includes(`/${gameName}/assets/`)) {
        // Extrait le nom du fichier sans chemin
        const fileName = path.split('/').pop() || '';
        // Stocke l'URL de l'asset avec le nom de fichier comme clé
        assets[fileName] = (module as any).default;
      }
    });
  } catch (error) {
    console.error(`Erreur lors du chargement des assets pour ${gameName}:`, error);
  }

  return assets;
}
