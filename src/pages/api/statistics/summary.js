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

    // Fetch latest heating status
    const { data: latestStatus, error: statusError } = await supabase
      .from('heating_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (statusError && statusError.code !== 'PGRST116') {
      console.error('Error fetching heating status:', statusError)
    }

    // Fetch 24h energy data for averages
    const { data: energyData24h, error: energyError } = await supabase
      .from('em3data')
      .select('total_power, b_power, c_power')
      .gte('created_at', yesterday.toISOString())

    if (energyError) {
      console.error('Error fetching energy data:', energyError)
    }

    // Fetch 24h temperature data
    const { data: tempData24h, error: tempError } = await supabase
      .from('heating_status')
      .select('water_temp, vorlauf_temp, ruecklauf_temp')
      .gte('created_at', yesterday.toISOString())

    if (tempError) {
      console.error('Error fetching temperature data:', tempError)
    }

    // Calculate averages
    const energyAvg = calculateEnergyAverages(energyData24h || [])
    const tempAvg = calculateTempAverages(tempData24h || [])

    // Get electricity price
    const { data: priceData } = await supabase
      .from('parameter_settings')
      .select('value')
      .eq('key', 'electricity_price')
      .single()

    const electricityPrice = parseFloat(priceData?.value || 0.25)

    // Calculate 24h costs
    const totalConsumption24h = energyAvg.totalPower * 24 / 1000 // kWh
    const cost24h = totalConsumption24h * electricityPrice

    return res.status(200).json({
      success: true,
      data: {
        current: {
          activeMode: latestStatus?.active_mode_name || 'Unbekannt',
          waterTemp: parseFloat(latestStatus?.water_temp || 0).toFixed(1),
          vorlaufTemp: parseFloat(latestStatus?.vorlauf_temp || 0).toFixed(1),
          ruecklaufTemp: parseFloat(latestStatus?.ruecklauf_temp || 0).toFixed(1),
          currentPwm: parseFloat(latestStatus?.current_pwm || 0).toFixed(0),
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
    }
  }

  const validData = data.filter(d => d.water_temp && d.vorlauf_temp && d.ruecklauf_temp)
  if (validData.length === 0) {
    return {
      waterTemp: 0,
      vorlaufTemp: 0,
      ruecklaufTemp: 0,
    }
  }

  const sum = validData.reduce((acc, d) => ({
    water: acc.water + parseFloat(d.water_temp),
    vorlauf: acc.vorlauf + parseFloat(d.vorlauf_temp),
    ruecklauf: acc.ruecklauf + parseFloat(d.ruecklauf_temp),
  }), { water: 0, vorlauf: 0, ruecklauf: 0 })

  return {
    waterTemp: (sum.water / validData.length).toFixed(1),
    vorlaufTemp: (sum.vorlauf / validData.length).toFixed(1),
    ruecklaufTemp: (sum.ruecklauf / validData.length).toFixed(1),
  }
}

