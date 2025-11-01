
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

    // Return null for power values to show "--" in frontend
    const result = data ? { 
      ...data, 
      total_power: null,
      a_power: null,
      b_power: null,
      c_power: null
    } : { 
      total_power: null,
      a_power: null,
      b_power: null,
      c_power: null
    }
    res.status(200).json(result)
  } catch (error) {
    console.error('Error fetching EM3 data:', error)
    // Return null data instead of error to show "--" in frontend
    res.status(200).json({ 
      total_power: null,
      a_power: null,
      b_power: null,
      c_power: null
    })
  }
}