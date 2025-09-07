// src/pages/heating.js
import Head from 'next/head'
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useSystemStats 
} from '@/hooks/useBackendData'
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
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

export default function HeatingControl() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading } = useHeatingStatus()
  const { data: systemStats } = useSystemStats()

  // Calculate heating-specific data
  const getHeatingData = () => {
    if (!currentData) return null
    
    const vorlaufTemp = currentData.temperatures?.vorlauf_temp || 0
    const ruecklaufTemp = currentData.temperatures?.ruecklauf_temp || 0
    const tempDiff = vorlaufTemp - ruecklaufTemp
    
    return {
      vorlaufTemp,
      ruecklaufTemp,
      tempDiff,
      heatingPower: 0,
      efficiency: tempDiff > 0 ? Math.round((tempDiff / 20) * 100) : 0,
      isHeating: heatingStatus?.is_heating || false,
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

  if (currentLoading && statusLoading) {
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
            <p className="text-gray-600 mt-1">Kontrolle und Monitoring der Heizungsanlage</p>
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
            topRight={
              <div className="flex items-center gap-2">
                <span className={`status-dot ${heatingData?.isHeating ? 'status-active' : 'status-inactive'}`} />
                <span className="text-xs font-medium text-gray-700">
                  {heatingData?.isHeating ? 'Heizung ein' : 'Heizung aus'}
                </span>
              </div>
            }
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
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dummy Mode 1 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 1</span>
                <span className="status-dot status-active"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Normalbetrieb</h3>
              <p className="text-sm text-gray-600">Standard Heizung mit Zeitsteuerung</p>
            </motion.button>

            {/* Dummy Mode 2 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 2</span>
                <span className="status-dot status-inactive"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Eco-Modus</h3>
              <p className="text-sm text-gray-600">Energiesparender Betrieb</p>
            </motion.button>

            {/* Dummy Mode 3 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 3</span>
                <span className="status-dot status-inactive"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Power-Modus</h3>
              <p className="text-sm text-gray-600">Maximale Heizleistung</p>
            </motion.button>

            {/* Dummy Mode 4 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 4</span>
                <span className="status-dot status-inactive"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Gäste-Modus</h3>
              <p className="text-sm text-gray-600">Erhöhte Temperatur</p>
            </motion.button>

            {/* Dummy Mode 5 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 5</span>
                <span className="status-dot status-inactive"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Vollbetrieb</h3>
              <p className="text-sm text-gray-600">Komplett eingeschaltet</p>
            </motion.button>

            {/* Dummy Mode 6 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Modus 6</span>
                <span className="status-dot status-inactive"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Aus</h3>
              <p className="text-sm text-gray-600">Heizung komplett aus</p>
            </motion.button>
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
            <StatusCard
              title="Heute"
              value={costData.today}
              unit="€"
              color="primary"
              loading={false}
            />
            <StatusCard
              title="Letzte Woche"
              value={costData.week}
              unit="€"
              color="primary"
              loading={false}
            />
            <StatusCard
              title="Letzten Monat"
              value={costData.month}
              unit="€"
              color="primary"
              loading={false}
            />
            <StatusCard
              title="Letztes Jahr"
              value={costData.year}
              unit="€"
              color="primary"
              loading={false}
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}