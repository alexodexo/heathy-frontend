// src/pages/api/statistics/energy.js
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
    let interval = '5 minutes' // Default interval

    switch (range) {
      case '1h':
        startTime.setHours(now.getHours() - 1)
        interval = '5 minutes'
        break
      case '6h':
        startTime.setHours(now.getHours() - 6)
        interval = '10 minutes'
        break
      case '24h':
        startTime.setHours(now.getHours() - 24)
        interval = '30 minutes'
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        interval = '2 hours'
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        interval = '6 hours'
        break
      default:
        startTime.setHours(now.getHours() - 24)
    }

    // Fetch energy data from em3data table with time-based aggregation
    const { data: energyData, error } = await supabase
      .from('em3data')
      .select('created_at, total_power, a_power, b_power, c_power')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching energy data:', error)
      return res.status(500).json({ error: 'Failed to fetch energy data' })
    }

    // Aggregate data based on interval
    const aggregatedData = aggregateByInterval(energyData, interval)

    // Calculate totals and averages
    const totalConsumption = aggregatedData.reduce((sum, d) => sum + (d.total_power || 0), 0) / aggregatedData.length
    const heatingConsumption = aggregatedData.reduce((sum, d) => sum + (d.b_power || 0), 0) / aggregatedData.length
    const warmwaterConsumption = aggregatedData.reduce((sum, d) => sum + (d.c_power || 0), 0) / aggregatedData.length
    const pvProduction = aggregatedData.reduce((sum, d) => sum + Math.abs(d.a_power || 0), 0) / aggregatedData.length

    return res.status(200).json({
      success: true,
      data: {
        timeseries: aggregatedData,
        summary: {
          totalConsumption: totalConsumption.toFixed(2),
          heatingConsumption: heatingConsumption.toFixed(2),
          warmwaterConsumption: warmwaterConsumption.toFixed(2),
          pvProduction: pvProduction.toFixed(2),
        },
        range,
        interval,
      }
    })

  } catch (error) {
    console.error('Error in energy statistics API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function aggregateByInterval(data, interval) {
  if (!data || data.length === 0) return []

  // Parse interval to minutes
  const intervalMinutes = parseInterval(interval)
  
  const aggregated = []
  let currentBucket = []
  let bucketStartTime = null

  data.forEach((point) => {
    const pointTime = new Date(point.created_at)
    
    if (!bucketStartTime) {
      bucketStartTime = pointTime
      currentBucket.push(point)
      return
    }

    const timeDiff = (pointTime - bucketStartTime) / (1000 * 60) // minutes

    if (timeDiff >= intervalMinutes) {
      // Average the current bucket
      if (currentBucket.length > 0) {
        aggregated.push(averageBucket(currentBucket, bucketStartTime))
      }
      // Start new bucket
      bucketStartTime = pointTime
      currentBucket = [point]
    } else {
      currentBucket.push(point)
    }
  })

  // Add last bucket
  if (currentBucket.length > 0) {
    aggregated.push(averageBucket(currentBucket, bucketStartTime))
  }

  return aggregated
}

function averageBucket(bucket, timestamp) {
  const avg = {
    timestamp: timestamp.toISOString(),
    total_power: 0,
    a_power: 0,
    b_power: 0,
    c_power: 0,
  }

  bucket.forEach(point => {
    avg.total_power += parseFloat(point.total_power || 0)
    avg.a_power += parseFloat(point.a_power || 0)
    avg.b_power += parseFloat(point.b_power || 0)
    avg.c_power += parseFloat(point.c_power || 0)
  })

  const count = bucket.length
  avg.total_power /= count
  avg.a_power /= count
  avg.b_power /= count
  avg.c_power /= count

  return avg
}

function parseInterval(interval) {
  const parts = interval.split(' ')
  const value = parseInt(parts[0])
  const unit = parts[1]

  if (unit.startsWith('minute')) return value
  if (unit.startsWith('hour')) return value * 60
  return 30 // default
}

