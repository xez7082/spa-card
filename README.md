# 🛁 Lumina Spa Card

[![HACS](https://img.shields.io/badge/HACS-Default-blue.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/github/v/release/xez7082/lumina-spa-card?include_prereleases)
![License](https://img.shields.io/github/license/xez7082/lumina-spa-card)

**Lumina Spa Card** est une carte Lovelace premium pour Home Assistant, conçue pour transformer le monitoring de votre spa en une interface futuriste et intuitive. Surveillez la température, la chimie de l'eau et pilotez vos équipements avec style.

---

## 🖼️ Aperçu

![Lumina Spa Preview](https://raw.githubusercontent.com/xez7082/lumina-spa-card/main/sparond2.png)

---

## ✨ Fonctionnalités

* 💎 **Design Glassmorphism** : Interface translucide avec effet de flou arrière-plan (backdrop-filter).
* 🌡️ **Double Température** : Suivi en temps réel de la température de l'eau et de l'air ambiant.
* 🧪 **Analyse de l'eau** : Monitoring complet du pH, ORP, Brome (Br) et Alcalinité (TAC).
* ⚡ **Énergie & Système** : Puissance (Watts), ampérage du SPA et de l'**aspirateur**.
* 🔘 **Commandes Interactives** : Boutons tactiles pour les bulles, la filtration et l'éclairage **LED**.
* 📺 **Indicateurs Multimédia** : Statut d'activation pour TV et Alexa intégré.
* 📊 **Tableau de Référence** : Rappel des seuils idéaux AquaChek directement sur la carte.
* ⚙️ **Éditeur Visuel Avancé** : Configuration simplifiée par onglets avec réglage précis des positions (X/Y %) pour chaque bloc de données.

---

## 📦 Installation

### Via HACS (Recommandé)
1. Ouvrez **HACS** → **Frontend** → **Menu (⋮)** → **Dépôts personnalisés**.
2. Ajoutez l'URL de ce dépôt : `https://github.com/xez7082/lumina-spa-card`.
3. Sélectionnez le type **Lovelace**.
4. Cliquez sur **Installer**.
5. Rafraîchissez votre navigateur (**Ctrl + F5**).

---

## 🧩 Configuration

La carte dispose d'un **éditeur visuel complet** (UI) intégré à Home Assistant. Vous n'avez normalement pas besoin de modifier le YAML manuellement.

### Exemple de configuration YAML
```yaml
type: custom:lumina-spa-card
card_title: "Mon Spa"
background_image: "/local/sparond2.jpg"
entity_water_temp: sensor.spa_water_temperature
entity_ph: sensor.spa_ph
entity_orp: sensor.spa_orp
switch_bubbles: switch.spa_bubbles
switch_filter: switch.spa_filter
switch_light: switch.spa_light
pos_temp_x: 5
pos_temp_y: 10
