🛁 Lumina Spa Card
Lumina Spa Card est une carte Lovelace premium pour Home Assistant, conçue pour transformer le monitoring de votre spa en une interface futuriste et intuitive. Surveillez la température, la chimie de l'eau et pilotez vos équipements avec style.

🖼️ Aperçu
✨ Fonctionnalités
💎 Design Glassmorphism : Interface translucide avec flou d'arrière-plan dynamique.

🌡️ Suivi Thermique : Affichage simultané de la température de l'eau et de l'air.

🧪 Analyse de l'eau : Monitoring complet du pH, ORP, Brome (Br) et Alcalinité (TAC).

⚡ Énergie & Système : Puissance (Watts), ampérage du SPA et de l'aspirateur.

🔘 Commandes Interactives : Boutons tactiles pour les bulles, la filtration et l'éclairage LED.

📺 Indicateurs Multimédia : Icônes d'état pour TV et Alexa intégrées.

📊 Tableau de Référence : Rappel des seuils idéaux AquaChek pour un équilibre parfait.

⚙️ Éditeur Visuel Avancé : Configuration simplifiée par onglets avec réglage précis des positions (X/Y %) pour chaque bloc.

📦 Installation
Via HACS (Recommandé)
Ouvrez HACS → Frontend → Menu (⋮) → Dépôts personnalisés.

Ajoutez l'URL de ce dépôt : https://github.com/xez7082/lumina-spa-card.

Sélectionnez le type Lovelace.

Cliquez sur Installer.

Rafraîchissez votre navigateur (Ctrl + F5).

🧩 Configuration
La carte dispose d'un éditeur visuel complet (UI), vous n'avez normalement pas besoin de modifier le YAML manuellement.

Exemple de configuration YAML
YAML
type: custom:lumina-spa-card
card_title: "Mon Spa"
background_image: "/local/sparond2.jpg"
entity_water_temp: sensor.spa_temperature_eau
entity_ph: sensor.spa_ph
entity_orp: sensor.spa_orp
switch_bubbles: switch.spa_bulles
switch_filter: switch.spa_filtration
switch_light: switch.spa_led
pos_temp_x: 5
pos_temp_y: 10
📜 Licence
Ce projet est sous licence MIT - voir le fichier LICENSE
 pour plus de détails.

Copyright (c) 2026 xez7082
