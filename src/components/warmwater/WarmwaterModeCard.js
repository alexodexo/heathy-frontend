// src/components/warmwater/WarmwaterModeCard.js
import { motion } from 'framer-motion'
import { CheckCircleIcon, FireIcon, PowerIcon } from '@heroicons/react/24/outline'

export default function WarmwaterModeCard({ 
  mode, 
  isActive, 
  isChangingMode, 
  onModeChange 
}) {
  const isRecommended = false // Keine Empfehlung mehr - nur Ein/Aus
  
  const displayNumber = (() => {
    // Backend-Nummerierung beibehalten (Modi 3,4,5,6 entfernt)
    if (mode.name === 'Vollständig EIN') return 1
    if (mode.name === 'Vollständig AUS') return 2
    return mode.id // Fallback
  })()

  return (
    <motion.button
      whileHover={{ scale: isChangingMode ? 1 : 1.02 }}
      whileTap={{ scale: isChangingMode ? 1 : 0.98 }}
      onClick={() => {
        if (!isChangingMode) {
          onModeChange(mode.id)
        }
      }}
      disabled={isChangingMode}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
        isActive
          ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4"
        >
          <CheckCircleIcon className="w-6 h-6 text-primary-500" />
        </motion.div>
      )}
      
      {isRecommended && (
        <div className="absolute top-4 left-4">
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Empfohlen
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${
          isActive
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {mode.active_heating ? (
            <FireIcon className="w-5 h-5" />
          ) : (
            <PowerIcon className="w-5 h-5" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{mode.name}</h3>
          <p className="text-xs text-gray-500">Modus {displayNumber}</p>
        </div>
      </div>
      
      {/* Ein- und Ausschalttemperatur nur für Vollständig EIN */}
      {mode.name === 'Vollständig EIN' && (
        <div className="mt-2 ml-11">
          <p className="text-sm font-medium text-gray-900">
            Einschalttemperatur: --°C
          </p>
          <p className="text-sm font-medium text-gray-900">
            Ausschalttemperatur: --°C
          </p>
        </div>
      )}
    </motion.button>
  )
}

