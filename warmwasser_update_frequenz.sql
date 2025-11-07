-- Füge warmwasser_update_frequenz zur einstellungen Tabelle hinzu
-- Gibt an, wie viele Sekunden zwischen jeder Überprüfung der Warmwasserwerte liegen

INSERT INTO einstellungen (key, value, description, updated_at)
VALUES 
  ('warmwasser_update_frequenz', 60, 'Warmwasser Update-Frequenz in Sekunden (wie oft Warmwasserwerte überprüft werden)', NOW())
ON CONFLICT (key) DO UPDATE 
SET 
  description = EXCLUDED.description,
  updated_at = NOW();

