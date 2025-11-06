-- Migration: Heizungs-Einstellungen in die einstellungen Tabelle

-- Modus 1: Normalbetrieb Einstellungen
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('mode_1_switchon', 40, 'Modus 1: Einschalten bei ≤ Temperatur (°C)', NOW()),
  ('mode_1_switchoff', 45, 'Modus 1: Ausschalten bei ≥ Temperatur (°C)', NOW()),
  ('mode_1_coldstart_enabled', false, 'Modus 1: Kaltstart-Boost aktiviert', NOW()),
  ('mode_1_coldstart_target_temp', 45, 'Modus 1: Kaltstart-Boost Zieltemperatur (°C)', NOW()),
  ('mode_1_l2_boost_time', 15, 'Modus 1: L2 Heizstab nach X Minuten zuschalten', NOW()),
  ('mode_1_l3_boost_time', 30, 'Modus 1: L3 Heizstab nach X Minuten zuschalten', NOW()),
  ('mode_1_downshift_l3_offset', 3.0, 'Modus 1: L3 abschalten bei Zieltemp minus X °C', NOW()),
  ('mode_1_downshift_l2_offset', 1.5, 'Modus 1: L2 abschalten bei Zieltemp minus X °C', NOW())
ON CONFLICT (key) DO NOTHING;

-- Modus 2: Booster Einstellungen
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('phase1_duration', 10, 'Booster Phase 1: Aufheizen Dauer (Minuten)', NOW()),
  ('phase2_duration', 12, 'Booster Phase 2: Stabilisieren Dauer (Minuten)', NOW()),
  ('phase3_duration', 8, 'Booster Phase 3: Halten Dauer (Minuten)', NOW())
ON CONFLICT (key) DO NOTHING;

-- Pumpen-Einstellungen
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('pump_overrun_time', 10, 'Zirkulationspumpe Nachlaufzeit (Minuten)', NOW()),
  ('pump_protection_time', '12:00', 'Pumpe täglich gegen Festsetzen um Uhrzeit', NOW())
ON CONFLICT (key) DO NOTHING;

