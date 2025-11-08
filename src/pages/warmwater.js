// src/pages/warmwater.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useHeatingModes, 
  useWarmwaterSettings,
  useSystemStats,
  useEinstellungen,
} from '@/hooks/useBackendData'
import { useTemperatureData } from '@/hooks/useRealtimeData'
import WarmwaterStatusCards from '@/components/warmwater/WarmwaterStatusCards'
import WarmwaterModeSelection from '@/components/warmwater/WarmwaterModeSelection'
import WarmwaterCostOverview from '@/components/warmwater/WarmwaterCostOverview'
import WarmwaterSettingsSection from '@/components/system/WarmwaterSettingsSection'

export default function WarmwaterControlCenter() {
  const { data: currentData, isLoading: currentLoading, refresh: refreshCurrent } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading, refresh: refreshStatus } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading, refresh: refreshModes } = useHeatingModes()
  const { data: warmwaterSettings, isLoading: settingsLoading } = useWarmwaterSettings()
  const { data: systemStats } = useSystemStats()
  const { data: einstellungen, isLoading: einstellungenLoading, refresh: refreshEinstellungen } = useEinstellungen()
  const { data: temperatureData, isLoading: temperatureLoading } = useTemperatureData()
  
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({})

  // Reset changing mode state on component mount
  useEffect(() => {
    setIsChangingMode(false)
  }, [])

  // Update local settings when data changes
  useEffect(() => {
    if (einstellungen) {
      const newLocalSettings = {}
      Object.keys(einstellungen).forEach(key => {
        newLocalSettings[key] = einstellungen[key].value
      })
      const hasChanged = JSON.stringify(newLocalSettings) !== JSON.stringify(localSettings)
      if (hasChanged && Object.keys(localSettings).length > 0) {
        setLocalSettings(newLocalSettings)
      } else if (Object.keys(localSettings).length === 0) {
        setLocalSettings(newLocalSettings)
      }
    }
  }, [einstellungen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update setting
  const updateSetting = useCallback(async (key, value, description = null) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/einstellungen/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, description }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Einstellung erfolgreich aktualisiert`)
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        await refreshEinstellungen()
      } else {
        toast.error(`Fehler beim Aktualisieren der Einstellung`)
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      toast.error(`Fehler beim Aktualisieren der Einstellung`)
    } finally {
      setIsSaving(false)
    }
  }, [refreshEinstellungen])

  // Get available modes from backend
  const availableModes = heatingModes?.modes ? Object.values(heatingModes.modes) : []
  // Aktiver Modus kommt aus einstellungen.warmwasser_modus (0=AUS/modeId 2, 1=EIN/modeId 1)
  const warmwasserModusValue = einstellungen?.warmwasser_modus?.value
  const activeMode = warmwasserModusValue === 1 ? 1 : 2

  // Kombiniere echte Modi mit Dummy-Modi
  // Vermeide Duplikate (falls Backend später gleiche IDs liefert)
  const byId = new Map()
  ;[...availableModes].forEach(m => {
    if (!byId.has(m.id)) byId.set(m.id, m)
  })
  const allModes = Array.from(byId.values())

  // Mode change handler - steuert warmwasser_modus in einstellungen Tabelle
  const handleModeChange = useCallback(async (modeId) => {
    if (isChangingMode) return // Prevent double-clicks
    
    setIsChangingMode(true)
    try {
      // modeId 1 = EIN, modeId 2 = AUS
      const newValue = modeId === 1 ? 1 : 0
      
      const response = await fetch('/api/einstellungen/warmwasser_modus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          value: newValue, 
          description: 'Warmwasser-Modus: 0=AUS, 1=EIN' 
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        const modeName = modeId === 1 ? 'Vollständig EIN' : 'Vollständig AUS'
        toast.success(`Modus ${modeName} aktiviert`)
        // Refresh einstellungen
        await refreshEinstellungen()
      } else {
        toast.error('Modus konnte nicht aktiviert werden')
      }
    } catch (error) {
      console.error('Error activating mode:', error)
      toast.error('Fehler beim Aktivieren des Modus')
    } finally {
      // Ensure state is always reset, even if an error occurs
      setTimeout(() => setIsChangingMode(false), 100)
    }
  }, [isChangingMode, refreshEinstellungen])

  // Calculate minimal data needed for display
  const getDisplayData = () => {
    if (!currentData || !heatingStatus || !temperatureData) return null
    
    // Get water temperature from temperature_data table (t1)
    const waterTemp = temperatureData.t1 || 0
    
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
      waterTemp,
      heatingPower,
    }
  }

  const displayData = getDisplayData()

  // Cost calculation for warmwater
  const calculateWarmwaterCosts = () => {
    if (!systemStats) return { today: '0.00', week: '0.00', month: '0.00', year: '0.00' }
    
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

  // Consumption calculation for warmwater (in kWh)
  const calculateWarmwaterConsumption = () => {
    if (!systemStats) return { today: '0.0', week: '0.0', month: '0.0', year: '0.0' }
    
    // Example calculation - Alex needs to implement real data from backend
    const hoursRunning = (systemStats.performance?.uptime_seconds || 0) / 3600
    const averagePower = 2.0 // kW - average warmwater heating power
    const totalConsumption = hoursRunning * averagePower
    
    return {
      today: (totalConsumption * 0.1).toFixed(1), // Rough estimation
      week: (totalConsumption * 0.7).toFixed(1),
      month: (totalConsumption * 3).toFixed(1),
      year: totalConsumption.toFixed(1),
    }
  }

  const costData = calculateWarmwaterCosts()
  const consumptionData = calculateWarmwaterConsumption()

  if (currentLoading && statusLoading && modesLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Lade Schaltzentrale...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Warmwasser Schaltzentrale - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Warmwasser Schaltzentrale</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 md:mt-2">Live-Steuerung und Monitoring</p>
        </div>

        {/* Live Status Cards */}
      <WarmwaterStatusCards 
        waterTemp={displayData?.waterTemp}
        heatingPower={displayData?.heatingPower}
        currentLoading={currentLoading || temperatureLoading}
        statusLoading={statusLoading}
      />

        {/* Mode Selection Control Center */}
        <WarmwaterModeSelection
          allModes={allModes}
          activeMode={activeMode}
          isChangingMode={isChangingMode}
          onModeChange={handleModeChange}
          einstellungen={einstellungen}
        />

        {/* Cost & Consumption Overview */}
        <WarmwaterCostOverview costData={costData} consumptionData={consumptionData} />

        {/* Warmwater Settings */}
        <WarmwaterSettingsSection
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          einstellungen={einstellungen}
          updateSetting={updateSetting}
          isSaving={isSaving}
          einstellungenLoading={einstellungenLoading}
        />
      </div>
    </>
  )
}
