// src/components/heating/HeatingModeSelection.js
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import HeatingModeCard from './HeatingModeCard'

export default function HeatingModeSelection({ einstellungen, refreshEinstellungen }) {
  const [isChanging, setIsChanging] = useState(false)
  
  // Get current mode from einstellungen (0=Aus, 1=Normalbetrieb, 2=Booster)
  const currentMode = parseInt(einstellungen?.heizung_modus?.value ?? 1)
  
  const modes = [
    {
      id: 1,
      title: 'Normalbetrieb',
      description: 'Vorlauftemperatur-Steuerung mit Zeitfenster',
      isActive: currentMode === 1,
      isRecommended: true,
    },
    {
      id: 2,
      title: 'Booster',
      description: 'Schnelle Aufheizung mit voller Leistung',
      isActive: currentMode === 2,
      isRecommended: false,
    },
    {
      id: 0,
      title: 'Aus',
      description: 'Heizung vollständig deaktiviert',
      isActive: currentMode === 0,
      isRecommended: false,
    },
  ]

  const handleModeChange = async (modeId) => {
    if (isChanging) return
    setIsChanging(true)
    
    try {
      const response = await fetch('/api/einstellungen/heizung_modus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          value: modeId, 
          description: 'Heizungsmodus: 0=Aus, 1=Normalbetrieb, 2=Booster' 
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        const modeName = modes.find(m => m.id === modeId)?.title
        toast.success(`Modus "${modeName}" aktiviert`)
        await refreshEinstellungen()
      } else {
        toast.error('Modus konnte nicht aktiviert werden')
      }
    } catch (error) {
      console.error('Error changing mode:', error)
      toast.error('Fehler beim Wechseln des Modus')
    } finally {
      setTimeout(() => setIsChanging(false), 500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-4 md:p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {modes.map((mode) => (
          <HeatingModeCard
            key={mode.id}
            modeNumber={mode.id}
            title={mode.title}
            description={mode.description}
            isActive={mode.isActive}
            isRecommended={mode.isRecommended}
            isChanging={isChanging}
            onSelect={() => handleModeChange(mode.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}

