// src/components/heating/HeatingModeSelection.js
import { motion } from 'framer-motion'
import HeatingModeCard from './HeatingModeCard'

export default function HeatingModeSelection() {
  const modes = [
    {
      number: 1,
      title: 'Normalbetrieb',
      description: 'Vorlauftemperatur --°C und Zeitsteuerung',
      isActive: true,
      isRecommended: true,
    },
    {
      number: 2,
      title: 'Booster',
      description: '-- min mit --kW Boosterbetrieb',
      isActive: false,
      isRecommended: false,
    },
    {
      number: 3,
      title: 'Aus',
      description: 'Heizung vollständig aus',
      isActive: false,
      isRecommended: false,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-4 md:p-6"
    >
      {/* Überschrift und aktuelle Werte in einer Zeile */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Betriebsmodus Steuerung</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {modes.map((mode) => (
          <HeatingModeCard
            key={mode.number}
            modeNumber={mode.number}
            title={mode.title}
            description={mode.description}
            isActive={mode.isActive}
            isRecommended={mode.isRecommended}
          />
        ))}
      </div>
    </motion.div>
  )
}

