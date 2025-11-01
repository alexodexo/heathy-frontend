// src/pages/heating.js
import Head from 'next/head'
import { 
  useCurrentData, 
  useHeatingStatus, 
  useSystemStats 
} from '@/hooks/useBackendData'
import HeatingStatusCards from '@/components/heating/HeatingStatusCards'
import HeatingModeSelection from '@/components/heating/HeatingModeSelection'
import HeatingCostOverview from '@/components/heating/HeatingCostOverview'

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

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Heizungs-Steuerung</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">Kontrolle und Monitoring der Heizungsanlage</p>
          </div>
        </div>

        {/* Status Cards */}
        <HeatingStatusCards
          heatingData={heatingData}
          currentData={currentData}
          currentLoading={currentLoading}
          statusLoading={statusLoading}
        />

        {/* Mode Selection Control Center */}
        <HeatingModeSelection />

        {/* Cost Overview */}
        <HeatingCostOverview costData={costData} />
      </div>
    </>
  )
}
