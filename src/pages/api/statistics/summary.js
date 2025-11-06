// src/pages/api/statistics/summary.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get last 24 hours of data for summary
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch latest temperature data
    const { data: latestTemp, error: tempStatusError } = await supabase
      .from('temperature_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (tempStatusError && tempStatusError.code !== 'PGRST116') {
      console.error('Error fetching latest temperature:', tempStatusError)
    }

    // Fetch 24h energy data for averages
    const { data: energyData24h, error: energyError } = await supabase
      .from('em3data')
      .select('total_power, b_power, c_power')
      .gte('created_at', yesterday.toISOString())

    if (energyError) {
      console.error('Error fetching energy data:', energyError)
    }

    // Fetch 24h temperature data from temperature_data
    const { data: tempData24h, error: tempError } = await supabase
      .from('temperature_data')
      .select('t1, t2, t3')
      .gte('created_at', yesterday.toISOString())

    if (tempError) {
      console.error('Error fetching temperature data:', tempError)
    }

    // Calculate averages
    const energyAvg = calculateEnergyAverages(energyData24h || [])
    const tempAvg = calculateTempAverages(tempData24h || [])

    // Get electricity price from einstellungen table
    const { data: priceData } = await supabase
      .from('einstellungen')
      .select('value')
      .eq('key', 'strompreis')
      .single()

    const electricityPrice = parseFloat(priceData?.value || 0.25)

    // Calculate 24h costs
    const totalConsumption24h = energyAvg.totalPower * 24 / 1000 // kWh
    const cost24h = totalConsumption24h * electricityPrice

    return res.status(200).json({
      success: true,
      data: {
        current: {
          waterTemp: parseFloat(latestTemp?.t1 || 0).toFixed(1),
          vorlaufTemp: parseFloat(latestTemp?.t2 || 0).toFixed(1),
          ruecklaufTemp: parseFloat(latestTemp?.t3 || 0).toFixed(1),
        },
        averages24h: {
          ...energyAvg,
          ...tempAvg,
        },
        costs24h: {
          total: cost24h.toFixed(2),
          consumption: totalConsumption24h.toFixed(2),
          pricePerKWh: electricityPrice.toFixed(2),
        },
      }
    })

  } catch (error) {
    console.error('Error in summary statistics API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function calculateEnergyAverages(data) {
  if (!data || data.length === 0) {
    return {
      totalPower: 0,
      heatingPower: 0,
      warmwaterPower: 0,
    }
  }

  const sum = data.reduce((acc, d) => ({
    total: acc.total + parseFloat(d.total_power || 0),
    heating: acc.heating + parseFloat(d.b_power || 0),
    warmwater: acc.warmwater + parseFloat(d.c_power || 0),
  }), { total: 0, heating: 0, warmwater: 0 })

  return {
    totalPower: (sum.total / data.length).toFixed(0),
    heatingPower: (sum.heating / data.length).toFixed(0),
    warmwaterPower: (sum.warmwater / data.length).toFixed(0),
  }
}

function calculateTempAverages(data) {
  if (!data || data.length === 0) {
    return {
      waterTemp: 0,
      vorlaufTemp: 0,
      ruecklaufTemp: 0,
      tempDiff: 0,
    }
  }

  const waterTemps = data.map(d => parseFloat(d.t1)).filter(t => !isNaN(t))  // t1 = Warmwasser
  const vorlaufTemps = data.map(d => parseFloat(d.t2)).filter(t => !isNaN(t))  // t2 = Vorlauf
  const ruecklaufTemps = data.map(d => parseFloat(d.t3)).filter(t => !isNaN(t))  // t3 = Rücklauf
  
  if (waterTemps.length === 0 || vorlaufTemps.length === 0 || ruecklaufTemps.length === 0) {
    return {
      waterTemp: 0,
      vorlaufTemp: 0,
      ruecklaufTemp: 0,
      tempDiff: 0,
    }
  }

  const waterAvg = waterTemps.reduce((a, b) => a + b, 0) / waterTemps.length
  const vorlaufAvg = vorlaufTemps.reduce((a, b) => a + b, 0) / vorlaufTemps.length
  const ruecklaufAvg = ruecklaufTemps.reduce((a, b) => a + b, 0) / ruecklaufTemps.length

  return {
    waterTemp: waterAvg.toFixed(1),
    vorlaufTemp: vorlaufAvg.toFixed(1),
    ruecklaufTemp: ruecklaufAvg.toFixed(1),
    tempDiff: (vorlaufAvg - ruecklaufAvg).toFixed(1),
  }
}

