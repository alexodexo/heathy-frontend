
// pages/api/em3/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the latest EM3 data
    const { data, error } = await supabase
      .from('em3data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    res.status(200).json(data || { 
      total_power: null,
      a_power: null,
      b_power: null,
      c_power: null
    })
  } catch (error) {
    console.error('Error fetching EM3 data:', error)
    res.status(200).json({ 
      total_power: null,
      a_power: null,
      b_power: null,
      c_power: null
    })
  }
}