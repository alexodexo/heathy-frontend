# Backend TODO - Parameter und Variablen

## Warmwasser-Seite (`/warmwater`)

### 1. Neue Betriebsmodi

#### Modus 5: "Power-Modus 4.5 kW"
```json
{
  "id": 5,
  "name": "Power-Modus 4.5 kW",
  "description": "Hochleistungsmodus für maximale Heizleistung",
  "pwm_value": 255,
  "estimated_power": 4500,
  "output_voltage": 24,
  "estimated_cost_hour": 0.85,
  "target_temp": 70,
  "active_heating": true,
  "reason": "Hochleistungsbetrieb"
}
```

#### Modus 6: "Gäste-Modus"
```json
{
  "id": 6,
  "name": "Gäste-Modus",
  "description": "Spezieller Modus für Gäste mit reduzierter Leistung",
  "pwm_value": 128,
  "estimated_power": 2000,
  "output_voltage": 12,
  "estimated_cost_hour": 0.45,
  "target_temp": 55,
  "active_heating": true,
  "reason": "Gästebetrieb"
}
```

### 2. Warmwasser-Einstellungen (Ausschaltpunkte)

#### Neue Parameter für `warmwaterSettings.warmwater`:
```json
{
  "switchon": "Ausschaltemperatur für Modus 1 (sollte 45°C sein)",
  "switchoff": "Ausschalttemperatur für Modus 2 und Modus 3",
  "modus4_switchoff": "Ausschaltemperatur für Modus 4",
  "guest_switchoff": "Ausschaltemperatur für Gäste-Modus",
  "power_mode_switchoff": "Ausschaltemperatur für Power-Modus 4.5 kW",
  "heater_power": "Leistung Heizstab (Default: 380W)"
}
```

#### WICHTIG: Backend-Korrektur erforderlich
- **Modus 1** zeigt 66°C statt 45.1°C
- **Modus 3** zeigt 45°C statt 66°C
- **Problem**: Backend sendet falsche Werte für `switchon` und `switchoff`
- **Korrektur**: 
  - Backend muss `switchon: 45.1` senden (nicht 66)
  - Backend muss `switchoff: 66` senden (nicht 45)
- **Erwartete Werte**:
  - Modus 1: 45.1°C (`switchon`) - ✅ Funktioniert bereits in der Praxis
  - Modus 2-3: 66°C (`switchoff`) - ❌ Modus 3 zeigt 45°C
  - Modus 4-6: 66°C (`switchoff`)

### 3. API-Endpunkte

#### Neue Endpunkte benötigt:
- `GET /api/heating/modes` - Erweitert um Modus 5 und 6
- `POST /api/heating/activate-mode` - Unterstützung für Modus 5 und 6
- `GET /api/warmwater/settings` - Erweitert um neue Ausschaltpunkte

### 5. Heizungsstatus-Integration

#### Backend-Endpunkt für Heizungsstatus:
```json
{
  "is_heating": "Boolean - true wenn Heizung aktiv, false wenn inaktiv",
  "heating_power": "Number - aktuelle Heizleistung in Watt",
  "mode": "String - aktueller Heizungsmodus"
}
```

#### Endpunkt: `GET /api/heating/status`
- **Sollte zurückgeben:** Aktuellen Heizungsstatus
- **Problem:** Frontend zeigt immer "Heizung aus" an, obwohl Heizung eingeschaltet ist
- **Status:** Backend-Integration erforderlich

### 6. Neue System-Parameter

#### Zählerstände und Ablesedaten:
```json
{
  "warmwater_meter_reading": "Zählerstand Warmwasser",
  "warmwater_meter_date": "Datum Ablesung Warmwasser (YYYY-MM-DD)",
  "ht_meter_reading": "Zählerstand HT (Hochtarif)",
  "nt_meter_reading": "Zählerstand NT (Niedertarif)",
  "electricity_meter_date": "Datum Ablesung HT/NT (YYYY-MM-DD)"
}
```

## Layout-Änderungen

### 1. Navigation
- Horizontales Menü unter "Heathy" implementiert
- Burger-Menü entfernt
- Konsistente Darstellung auf allen Bildschirmgrößen

## Frontend-Optimierungen (bereits implementiert)

### 1. Warmwasser-Seite
- ✅ Modus-Reihenfolge geändert (1-6)
- ✅ Betriebsmodus-Steuerung optimiert
- ✅ Status Cards kompakter
- ✅ Systemgesundheit-Bereich entfernt
- ✅ Warmwasser-Einstellungen zu Ausschaltpunkten umbenannt

### 2. Icon-Änderungen
- ✅ PV-Strom Icon von CheckCircle zu BoltIcon geändert

## Prioritäten

### Hoch (für sofortige Funktionalität):
1. **Modus 5 und 6** im Backend hinzufügen
2. **Neue Ausschaltpunkte** für Modus 4 und Gäste-Modus
3. **API-Endpunkte** erweitern

### Mittel (für vollständige Integration):
1. **Datenvalidierung** für neue Modi
2. **Fehlerbehandlung** für unbekannte Modi
3. **Logging** für neue Betriebsmodi

### Niedrig (für zukünftige Erweiterungen):
1. **Konfigurationsdatei** für Modi-Parameter
2. **Admin-Interface** für Modi-Verwaltung
3. **Statistiken** für neue Modi

## Notizen

- **Dummy-Daten** sind aktuell im Frontend implementiert
- **Backend-Erweiterung** sollte vor Produktivbetrieb erfolgen
- **Fallback-Mechanismus** für fehlende Backend-Daten implementiert
- **Responsive Design** für alle Bildschirmgrößen optimiert

## Zukünftige Erweiterungen

### Mögliche weitere Modi:
- "Nachtspeicher-Modus"
- "Urlaubs-Modus"
- "Wartungs-Modus"

### Mögliche weitere Parameter:
- Zeitbasierte Automatisierung
- Wetterabhängige Steuerung
- Energiepreis-Optimierung

## Dashboard-Erweiterungen

### 1. Neue Variablen für Status-Anzeigen

#### Pumpen-Status:
```json
{
  "circulator_no1": "Boolean - Status Pumpe 1 (Heizkreislauf)",
  "recirc_pump_no2": "Boolean - Status Pumpe 2 (Zirkulationspumpe)"
}
```

#### Kostendaten:
```json
{
  "costs": {
    "heating_week": "Number - Heizungskosten der letzten Woche in Euro (z.B. 12.45)"
  }
}
```

### 2. Automatisierte Pumpen-Wartung
- **Aufgabe**: Beide Pumpen täglich um 14:00 Uhr für 1 Minute automatisch einschalten
- **Zweck**: Festsetzschutz und Wartung
- **Implementation**: Cron-Job oder Timer im Backend

### 3. Wetter-API Integration
- **Standort**: Latitude 50.1109, Longitude 8.6821 (Einbauort der Heizung)
- **Benötigte Daten**: 
  - Sonnenschein-Forecast
  - Außentemperatur
- **Verwendung**: Für Sonnenschein-Anpassung und Temperatur-Monitoring
