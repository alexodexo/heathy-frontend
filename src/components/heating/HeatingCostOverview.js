// src/components/heating/HeatingCostOverview.js
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import { CurrencyEuroIcon } from '@heroicons/react/24/outline'

export default function HeatingCostOverview({ costData }) {
  return (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="heute"
          value={costData.today}
          unit="€"
          color="primary"
          loading={false}
        />
        <StatusCard
          title="letzten 7 Tage"
          value={costData.week}
          unit="€"
          color="primary"
          loading={false}
        />
        <StatusCard
          title="letzten 30 Tage"
          value={costData.month}
          unit="€"
          color="primary"
          loading={false}
        />
        <StatusCard
          title="letzten 365 Tage"
          value={costData.year}
          unit="€"
          color="primary"
          loading={false}
        />
      </div>
    </motion.div>
  )
}

