// src/components/dashboard/EnergyMonitoring.js
import { motion } from 'framer-motion'
import { BoltIcon } from '@heroicons/react/24/outline'

export default function EnergyMonitoring({ currentData, plugsData, currentLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Energie-Monitoring</h2>
        <BoltIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      {currentLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
            <p className="text-sm text-primary-600 mb-1">Gesamt</p>
            <p className="text-2xl font-bold text-primary-700">
              {(currentData?.power?.total_power !== null && currentData?.power?.total_power !== undefined) ? currentData.power.total_power.toFixed(0) : '--'} W
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">PV-Einspeisung</p>
            <p className="text-xl font-semibold text-gray-700">
              {(plugsData?.apower !== null && plugsData?.apower !== undefined) ? plugsData.apower.toFixed(0) : '--'} W
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Heizung</p>
            <p className="text-xl font-semibold text-gray-700">
              {(currentData?.power?.b_power !== null && currentData?.power?.b_power !== undefined) ? currentData.power.b_power.toFixed(0) : '--'} W
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Warmwasser</p>
            <p className="text-xl font-semibold text-gray-700">
              {(currentData?.power?.c_power !== null && currentData?.power?.c_power !== undefined) ? currentData.power.c_power.toFixed(0) : '--'} W
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

