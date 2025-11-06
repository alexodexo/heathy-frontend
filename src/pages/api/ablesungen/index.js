// src/pages/api/ablesungen/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Alle Ablesungen abrufen, sortiert nach Datum (neueste zuerst)
    try {
      const { data, error } = await supabase
        .from('ablesungen')
        .select('*')
        .order('ablesedatum', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('Error fetching ablesungen:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch ablesungen' })
    }
  } else if (req.method === 'POST') {
    // Neue Ablesung hinzufügen
    try {
      const { ablesedatum, ht_zaehlerstand_kwh, nt_zaehlerstand_kwh, warmwasser_zaehlerstand_kwh, notizen } = req.body

      const { data, error } = await supabase
        .from('ablesungen')
        .insert({
          ablesedatum,
          ht_zaehlerstand_kwh,
          nt_zaehlerstand_kwh,
          warmwasser_zaehlerstand_kwh,
          notizen,
        })
        .select()
        .single()

      if (error) throw error

      res.status(201).json({ success: true, data })
    } catch (error) {
      console.error('Error creating ablesung:', error)
      res.status(500).json({ success: false, error: 'Failed to create ablesung' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

