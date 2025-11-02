// src/components/statistics/StatsSummaryCards.js
import { motion } from 'framer-motion'
import { 
  BoltIcon, 
  BeakerIcon, 
  CurrencyEuroIcon, 
  FireIcon 
} from '@heroicons/react/24/outline'

export default function StatsSummaryCards({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const { current, averages24h, costs24h } = summary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      <div className="card p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <BeakerIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm md:text-base font-medium text-gray-900">Warmwasser</h3>
        </div>
        <p className="text-xl md:text-2xl font-bold text-blue-600">{current?.waterTemp || '--'}°C</p>
        <p className="text-xs md:text-sm text-gray-600">Ø 24h: {averages24h?.waterTemp || '--'}°C</p>
      </div>
      
      <div className="card p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm md:text-base font-medium text-gray-900">Heizung</h3>
        </div>
        <p className="text-xl md:text-2xl font-bold text-orange-600">{current?.vorlaufTemp || '--'}°C</p>
        <p className="text-xs md:text-sm text-gray-600">Ø 24h: {averages24h?.vorlaufTemp || '--'}°C</p>
      </div>
      
      <div className="card p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <BoltIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-sm md:text-base font-medium text-gray-900">Verbrauch</h3>
        </div>
        <p className="text-xl md:text-2xl font-bold text-primary-600">{averages24h?.totalPower || '--'}W</p>
        <p className="text-xs md:text-sm text-gray-600">{costs24h?.consumption || '--'} kWh/24h</p>
      </div>
      
      <div className="card p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <CurrencyEuroIcon className="w-5 h-5 text-green-500" />
          <h3 className="text-sm md:text-base font-medium text-gray-900">Kosten 24h</h3>
        </div>
        <p className="text-xl md:text-2xl font-bold text-green-600">€{costs24h?.total || '--'}</p>
        <p className="text-xs md:text-sm text-gray-600">€{costs24h?.pricePerKWh || '--'}/kWh</p>
      </div>
    </motion.div>
  )
}

