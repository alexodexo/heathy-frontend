// src/pages/warmwater.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import StatusCard from '@/components/StatusCard'
import { ErrorMessage } from '@/components/Error'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useHeatingModes, 
  useWarmwaterSettings,
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  BeakerIcon,
  BoltIcon,
  PowerIcon,
  FireIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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

  const formatNumber = (value, decimals = 0) => {
    const num = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(num) ? num.toFixed(decimals) : '--'
  }


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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard
            title="Warmwasser"
            value={formatNumber(displayData?.waterTemp, 1)}
            unit="°C"
            icon={BeakerIcon}
            color={Number(displayData?.waterTemp) > 50 ? 'success' : 'warning'}
            loading={currentLoading}
          />
          <StatusCard
            title="Kosten/heute"
            value={formatNumber(displayData?.estimatedCostPerHour, 2)}
            unit="€"
            icon={CurrencyEuroIcon}
            color="warning"
            loading={statusLoading}
          />
        </div>

        

        {/* Mode Selection Control Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          {/* Überschrift */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Betriebsmodus Steuerung</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allModes
              .sort((a, b) => {
                // Korrekte Reihenfolge basierend auf Namen, nicht IDs
                const nameOrder = {
                  'Vollständig EIN': 1,
                  'Vollständig AUS': 2
                };
                return (nameOrder[a.name] || 999) - (nameOrder[b.name] || 999);
              })
              .map((mode, index) => {
              const isActive = mode.id === activeMode
              const isRecommended = false // Keine Empfehlung mehr - nur Ein/Aus
              const displayNumber = (() => {
                // Backend-Nummerierung beibehalten (Modi 3,4,5,6 entfernt)
                if (mode.name === 'Vollständig EIN') return 1;
                if (mode.name === 'Vollständig AUS') return 2;
                return mode.id; // Fallback
              })()
              
              return (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: isChangingMode ? 1 : 1.02 }}
                  whileTap={{ scale: isChangingMode ? 1 : 0.98 }}
                  onClick={() => {
                    if (!isChangingMode) {
                      handleModeChange(mode.id);
                    }
                  }}
                  disabled={isChangingMode}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircleIcon className="w-6 h-6 text-primary-500" />
                    </motion.div>
                  )}
                  
                  {isRecommended && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Empfohlen
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mode.active_heating ? (
                        <FireIcon className="w-5 h-5" />
                      ) : (
                        <PowerIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mode.name}</h3>
                      <p className="text-xs text-gray-500">Modus {displayNumber}</p>
                    </div>
                  </div>
                  
                  {/* Ein- und Ausschalttemperatur nur für Vollständig EIN */}
                  {mode.name === 'Vollständig EIN' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Einschalttemperatur: --°C
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: --°C
                      </p>
                    </div>
                  )}
                  

                </motion.button>
              )
            })}
          </div>
        </motion.div>



      </div>
    </>
  )
}