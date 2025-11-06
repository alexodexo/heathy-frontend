// src/components/warmwater/WarmwaterModeSelection.js
import { motion } from 'framer-motion'
import WarmwaterModeCard from './WarmwaterModeCard'

export default function WarmwaterModeSelection({ 
  allModes, 
  activeMode, 
  isChangingMode, 
  onModeChange,
  einstellungen 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-4 md:p-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {allModes
          .sort((a, b) => {
            // Korrekte Reihenfolge basierend auf Namen, nicht IDs
            const nameOrder = {
              'Vollständig EIN': 1,
              'Vollständig AUS': 2
            }
            return (nameOrder[a.name] || 999) - (nameOrder[b.name] || 999)
          })
          .map((mode) => {
            const isActive = mode.id === activeMode
            
            return (
              <WarmwaterModeCard
                key={mode.id}
                mode={mode}
                isActive={isActive}
                isChangingMode={isChangingMode}
                onModeChange={onModeChange}
                einstellungen={einstellungen}
              />
            )
          })}
      </div>
    </motion.div>
  )
}

