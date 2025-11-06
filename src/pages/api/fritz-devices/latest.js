// pages/api/fritz-devices/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the latest temperature data for both devices
    const devices = {
      'zimmer_alex': 'Alex-Notwecker',
      'buero': 'Solar Steckdose'
    }
    const deviceData = {}

    for (const [key, deviceName] of Object.entries(devices)) {
      const { data, error } = await supabase
        .from('fritz_devices_data')
        .select('device_name, temperature, created_at')
        .eq('device_name', deviceName)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error(`Error fetching data for ${deviceName}:`, error)
        // Continue with other devices even if one fails
        deviceData[key] = null
      } else {
        deviceData[key] = data
      }
    }

    res.status(200).json(deviceData)
  } catch (error) {
    console.error('Error fetching fritz devices data:', error)
    res.status(500).json({ error: 'Failed to fetch fritz devices data' })
  }
}

