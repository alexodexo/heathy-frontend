// src/pages/warmwater.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useHeatingModes, 
  useWarmwaterSettings,
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import WarmwaterStatusCards from '@/components/warmwater/WarmwaterStatusCards'
import WarmwaterModeSelection from '@/components/warmwater/WarmwaterModeSelection'

export default function WarmwaterControlCenter() {
  const { data: currentData, isLoading: currentLoading, refresh: refreshCurrent } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading, refresh: refreshStatus } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading, refresh: refreshModes } = useHeatingModes()
  const { data: warmwaterSettings, isLoading: settingsLoading } = useWarmwaterSettings()
  
  const [isChangingMode, setIsChangingMode] = useState(false)

  // Reset changing mode state on component mount
  useEffect(() => {
    setIsChangingMode(false)
  }, [])

  // Get available modes from backend
  const availableModes = heatingModes?.modes ? Object.values(heatingModes.modes) : []
  const activeMode = heatingModes?.active_mode

  // Kombiniere echte Modi mit Dummy-Modi
  // Vermeide Duplikate (falls Backend später gleiche IDs liefert)
  const byId = new Map()
  ;[...availableModes].forEach(m => {
    if (!byId.has(m.id)) byId.set(m.id, m)
  })
  const allModes = Array.from(byId.values())

  // Mode change handler
  const handleModeChange = useCallback(async (modeId) => {
    if (isChangingMode) return // Prevent double-clicks
    
    setIsChangingMode(true)
    try {
      const response = await backendAPI.activateMode(modeId)
      if (response.success) {
        toast.success(`Modus ${response.data.mode_name} aktiviert`)
        // Refresh data in parallel
        await Promise.all([refreshModes(), refreshStatus()])
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
  }, [isChangingMode, refreshModes, refreshStatus])

  // Calculate minimal data needed for display
  const getDisplayData = () => {
    if (!currentData || !heatingStatus) return null
    
    const waterTemp = currentData.temperatures?.water_temp || 0
    const activeModeInfo = availableModes.find(mode => mode.id === activeMode)
    
    return {
      waterTemp,
      estimatedCostPerHour: activeModeInfo?.estimated_cost_hour || 0,
    }
  }

  const displayData = getDisplayData()

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

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Warmwasser Schaltzentrale</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">Live-Steuerung und Monitoring</p>
          </div>
        </div>

        {/* Live Status Cards */}
        <WarmwaterStatusCards
          waterTemp={displayData?.waterTemp}
          estimatedCostPerHour={displayData?.estimatedCostPerHour}
          currentLoading={currentLoading}
          statusLoading={statusLoading}
        />

        {/* Mode Selection Control Center */}
        <WarmwaterModeSelection
          allModes={allModes}
          activeMode={activeMode}
          isChangingMode={isChangingMode}
          onModeChange={handleModeChange}
        />
      </div>
    </>
  )
}
