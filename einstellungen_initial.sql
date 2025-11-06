-- Initial Warmwasser-Einstellungen in die einstellungen Tabelle einfügen
-- Führe dieses SQL-Skript in Supabase aus, um die Standardwerte zu setzen

INSERT INTO einstellungen (key, value, description, updated_at)
VALUES 
  ('warmwasser_einschalt_temperatur', 45, 'Temperatur, bei der die Warmwasserheizung einschaltet', NOW()),
  ('warmwasser_ausschalt_temperatur', 55, 'Temperatur, bei der die Warmwasserheizung ausschaltet', NOW()),
  ('warmwasser_heizstab_leistung', 380, 'Maximale Leistung des Heizstabs in Watt', NOW())
ON CONFLICT (key) DO NOTHING;

