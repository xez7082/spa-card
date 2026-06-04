# 🛁 Spa Card - Home Assistant

> Une carte de contrôle moderne et élégante pour votre spa LayZSpa dans Home Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Home%20Assistant-2024+-blue?style=flat-square&logo=home-assistant" alt="Home Assistant">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT">
  <img src="https://img.shields.io/badge/Maintenance-Active-brightgreen?style=flat-square" alt="Maintenance">
</p>

---

## ✨ Caractéristiques principales

### 🌡️ Gestion thermique complète
- **Contrôle en temps réel** de la température de l'eau
- **Programmation intelligente** du chauffage avec estimation du temps
- **Consignes de température** ajustables (min/max)
- Affichage de la température extérieure et de l'air du spa

### 🧪 Suivi chimique avancé
- Monitoring du **pH, ORP, TDS** et du niveau de **sel**
- Plages de normalité configurables
- Alertes visuelles claires

### 🔧 Maintenance simplifiée
- **Suivi du filtre** : âge, alertes de changement, réinitialisation
- **Gestion du chlore** : âge, alertes de renouvellement
- **Consommation énergétique** en direct (W/kWh)
- Boutons de reset d'une simple pression

### 📷 Caméra intégrée
- Flux vidéo en direct depuis votre spa
- Mode plein écran disponible
- Contrôle d'offset (X, Y) et d'arrondi des coins

### 💧 Sécurité
- **Détecteur de fuite d'eau** en temps réel
- **Alerte sabotage** (tamper alert)
- Monitoring batterie du capteur
- Indicateur visuel avec animation d'alerte

### ⚡ Contrôles complets
- **6 interrupteurs programmables** : pompe, jets, bulles, chauffage, alimentation, verrouillage
- États visuels en direct
- Boutons d'action rapide intégrés

### 🎨 Design premium
- Interface glassmorphism moderne
- Arrière-plan personnalisable avec flou dynamique
- Responsive et adaptatif
- Thème sombre optimisé

---

