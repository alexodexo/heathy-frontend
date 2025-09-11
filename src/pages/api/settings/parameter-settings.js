// pages/api/settings/parameter-settings.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all parameter settings from the database
      const { data, error } = await supabase
        .from('parameter_settings')
        .select('key, value, category, description, unit')
        .order('key')

      if (error) throw error

      // Transform the data into a more usable format
      const settings = {}
      data.forEach(setting => {
        settings[setting.key] = {
          value: setting.value,
          category: setting.category,
          description: setting.description,
          unit: setting.unit
        }
      })

      res.status(200).json({
        success: true,
        data: settings
      })
    } catch (error) {
      console.error('Error fetching parameter settings:', error)
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch parameter settings' 
      })
    }
  } else if (req.method === 'PUT') {
    try {
      const { key, value } = req.body

      if (!key || value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing key or value'
        })
      }

      // Update the parameter setting in the database
      const { data, error } = await supabase
        .from('parameter_settings')
        .update({ 
          value: value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()

      if (error) throw error

      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Setting with key '${key}' not found`
        })
      }

      res.status(200).json({
        success: true,
        data: {
          key: key,
          value: value,
          updated: data[0]
        }
      })
    } catch (error) {
      console.error('Error updating parameter setting:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update parameter setting'
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
