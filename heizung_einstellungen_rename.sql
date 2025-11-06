-- Migration: Alle Heizungs-Einstellungen mit heizung_ Prefix

-- 1. Alte Einträge löschen
DELETE FROM einstellungen WHERE key LIKE 'mode_1_%';
DELETE FROM einstellungen WHERE key LIKE 'phase%_duration';
DELETE FROM einstellungen WHERE key LIKE 'pump_%';

-- 2. Neue Einträge mit heizung_ Prefix einfügen

-- Heizung Normalbetrieb
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('heizung_switchon', 40, 'Heizung: Einschalten bei ≤ Temperatur (°C)', NOW()),
  ('heizung_switchoff', 45, 'Heizung: Ausschalten bei ≥ Temperatur (°C)', NOW()),
  ('heizung_coldstart_enabled', 0, 'Heizung: Kaltstart-Boost aktiviert (0=false, 1=true)', NOW()),
  ('heizung_coldstart_target_temp', 45, 'Heizung: Kaltstart-Boost Zieltemperatur (°C)', NOW()),
  ('heizung_l2_boost_time', 15, 'Heizung: L2 Heizstab nach X Minuten zuschalten', NOW()),
  ('heizung_l3_boost_time', 30, 'Heizung: L3 Heizstab nach X Minuten zuschalten', NOW()),
  ('heizung_downshift_l3_offset', 3.0, 'Heizung: L3 abschalten bei Zieltemp minus X °C', NOW()),
  ('heizung_downshift_l2_offset', 1.5, 'Heizung: L2 abschalten bei Zieltemp minus X °C', NOW())
ON CONFLICT (key) DO NOTHING;

-- Heizung Booster Phasen
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('heizung_phase1_duration', 10, 'Heizung Booster Phase 1: Aufheizen Dauer (Minuten)', NOW()),
  ('heizung_phase2_duration', 12, 'Heizung Booster Phase 2: Stabilisieren Dauer (Minuten)', NOW()),
  ('heizung_phase3_duration', 8, 'Heizung Booster Phase 3: Halten Dauer (Minuten)', NOW())
ON CONFLICT (key) DO NOTHING;

-- Heizung Pumpen-Einstellungen
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('heizung_pump_overrun_time', 10, 'Heizung Zirkulationspumpe Nachlaufzeit (Minuten)', NOW()),
  ('heizung_pump_protection_time', 720, 'Heizung Pumpe täglich gegen Festsetzen (Minuten seit Mitternacht, 720=12:00)', NOW())
ON CONFLICT (key) DO NOTHING;

