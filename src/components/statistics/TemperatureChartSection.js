// src/components/statistics/TemperatureChartSection.js
import { motion } from 'framer-motion'
import { TemperatureChart } from '@/components/Chart'

export default function TemperatureChartSection({ data, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-4 md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4 gap-2">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Temperaturverläufe</h2>
        {data?.stats && (
          <div className="text-xs md:text-sm text-gray-600">
            Ø Warmwasser: {data.stats.waterTempAvg}°C | Vorlauf: {data.stats.vorlaufTempAvg}°C
          </div>
        )}
      </div>
      
      <div className="h-64 md:h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <TemperatureChart 
            data={data?.chartData} 
            loading={false}
          />
        )}
      </div>
    </motion.div>
  )
}

