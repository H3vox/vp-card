// Créer une classe pour la carte personnalisée
class FileExplorerCard {

    // Constructeur de la classe
    constructor(config) {
      this.config = config;
  
      // Récupérer l'entité sensor
      this.entity = config.entity;
  
      // Initialiser les variables
      this.files = [];
      this.currentFolder = null;
  
      // Charger les fichiers au démarrage
      this.loadFiles();
    }
  
    // Fonction pour charger les fichiers
    async loadFiles() {
      const files = await this.getFiles(this.entity);
      this.files = files;
      this.updateCard();
    }
  
    // Fonction pour obtenir les fichiers d'un dossier
    async getFiles(path) {
      const response = await HA.api.callService('file', 'list', { path });
      const files = response.data.files;
      return files;
    }
  
    // Fonction pour trier les sous-dossiers et les fichiers
    sortFiles(files) {
      // Trier les sous-dossiers par date de création (nom de format 'jj-mm-aaaa')
      files.sort((a, b) => {
        const dateA = new Date(a.name.split('-')[0], a.name.split('-')[1] - 1, a.name.split('-')[2]);
        const dateB = new Date(b.name.split('-')[0], b.name.split('-')[1] - 1, b.name.split('-')[2]);
        return dateB.getTime() - dateA.getTime();
      });
  
      // Trier les fichiers par heure de création (nom de format 'hh-mm-ss.mp4')
      files.forEach(file => {
        if (file.type === 'file' && file.name.endsWith('.mp4')) {
          file.name = file.name.slice(0, -6); // Supprimer l'extension .mp4
          const time = parseInt(file.name);
          file.name = time; // Convertir le nom en timestamp
        }
      });
      files.sort((a, b) => {
        return a.name - b.name;
      });
    }
  
    // Fonction pour mettre à jour la carte
    updateCard() {
      // Trier les fichiers
      this.sortFiles(this.files);
  
      // Générer le contenu HTML de la carte
      let html = '';
  
      // Afficher le dossier actuel
      if (this.currentFolder) {
        html += `<h4>Dossier actuel : ${this.currentFolder}</h4>`;
      }
  
      // Afficher les sous-dossiers
      this.files.filter(file => file.type === 'dir').forEach(folder => {
        html += `<li class="folder" data-path="<span class="math-inline">\{folder\.name\}"\></span>{folder.name}</li>`;
      });
  
      // Afficher les fichiers
      this.files.filter(file => file.type === 'file' && file.name.endsWith('.mp4')).forEach(file => {
        const filename = file.name.slice(0, -6); // Supprimer l'extension .mp4
        const timestamp = new Date(file.name * 1000); // Convertir le timestamp en objet Date
        html += `<li class="file" data-path="<span class="math-inline">\{file\.name\}"\></span>{filename} (${timestamp.toLocaleTimeString()})</li>`;
      });
  
      // Configurer le contenu de la carte
      const cardConfig = {
        type: 'custom:file-explorer-card',
        entity: this.entity,
        html: html,
      };
  
      // Mettre à jour la carte
      this.setConfig(cardConfig);
    }
  
    // Fonction pour gérer les clics sur les éléments de la carte
    handleClick(event) {
      const path = event.target.dataset.path;
  
      // Si l'élément cliqué est un sous-dossier, afficher son contenu
      if (event.target.classList.contains('folder')) {
        this.currentFolder = path;
        this.loadFiles();
      }
  
      // Si l'élément cliqué est un fichier, lire le fichier vidéo
      if (event.target.classList.contains('file')) {
        // Code pour lire le fichier vidéo (à implémenter)
        console.log(`Lecture du fichier vidéo : ${path}`);
      }
    }
  
    // Fonction pour initialiser la carte
  setConfig(config) {
    this.config = config;
    const node = document.querySelector(`[type="custom:file-explorer-card"][entity="${this.entity}"]`);
    if (node) {
      node.innerHTML = config.html;
      node.addEventListener('click', this.handleClick.bind(this));
    }
  }

  // Fonction d'initialisation de la carte (à appeler dans le code Lovelace)
  static async init(config) {
    const card = new FileExplorerCard(config);
    return card;
  }
}

customElements.define('file-explorer-card', FileExplorerCard);
