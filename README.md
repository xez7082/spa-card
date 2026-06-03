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
- Historique et tendances des paramètres
- Alertes de dérive chimique

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

Dans votre fichier **`ui-lovelace.yaml`** ou directement via l'interface :

```yaml
resources:
  - url: /local/spa-card/spa-card.js
    type: module
```

### 3️⃣ Configurez votre carte

```yaml
type: custom:spa-card
card_title: "Mon Spa"
background_image: "https://votre-image.jpg"
blur_amount: 15
card_height: "680px"

# 🌡️ Températures
entity_water_temp: sensor.layzspa_temp_c
entity_target_temp: climate.layzspa_temperature_control
target_temp_min: 20
target_temp_max: 40
entity_ext_temp: sensor.outdoor_temp
entity_spa_air_temp: sensor.spa_air_temp

# 🧪 Chimie
entity_ph: sensor.layzspa_ph
entity_orp: sensor.layzspa_orp
entity_tds: sensor.layzspa_tds

# 🔧 Maintenance
entity_lz_filter: sensor.layzspa_filter_age
lz_filter_max: 60
entity_lz_reset_filter: button.layzspa_reset_filter_change_timer
entity_lz_chlorine: sensor.layzspa_chlorine_age
lz_chlorine_max: 14
entity_lz_reset_chlore: button.layzspa_reset_chlorine_timer

# ⚡ Énergie
entity_lz_energy: sensor.layzspa_energy
main_cons_entity: sensor.layzspa_power

# 💧 Sécurité
entity_water_leak: binary_sensor.innondation_spa_water_leak
entity_tamper: binary_sensor.innondation_spa_tamper
entity_flood_bat: sensor.innondation_spa_battery

# 📷 Caméra
entity_camera: camera.spa_camera
cam_w_px: 300
cam_h_px: 200
cam_radius: 12
cam_x: 0
cam_y: 0

# 🔘 Interrupteurs (jusqu'à 6)
switch_1: switch.layzspa_pump
name_switch_1: "Pompe"
switch_2: switch.layzspa_jets
name_switch_2: "Jets"
switch_3: switch.layzspa_airbubbles
name_switch_3: "Bulles"
switch_4: switch.layzspa_heat_regulation
name_switch_4: "Chauffage"
switch_5: switch.layzspa_power_switch
name_switch_5: "Alimentation"
switch_6: switch.layzspa_lock
name_switch_6: "Verrouillage"
```

---

## 📋 Configuration complète des entités

### 🌡️ Température
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_water_temp` | `sensor` | Température actuelle de l'eau |
| `entity_target_temp` | `climate` ou `input_number` | Température cible |
| `target_temp_min` | `number` | Température minimale (°C) |
| `target_temp_max` | `number` | Température maximale (°C) |
| `entity_ext_temp` | `sensor` | Température extérieure |
| `entity_spa_air_temp` | `sensor` | Température de l'air dans le spa |

### 🧪 Chimie
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_ph` | `sensor` | Valeur pH |
| `entity_orp` | `sensor` | Valeur ORP (potentiel redox) |
| `entity_tds` | `sensor` | TDS (solides dissous totaux) |

### 🛁 État du spa (LayZSpa)
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_lz_ready` | `binary_sensor` | Spa prêt/pas prêt |
| `entity_lz_heater` | `binary_sensor` | Chauffage actif/inactif |
| `lz_volume` | `number` | Volume eau (litres) |
| `lz_power_w` | `number` | Puissance chauffe (W) |
| `lz_heat_loss` | `number` | Pertes thermiques (%) |

### 🔧 Maintenance
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_lz_filter` | `sensor` | Âge du filtre (jours) |
| `lz_filter_max` | `number` | Alerte filtre après (jours) |
| `entity_lz_reset_filter` | `button` | Bouton reset filtre |
| `entity_lz_chlorine` | `sensor` | Âge du chlore (jours) |
| `lz_chlorine_max` | `number` | Alerte chlore après (jours) |
| `entity_lz_reset_chlore` | `button` | Bouton reset chlore |
| `entity_lz_energy` | `sensor` | Énergie totale (kWh) |
| `entity_lz_rssi` | `sensor` | Signal WiFi (RSSI) |

### 💧 Sécurité
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_water_leak` | `binary_sensor` | Détecteur de fuite |
| `entity_tamper` | `binary_sensor` | Alerte sabotage |
| `entity_flood_bat` | `sensor` | Batterie du capteur (%) |

### 📷 Caméra
| Paramètre | Type | Description |
|-----------|------|-------------|
| `entity_camera` | `camera` | Entité caméra |
| `cam_w_px` | `number` | Largeur (px) |
| `cam_h_px` | `number` | Hauteur (px) |
| `cam_radius` | `number` | Arrondi des coins (px) |
| `cam_x` | `number` | Décalage horizontal (px) |
| `cam_y` | `number` | Décalage vertical (px) |

---

## 🎨 Personnalisation

### Modifier l'apparence
```yaml
# Image de fond
background_image: "https://example.com/spa-bg.jpg"

