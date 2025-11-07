-- Füge warmwasser_modus zur einstellungen Tabelle hinzu
-- 0 = AUS, 1 = EIN

INSERT INTO einstellungen (key, value, description, updated_at)
VALUES 
  ('warmwasser_modus', 0, 'Warmwasser-Modus: 0=AUS, 1=EIN', NOW())
ON CONFLICT (key) DO UPDATE 
SET 
  description = EXCLUDED.description,
  updated_at = NOW();

