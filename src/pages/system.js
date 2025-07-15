// src/pages/system.js
import { useState, useCallback } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  useAllSettings, 
  useSensorSettings, 
  useWarmwaterSettings, 
  useSystemHealth,
  useSystemStats
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  Cog6ToothIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ServerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function SystemSettings() {
  const { data: allSettings, isLoading: settingsLoading, refresh: refreshSettings } = useAllSettings()
  const { data: sensorSettings, refresh: refreshSensorSettings } = useSensorSettings()
  const { data: warmwaterSettings, refresh: refreshWarmwaterSettings } = useWarmwaterSettings()
  const { data: systemHealth } = useSystemHealth()
  const { data: systemStats } = useSystemStats()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({})
  
  // Initialize local settings when data loads
  useState(() => {
    if (allSettings?.settings) {
      setLocalSettings(allSettings.settings)
    }
  }, [allSettings])

  // Update individual setting
  const updateSetting = useCallback(async (key, value) => {
    setIsSaving(true)
    try {
      const response = await backendAPI.updateSetting(key, value)
      if (response.success) {
        toast.success(`${key} erfolgreich aktualisiert`)
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        await refreshSettings()
        await refreshSensorSettings()
        await refreshWarmwaterSettings()
      } else {
        toast.error(`Fehler beim Aktualisieren von ${key}`)
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      toast.error(`Fehler beim Aktualisieren von ${key}`)
    } finally {
      setIsSaving(false)
    }
  }, [refreshSettings, refreshSensorSettings, refreshWarmwaterSettings])

  // Refresh all settings
  const handleRefreshSettings = useCallback(async () => {
    try {
      const response = await backendAPI.refreshSettings()
      if (response.success) {
        toast.success('Einstellungen neu geladen')
        await refreshSettings()
      } else {
        toast.error('Fehler beim Neuladen der Einstellungen')
      }
    } catch (error) {
      console.error('Error refreshing settings:', error)
      toast.error('Fehler beim Neuladen der Einstellungen')
    }
  }, [refreshSettings])

  if (settingsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Lade Systemeinstellungen...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>System - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Systemeinstellungen</h1>
            <p className="text-gray-600 mt-1">Konfiguration und Verwaltung</p>
          </div>
          <button
            onClick={handleRefreshSettings}
            className="btn-secondary"
            disabled={isSaving}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Neu laden
          </button>
        </div>

        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System-Status</h2>
            <ServerIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${
              systemHealth?.status === 'healthy' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className={`w-5 h-5 ${
                  systemHealth?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`} />
                <h3 className="font-medium text-gray-900">System</h3>
              </div>
              <p className="text-sm text-gray-600">
                Status: {systemHealth?.status || 'Unbekannt'}
              </p>
              <p className="text-sm text-gray-600">
                Uptime: {Math.floor((systemHealth?.uptime_seconds || 0) / 3600)}h {Math.floor(((systemHealth?.uptime_seconds || 0) % 3600) / 60)}m
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Performance</h3>
              </div>
              <p className="text-sm text-gray-600">
                Loops: {systemStats?.performance?.main_loops_executed || 0}
              </p>
              <p className="text-sm text-gray-600">
                PWM Effizienz: {systemStats?.performance?.pwm_efficiency_percent || 0}%
              </p>
            </div>

            <div className={`p-4 rounded-xl ${
              (systemStats?.errors?.total_errors || 0) === 0
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className={`w-5 h-5 ${
                  (systemStats?.errors?.total_errors || 0) === 0 ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <h3 className="font-medium text-gray-900">Fehler</h3>
              </div>
              <p className="text-sm text-gray-600">
                Gesamt: {systemStats?.errors?.total_errors || 0}
              </p>
              <p className="text-sm text-gray-600">
                Rate: {systemStats?.errors?.error_rate_percent || 0}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warmwater Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Warmwasser-Einstellungen</h2>
            <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Einschalttemperatur (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_switchon || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_switchon: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_switchon) {
                    updateSetting('warmwater_switchon', value)
                  }
                }}
                className="input"
                min="20"
                max="60"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ausschalttemperatur (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_switchoff || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_switchoff: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_switchoff) {
                    updateSetting('warmwater_switchoff', value)
                  }
                }}
                className="input"
                min="30"
                max="70"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sonnenschein-Reduzierung (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_sunshine_reduction || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_sunshine_reduction: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_sunshine_reduction) {
                    updateSetting('warmwater_sunshine_reduction', value)
                  }
                }}
                className="input"
                min="0"
                max="10"
                step="0.5"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sonnenschein-Aktivierung (0.0 - 1.0)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_sunshine_activation || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_sunshine_activation: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_sunshine_activation) {
                    updateSetting('warmwater_sunshine_activation', value)
                  }
                }}
                className="input"
                min="0"
                max="1"
                step="0.1"
                disabled={isSaving}
              />
            </div>
          </div>
        </motion.div>

        {/* Temperature Sensor Calibration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Temperaturfühler Kalibrierung</h2>
            <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((sensorNum) => {
              const settingKey = `temperature_sensor${sensorNum}_offset`
              const sensorNames = {
                1: 'Warmwasser',
                2: 'Vorlauf Heizung',
                3: 'Rücklauf Heizung'
              }
              
              return (
                <div key={sensorNum} className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-1">Sensor {sensorNum}</h3>
                  <p className="text-sm text-gray-600 mb-3">{sensorNames[sensorNum]}</p>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Kalibrierung Offset (°C)</label>
                    <input
                      type="number"
                      value={localSettings[settingKey] || ''}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        setLocalSettings(prev => ({ ...prev, [settingKey]: value }))
                      }}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (value !== allSettings?.settings?.[settingKey]) {
                          updateSetting(settingKey, value)
                        }
                      }}
                      className="input text-sm"
                      step="0.1"
                      min="-10"
                      max="10"
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-success" />
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System-Einstellungen</h2>
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strompreis (€/kWh)
              </label>
              <input
                type="number"
                value={localSettings.electricity_price || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, electricity_price: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.electricity_price) {
                    updateSetting('electricity_price', value)
                  }
                }}
                className="input"
                step="0.01"
                min="0"
                max="1"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird für alle Kostenberechnungen verwendet
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktiver Modus
              </label>
              <input
                type="number"
                value={localSettings.active_mode || ''}
                className="input bg-gray-100"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Nur über Warmwasser-Schaltzentrale änderbar
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <h2 className="text-lg font-semibold text-white">Alle Einstellungen im Überblick</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Warmwater Category */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Warmwasser</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Einschalttemperatur:</span>
                    <span className="font-medium">{allSettings?.categories?.warmwater?.switchon}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ausschalttemperatur:</span>
                    <span className="font-medium">{allSettings?.categories?.warmwater?.switchoff}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sonnenreduzierung:</span>
                    <span className="font-medium">{allSettings?.categories?.warmwater?.sunshine_reduction}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sonnenaktivierung:</span>
                    <span className="font-medium">{(allSettings?.categories?.warmwater?.sunshine_activation * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Sensors Category */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sensoren</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sensor 1 Offset:</span>
                    <span className="font-medium">{allSettings?.categories?.sensors?.sensor1}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sensor 2 Offset:</span>
                    <span className="font-medium">{allSettings?.categories?.sensors?.sensor2}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sensor 3 Offset:</span>
                    <span className="font-medium">{allSettings?.categories?.sensors?.sensor3}°C</span>
                  </div>
                </div>
              </div>

              {/* System Category */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">System</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strompreis:</span>
                    <span className="font-medium">€{allSettings?.categories?.system?.electricity_price}/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktiver Modus:</span>
                    <span className="font-medium">{allSettings?.categories?.system?.active_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gesamt Settings:</span>
                    <span className="font-medium">{allSettings?.total_settings}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Status */}
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Speichere...</span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}