-- Fehlende Booster Phase-Settings hinzufügen

INSERT INTO einstellungen (key, value, description, updated_at)
VALUES
  ('heizung_phase1_duration', 10, 'Heizung Booster Phase 1: Aufheizen Dauer (Minuten)', NOW()),
  ('heizung_phase2_duration', 12, 'Heizung Booster Phase 2: Stabilisieren Dauer (Minuten)', NOW()),
  ('heizung_phase3_duration', 8, 'Heizung Booster Phase 3: Halten Dauer (Minuten)', NOW())
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at;

