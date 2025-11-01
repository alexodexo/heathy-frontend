// src/pages/api/test-db.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  try {
    // Test em3data table
    const { data: em3Count, error: em3Error } = await supabase
      .from('em3data')
      .select('*', { count: 'exact', head: true })

    // Test heating_status table
    const { data: heatingCount, error: heatingError } = await supabase
      .from('heating_status')
      .select('*', { count: 'exact', head: true })

    // Get latest records
    const { data: latestEm3, error: latestEm3Error } = await supabase
      .from('em3data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: latestHeating, error: latestHeatingError } = await supabase
      .from('heating_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    return res.status(200).json({
      success: true,
      tables: {
        em3data: {
          exists: !em3Error,
          error: em3Error?.message,
          latestRecord: latestEm3?.[0],
          latestError: latestEm3Error?.message,
        },
        heating_status: {
          exists: !heatingError,
          error: heatingError?.message,
          latestRecord: latestHeating?.[0],
          latestError: latestHeatingError?.message,
        },
      },
    })
  } catch (error) {
    console.error('Database test error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