| Général | Programmation | Chimie | Caméra | Interrupteurs |
| :---: | :---: | :---: | :---: | :---: |
| ![Général](https://github.com/xez7082/spa-card/blob/main/Img/spa.png?raw=true) | ![Programmation](https://github.com/xez7082/spa-card/blob/main/Img/spa1.png?raw=true) | ![Chimie](https://github.com/xez7082/spa-card/blob/main/Img/spa2.png?raw=true) | ![Caméra](Capture%20d'écran%202026-06-04%20081616.jpg) | ![Interrupteurs](Capture%20d'écran%202026-06-04%20081657.jpg) |


## 🚀 Installation rapide

### 1️⃣ Téléchargez le fichier

```bash
# Créez le dossier
mkdir -p /config/www/spa-card

# Téléchargez le fichier
cd /config/www/spa-card
wget https://raw.githubusercontent.com/xez7082/spa-card/main/spa-card.js
```

### 2️⃣ Ajoutez à Home Assistant

Dans votre tableau de bord Home Assistant, ajoutez la ressource :

**Via l'interface** → Menu (⋮) → Éditer le tableau de bord → Ressources :
```yaml
- url: /local/spa-card/spa-card.js
  type: module
```

### 3️⃣ Créez votre carte

**Ajouter une carte** → Personnalisée → `spa-card`

---

## ⚙️ Configuration complète

```yaml
type: custom:spa-card

# 🎨 Apparence générale
card_title: "MY LAYZSPA"
card_height: "640px"              # Hauteur (défaut: 640px)
blur_amount: 15                   # Flou du fond (0-30)
background_image: ""              # URL image de fond (optionnel)

# 🌡️ Gestion température
entity_water_temp: "sensor.layzspa_temp_c"
entity_target_temp: "climate.layzspa_temperature_control"
target_temp_min: 20
target_temp_max: 40

# 🌡️ Températures complémentaires
entity_ext_temp: "sensor.outdoor_temp"        # Optionnel
entity_ext_hum: "sensor.outdoor_humidity"     # Optionnel
entity_spa_air_temp: "sensor.spa_air_temp"    # Optionnel
entity_spa_hum: "sensor.spa_humidity"         # Optionnel

# 🔋 État du spa
entity_lz_ready: "binary_sensor.layzspa_ready"
entity_lz_heater: "binary_sensor.layzspa_heater"

# 📐 Paramètres calcul chauffage
lz_volume: 500                    # Volume en litres
lz_power_w: 1942                  # Puissance en watts
lz_heat_loss: 30                  # Perte thermique (%)

# 🔧 Maintenance filtre
entity_lz_filter: "sensor.layzspa_filter_age"
entity_lz_reset_filter: "button.layzspa_reset_filter_change_timer"
lz_filter_max: 60                 # Durée max filtre (jours)

# 🧴 Maintenance chlore
entity_lz_chlorine: "sensor.layzspa_chlorine_age"
entity_lz_reset_chlore: "button.layzspa_reset_chlorine_timer"
lz_chlorine_max: 14               # Durée max chlore (jours)

# 🧪 Chimie - pH
entity_ph: "sensor.layzspa_ph"
ph_min: 7.2
ph_max: 7.6

# 🧪 Chimie - ORP
entity_orp: "sensor.layzspa_orp"
orp_min: 650
orp_max: 800

# 🧪 Chimie - TDS
entity_tds: "sensor.layzspa_tds"
tds_min: 500
tds_max: 1500

# 🧪 Chimie - Sel
entity_salt: "sensor.layzspa_salt"
salt_min: 2500
salt_max: 3500

# ⚙️ Interrupteur 1 - Pompe
switch_1: "switch.layzspa_pump"
name_switch_1: "Pompe"

# ⚙️ Interrupteur 2 - Jets
switch_2: "switch.layzspa_jets"
name_switch_2: "Jets"

# ⚙️ Interrupteur 3 - Bulles
switch_3: "switch.layzspa_airbubbles"
name_switch_3: "Bulles"

# ⚙️ Interrupteur 4 - Chauffage
switch_4: "switch.layzspa_heat_regulation"
name_switch_4: "Chauffe"

# ⚙️ Interrupteur 5 - Alimentation
switch_5: "switch.layzspa_power_switch"
name_switch_5: "Alimentation"

# ⚙️ Interrupteur 6 - Verrouillage
switch_6: "switch.layzspa_lock"
name_switch_6: "Verrouillage"

# 🎥 Caméra
entity_camera: "camera.spa_rtsp"
cam_w_px: 280                     # Largeur (défaut: 100%)
cam_h_px: 210                     # Hauteur (défaut: 210px)
cam_radius: 12                    # Arrondi des coins (px)
cam_x: 0                          # Décalage horizontal (px)
cam_y: 0                          # Décalage vertical (px)

# 📅 Programmation
entity_lz_schedule: "input_datetime.spa_ready_at"

# ⚡ Consommation énergétique
entity_lz_energy: "sensor.layzspa_energy"
main_cons_entity: "sensor.layzspa_power"
entity_lz_rssi: "sensor.layzspa_rssi"

# 🚨 Sécurité - Détecteurs d'inondation
entity_water_leak: "binary_sensor.innondation_spa_water_leak"
entity_tamper: "binary_sensor.innondation_spa_tamper"
entity_flood_bat: "sensor.innondation_spa_battery"
```

---

## 🎯 5 Onglets du menu

| Onglet | Icône | Contenu |
|--------|-------|---------|
| **Général** | 🏠 | Température, Thermostat, Maintenance, Sécurit�� |
| **Programmation** | 📅 | Planification de l'activation du chauffage |
| **Chimie** | ⚗️ | pH, ORP, TDS, Sel avec plages d'alerte |
| **Caméra** | 🎥 | Flux vidéo en direct + Mode plein écran |
| **Interrupteurs** | ⚙️ | Contrôle des 6 commandes principales |

---

## 📱 Responsive Design

- ✅ **Desktop** : Affichage complet avec tous les détails
- ✅ **Tablette** : Optimisé pour portrait et paysage
- ✅ **Mobile** : Menu compressé, scroll vertical, tactile

---

## 🧩 Entités LayZSpa requises

Assurez-vous que votre intégration **LayZSpa** fournit ces entités :

| Entité | Type | Description |
|--------|------|-------------|
| `sensor.layzspa_temp_c` | Capteur | Température de l'eau actuelle |
| `climate.layzspa_temperature_control` | Climate | Contrôle température cible |
| `binary_sensor.layzspa_ready` | Binary | État prêt du spa |
| `binary_sensor.layzspa_heater` | Binary | État du chauffeur |
| `sensor.layzspa_filter_age` | Capteur | Âge du filtre (jours) |
| `sensor.layzspa_chlorine_age` | Capteur | Âge du chlore (jours) |
| `sensor.layzspa_ph` | Capteur | Valeur pH |
| `sensor.layzspa_orp` | Capteur | Valeur ORP (oxydation) |
| `sensor.layzspa_tds` | Capteur | Valeur TDS (minéralité) |
| `sensor.layzspa_salt` | Capteur | Niveau de sel |
| `sensor.layzspa_power` | Capteur | Puissance instantanée (W) |
| `sensor.layzspa_energy` | Capteur | Énergie totale (kWh) |

---

## 🎨 Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans le fichier `spa-card.js` section `static styles` :
```css
:host {
  --glass-border: rgba(255,255,255,0.12);
  --txt-p: #ffffff;
  --txt-s: rgba(255,255,255,0.65);
}
```

### Ajouter une image de fond
```yaml
background_image: "https://votre-image.jpg"
blur_amount: 20  # Plus de flou = moins visible l'image
```

---

## 🐛 Dépannage

### ❌ La carte ne s'affiche pas
1. Vérifiez le chemin du fichier : `/config/www/spa-card/spa-card.js`
2. Videz le cache du navigateur (Ctrl+Shift+Del)
3. Redémarrez Home Assistant
4. Vérifiez la console du navigateur (F12) pour les erreurs

### ❌ Les entités ne remontent pas
1. Vérifiez que l'intégration LayZSpa est bien installée
2. Confirmer les IDs des entités correspondent exactement
3. Testez chaque entité individuellement dans Home Assistant

### ❌ Caméra ne s'affiche pas
1. Vérifiez que `entity_camera` existe et fonctionne
2. Testez le flux vidéo directement dans HA
3. Vérifiez les permissions d'accès à la caméra

### ❌ Performance lente
1. Réduisez le nombre de capteurs affichés
2. Augmentez l'intervalle de rafraîchissement dans HA
3. Videz le cache du navigateur

---

## 💡 Conseils & Astuces

✨ **Pour une meilleure expérience :**
- Configurez **tous les capteurs** LayZSpa avant d'ajouter la carte
- Utilisez des **noms courts** pour les entités
- Testez la **caméra** séparément avant intégration
- Adaptez les **seuils chimiques** à votre spa
- Sauvegardez votre configuration dans **GitHub** 🚀

---

## 📄 Fichiers du projet

```
spa-card/
├── spa-card.js          # Composant principal
├── README.md            # Cette documentation
└── LICENSE              # Licence MIT
```

---

## 🤝 Contributions

Les contributions sont bienvenues !
- 🐛 Signalez les bugs via **Issues**
- 💡 Proposez des améliorations via **Discussions**
- 🔧 Soumettez du code via **Pull Requests**

---

## 📄 Licence

**MIT License** - Libre d'utilisation et de modification

Créé avec ❤️ pour la communauté Home Assistant

---

## 🙏 Crédits

- **Home Assistant** : https://www.home-assistant.io
- **Lit Element** : https://lit.dev
- **LayZSpa Integration** : https://github.com/spaceman006/layzspa

---

**Profitez de votre spa ! 🏊‍♂️🧖‍♀️**
