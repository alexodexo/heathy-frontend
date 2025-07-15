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
  useWarmwaterSettings 
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  BeakerIcon,
  SunIcon,
  BoltIcon,
  PowerIcon,
  FireIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StopIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'

export default function WarmwaterControlCenter() {
  const { data: currentData, isLoading: currentLoading, refresh: refreshCurrent } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading, refresh: refreshStatus } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading, refresh: refreshModes } = useHeatingModes()
  const { data: warmwaterSettings, isLoading: settingsLoading } = useWarmwaterSettings()
  
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [emergencyStopConfirm, setEmergencyStopConfirm] = useState(false)

  // Get available modes from backend
  const availableModes = heatingModes?.modes ? Object.values(heatingModes.modes) : []
  const activeMode = heatingModes?.active_mode

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

  // Emergency stop handler
  const handleEmergencyStop = useCallback(async () => {
    try {
      const response = await backendAPI.emergencyStop()
      if (response.success) {
        toast.success('Notfall-Stop ausgeführt')
        setEmergencyStopConfirm(false)
        await refreshStatus()
        await refreshModes()
      } else {
        toast.error('Notfall-Stop fehlgeschlagen')
      }
    } catch (error) {
      console.error('Error executing emergency stop:', error)
      toast.error('Fehler beim Notfall-Stop')
    }
  }, [refreshStatus, refreshModes])

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
            <p className="text-gray-600 mt-1">Live-Steuerung und Überwachung</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-dot ${efficiencyData?.isHeating ? 'status-active' : 'status-inactive'}`} />
            <span className="text-sm font-medium text-gray-700">
              {efficiencyData?.isHeating ? 'Heizung aktiv' : 'Heizung inaktiv'}
            </span>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="Warmwasser"
            value={efficiencyData?.waterTemp?.toFixed(1) || '--'}
            unit="°C"
            icon={BeakerIcon}
            color={efficiencyData?.waterTemp > 50 ? 'success' : 'warning'}
            loading={currentLoading}
          />
          <StatusCard
            title="Aktuelle Leistung"
            value={efficiencyData?.currentPower?.toFixed(0) || '--'}
            unit="W"
            icon={BoltIcon}
            color="primary"
            loading={currentLoading}
          />
          <StatusCard
            title="Kosten/Stunde"
            value={`€${efficiencyData?.estimatedCostPerHour || '0.00'}`}
            icon={CurrencyEuroIcon}
            color="warning"
            loading={statusLoading}
          />
          <StatusCard
            title="Effizienz"
            value={`${efficiencyData?.efficiency || 0}%`}
            icon={CheckCircleIcon}
            color={efficiencyData?.efficiency > 70 ? 'success' : 'error'}
            loading={currentLoading}
          />
        </div>

        {/* Emergency Stop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-red-200 bg-red-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-xl text-white">
                <StopIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Notfall-Stop</h3>
                <p className="text-sm text-red-700">Heizung sofort ausschalten</p>
              </div>
            </div>
            
            {!emergencyStopConfirm ? (
              <button
                onClick={() => setEmergencyStopConfirm(true)}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                <StopIcon className="w-4 h-4" />
                Notfall-Stop
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEmergencyStopConfirm(false)}
                  className="btn-secondary text-sm"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleEmergencyStop}
                  className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Bestätigen
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mode Selection Control Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Betriebsmodus Steuerung</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModes.map((mode) => {
              const isActive = mode.id === activeMode
              const isRecommended = mode.id === 4 // Normalbetrieb + PV is recommended
              
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
                  
                  {isRecommended && !isActive && (
                    <div className="absolute top-4 right-4">
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
                      <p className="text-xs text-gray-500">Modus {mode.id}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">PWM</p>
                      <p className="font-semibold">{mode.pwm_value}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Leistung</p>
                      <p className="font-semibold">{mode.estimated_power}W</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Spannung</p>
                      <p className="font-semibold">{mode.output_voltage}V</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kosten/h</p>
                      <p className="font-semibold">€{mode.estimated_cost_hour}</p>
                    </div>
                  </div>
                  
                  {mode.reason && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>Status:</strong> {mode.reason}
                      </p>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Current Settings Display */}
        {warmwaterSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Warmwasser-Einstellungen</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Einschalttemperatur</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warmwaterSettings.warmwater?.switchon || '--'}°C
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Ausschalttemperatur</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warmwaterSettings.warmwater?.switchoff || '--'}°C
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Sonnenreduzierung</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warmwaterSettings.warmwater?.sunshine_reduction || '--'}°C
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Sonnen-Schwelle</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(warmwaterSettings.warmwater?.sunshine_activation * 100) || '--'}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Health Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System-Gesundheit</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${
              heatingStatus?.data_status?.temperature_data?.available 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`status-dot ${
                  heatingStatus?.data_status?.temperature_data?.available ? 'status-active' : 'status-warning'
                }`} />
                <h3 className="font-medium text-gray-900">Temperaturdaten</h3>
              </div>
              <p className="text-sm text-gray-600">
                {heatingStatus?.data_status?.temperature_data?.available 
                  ? `Verfügbar (${Math.abs(Math.round(currentData?.data_age?.temp_data_age_minutes || 0))} min alt)`
                  : 'Nicht verfügbar'
                }
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${
              heatingStatus?.data_status?.em3_data?.available 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`status-dot ${
                  heatingStatus?.data_status?.em3_data?.available ? 'status-active' : 'status-warning'
                }`} />
                <h3 className="font-medium text-gray-900">Stromdaten</h3>
              </div>
              <p className="text-sm text-gray-600">
                {heatingStatus?.data_status?.em3_data?.available 
                  ? `Verfügbar (${Math.abs(Math.round(currentData?.data_age?.em3_data_age_minutes || 0))} min alt)`
                  : 'Nicht verfügbar'
                }
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${
              heatingStatus?.pwm_status?.server_reachable 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`status-dot ${
                  heatingStatus?.pwm_status?.server_reachable ? 'status-active' : 'status-warning'
                }`} />
                <h3 className="font-medium text-gray-900">PWM Server</h3>
              </div>
              <p className="text-sm text-gray-600">
                {heatingStatus?.pwm_status?.server_reachable 
                  ? `Verbunden (PWM: ${heatingStatus?.pwm_status?.current_pwm_server || 0})`
                  : 'Nicht erreichbar'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}