// src/components/heating/HeatingStatusCards.js
import StatusCard from '@/components/StatusCard'
import { ArrowUpIcon, ArrowDownIcon, FireIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function HeatingStatusCards({ heatingData, currentData, currentLoading, statusLoading, temperatureData, temperatureLoading }) {
  // Get temperatures from temperature_data table (t2 = Vorlauf, t3 = Rücklauf)
  const vorlaufTemp = temperatureData?.t2
  const ruecklaufTemp = temperatureData?.t3
  const tempDiff = vorlaufTemp && ruecklaufTemp ? vorlaufTemp - ruecklaufTemp : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatusCard
        title="Vorlauf"
        value={vorlaufTemp?.toFixed(1) || '--'}
        unit="°C"
        icon={ArrowUpIcon}
        color={vorlaufTemp && vorlaufTemp > 40 ? 'success' : 'warning'}
        loading={currentLoading || temperatureLoading}
        size="lg"
      />
      <StatusCard
        title="Rücklauf"
        value={ruecklaufTemp?.toFixed(1) || '--'}
        unit="°C"
        icon={ArrowDownIcon}
        color={ruecklaufTemp && ruecklaufTemp > 30 ? 'success' : 'warning'}
        loading={currentLoading || temperatureLoading}
        size="lg"
      />
      <StatusCard
        title="Temperaturdifferenz"
        value={tempDiff?.toFixed(1) || '--'}
        unit="°C"
        icon={FireIcon}
        color={tempDiff && tempDiff > 5 ? 'success' : 'error'}
        loading={currentLoading || temperatureLoading}
        size="lg"
      />
      <StatusCard
        title="Heizleistung"
        value={heatingData?.heatingPower?.toString() || '0'}
        unit="W"
        icon={BoltIcon}
        color={heatingData?.heatingPower > 0 ? 'success' : 'primary'}
        loading={statusLoading}
        size="lg"
      />
    </div>
  )
}