# Intensité du flou (0-25px)
blur_amount: 12

# Hauteur de la carte
card_height: "680px"

# Titre personnalisé
card_title: "🛁 Mon Magnifique Spa"
```

### Exemple d'intégration minimale
```yaml
type: custom:spa-card
card_title: "Spa"
entity_water_temp: sensor.spa_temperature
entity_target_temp: climate.spa_heater
entity_camera: camera.spa
```

---

## 🔥 Cas d'usage courants

### 💡 Alertes intelligentes
Configurez des automatisations basées sur la température :
```yaml
automation:
  - alias: "Spa trop chaud"
    trigger:
      platform: numeric_state
      entity_id: sensor.spa_temp
      above: 40
    action:
      service: notify.mobile_app_phone
      data:
        message: "Attention : Spa à {{ states('sensor.spa_temp') }}°C"
```

### 📊 Historiques et graphiques
Utilisez History Stats pour tracker les usages :
```yaml
template:
  - sensor:
      - name: "Spa - Heures chauffe/jour"
        unique_id: spa_heating_hours
        unit_of_measurement: "h"
```

### 🏠 Scènes de contrôle
```yaml
scene:
  - name: "Spa Détente"
    entities:
      switch.spa_pump: "on"
      switch.spa_jets: "on"
      climate.spa_heater:
        temperature: 38
```

---

## 🛠️ Troubleshooting

### La carte n'apparaît pas
- Vérifiez que le fichier est dans `/config/www/spa-card/`
- Redémarrez Home Assistant
- Videz le cache du navigateur (Ctrl+Shift+Del)

### Entités manquantes
- Assurez-vous que toutes les entités existent dans Home Assistant
- Utilisez l'éditeur visuel pour les selectionner automatiquement

### Erreurs de console
Ouvrez les outils de développement (F12) et vérifiez que :
- Les imports Lit Element chargent correctement
- Pas d'erreurs CORS

---

## 📝 Exemple de configuration complète

```yaml
type: custom:spa-card
card_title: "🛁 SPA LAYZSPA"
background_image: "https://example.com/spa-banner.jpg"
blur_amount: 15
card_height: "700px"

# 🌡️ Température
entity_water_temp: sensor.layzspa_temp_c
entity_target_temp: climate.layzspa_temperature_control
target_temp_min: 20
target_temp_max: 40
entity_ext_temp: sensor.outdoor_temperature
entity_spa_air_temp: sensor.spa_air_temperature
entity_ext_hum: sensor.outdoor_humidity
entity_spa_hum: sensor.spa_humidity

# 🧪 Chimie
entity_ph: sensor.spa_ph
entity_orp: sensor.spa_orp
entity_tds: sensor.spa_tds

# 🛁 État
entity_lz_ready: binary_sensor.layzspa_ready
entity_lz_heater: binary_sensor.layzspa_heater
lz_volume: 500
lz_power_w: 1942
lz_heat_loss: 30

# 🔧 Maintenance
entity_lz_filter: sensor.layzspa_filter_age
lz_filter_max: 60
entity_lz_reset_filter: button.layzspa_reset_filter
entity_lz_chlorine: sensor.layzspa_chlorine_age
lz_chlorine_max: 14
entity_lz_reset_chlore: button.layzspa_reset_chlorine
entity_lz_energy: sensor.layzspa_energy_kwh
entity_lz_rssi: sensor.layzspa_rssi
main_cons_entity: sensor.layzspa_power

# 💧 Sécurité
entity_water_leak: binary_sensor.flood_sensor_water_leak
entity_tamper: binary_sensor.flood_sensor_tamper
entity_flood_bat: sensor.flood_sensor_battery

# 📷 Caméra
entity_camera: camera.spa_video_feed
cam_w_px: 320
cam_h_px: 240
cam_radius: 12

# 🔘 Interrupteurs
switch_1: switch.layzspa_pump
name_switch_1: "Pompe"
switch_2: switch.layzspa_jets
name_switch_2: "Jets"
switch_3: switch.layzspa_airbubbles
name_switch_3: "Bulles"
switch_4: switch.layzspa_heater
name_switch_4: "Chauffage"
switch_5: switch.layzspa_power
name_switch_5: "Alimentation"
switch_6: switch.layzspa_lock
name_switch_6: "Verrouillage"
```

---

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à :
- Signaler des bugs 🐛
- Proposer des améliorations 💡
- Partager vos configurations 📸

---

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

## 🙋 Support

Besoin d'aide ?
- 📖 Consultez la [documentation Home Assistant](https://www.home-assistant.io/)
- 💬 Posez vos questions dans les issues GitHub
- 🔍 Vérifiez les configurations existantes

---

<div align="center">

**Fait avec ❤️ pour les amoureux de spa et de Home Assistant**

⭐ Si vous aimez ce projet, n'hésitez pas à laisser une star !

</div>
