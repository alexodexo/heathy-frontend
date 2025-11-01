// src/components/statistics/CostAnalysisSection.js
import { motion } from 'framer-motion'
import { CurrencyEuroIcon } from '@heroicons/react/24/outline'

export default function CostAnalysisSection({ data, loading, selectedRange }) {
  if (loading || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="skeleton h-64 rounded-xl" />
      </motion.div>
    )
  }

  const { totals, electricityPrice } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Kostenanalyse</h2>
        <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <h3 className="font-medium text-green-900 mb-1">Gesamtkosten ({selectedRange})</h3>
          <p className="text-2xl font-bold text-green-700">€{totals.total}</p>
          <p className="text-sm text-green-600">{totals.consumption} kWh verbraucht</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-1">Durchschnitt/Tag</h3>
          <p className="text-2xl font-bold text-blue-700">€{totals.dailyAverage}</p>
          <p className="text-sm text-blue-600">Strompreis: €{electricityPrice}/kWh</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <h3 className="font-medium text-purple-900 mb-1">Monatsschätzung</h3>
          <p className="text-2xl font-bold text-purple-700">€{totals.monthlyProjection}</p>
          <p className="text-sm text-purple-600">Jahresschätzung: €{totals.yearlyProjection}</p>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Heizung</h4>
          <p className="text-xl font-bold text-orange-700">€{totals.heating}</p>
          <p className="text-xs text-orange-600">{((parseFloat(totals.heating) / parseFloat(totals.total)) * 100).toFixed(0)}% der Gesamtkosten</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Warmwasser</h4>
          <p className="text-xl font-bold text-blue-700">€{totals.warmwater}</p>
          <p className="text-xs text-blue-600">{((parseFloat(totals.warmwater) / parseFloat(totals.total)) * 100).toFixed(0)}% der Gesamtkosten</p>
        </div>
      </div>
    </motion.div>
  )
}

