// src/pages/api/einstellungen/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('einstellungen')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw error

      // Convert array to object with key as property
      const settings = {}
      data.forEach(setting => {
        settings[setting.key] = setting
      })

      return res.status(200).json(settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      return res.status(500).json({ error: 'Failed to fetch settings' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

