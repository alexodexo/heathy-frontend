// src/pages/api/einstellungen/[key].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { key } = req.query

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('einstellungen')
        .select('*')
        .eq('key', key)
        .single()

      if (error) throw error

      return res.status(200).json(data)
    } catch (error) {
      console.error('Error fetching setting:', error)
      return res.status(500).json({ error: 'Failed to fetch setting' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { value, description } = req.body

      // First, check if the key exists
      const { data: existing } = await supabase
        .from('einstellungen')
        .select('key, description')
        .eq('key', key)
        .single()

      if (existing) {
        // Key exists - UPDATE only value and updated_at
        // Keep existing description unless explicitly provided
        const updateData = {
          value,
          updated_at: new Date().toISOString()
        }

        // Only update description if explicitly provided
        if (description !== undefined && description !== null) {
          updateData.description = description
        }

        const { data, error } = await supabase
          .from('einstellungen')
          .update(updateData)
          .eq('key', key)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, data })
      } else {
        // Key doesn't exist - INSERT new entry
        const { data, error } = await supabase
          .from('einstellungen')
          .insert({
            key,
            value,
            description: description || null,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, data })
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      return res.status(500).json({ error: 'Failed to update setting' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

