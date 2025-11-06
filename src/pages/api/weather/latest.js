// pages/api/weather/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    
    // Get the latest weather data (only current/past data, not future)
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .lte('timestamp_utc', now.toISOString())
      .order('timestamp_utc', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    // Get today's data for sunshine hours calculation (since midnight)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todayData, error: todayError } = await supabase
      .from('weather')
      .select('sunshine')
      .gte('timestamp_utc', today.toISOString())
      .lte('timestamp_utc', now.toISOString())
      .order('timestamp_utc', { ascending: false })

    let totalSunshineToday = 0
    if (!todayError && todayData) {
      // Sum up sunshine minutes from all entries today
      totalSunshineToday = todayData.reduce((sum, entry) => {
        return sum + (parseFloat(entry.sunshine) || 0)
      }, 0)
    }

    // Get today's min/max temperature
    const { data: todayTempData, error: todayTempError } = await supabase
      .from('weather')
      .select('temperature')
      .gte('timestamp_utc', today.toISOString())
      .lte('timestamp_utc', now.toISOString())
      .order('timestamp_utc', { ascending: false })

    let minTemp = null
    let maxTemp = null
    if (!todayTempError && todayTempData && todayTempData.length > 0) {
      const temps = todayTempData.map(entry => parseFloat(entry.temperature)).filter(t => !isNaN(t))
      if (temps.length > 0) {
        minTemp = Math.min(...temps)
        maxTemp = Math.max(...temps)
      }
    }

    res.status(200).json({
      ...data,
      sunshine_hours_today: totalSunshineToday / 60, // Convert minutes to hours
      min_temp_today: minTemp,
      max_temp_today: maxTemp
    })
  } catch (error) {
    console.error('Error fetching weather data:', error)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}

