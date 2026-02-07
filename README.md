# 🛁 SPA Card Master Ultimate

[![HACS](https://img.shields.io/badge/HACS-Default-blue.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/github/v/release/xez7082/spa-card?include_prereleases)
[![License](https://img.shields.io/github/license/xez7082/spa-card)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/xez7082/spa-card/graphs/commit-activity)

**SPA Card Master** est la carte Lovelace la plus avancée pour Home Assistant, conçue spécifiquement pour les propriétaires de spas exigeants. Elle transforme vos données brutes en une interface **Glassmorphism** digne d'un yacht de luxe.

---

## 🖼️ Aperçu de l'interface

![Spa Preview](https://raw.githubusercontent.com/xez7082/lumina-spa-card/main/sparond2.png)
*[Exemple d'intégration avec fond personnalisé et monitoring chimique actif]*

---

## ✨ Fonctionnalités Exclusives

* 💎 **Effet Frosted Glass** : Utilisation de `backdrop-filter: blur` pour un rendu translucide premium.
* 🚨 **Colorimétrie Dynamique** : Système d'alerte visuelle intégré. Les chiffres deviennent **rouges** si le pH, l'ORP ou le Brome dérivent.
* 📏 **Éditeur "Pixel-Perfect"** : 6 onglets de configuration permettant de déplacer et redimensionner chaque bloc (X, Y, Largeur, Hauteur) directement via l'UI.
* 📱 **Optimisé Tablette (Fully Kiosk)** : Réglage de la hauteur en `% écran` (vh) pour un affichage plein écran sans scroll.
* ⚡ **Haute Performance** : Code optimisé pour limiter la charge CPU sur les tablettes d'entrée de gamme.
* 🎥 **Live Camera Feed** : Intégration transparente de votre flux caméra de surveillance.

---

## 🧪 Intelligence Chimique (Seuils)

La carte analyse vos `sensors` en temps réel et applique les styles suivants :

| Paramètre | Plage OK | Alerte (Rouge) |
| :--- | :--- | :--- |
| **pH** | `7.2` - `7.6` | `< 7.2` ou `> 7.6` |
| **ORP** | `> 650 mV` | `< 650 mV` |
| **Brome (Br)** | `3.0` - `5.0` | `< 3.0` ou `> 5.0` |

---

## 📦 Installation

### 1. Via HACS (Recommandé)
1. Dans Home Assistant, allez dans **HACS** -> **Frontend**.
2. Cliquez sur les **3 points (⋮)** -> **Dépôts personnalisés**.
3. Ajoutez `https://github.com/xez7082/spa-card` avec la catégorie **Lovelace**.
4. Cliquez sur **Installer**.

### 2. Installation Manuelle
1. Téléchargez le fichier `spa-card.js`.
2. Placez-le dans votre dossier `/config/www/`.
3. Ajoutez la ressource dans Home Assistant :
   * **Paramètres** -> **Tableaux de bord** -> **Ressources** -> `Ajouter /local/spa-card.js` (Type: JavaScript Module).

---

## 🧩 Guide de Configuration

L'éditeur visuel est divisé en **6 sections stratégiques** :

1.  **Général** : Image de fond (URL), alignement du titre et hauteur adaptative.
2.  **Boutons** : Configurez jusqu'à 8 commandes (Pompes, LED, Bulles).
3.  **Sondes** : Températures (Eau/Air) et chimie (pH, ORP, Br, TAC).
4.  **Système** : Jusqu'à 14 capteurs techniques (Watts, Ampères, TV, Alexa...).
5.  **Caméra** : Entité caméra et taille du flux.
6.  **Cibles** : Affichage optionnel du tableau de référence AquaChek.

---

## 🛠️ Dépannage (FAQ)

**Q : L'image de fond ne s'affiche pas ?** *R : Assurez-vous que l'image est dans `/config/www/` et utilisez l'URL `/local/votre_image.jpg`.*

**Q : La carte dépasse en bas de ma tablette ?** *R : Allez dans l'onglet **Général** de l'éditeur et baissez la valeur de **Hauteur Carte (% écran)**.*

**Q : Les couleurs d'alerte ne fonctionnent pas ?** *R : Vérifiez que vos entités retournent bien des valeurs numériques et non des textes.*

---

## 🔄 Mise à jour
Pour mettre à jour, utilisez simplement HACS. Si vous avez fait une installation manuelle, remplacez le fichier `.js` et forcez le rafraîchissement du cache navigateur (`Ctrl + F5`).

---

## 📜 Licence & Crédits
* **Auteur** : [xez7082](https://github.com/xez7082)
* **Licence** : MIT - Utilisation libre pour usage personnel.
* **Remerciements** : Inspiré par les designs futuristes de dashboards domotiques haut de gamme.

---
⭐ **Ce projet vous aide ? Donnez-lui une étoile sur GitHub !**
