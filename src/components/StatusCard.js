// components/StatusCard.js
import { motion } from 'framer-motion'

export default function StatusCard({ 
  title, 
  value, 
  unit = '', 
  secondaryValue = null,
  secondaryUnit = '',
  secondaryTitle = '',
  tertiaryValue = null,
  tertiaryUnit = '',
  tertiaryTitle = '',
  quaternaryValue = null,
  quaternaryUnit = '',
  quaternaryTitle = '',
  quinternaryValue = null,
  quinternaryUnit = '',
  quinternaryTitle = '',
  icon: Icon, 
  color = 'primary',
  trend = null,
  loading = false,
  topRight = null,
  size = 'default', // 'default' or 'sm'
}) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success to-green-600',
    warning: 'from-warning to-orange-600',
    error: 'from-error to-red-600',
  }

  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-4 w-32" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="stat-card card-hover"
    >
      <div className="flex items-center justify-between gap-4">
        {Icon && (
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
              <Icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            {quinternaryValue !== null && (
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${quinternaryValue === 'ein' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-xs text-gray-500">{quinternaryTitle}</span>
              </div>
            )}
          </div>
        )}
        
        <div className={`flex-1 ${size === 'sm' ? 'flex flex-col items-center justify-center text-center space-y-2' : 'flex flex-col'}`}>
          {size === 'sm' ? (
            /* Symmetrisches Layout für kleine Karten */
            <>
              <div className="flex items-baseline gap-2">
                <span className="stat-value-sm">{value}</span>
                {unit && <span className="text-sm text-gray-500">{unit}</span>}
              </div>
              {secondaryValue !== null && (
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-700">{secondaryValue}</span>
                  {secondaryUnit && <span className="text-xs text-gray-500">{secondaryUnit}</span>}
                </div>
              )}
              <p className="stat-label-sm pt-1">{title}</p>
            </>
          ) : (
            /* Normales Layout für große Karten - Wert und Titel einzeilig linksbündig */
            <>
              <div className="flex items-center gap-2">
                <span className="stat-value">{value}</span>
                {unit && <span className="text-lg text-gray-500">{unit}</span>}
                <span className="text-xs text-gray-500">- {title}</span>
              </div>
              {secondaryValue !== null && (
                <div className="pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">{secondaryValue}</span>
                    {secondaryUnit && <span className="text-xs text-gray-500">{secondaryUnit}</span>}
                    {secondaryTitle && <span className="text-xs text-gray-500">- {secondaryTitle}</span>}
                  </div>
                </div>
              )}
            </>
          )}
          {tertiaryValue !== null && (
            <div className="pt-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-700">{tertiaryValue}</span>
                {tertiaryUnit && <span className="text-sm text-gray-500">{tertiaryUnit}</span>}
                {tertiaryTitle && <span className="text-xs text-gray-500">- {tertiaryTitle}</span>}
              </div>
            </div>
          )}
          {quaternaryValue !== null && (
            <div className="pt-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-700">{quaternaryValue}</span>
                {quaternaryUnit && <span className="text-sm text-gray-500">{quaternaryUnit}</span>}
                {quaternaryTitle && <span className="text-xs text-gray-500">- {quaternaryTitle}</span>}
              </div>
            </div>
          )}
        </div>

        {topRight ? (
          <div className="flex-shrink-0">{topRight}</div>
        ) : trend !== null && (
          <div className={`text-sm font-medium flex-shrink-0 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  )
}