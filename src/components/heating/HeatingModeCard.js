// src/components/heating/HeatingModeCard.js
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function HeatingModeCard({ 
  modeNumber, 
  title, 
  description, 
  isActive, 
  isRecommended,
  isChanging,
  onSelect 
}) {
  return (
    <motion.button
      whileHover={{ scale: isChanging ? 1 : 1.02 }}
      whileTap={{ scale: isChanging ? 1 : 0.98 }}
      onClick={onSelect}
      disabled={isChanging || isActive}
      className={`relative p-4 md:p-5 rounded-xl border-2 transition-all duration-200 shadow-sm touch-manipulation min-h-[100px] ${
        isActive 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-gray-200 hover:border-blue-300'
      } ${isChanging || isActive ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {isActive && (
        <div className="absolute top-2 right-2">
          <CheckCircleIcon className="w-6 h-6 text-blue-500" />
        </div>
      )}
      {isRecommended && !isActive && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            Empfohlen
          </span>
        </div>
      )}
      <h3 className={`text-base md:text-lg font-bold mb-1 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {description}
      </p>
    </motion.button>
  )
}

