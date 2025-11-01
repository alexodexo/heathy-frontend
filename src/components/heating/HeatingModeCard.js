// src/components/heating/HeatingModeCard.js
import { motion } from 'framer-motion'

export default function HeatingModeCard({ 
  modeNumber, 
  title, 
  description, 
  isActive, 
  isRecommended 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 shadow-sm ${
        isActive 
          ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
          Modus {modeNumber}
        </span>
        <div className="flex items-center gap-2">
          {isRecommended && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              Empfohlen
            </span>
          )}
          <span className={`status-dot ${isActive ? 'status-active' : 'status-inactive'}`}></span>
        </div>
      </div>
      <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {description}
      </p>
    </motion.button>
  )
}

