// src/pages/api/ip-addresses/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('ip_adresses')
        .select('*')
        .order('key', { ascending: true })

      if (error) {
        console.error('Error fetching IP addresses:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error('Error in GET /api/ip-addresses:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ip, port } = req.body

      if (!id || !ip) {
        return res.status(400).json({ error: 'ID and IP are required' })
      }

      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(ip)) {
        return res.status(400).json({ error: 'Invalid IP address format' })
      }

      // Validate port if provided
      if (port && (port < 1 || port > 65535)) {
        return res.status(400).json({ error: 'Port must be between 1 and 65535' })
      }

      const updateData = { ip }
      if (port !== undefined) {
        updateData.port = port
      }

      const { data, error } = await supabase
        .from('ip_adresses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating IP address:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error('Error in PUT /api/ip-addresses:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

