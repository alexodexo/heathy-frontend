// src/pages/api/statistics/costs.js
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

    // Fetch electricity price from einstellungen table
    const { data: priceData, error: priceError } = await supabase
      .from('einstellungen')
      .select('value')
      .eq('key', 'strompreis')
      .single()

    const electricityPrice = parseFloat(priceData?.value) || 0.25 // Default price per kWh

    // Fetch energy consumption data
    const { data: energyData, error: energyError } = await supabase
      .from('em3data')
      .select('created_at, total_power, b_power, c_power')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true })

    if (energyError) {
      console.error('Error fetching energy data:', energyError)
      return res.status(500).json({ error: 'Failed to fetch energy data' })
    }

    // Calculate costs per time interval
    const costsTimeseries = calculateCosts(energyData || [], electricityPrice)
    
    // Calculate totals
    const totals = calculateTotals(costsTimeseries, range)

    return res.status(200).json({
      success: true,
      data: {
        timeseries: costsTimeseries,
        totals,
        electricityPrice: parseFloat(electricityPrice),
        range,
      }
    })

  } catch (error) {
    console.error('Error in costs statistics API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function calculateCosts(energyData, pricePerKWh) {
  if (!energyData || energyData.length === 0) return []

  const costs = []
  
  for (let i = 0; i < energyData.length - 1; i++) {
    const current = energyData[i]
    const next = energyData[i + 1]
    
    const currentTime = new Date(current.created_at)
    const nextTime = new Date(next.created_at)
    const hoursDiff = (nextTime - currentTime) / (1000 * 60 * 60)

    // Calculate energy consumption in kWh for this interval
    const totalKWh = (parseFloat(current.total_power) / 1000) * hoursDiff
    const heatingKWh = (parseFloat(current.b_power) / 1000) * hoursDiff
    const warmwaterKWh = (parseFloat(current.c_power) / 1000) * hoursDiff

    costs.push({
      timestamp: current.created_at,
      totalCost: totalKWh * pricePerKWh,
      heatingCost: heatingKWh * pricePerKWh,
      warmwaterCost: warmwaterKWh * pricePerKWh,
      consumption: totalKWh,
    })
  }

  return costs
}

function calculateTotals(costsData, range) {
  if (!costsData || costsData.length === 0) {
    return {
      total: 0,
      heating: 0,
      warmwater: 0,
      consumption: 0,
      dailyAverage: 0,
      monthlyProjection: 0,
      yearlyProjection: 0,
    }
  }

  const total = costsData.reduce((sum, c) => sum + c.totalCost, 0)
  const heating = costsData.reduce((sum, c) => sum + c.heatingCost, 0)
  const warmwater = costsData.reduce((sum, c) => sum + c.warmwaterCost, 0)
  const consumption = costsData.reduce((sum, c) => sum + c.consumption, 0)

  // Calculate daily average based on range
  let days = 1
  switch (range) {
    case '1h': days = 1 / 24; break
    case '6h': days = 6 / 24; break
    case '24h': days = 1; break
    case '7d': days = 7; break
    case '30d': days = 30; break
  }

  const dailyAverage = total / days
  const monthlyProjection = dailyAverage * 30
  const yearlyProjection = dailyAverage * 365

  return {
    total: total.toFixed(2),
    heating: heating.toFixed(2),
    warmwater: warmwater.toFixed(2),
    consumption: consumption.toFixed(2),
    dailyAverage: dailyAverage.toFixed(2),
    monthlyProjection: monthlyProjection.toFixed(2),
    yearlyProjection: yearlyProjection.toFixed(2),
  }
}

