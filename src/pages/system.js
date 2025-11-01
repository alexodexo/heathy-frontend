// src/pages/system.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  useAllSettings, 
  useSensorSettings, 
  useWarmwaterSettings,
  useParameterSettings,
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  CurrencyEuroIcon,
  ArrowPathIcon,
  BeakerIcon,
  FireIcon,
  TrashIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'


export default function SystemSettings() {
  const { data: allSettings, isLoading: settingsLoading, refresh: refreshSettings } = useAllSettings()
  const { data: sensorSettings, refresh: refreshSensorSettings } = useSensorSettings()
  const { data: warmwaterSettings, refresh: refreshWarmwaterSettings } = useWarmwaterSettings()
  const { data: parameterSettings, isLoading: parameterLoading, refresh: refreshParameterSettings } = useParameterSettings()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({})
  const [localParameterSettings, setLocalParameterSettings] = useState({})
  const [timeSlots, setTimeSlots] = useState([
    { id: 0, start: '06:00', end: '22:00' },
    { id: 1, start: '06:00', end: '22:00' }
  ])
  
  // Initialize local settings when data loads (handled by useEffect below)

  // Update local settings when backend data changes
  useEffect(() => {
    if (allSettings?.settings) {
      setLocalSettings(allSettings.settings)
    }
  }, [allSettings])

  // Update local parameter settings when data changes
  useEffect(() => {
    if (parameterSettings) {
      const localParams = {}
      Object.keys(parameterSettings).forEach(key => {
        localParams[key] = parameterSettings[key].value
      })
      setLocalParameterSettings(localParams)
    }
  }, [parameterSettings])

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

  // Update parameter setting (for warmwater settings from database)
  const updateParameterSetting = useCallback(async (key, value) => {
    setIsSaving(true)
    try {
      const response = await backendAPI.updateParameterSetting(key, value)
      if (response.success) {
        toast.success(`Einstellung erfolgreich aktualisiert`)
        // Update local state optimistically
        setLocalParameterSettings(prev => ({ ...prev, [key]: value }))
        await refreshParameterSettings()
      } else {
        toast.error(`Fehler beim Aktualisieren der Einstellung`)
      }
    } catch (error) {
      console.error(`Error updating parameter setting ${key}:`, error)
      toast.error(`Fehler beim Aktualisieren der Einstellung`)
    } finally {
      setIsSaving(false)
    }
  }, [refreshParameterSettings])

  // Add time slot
  const addTimeSlot = useCallback(() => {
    const newId = Math.max(...timeSlots.map(slot => slot.id), -1) + 1
    setTimeSlots(prev => [...prev, { id: newId, start: '06:00', end: '22:00' }])
  }, [timeSlots])

  // Remove time slot
  const removeTimeSlot = useCallback((slotId) => {
    if (timeSlots.length > 1) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId))
    }
  }, [timeSlots])

  // Update time slot
  const updateTimeSlot = useCallback((slotId, field, value) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ))
  }, [])

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

  if (settingsLoading || parameterLoading) {
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

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">
        {/* LiveStatus entfernt gemäss Wunsch */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Systemeinstellungen</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">Konfiguration und Verwaltung</p>
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

        {/* Systemstatus-Bereich entfernt */}



        {/* Warmwater Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-0 overflow-hidden"
        >
          {/* Warmwater Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Warmwasser-Einstellungen</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">Schalttemperaturen für Warmwasser</p>
          </div>
          
          <div className="p-6">

          <div className="space-y-6">

            {/* Modus 1 + Leistung Heizstab in separaten Boxen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Modus 1: Vollständig EIN */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Modus 1 &ldquo;Normalbetrieb - EIN&rdquo;</h3>
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                      <input
                        type="number"
                        value={localParameterSettings.mode_1_switchon ?? 45}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setLocalParameterSettings(prev => ({ ...prev, mode_1_switchon: value }))
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value)
                          if (value !== parameterSettings?.mode_1_switchon?.value) {
                            updateParameterSetting('mode_1_switchon', value)
                          }
                        }}
                        className="input text-gray-900 w-full"
                        min="20"
                        max="70"
                        step="0.1"
                        placeholder="45"
                        disabled={isSaving || parameterLoading}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                      <input
                        type="number"
                        value={localParameterSettings.mode_1_switchoff ?? 55}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setLocalParameterSettings(prev => ({ ...prev, mode_1_switchoff: value }))
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value)
                          if (value !== parameterSettings?.mode_1_switchoff?.value) {
                            updateParameterSetting('mode_1_switchoff', value)
                          }
                        }}
                        className="input text-gray-900 w-full"
                        min="20"
                        max="80"  
                        step="0.1"
                        placeholder="55"
                        disabled={isSaving || parameterLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leistung Heizstab */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Leistung Heizstab</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leistung Heizstab (Watt)</label>
                  <input
                    type="number"
                    value={localParameterSettings.power_heathing_rod ?? 380}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, power_heathing_rod: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.power_heathing_rod?.value) {
                        updateParameterSetting('power_heathing_rod', value)
                      }
                    }}
                    className="input text-gray-900 w-28"
                    min="100"
                    max="2000"
                    step="10"
                    placeholder="380"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Heating Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-0 overflow-hidden"
        >
          {/* Heating Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <FireIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Heizungs-Einstellungen</h2>
            </div>
            <p className="text-green-100 text-sm mt-1">Zeitsteuerung, Pumpensteuerung und Booster-Konfiguration</p>
          </div>
          
          <div className="p-6 space-y-8">

          <div className="space-y-6">
            {/* Betriebsmodus Steuerung */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <FireIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Betriebsmodus Steuerung</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">Konfiguriere die Vorlauftemperaturen für die einzelnen Betriebsmodi.</p>

              {/* Modi Einstellungen */}
              <div className="space-y-4">
                {/* First Row - Modus 1 Full Width */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                {/* Modus 1 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Modus 1 - Normalbetrieb Beginn mit 1,5kW (L1)</h4>
                  <div className="space-y-3">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_1_switchon ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_1_switchon: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_1_switchon?.value) {
                              updateParameterSetting('mode_1_switchon', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="70"
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_1_switchoff ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_1_switchoff: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_1_switchoff?.value) {
                              updateParameterSetting('mode_1_switchoff', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="80"  
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">L2 Booster bei verzögerter Erreichung:</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Nach</span>
                          <input
                            type="number"
                            value={localParameterSettings.mode_1_l2_boost_time ?? '--'}
                            onChange={(e) => {
                              const value = parseInt(e.target.value)
                              setLocalParameterSettings(prev => ({ ...prev, mode_1_l2_boost_time: value }))
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value)
                              if (value !== parameterSettings?.mode_1_l2_boost_time?.value) {
                                updateParameterSetting('mode_1_l2_boost_time', value)
                              }
                            }}
                            className="input text-gray-900 w-16"
                            min="0"
                            max="60"
                            step="1"
                            placeholder="--"
                            disabled={isSaving || parameterLoading}
                            style={{
                              MozAppearance: 'textfield',
                              WebkitAppearance: 'none'
                            }}
                          />
                          <span className="text-xs text-gray-600">min. L2 zuschalten, wenn Vorlauftemperatur &quot;Ausschalten&quot; nicht erreicht wird.</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">L3 Booster bei verzögerter Erreichung:</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Nach</span>
                          <input
                            type="number"
                            value={localParameterSettings.mode_1_l3_boost_time ?? '--'}
                            onChange={(e) => {
                              const value = parseInt(e.target.value)
                              setLocalParameterSettings(prev => ({ ...prev, mode_1_l3_boost_time: value }))
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value)
                              if (value !== parameterSettings?.mode_1_l3_boost_time?.value) {
                                updateParameterSetting('mode_1_l3_boost_time', value)
                              }
                            }}
                            className="input text-gray-900 w-16"
                            min="0"
                            max="60"
                            step="1"
                            placeholder="--"
                            disabled={isSaving || parameterLoading}
                            style={{
                              MozAppearance: 'textfield',
                              WebkitAppearance: 'none'
                            }}
                          />
                          <span className="text-xs text-gray-600">min. L3 zuschalten, wenn Vorlauftemperatur &quot;Ausschalten&quot; nicht erreicht wird.</span>
                        </div>
                      </div>
                      
                      {/* Zeitsteuerung für Modus 1 */}
                      <div className="pt-3 border-t border-gray-300 mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-3">Zeitsteuerung:</p>
                        <div className="space-y-3">
                          {timeSlots.map((slot, index) => (
                            <div key={slot.id} className="flex items-end gap-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {index === 0 && 'Heizung einschalten um'}
                                </label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(slot.id, 'start', e.target.value)}
                                  className="input text-gray-900 w-full"
                                  disabled={isSaving}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {index === 0 && 'Heizung ausschalten um'}
                                </label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(slot.id, 'end', e.target.value)}
                                  className="input text-gray-900 w-full"
                                  disabled={isSaving}
                                />
                              </div>
                              {timeSlots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(slot.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                  disabled={isSaving}
                                  title="Zeitfenster entfernen"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* Second Row - Modi 4, 5, 6 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Modus 4 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Modus 4</h4>
                  <p className="text-xs text-gray-600 mb-3">1.5 kW Dauerbetrieb (L1)</p>
                  <div className="space-y-3">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_4_switchon ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_4_switchon: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_4_switchon?.value) {
                              updateParameterSetting('mode_4_switchon', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="70"
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_4_switchoff ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_4_switchoff: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_4_switchoff?.value) {
                              updateParameterSetting('mode_4_switchoff', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="80"  
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modus 5 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Modus 5</h4>
                  <p className="text-xs text-gray-600 mb-3">3.0 kW Dauerbetrieb (L1, L2)</p>
                  <div className="space-y-3">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_5_switchon ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_5_switchon: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_5_switchon?.value) {
                              updateParameterSetting('mode_5_switchon', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="70"
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_5_switchoff ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_5_switchoff: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_5_switchoff?.value) {
                              updateParameterSetting('mode_5_switchoff', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="80"  
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modus 6 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Modus 6</h4>
                  <p className="text-xs text-gray-600 mb-3">4.5 kW Dauerbetrieb (L1, L2, L3)</p>
                  <div className="space-y-3">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_6_switchon ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_6_switchon: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_6_switchon?.value) {
                              updateParameterSetting('mode_6_switchon', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="70"
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                        <input
                          type="number"
                          value={localParameterSettings.mode_6_switchoff ?? '--'}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, mode_6_switchoff: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value !== parameterSettings?.mode_6_switchoff?.value) {
                              updateParameterSetting('mode_6_switchoff', value)
                            }
                          }}
                          className="input text-gray-900 w-full"
                          min="20"
                          max="80"  
                          step="0.1"
                          placeholder="--"
                          disabled={isSaving || parameterLoading}
                        />
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

              {/* Info Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Konfiguriere die Vorlauftemperaturen für jeden Betriebsmodus.
                </p>
              </div>
            </div>

            {/* Booster Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-100">
                  <BoltIcon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Modus 2 - Booster Einstellungen</h3>
              </div>
              
              {/* Gesamt-Boosterzeit */}
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-orange-800">
                    Gesamt-Boosterzeit:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localParameterSettings.total_booster_duration ?? 30}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, total_booster_duration: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value)
                        if (value !== parameterSettings?.total_booster_duration?.value) {
                          updateParameterSetting('total_booster_duration', value)
                        }
                      }}
                      className="input text-gray-900 w-20 font-semibold"
                      min="1"
                      max="120"
                      step="1"
                      disabled={isSaving || parameterLoading}
                    />
                    <span className="text-sm font-medium text-orange-800">min</span>
                  </div>
                  
                  {/* Restzeit Anzeige */}
                  <div className="ml-auto flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Verbleibend:</span>
                      <span className={`font-semibold ${
                        (localParameterSettings.total_booster_duration ?? 30) - 
                        (localParameterSettings.phase1_duration ?? 10) - 
                        (localParameterSettings.phase2_duration ?? 12) - 
                        (localParameterSettings.phase3_duration ?? 8) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {Math.max(0, (localParameterSettings.total_booster_duration ?? 30) - 
                        (localParameterSettings.phase1_duration ?? 10) - 
                        (localParameterSettings.phase2_duration ?? 12) - 
                        (localParameterSettings.phase3_duration ?? 8))} min
                      </span>
                    </div>

                    {/* Visueller Zeitbalken */}
                    <div className="flex items-center gap-1">
                      <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden flex">
                        {/* Phase 1 */}
                        <div 
                          className="bg-red-400 h-full"
                          style={{
                            width: `${((localParameterSettings.phase1_duration ?? 10) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                          }}
                          title={`Phase 1: ${localParameterSettings.phase1_duration ?? 10} min`}
                        />
                        {/* Phase 2 */}
                        <div 
                          className="bg-yellow-400 h-full"
                          style={{
                            width: `${((localParameterSettings.phase2_duration ?? 12) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                          }}
                          title={`Phase 2: ${localParameterSettings.phase2_duration ?? 12} min`}
                        />
                        {/* Phase 3 */}
                        <div 
                          className="bg-green-400 h-full"
                          style={{
                            width: `${((localParameterSettings.phase3_duration ?? 8) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                          }}
                          title={`Phase 3: ${localParameterSettings.phase3_duration ?? 8} min`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        {(localParameterSettings.phase1_duration ?? 10) + 
                         (localParameterSettings.phase2_duration ?? 12) + 
                         (localParameterSettings.phase3_duration ?? 8)}/{localParameterSettings.total_booster_duration ?? 30}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booster-Phasen */}
              <div className="space-y-4">
                {/* Phase 1: Aufheizen */}
                <div className="flex gap-6 items-start p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  {/* Phase Label */}
                  <div className="flex-shrink-0 w-[160px]">
                    <h4 className="text-sm font-semibold text-red-700">Phase 1: Aufheizen</h4>
                    <p className="text-xs text-red-600">Booster-Phase</p>
                  </div>

                  {/* Duration & Heizstäbe Column */}
                  <div className="flex-1">
                    {/* Duration & Heizstäbe on same line */}
                    <div className="flex items-center gap-4">
                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={localParameterSettings.phase1_duration ?? 10}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, phase1_duration: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value)
                            if (value !== parameterSettings?.phase1_duration?.value) {
                              updateParameterSetting('phase1_duration', value)
                            }
                          }}
                          className="input text-gray-900 w-20"
                          min="0"
                          max="120"
                          step="1"
                          disabled={isSaving || parameterLoading}
                        />
                        <span className="text-xs font-medium text-gray-700">min</span>
                      </div>

                      {/* Heizstäbe */}
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'L1', label: 'L1' },
                          { value: 'L2', label: 'L2' },
                          { value: 'L3', label: 'L3' }
                        ].map((option) => (
                          <label key={`phase1_${option.value}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={Array.isArray(localParameterSettings.phase1_power) 
                                ? localParameterSettings.phase1_power.includes(option.value)
                                : ['L1', 'L2', 'L3'].includes(option.value)}
                              onChange={(e) => {
                                const value = e.target.value
                                const currentPowers = Array.isArray(localParameterSettings.phase1_power) 
                                  ? localParameterSettings.phase1_power 
                                  : ['L1', 'L2', 'L3']
                                
                                let newPowers
                                if (e.target.checked) {
                                  newPowers = [...currentPowers, value]
                                } else {
                                  newPowers = currentPowers.filter(p => p !== value)
                                }
                                
                                setLocalParameterSettings(prev => ({ ...prev, phase1_power: newPowers }))
                                updateParameterSetting('phase1_power', newPowers)
                              }}
                              className="w-4 h-4 text-red-600 focus:ring-red-500 focus:ring-2 rounded"
                              disabled={isSaving || parameterLoading}
                            />
                            <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Power Display */}
                  <div className="ml-6 text-right">
                    <div className="text-sm font-semibold text-red-700">
                      {(Array.isArray(localParameterSettings.phase1_power) 
                        ? localParameterSettings.phase1_power.length 
                        : 3) * 1.5} kW
                    </div>
                    <div className="text-xs text-red-600">Max. Power</div>
                  </div>
                </div>

                {/* Phase 2: Stabilisieren */}
                <div className="flex gap-6 items-start p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  {/* Phase Label */}
                  <div className="flex-shrink-0 w-[160px]">
                    <h4 className="text-sm font-semibold text-yellow-700">Phase 2: Stabilisieren</h4>
                    <p className="text-xs text-yellow-600">Temperatur halten</p>
                  </div>

                  {/* Duration & Heizstäbe Column */}
                  <div className="flex-1">
                    {/* Duration & Heizstäbe on same line */}
                    <div className="flex items-center gap-4">
                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={localParameterSettings.phase2_duration ?? 12}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, phase2_duration: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value)
                            if (value !== parameterSettings?.phase2_duration?.value) {
                              updateParameterSetting('phase2_duration', value)
                            }
                          }}
                          className="input text-gray-900 w-20"
                          min="0"
                          max="120"
                          step="1"
                          disabled={isSaving || parameterLoading}
                        />
                        <span className="text-xs font-medium text-gray-700">min</span>
                      </div>

                      {/* Heizstäbe */}
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'L1', label: 'L1' },
                          { value: 'L2', label: 'L2' },
                          { value: 'L3', label: 'L3' }
                        ].map((option) => (
                          <label key={`phase2_${option.value}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={Array.isArray(localParameterSettings.phase2_power) 
                                ? localParameterSettings.phase2_power.includes(option.value)
                                : ['L1', 'L2'].includes(option.value)}
                              onChange={(e) => {
                                const value = e.target.value
                                const currentPowers = Array.isArray(localParameterSettings.phase2_power) 
                                  ? localParameterSettings.phase2_power 
                                  : ['L1', 'L2']
                                
                                let newPowers
                                if (e.target.checked) {
                                  newPowers = [...currentPowers, value]
                                } else {
                                  newPowers = currentPowers.filter(p => p !== value)
                                }
                                
                                setLocalParameterSettings(prev => ({ ...prev, phase2_power: newPowers }))
                                updateParameterSetting('phase2_power', newPowers)
                              }}
                              className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 focus:ring-2 rounded"
                              disabled={isSaving || parameterLoading}
                            />
                            <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Power Display */}
                  <div className="ml-6 text-right">
                    <div className="text-sm font-semibold text-yellow-700">
                      {(Array.isArray(localParameterSettings.phase2_power) 
                        ? localParameterSettings.phase2_power.length 
                        : 2) * 1.5} kW
                    </div>
                    <div className="text-xs text-yellow-600">Mittlere Power</div>
                  </div>
                </div>

                {/* Phase 3: Halten */}
                <div className="flex gap-6 items-start p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  {/* Phase Label */}
                  <div className="flex-shrink-0 w-[160px]">
                    <h4 className="text-sm font-semibold text-green-700">Phase 3: Halten</h4>
                    <p className="text-xs text-green-600">Ausdauerbetrieb</p>
                  </div>

                  {/* Duration & Heizstäbe Column */}
                  <div className="flex-1">
                    {/* Duration & Heizstäbe on same line */}
                    <div className="flex items-center gap-4">
                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={localParameterSettings.phase3_duration ?? 8}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            setLocalParameterSettings(prev => ({ ...prev, phase3_duration: value }))
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value)
                            if (value !== parameterSettings?.phase3_duration?.value) {
                              updateParameterSetting('phase3_duration', value)
                            }
                          }}
                          className="input text-gray-900 w-20"
                          min="0"
                          max="120"
                          step="1"
                          disabled={isSaving || parameterLoading}
                        />
                        <span className="text-xs font-medium text-gray-700">min</span>
                      </div>

                      {/* Heizstäbe */}
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'L1', label: 'L1' },
                          { value: 'L2', label: 'L2' },
                          { value: 'L3', label: 'L3' }
                        ].map((option) => (
                          <label key={`phase3_${option.value}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={Array.isArray(localParameterSettings.phase3_power) 
                                ? localParameterSettings.phase3_power.includes(option.value)
                                : ['L1'].includes(option.value)}
                              onChange={(e) => {
                                const value = e.target.value
                                const currentPowers = Array.isArray(localParameterSettings.phase3_power) 
                                  ? localParameterSettings.phase3_power 
                                  : ['L1']
                                
                                let newPowers
                                if (e.target.checked) {
                                  newPowers = [...currentPowers, value]
                                } else {
                                  newPowers = currentPowers.filter(p => p !== value)
                                }
                                
                                setLocalParameterSettings(prev => ({ ...prev, phase3_power: newPowers }))
                                updateParameterSetting('phase3_power', newPowers)
                              }}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2 rounded"
                              disabled={isSaving || parameterLoading}
                            />
                            <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Power Display */}
                  <div className="ml-6 text-right">
                    <div className="text-sm font-semibold text-green-700">
                      {(Array.isArray(localParameterSettings.phase3_power) 
                        ? localParameterSettings.phase3_power.length 
                        : 1) * 1.5} kW
                    </div>
                    <div className="text-xs text-green-600">Min. Power</div>
                  </div>
                </div>
              </div>

              {/* Combined Info Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Intelligenter Booster-Sequenzer:</strong> Phase 1 startet die Booster-Phase mit maximaler Leistung. 
                  Phase 2 stabilisiert die Temperatur (Mittlere Power). Phase 3 hält die Temperatur im Ausdauerbetrieb (Min. Power). 
                  Die Summe aller Phasen darf die Gesamt-Boosterzeit nicht überschreiten.
                </p>
              </div>
            </div>

            {/* Pump Overrun Time */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Heizungs-Zirkulationspumpe</h3>
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachlaufzeit nach Ausschalten der Heizstäbe
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localParameterSettings.pump_overrun_time ?? 10}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, pump_overrun_time: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value)
                        if (value !== parameterSettings?.pump_overrun_time?.value) {
                          updateParameterSetting('pump_overrun_time', value)
                        }
                      }}
                      className="input text-gray-900 w-20"
                      min="0"
                      max="60"
                      step="1"
                      placeholder="10"
                      disabled={isSaving || parameterLoading}
                    />
                    <span className="text-sm font-medium text-gray-700">min</span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Hinweis:</strong> Die Zirkulationspumpe läuft automatisch nach dem Ausschalten der Heizstäbe noch diese Zeit weiter, um die Restwärme zu verteilen.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pumpenlauf gegen Festsetzen
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Täglich um</span>
                    <input
                      type="time"
                      value={localParameterSettings.pump_protection_time ?? '12:00'}
                      onChange={(e) => {
                        const value = e.target.value
                        setLocalParameterSettings(prev => ({ ...prev, pump_protection_time: value }))
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        if (value !== parameterSettings?.pump_protection_time?.value) {
                          updateParameterSetting('pump_protection_time', value)
                        }
                      }}
                      className="input text-gray-900 w-28"
                      disabled={isSaving || parameterLoading}
                    />
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Hinweis:</strong> Regelmäßige Betätigung zur Erhaltung der Funktionsfähigkeit. Die Pumpe startet automatisch für 1min, auch wenn keine Heizung aktiv ist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Billing Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-0 overflow-hidden"
        >
          {/* Billing Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <CurrencyEuroIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Abrechnungseinstellungen</h2>
            </div>
            <p className="text-orange-100 text-sm mt-1">Strompreise und Zählerstände für die Kostenberechnung</p>
          </div>
          
          <div className="p-6">

          <div className="space-y-6">
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
                className="input text-gray-900 w-32"
                step="0.01"
                min="0"
                max="1"
                disabled={isSaving}
              />
            </div>
            
            <div className="border-t border-gray-200 my-6"></div>
            
            <div>
              <div className="flex gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand Heizung
                  </label>
                  <input
                    type="number"
                    value={localSettings.warmwater_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, warmwater_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.warmwater_meter_reading) {
                        updateSetting('warmwater_meter_reading', value)
                      }
                    }}
                    className="input text-gray-900 w-32"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum Ablesung Heizung
                  </label>
                  <input
                    type="date"
                    value={localSettings.warmwater_meter_date || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, warmwater_meter_date: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.warmwater_meter_date) {
                        updateSetting('warmwater_meter_date', value)
                      }
                    }}
                    className="input text-gray-900 w-40"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 my-6"></div>
            
            <div>
              <div className="flex gap-6 flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand HT
                  </label>
                  <input
                    type="number"
                    value={localSettings.ht_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, ht_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.ht_meter_reading) {
                        updateSetting('ht_meter_reading', value)
                      }
                    }}
                    className="input text-gray-900 w-32"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand NT
                  </label>
                  <input
                    type="number"
                    value={localSettings.nt_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, nt_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.nt_meter_reading) {
                        updateSetting('nt_meter_reading', value)
                      }
                    }}
                    className="input text-gray-900 w-32"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum Ablesung HT/NT
                  </label>
                  <input
                    type="date"
                    value={localSettings.electricity_meter_date || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, electricity_meter_date: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.electricity_meter_date) {
                        updateSetting('electricity_meter_date', value)
                      }
                    }}
                    className="input text-gray-900 w-40"
                    disabled={isSaving}
                  />
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