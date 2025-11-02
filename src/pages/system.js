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
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import WarmwaterSettingsSection from '@/components/system/WarmwaterSettingsSection'
import HeatingSettingsSection from '@/components/system/HeatingSettingsSection'
import BillingSettingsSection from '@/components/system/BillingSettingsSection'


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

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Systemeinstellungen</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 md:mt-2">Konfiguration und Verwaltung</p>
          </div>
          <button
            onClick={handleRefreshSettings}
            className="btn-secondary flex-shrink-0 h-10"
            disabled={isSaving}
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Neu laden</span>
          </button>
        </div>

        {/* Warmwater Settings */}
        <WarmwaterSettingsSection
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />

        {/* Heating Settings */}
        <HeatingSettingsSection
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          timeSlots={timeSlots}
          updateTimeSlot={updateTimeSlot}
          removeTimeSlot={removeTimeSlot}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />

        {/* Billing Settings */}
        <BillingSettingsSection
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          allSettings={allSettings}
          updateSetting={updateSetting}
          isSaving={isSaving}
        />

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
