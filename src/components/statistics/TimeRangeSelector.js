// src/components/statistics/TimeRangeSelector.js
import { motion } from 'framer-motion'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

const timeRanges = [
  { value: '1h', label: 'Letzte Stunde' },
  { value: '6h', label: 'Letzte 6 Stunden' },
  { value: '24h', label: 'Letzte 24 Stunden' },
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
]

export default function TimeRangeSelector({ selectedRange, onRangeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Zeitraum auswählen</h2>
        <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedRange === range.value
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

