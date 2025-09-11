// pages/api/plugs/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the latest plugs_data entry with the newest apower value
    const { data, error } = await supabase
      .from('plugs_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    // Return the complete data, frontend can extract apower
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching plugs data:', error)
    res.status(500).json({ error: 'Failed to fetch plugs data' })
  }
}
