// src/components/warmwater/WarmwaterStatusCards.js
import StatusCard from '@/components/StatusCard'
import { BeakerIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function WarmwaterStatusCards({ 
  waterTemp, 
  heatingPower, 
  currentLoading, 
  statusLoading 
}) {
  const formatNumber = (value, decimals = 0) => {
    const num = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(num) ? num.toFixed(decimals) : '--'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <StatusCard
        title="Warmwasser"
        value={formatNumber(waterTemp, 1)}
        unit="°C"
        icon={BeakerIcon}
        color={Number(waterTemp) > 50 ? 'success' : 'warning'}
        loading={currentLoading}
        size="lg"
      />
      <StatusCard
        title="Heizleistung"
        value={formatNumber(heatingPower, 0)}
        unit="W"
        icon={BoltIcon}
        color={Number(heatingPower) > 0 ? 'success' : 'primary'}
        loading={statusLoading}
        size="lg"
      />
    </div>
  )
}

