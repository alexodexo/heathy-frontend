// src/components/warmwater/WarmwaterStatusCards.js
import StatusCard from '@/components/StatusCard'
import { BeakerIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

export default function WarmwaterStatusCards({ 
  waterTemp, 
  estimatedCostPerHour, 
  currentLoading, 
  statusLoading 
}) {
  const formatNumber = (value, decimals = 0) => {
    const num = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(num) ? num.toFixed(decimals) : '--'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatusCard
        title="Warmwasser"
        value={formatNumber(waterTemp, 1)}
        unit="°C"
        icon={BeakerIcon}
        color={Number(waterTemp) > 50 ? 'success' : 'warning'}
        loading={currentLoading}
      />
      <StatusCard
        title="Kosten/heute"
        value={formatNumber(estimatedCostPerHour, 2)}
        unit="€"
        icon={CurrencyEuroIcon}
        color="warning"
        loading={statusLoading}
      />
    </div>
  )
}

