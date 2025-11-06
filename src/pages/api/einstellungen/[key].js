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

      const { data, error } = await supabase
        .from('einstellungen')
        .upsert({
          key,
          value,
          description,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('Error updating setting:', error)
      return res.status(500).json({ error: 'Failed to update setting' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

