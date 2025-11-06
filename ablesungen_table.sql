-- 1. Strompreis in die einstellungen Tabelle einfügen
-- Diese Tabelle existiert bereits, wir fügen nur den Strompreis hinzu
INSERT INTO einstellungen (key, value, description, updated_at)
VALUES 
  ('strompreis', 0.25, 'Strompreis in Euro pro Kilowattstunde', NOW())
ON CONFLICT (key) DO NOTHING;

-- 2. Ablesungen-Tabelle für Zählerstände Historie erstellen
-- Speichert alle Ablesungen mit Zeitstempel
CREATE TABLE ablesungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  ablesedatum date NOT NULL,
  
  -- Heizung Zählerstände (HT/NT)
  ht_zaehlerstand_kwh numeric(12,2),
  nt_zaehlerstand_kwh numeric(12,2),
  
  -- Warmwasser Zählerstand
  warmwasser_zaehlerstand_kwh numeric(12,2),
  
  -- Notizen (optional)
  notizen text
);

-- Index für schnelle Abfragen nach Datum
CREATE INDEX idx_ablesungen_created_at ON ablesungen(created_at DESC);

-- Kommentare für bessere Dokumentation
COMMENT ON TABLE ablesungen IS 'Speichert alle Zählerstandsablesungen mit Historie';
COMMENT ON COLUMN ablesungen.ablesedatum IS 'Datum der Ablesung';
COMMENT ON COLUMN ablesungen.ht_zaehlerstand_kwh IS 'Hochtarif-Zählerstand in kWh';
COMMENT ON COLUMN ablesungen.nt_zaehlerstand_kwh IS 'Niedertarif-Zählerstand in kWh';
COMMENT ON COLUMN ablesungen.warmwasser_zaehlerstand_kwh IS 'Warmwasser-Zählerstand in kWh';

-- Beispiel-Ablesung einfügen (optional, kann auch leer starten)
INSERT INTO ablesungen (
  ablesedatum,
  ht_zaehlerstand_kwh,
  nt_zaehlerstand_kwh,
  warmwasser_zaehlerstand_kwh
) VALUES (
  CURRENT_DATE,
  0,
  0,
  0
);

