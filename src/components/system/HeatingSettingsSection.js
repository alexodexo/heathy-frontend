// src/components/system/HeatingSettingsSection.js
import { motion } from 'framer-motion'
import { FireIcon } from '@heroicons/react/24/outline'
import OperationModeControls from './OperationModeControls'
import PumpSettings from './PumpSettings'

export default function HeatingSettingsSection({
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  timeSlots,
  updateTimeSlot,
  removeTimeSlot,
  isSaving,
  parameterLoading
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-0 overflow-hidden"
    >
      {/* Heating Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <FireIcon className="w-5 h-5 md:w-6 md:h-6" />
          <h2 className="text-base md:text-xl font-semibold">Heizungs-Einstellungen</h2>
        </div>
        <p className="text-green-100 text-xs md:text-sm mt-1">Zeitsteuerung, Pumpensteuerung und Booster-Konfiguration</p>
      </div>
      
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="space-y-6">
          {/* Betriebsmodus Steuerung - enthält jetzt Modi 1, 2, 4, 5, 6 */}
          <OperationModeControls
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            timeSlots={timeSlots}
            updateTimeSlot={updateTimeSlot}
            removeTimeSlot={removeTimeSlot}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          />

          {/* Pump Settings */}
          <PumpSettings
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          />
        </div>
      </div>
    </motion.div>
  )
}

