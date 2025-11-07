// src/components/warmwater/WarmwaterStatusCards.js
import StatusCard from '@/components/StatusCard'

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
        icon={() => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2C10.9 2 10 2.9 10 4V14.5C8.8 15.2 8 16.5 8 18C8 20.2 9.8 22 12 22S16 20.2 16 18C16 16.5 15.2 15.2 14 14.5V4C14 2.9 13.1 2 12 2M12 4C12.6 4 13 4.4 13 5V8H11V5C11 4.4 11.4 4 12 4M12 10H13V11H12V10M12 12H13V14.3C14.2 14.9 15 16.3 15 18C15 19.7 13.7 21 12 21S9 19.7 9 18C9 16.3 9.8 14.9 11 14.3V12Z"/>
          </svg>
        )}
        color={Number(waterTemp) > 50 ? 'success' : 'warning'}
        loading={currentLoading}
        size="lg"
      />
      <StatusCard
        title="Heizleistung"
        value={formatNumber(heatingPower, 0)}
        unit="W"
        icon={() => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M11.5 20L8.5 14H11V7L14 13H11.5L11.5 20M12 2C11.5 2 11 2.2 10.6 2.6L3.6 9.6C2.8 10.4 2.8 11.6 3.6 12.4L10.6 19.4C11.4 20.2 12.6 20.2 13.4 19.4L20.4 12.4C21.2 11.6 21.2 10.4 20.4 9.6L13.4 2.6C13 2.2 12.5 2 12 2Z"/>
          </svg>
        )}
        color={Number(heatingPower) > 0 ? 'success' : 'primary'}
        loading={statusLoading}
        size="lg"
      />
    </div>
  )
}

