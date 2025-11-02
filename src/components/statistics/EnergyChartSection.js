// src/components/statistics/EnergyChartSection.js
import { motion } from 'framer-motion'
import { PowerChart } from '@/components/Chart'

export default function EnergyChartSection({ data, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-4 md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4 gap-2">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Energieverbrauch</h2>
        {data?.summary && (
          <div className="text-xs md:text-sm text-gray-600">
            Ø {data.summary.totalConsumption}W gesamt
          </div>
        )}
      </div>
      
      <div className="h-64 md:h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <PowerChart 
            data={data?.chartData} 
            loading={false}
            type="line"
          />
        )}
      </div>

      {/* Energy breakdown */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6">
          <div className="bg-blue-50 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs md:text-sm text-blue-600 mb-1">Heizung</p>
            <p className="text-base md:text-xl font-bold text-blue-700">{data.summary.heatingConsumption}W</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs md:text-sm text-orange-600 mb-1">Warmwasser</p>
            <p className="text-base md:text-xl font-bold text-orange-700">{data.summary.warmwaterConsumption}W</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs md:text-sm text-green-600 mb-1">PV-Einspeisung</p>
            <p className="text-base md:text-xl font-bold text-green-700">{data.summary.pvProduction}W</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

