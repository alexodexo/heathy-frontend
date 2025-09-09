// src/pages/warmwater.js
import { useState, useCallback } from 'react'
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

  // Get available modes from backend
  const availableModes = heatingModes?.modes ? Object.values(heatingModes.modes) : []
  const activeMode = heatingModes?.active_mode

  // Dummy-Daten für Power-Modus 4.5 kW (Modus 3) bis Backend erweitert wird
  const dummyPowerMode = {
    id: 3,
    name: "Power-Modus 4.5 kW",
    description: "Hochleistungsmodus für maximale Heizleistung",
    pwm_value: 255,
    estimated_power: 4500,
    output_voltage: 24,
    estimated_cost_hour: 0.85,
    target_temp: 70,
    active_heating: true,
    reason: "Hochleistungsbetrieb"
  }

  // Dummy-Daten für Gäste-Modus (Modus 6) bis Backend erweitert wird
  const dummyGuestMode = {
    id: 4,
    name: "Gäste-Modus",
    description: "Spezieller Modus für Gäste mit reduzierter Leistung",
    pwm_value: 128,
    estimated_power: 2000,
    output_voltage: 12,
    estimated_cost_hour: 0.45,
    target_temp: 55,
    active_heating: true,
    reason: "Gästebetrieb"
  }

  // Kombiniere echte Modi mit Dummy-Modi
  // Vermeide Duplikate (falls Backend später gleiche IDs liefert)
  const byId = new Map()
  ;[...availableModes, dummyPowerMode, dummyGuestMode].forEach(m => {
    if (!byId.has(m.id)) byId.set(m.id, m)
  })
  const allModes = Array.from(byId.values())

  // Mode change handler
  const handleModeChange = useCallback(async (modeId) => {
    setIsChangingMode(true)
    try {
      const response = await backendAPI.activateMode(modeId)
      if (response.success) {
        toast.success(`Modus ${response.data.mode_name} aktiviert`)
        await refreshModes()
        await refreshStatus()
      } else {
        toast.error('Modus konnte nicht aktiviert werden')
      }
    } catch (error) {
      console.error('Error activating mode:', error)
      toast.error('Fehler beim Aktivieren des Modus')
    } finally {
      setIsChangingMode(false)
    }
  }, [refreshModes, refreshStatus])

  

  // Calculate current efficiency and costs
  const getEfficiencyData = () => {
    if (!currentData || !heatingStatus) return null
    
    const waterTemp = currentData.temperatures?.water_temp || 0
    const currentPower = currentData.power?.total_power || 0
    const activeModeInfo = availableModes.find(mode => mode.id === activeMode)
    
    return {
      waterTemp,
      currentPower,
      estimatedCostPerHour: activeModeInfo?.estimated_cost_hour || 0,
      efficiency: waterTemp > 0 ? Math.round((waterTemp / 70) * 100) : 0,
      targetTemp: activeModeInfo?.target_temp || 0,
      isHeating: activeModeInfo?.active_heating || false,
    }
  }

  const efficiencyData = getEfficiencyData()

  const formatNumber = (value, decimals = 0) => {
    const num = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(num) ? num.toFixed(decimals) : '--'
  }

  // Spannung aus Backend ableiten (ohne Modus-Fallback)
  const extractVoltage = (status, current) => {
    const candidates = []
    if (status && typeof status === 'object') {
      candidates.push(status.output_voltage)
      candidates.push(status.voltage)
      candidates.push(status.out_voltage)
      candidates.push(status.v_out)
    }
    if (current && typeof current === 'object') {
      candidates.push(current.output_voltage)
      candidates.push(current.voltage)
      candidates.push(current?.power?.output_voltage)
      candidates.push(current?.power?.voltage)
    }
    return candidates.find(v => typeof v === 'number')
  }

  // Live-Werte: PWM aus HeatingStatus, Spannung/Leistung nur aus Backend-Daten
  const livePwm = typeof heatingStatus?.last_sent_pwm === 'number'
    ? heatingStatus.last_sent_pwm
    : undefined

  const liveVoltage = extractVoltage(heatingStatus, currentData)

  const livePower = typeof currentData?.power?.total_power === 'number'
    ? currentData.power.total_power
    : undefined

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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warmwasser Schaltzentrale</h1>
            <p className="text-gray-600 mt-1">Live-Steuerung und Monitoring</p>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="Warmwasser"
            value={formatNumber(efficiencyData?.waterTemp, 1)}
            unit="°C"
            icon={BeakerIcon}
            color={Number(efficiencyData?.waterTemp) > 50 ? 'success' : 'warning'}
            loading={currentLoading}
          />
          <StatusCard
            title="Aktuelle Leistung"
            value={formatNumber(livePower, 0)}
            unit="W"
            icon={BoltIcon}
            color="primary"
            loading={currentLoading}
            topRight={(
              <div className="flex items-center gap-2">
                <span className={`status-dot ${efficiencyData?.isHeating ? 'status-active' : 'status-inactive'}`} />
                <span className="text-xs font-medium text-gray-700">
                  {efficiencyData?.isHeating ? 'Heizung ein' : 'Heizung aus'}
                </span>
              </div>
            )}
          />
          <StatusCard
            title="PV-Strom"
            value={formatNumber(efficiencyData?.efficiency, 0)}
            unit="%"
            icon={BoltIcon}
            color={Number(efficiencyData?.efficiency) > 70 ? 'success' : 'error'}
            loading={currentLoading}
          />
          <StatusCard
            title="Kosten/Monat"
            value={formatNumber(efficiencyData?.estimatedCostPerHour, 2)}
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
          {/* Überschrift und aktuelle Werte in einer Zeile */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900">Betriebsmodus Steuerung</h2>
            
                        <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">PWM</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(livePwm, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Spannung</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(liveVoltage, 0)}
                  <span className="text-gray-500 font-normal"> V</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Leistung</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(livePower, 0)}
                  <span className="text-gray-500 font-normal"> W</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allModes
              .sort((a, b) => {
                // Debug: Zeige die Sortierung
                console.log('Sorting:', a.id, b.id, a.name, b.name);
                // Korrekte Reihenfolge basierend auf Namen, nicht IDs
                const nameOrder = {
                  'Normalbetrieb + PV-Strom': 1,
                  'Nur PV-Strom': 2,
                  'Power-Modus 4.5 kW': 3,
                  'Gäste-Modus': 4,
                  'Vollständig EIN': 5,
                  'Vollständig AUS': 6
                };
                return (nameOrder[a.name] || 999) - (nameOrder[b.name] || 999);
              })
              .map((mode, index) => {
              const isActive = mode.id === activeMode
              const isRecommended = mode.name === 'Normalbetrieb + PV-Strom' // Modus 1 empfohlen
              const displayNumber = (() => {
                // Spezielle Nummerierung: "Normalbetrieb + PV-Strom" wird Modus 1
                if (mode.name === 'Normalbetrieb + PV-Strom') return 1;
                if (mode.name === 'Nur PV-Strom') return 2;
                if (mode.name === 'Power-Modus 4.5 kW') return 3;
                if (mode.name === 'Gäste-Modus') return 4;
                if (mode.name === 'Vollständig EIN') return 5;
                if (mode.name === 'Vollständig AUS') return 6;
                return mode.id; // Fallback
              })()
              
              return (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isChangingMode && handleModeChange(mode.id)}
                  disabled={isChangingMode}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Empfohlen
                      </span>
                    </div>
                  )}
                  
                  {/* Pumpen-Status für Power-Modus 4.5 kW rechts oben */}
                  {mode.name === 'Power-Modus 4.5 kW' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className={`status-dot ${currentData?.recirc_pump_no2 ? 'status-active' : 'status-inactive'}`} />
                      <span className="text-xs font-medium text-gray-700">
                        {currentData?.recirc_pump_no2 ? 'Pumpe ein' : 'Pumpe aus'}
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
                  
                  {/* Ausschalttemperatur nur für Normalbetrieb + PV-Strom */}
                  {mode.name === 'Normalbetrieb + PV-Strom' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: {warmwaterSettings?.warmwater?.switchon || '--'}°C
                      </p>
                    </div>
                  )}
                  
                  {/* Ausschalttemperatur nur für Nur PV-Strom */}
                  {mode.name === 'Nur PV-Strom' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: {warmwaterSettings?.warmwater?.switchoff || '--'}°C
                      </p>
                    </div>
                  )}
                  
                  {/* Ausschalttemperatur nur für Vollständig EIN */}
                  {mode.name === 'Vollständig EIN' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: {warmwaterSettings?.warmwater?.switchoff || '--'}°C
                      </p>
                    </div>
                  )}
                  
                  {/* Ausschalttemperatur nur für Power-Modus 4.5 kW */}
                  {mode.name === 'Power-Modus 4.5 kW' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: --
                      </p>
                    </div>
                  )}
                  
                  {/* Ausschalttemperatur nur für Gäste-Modus */}
                  {mode.name === 'Gäste-Modus' && (
                    <div className="mt-2 ml-11">
                      <p className="text-sm font-medium text-gray-900">
                        Ausschalttemperatur: --
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