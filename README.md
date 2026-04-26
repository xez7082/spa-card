# Spa Master Card - Luxury Edition

Une carte Home Assistant avancée et ultra-design pour le pilotage complet de votre SPA. Elle utilise un style **Glassmorphism** (effet de verre dépoli) avec des animations fluides et une interface tactile optimisée.

![Aperçu Principal](https://raw.githubusercontent.com/xez7082/solar-master-card/main/img/spa10.png)

---

## ✨ Caractéristiques

* **Design Premium** : Interface basée sur le Glassmorphism avec flou d'arrière-plan (`backdrop-filter`) et typographie aérienne.
* **Tableau de Bord Central** : Visualisation immédiate de la température de l'eau (avec anneau animé), des températures extérieures/intérieures et de l'humidité.
* **Monitoring Énergétique** : Affichage en temps réel de la consommation électrique sous forme de badge néon pulsant.
* **Suivi Chimique Complet** : Onglet dédié pour le pH, ORP, TDS, Sel, Conductivité et humidité de la sonde avec alertes visuelles de dépassement.
* **Gestion des Équipements** : Jusqu'à 10 boutons configurables pour les pompes, bulles, éclairages, etc.
* **Vidéo-surveillance** : Intégration de flux caméra avec réglage dynamique de la largeur et de la hauteur.
* **Éditeur Visuel** : Configuration simplifiée via l'interface Home Assistant (aucun code YAML requis pour l'usage quotidien).

---

## 📸 Captures d'écran

### 🏠 Vue Principale & 📷 Vidéosurveillance
| Accueil (Gauges & Météo) | Surveillance Caméra |
| :---: | :---: |
| ![Accueil](https://raw.githubusercontent.com/xez7082/solar-master-card/main/img/spa10.png) | ![Caméra](https://raw.githubusercontent.com/xez7082/solar-master-card/main/img/spa11.png) |

### ⚗️ Analyse Chimique & ⚡ Contrôles
| Monitoring Qualité Eau | Panneau de Contrôle (10 boutons) |
| :---: | :---: |
| ![Chimie](https://raw.githubusercontent.com/xez7082/solar-master-card/main/img/spa12.png) | ![Contrôles](https://raw.githubusercontent.com/xez7082/solar-master-card/main/img/spa13.png) |

---

## 🚀 Installation

1.  **Téléchargement** : Téléchargez le fichier `spa-card.js` présent sur ce dépôt.
2.  **Copie** : Placez le fichier dans votre dossier `www` de Home Assistant (généralement `/config/www/spa-card.js`).
3.  **Déclaration de la Ressource** :
    * Allez dans **Paramètres** -> **Tableaux de bord**.
    * Cliquez sur les trois points (en haut à droite) -> **Ressources**.
    * Ajoutez une ressource avec l'URL : `/local/spa-card.js` et sélectionnez **Module JavaScript**.
4.  **Ajout de la Carte** :
    * Sur votre tableau de bord, passez en mode édition.
    * Ajoutez une carte et cherchez **Spa Master V27** dans la liste.

---

## ⚙️ Configuration

La carte possède un éditeur visuel intégré divisé en onglets pour une configuration intuitive :

1.  **Général** : Titre personnalisé, image de fond (URL ou `/local/...`) et hauteur globale de la carte.
2.  **Capteurs** : Liaison des entités de température (Eau, Air, Ext), humidité et capteur de puissance.
3.  **Chimie** : Liaison des entités de monitoring chimique et définition des seuils **Min** et **Max** pour déclencher les alertes visuelles.
4.  **Caméra** : Liaison de l'entité caméra et ajustement précis de la taille de l'image (Largeur/Hauteur).
5.  **Boutons** : Configuration des 10 switchs, des icônes dynamiques et des étiquettes de texte.

---

## 🎨 Personnalisation Graphique

Pour une immersion totale, il est recommandé d'utiliser une photo réelle de votre spa en fond :
* Uploadez votre image dans `/config/www/mon_spa.jpg`.
* Dans l'éditeur de la carte, mettez `/local/mon_spa.jpg` dans le champ **Background Image**.

---
*Projet maintenu par [xez7082](https://github.com/xez7082). N'hésitez pas à ouvrir une issue pour toute suggestion !*
