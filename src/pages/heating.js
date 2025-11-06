// src/pages/heating.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useSystemStats,
  useParameterSettings
} from '@/hooks/useBackendData'
import { useTemperatureData } from '@/hooks/useRealtimeData'
import { backendAPI } from '@/lib/api'
import HeatingStatusCards from '@/components/heating/HeatingStatusCards'
import HeatingModeSelection from '@/components/heating/HeatingModeSelection'
import HeatingCostOverview from '@/components/heating/HeatingCostOverview'
import HeatingSettingsSection from '@/components/system/HeatingSettingsSection'

export default function HeatingControl() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading } = useHeatingStatus()
  const { data: systemStats } = useSystemStats()
  const { data: temperatureData, isLoading: temperatureLoading } = useTemperatureData()
  const { data: parameterSettings, isLoading: parameterLoading, refresh: refreshParameterSettings } = useParameterSettings()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localParameterSettings, setLocalParameterSettings] = useState({})
  const [timeSlots, setTimeSlots] = useState([
    { id: 0, start: '06:00', end: '22:00' },
    { id: 1, start: '06:00', end: '22:00' }
  ])

  // Update local parameter settings when data changes
  useEffect(() => {
    if (parameterSettings) {
      const localParams = {}
      Object.keys(parameterSettings).forEach(key => {
        localParams[key] = parameterSettings[key].value
      })
      const hasChanged = JSON.stringify(localParams) !== JSON.stringify(localParameterSettings)
      if (hasChanged && Object.keys(localParameterSettings).length > 0) {
        setLocalParameterSettings(localParams)
      } else if (Object.keys(localParameterSettings).length === 0) {
        setLocalParameterSettings(localParams)
      }
    }
  }, [parameterSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update parameter setting
  const updateParameterSetting = useCallback(async (key, value) => {
    setIsSaving(true)
    try {
      const response = await backendAPI.updateParameterSetting(key, value)
      if (response.success) {
        toast.success(`Einstellung erfolgreich aktualisiert`)
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

  // Update time slot
  const updateTimeSlot = useCallback((slotId, field, value) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ))
  }, [])

  // Calculate heating-specific data
  const getHeatingData = () => {
    if (!currentData) return null
    
    const vorlaufTemp = currentData.temperatures?.vorlauf_temp || 0
    const ruecklaufTemp = currentData.temperatures?.ruecklauf_temp || 0
    const tempDiff = vorlaufTemp - ruecklaufTemp
    
    // Berechne aktuelle Heizleistung basierend auf aktiven Heizstäben
    // Jeder Heizstab = 1500W
    let heatingPower = 0
    if (currentData.plugs) {
      const plug1Active = currentData.plugs.plug_1?.state === 'on' || currentData.plugs.plug_1?.state === true
      const plug2Active = currentData.plugs.plug_2?.state === 'on' || currentData.plugs.plug_2?.state === true
      const plug3Active = currentData.plugs.plug_3?.state === 'on' || currentData.plugs.plug_3?.state === true
      
      if (plug1Active) heatingPower += 1500
      if (plug2Active) heatingPower += 1500
      if (plug3Active) heatingPower += 1500
    }
    
    return {
      vorlaufTemp,
      ruecklaufTemp,
      tempDiff,
      heatingPower,
      efficiency: tempDiff > 0 ? Math.round((tempDiff / 20) * 100) : 0,
      isHeating: heatingPower > 0,
    }
  }

  const heatingData = getHeatingData()

  // Cost calculation for heating
  const calculateHeatingCosts = () => {
    if (!heatingData || !systemStats) return { today: '0.00', week: '0.00', month: '0.00', year: '0.00' }
    
    const hoursRunning = (systemStats.performance?.uptime_seconds || 0) / 3600
    const costPerHour = 0
    const totalCost = hoursRunning * costPerHour
    
    return {
      today: (totalCost * 0.1).toFixed(2), // Rough estimation
      week: (totalCost * 0.7).toFixed(2),
      month: (totalCost * 3).toFixed(2),
      year: totalCost.toFixed(2),
    }
  }

  const costData = calculateHeatingCosts()

  // Consumption calculation for heating (in kWh)
  const calculateHeatingConsumption = () => {
    if (!heatingData || !systemStats) return { today: '0.0', week: '0.0', month: '0.0', year: '0.0' }
    
    // Example calculation - Alex needs to implement real data from backend
    const hoursRunning = (systemStats.performance?.uptime_seconds || 0) / 3600
    const averagePower = 2.5 // kW - average heating power (can be 1.5, 3.0, or 4.5 depending on mode)
    const totalConsumption = hoursRunning * averagePower
    
    return {
      today: (totalConsumption * 0.1).toFixed(1), // Rough estimation
      week: (totalConsumption * 0.7).toFixed(1),
      month: (totalConsumption * 3).toFixed(1),
      year: totalConsumption.toFixed(1),
    }
  }

  const consumptionData = calculateHeatingConsumption()

  if (currentLoading && statusLoading && parameterLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Lade Heizungssteuerung...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Heizung - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Heizungs-Steuerung</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 md:mt-2">Kontrolle und Monitoring der Heizungsanlage</p>
        </div>

        {/* Status Cards */}
        <HeatingStatusCards
          heatingData={heatingData}
          currentData={currentData}
          currentLoading={currentLoading}
          statusLoading={statusLoading}
          temperatureData={temperatureData}
          temperatureLoading={temperatureLoading}
        />

        {/* Mode Selection Control Center */}
        <HeatingModeSelection />

        {/* Cost & Consumption Overview */}
        <HeatingCostOverview costData={costData} consumptionData={consumptionData} />

        {/* Heating Settings */}
        <HeatingSettingsSection
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          timeSlots={timeSlots}
          updateTimeSlot={updateTimeSlot}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
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
