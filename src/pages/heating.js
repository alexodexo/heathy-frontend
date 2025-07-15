// src/pages/heating.js
import { useState, useCallback } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from '@/components/ToastProvider'
import StatusCard from '@/components/StatusCard'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useHeatingModes, 
  useSystemStats 
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  FireIcon,
  PowerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CloudIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function HeatingControl() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading, refresh: refreshStatus } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading, refresh: refreshModes } = useHeatingModes()
  const { data: systemStats } = useSystemStats()
  
  const [isChangingMode, setIsChangingMode] = useState(false)

  // Get available modes specific to heating (could be filtered differently than warmwater)
  const availableModes = heatingModes?.modes ? Object.values(heatingModes.modes) : []
  const activeMode = heatingModes?.active_mode
  const activeModeInfo = availableModes.find(mode => mode.id === activeMode)

  // Mode change handler
  const handleModeChange = useCallback(async (modeId) => {
    setIsChangingMode(true)
    try {
      const response = await backendAPI.activateMode(modeId)
      if (response.success) {
        toast.success(`Heizmodus ${response.data.mode_name} aktiviert`)
        await refreshModes()
        await refreshStatus()
      } else {
        toast.error('Heizmodus konnte nicht aktiviert werden')
      }
    } catch (error) {
      console.error('Error activating heating mode:', error)
      toast.error('Fehler beim Aktivieren des Heizmodus')
    } finally {
      setIsChangingMode(false)
    }
  }, [refreshModes, refreshStatus])

  // Calculate heating-specific data
  const getHeatingData = () => {
    if (!currentData) return null
    
    const vorlaufTemp = currentData.temperatures?.vorlauf_temp || 0
    const ruecklaufTemp = currentData.temperatures?.ruecklauf_temp || 0
    const tempDiff = vorlaufTemp - ruecklaufTemp
    const heatingPower = activeModeInfo?.estimated_power || 0
    
    return {
      vorlaufTemp,
      ruecklaufTemp,
      tempDiff,
      heatingPower,
      efficiency: tempDiff > 0 ? Math.round((tempDiff / 20) * 100) : 0,
      isHeating: activeModeInfo?.active_heating || false,
    }
  }

  const heatingData = getHeatingData()

  // Cost calculation for heating
  const calculateHeatingCosts = () => {
    if (!heatingData || !systemStats) return { today: '0.00', week: '0.00', month: '0.00', year: '0.00' }
    
    const hoursRunning = (systemStats.performance?.uptime_seconds || 0) / 3600
    const costPerHour = activeModeInfo?.estimated_cost_hour || 0
    const totalCost = hoursRunning * costPerHour
    
    return {
      today: (totalCost * 0.1).toFixed(2), // Rough estimation
      week: (totalCost * 0.7).toFixed(2),
      month: (totalCost * 3).toFixed(2),
      year: totalCost.toFixed(2),
    }
  }

  const costData = calculateHeatingCosts()

  if (currentLoading && statusLoading && modesLoading) {
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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Heizungs-Steuerung</h1>
            <p className="text-gray-600 mt-1">Kontrolle und Überwachung der Heizungsanlage</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-dot ${heatingData?.isHeating ? 'status-active' : 'status-inactive'}`} />
            <span className="text-sm font-medium text-gray-700">
              {heatingData?.isHeating ? 'Heizung aktiv' : 'Heizung inaktiv'}
            </span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="Vorlauf"
            value={heatingData?.vorlaufTemp?.toFixed(1) || '--'}
            unit="°C"
            icon={ArrowUpIcon}
            color={heatingData?.vorlaufTemp > 40 ? 'success' : 'warning'}
            loading={currentLoading}
          />
          <StatusCard
            title="Rücklauf"
            value={heatingData?.ruecklaufTemp?.toFixed(1) || '--'}
            unit="°C"
            icon={ArrowDownIcon}
            color={heatingData?.ruecklaufTemp > 30 ? 'success' : 'warning'}
            loading={currentLoading}
          />
          <StatusCard
            title="Temperaturdifferenz"
            value={heatingData?.tempDiff?.toFixed(1) || '--'}
            unit="°C"
            icon={FireIcon}
            color={heatingData?.tempDiff > 5 ? 'success' : 'error'}
            loading={currentLoading}
          />
          <StatusCard
            title="Heizleistung"
            value={heatingData?.heatingPower?.toString() || '--'}
            unit="W"
            icon={BoltIcon}
            color="primary"
            loading={statusLoading}
          />
        </div>

        {/* Mode Selection for Heating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Heizungs-Betriebsmodus</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModes.map((mode) => {
              const isActive = mode.id === activeMode
              const isHeatingMode = mode.id === 1 || mode.id === 4 // Modes that actually heat
              
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
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isHeatingMode ? (
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
                      <p className="text-gray-500">Zieltemperatur</p>
                      <p className="font-semibold">{mode.target_temp}°C</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Leistung</p>
                      <p className="font-semibold">{mode.estimated_power}W</p>
                    </div>
                    <div>
                      <p className="text-gray-500">PWM</p>
                      <p className="font-semibold">{mode.pwm_value}/255</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kosten/h</p>
                      <p className="font-semibold">€{mode.estimated_cost_hour}</p>
                    </div>
                  </div>
                  
                  {mode.reason && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>Grund:</strong> {mode.reason}
                      </p>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Temperature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperatur-Übersicht</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vorlauf */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpIcon className="w-6 h-6 text-orange-600" />
                <span className={`status-dot ${heatingData?.vorlaufTemp > 40 ? 'status-active' : 'status-warning'}`} />
              </div>
              <p className="text-sm text-orange-600 mb-1">Vorlauf Temperatur</p>
              <p className="text-3xl font-bold text-orange-700">
                {heatingData?.vorlaufTemp?.toFixed(1) || '--'}°C
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Status: {heatingData?.vorlaufTemp > 40 ? 'Normal' : 'Niedrig'}
              </p>
            </div>

            {/* Rücklauf */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownIcon className="w-6 h-6 text-blue-600" />
                <span className={`status-dot ${heatingData?.ruecklaufTemp > 30 ? 'status-active' : 'status-warning'}`} />
              </div>
              <p className="text-sm text-blue-600 mb-1">Rücklauf Temperatur</p>
              <p className="text-3xl font-bold text-blue-700">
                {heatingData?.ruecklaufTemp?.toFixed(1) || '--'}°C
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Status: {heatingData?.ruecklaufTemp > 30 ? 'Normal' : 'Niedrig'}
              </p>
            </div>

            {/* Temperature Difference */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FireIcon className="w-6 h-6 text-purple-600" />
                <span className={`status-dot ${heatingData?.tempDiff > 5 ? 'status-active' : 'status-warning'}`} />
              </div>
              <p className="text-sm text-purple-600 mb-1">Temperaturdifferenz</p>
              <p className="text-3xl font-bold text-purple-700">
                {heatingData?.tempDiff?.toFixed(1) || '--'}°C
              </p>
              <p className="text-xs text-purple-600 mt-2">
                Effizienz: {heatingData?.efficiency || 0}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cost Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Heizungskosten</h2>
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.today}</p>
              <p className="text-sm text-gray-600 mt-1">Heute</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.week}</p>
              <p className="text-sm text-gray-600 mt-1">Diese Woche</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.month}</p>
              <p className="text-sm text-gray-600 mt-1">Dieser Monat</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.year}</p>
              <p className="text-sm text-gray-600 mt-1">Dieses Jahr</p>
            </div>
          </div>
        </motion.div>

        {/* System Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System-Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Betriebszeit</h3>
              <p className="text-xl font-bold text-gray-700">
                {Math.floor((systemStats?.performance?.uptime_seconds || 0) / 3600)}h {Math.floor(((systemStats?.performance?.uptime_seconds || 0) % 3600) / 60)}m
              </p>
              <p className="text-sm text-gray-500">Kontinuierlicher Betrieb</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">PWM Effizienz</h3>
              <p className="text-xl font-bold text-gray-700">
                {systemStats?.performance?.pwm_efficiency_percent || 0}%
              </p>
              <p className="text-sm text-gray-500">
                {systemStats?.performance?.pwm_commands_sent || 0} Kommandos gesendet
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Steuerungszyklen</h3>
              <p className="text-xl font-bold text-gray-700">
                {systemStats?.performance?.main_loops_executed || 0}
              </p>
              <p className="text-sm text-gray-500">
                {systemStats?.performance?.loops_per_minute?.toFixed(1) || 0} pro Minute
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}