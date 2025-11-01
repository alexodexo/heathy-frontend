// src/components/system/HeatingSettingsSection.js
import { motion } from 'framer-motion'
import { FireIcon } from '@heroicons/react/24/outline'
import OperationModeControls from './OperationModeControls'
import BoosterSettings from './BoosterSettings'
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <FireIcon className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Heizungs-Einstellungen</h2>
        </div>
        <p className="text-green-100 text-sm mt-1">Zeitsteuerung, Pumpensteuerung und Booster-Konfiguration</p>
      </div>
      
      <div className="p-6 space-y-8">
        <div className="space-y-6">
          {/* Betriebsmodus Steuerung */}
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

          {/* Booster Settings */}
          <BoosterSettings
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
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

