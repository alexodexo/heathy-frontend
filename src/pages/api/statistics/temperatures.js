// src/pages/api/statistics/temperatures.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { range = '24h' } = req.query

    // Calculate time range
    const now = new Date()
    let startTime = new Date()

    switch (range) {
      case '1h':
        startTime.setHours(now.getHours() - 1)
        break
      case '6h':
        startTime.setHours(now.getHours() - 6)
        break
      case '24h':
        startTime.setHours(now.getHours() - 24)
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        break
      default:
        startTime.setHours(now.getHours() - 24)
    }

    // Fetch raw temperature sensor data from temperature_data
    // t1 = Warmwasser, t2 = Vorlauf, t3 = Rücklauf
    const { data: sensorData, error: sensorError } = await supabase
      .from('temperature_data')
      .select('created_at, t1, t2, t3')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true })

    if (sensorError) {
      console.error('Error fetching temperature data:', sensorError)
      throw sensorError
    }

    // Process temperature data
    const processedData = processTemperatureData(sensorData || [], range)

    // Calculate statistics
    const stats = calculateTemperatureStats(sensorData || [])

    return res.status(200).json({
      success: true,
      data: {
        timeseries: processedData,
        stats,
        range,
      }
    })

  } catch (error) {
    console.error('Error in temperature statistics API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function processTemperatureData(sensorData, range) {
  // Determine sampling rate based on range
  const samplingRate = getSamplingRate(range)
  
  // Sample sensor data
  const sampledData = sampleData(sensorData, samplingRate)
  
  return sampledData.map(d => ({
    timestamp: d.created_at,
    water_temp: parseFloat(d.t1) || null,  // t1 = Warmwasser
    vorlauf_temp: parseFloat(d.t2) || null,  // t2 = Vorlauf
    ruecklauf_temp: parseFloat(d.t3) || null,  // t3 = Rücklauf
  }))
}

function sampleData(data, rate) {
  if (!data || data.length === 0) return []
  if (rate === 1) return data
  
  const sampled = []
  for (let i = 0; i < data.length; i += rate) {
    sampled.push(data[i])
  }
  return sampled
}

function getSamplingRate(range) {
  switch (range) {
    case '1h': return 1
    case '6h': return 2
    case '24h': return 5
    case '7d': return 20
    case '30d': return 60
    default: return 5
  }
}

function calculateTemperatureStats(data) {
  if (!data || data.length === 0) {
    return {
      waterTempAvg: 0,
      waterTempMin: 0,
      waterTempMax: 0,
      vorlaufTempAvg: 0,
      ruecklaufTempAvg: 0,
      tempDiffAvg: 0,
    }
  }

  const waterTemps = data.map(d => parseFloat(d.t1)).filter(t => !isNaN(t))  // t1 = Warmwasser
  const vorlaufTemps = data.map(d => parseFloat(d.t2)).filter(t => !isNaN(t))  // t2 = Vorlauf
  const ruecklaufTemps = data.map(d => parseFloat(d.t3)).filter(t => !isNaN(t))  // t3 = Rücklauf

  const waterTempAvg = waterTemps.length > 0 ? waterTemps.reduce((a, b) => a + b, 0) / waterTemps.length : 0
  const vorlaufTempAvg = vorlaufTemps.length > 0 ? vorlaufTemps.reduce((a, b) => a + b, 0) / vorlaufTemps.length : 0
  const ruecklaufTempAvg = ruecklaufTemps.length > 0 ? ruecklaufTemps.reduce((a, b) => a + b, 0) / ruecklaufTemps.length : 0

  return {
    waterTempAvg: waterTempAvg.toFixed(1),
    waterTempMin: waterTemps.length > 0 ? Math.min(...waterTemps).toFixed(1) : '0.0',
    waterTempMax: waterTemps.length > 0 ? Math.max(...waterTemps).toFixed(1) : '0.0',
    vorlaufTempAvg: vorlaufTempAvg.toFixed(1),
    ruecklaufTempAvg: ruecklaufTempAvg.toFixed(1),
    tempDiffAvg: (vorlaufTempAvg - ruecklaufTempAvg).toFixed(1),
  }
}

