// src/components/system/WarmwaterSettingsSection.js
import { motion } from 'framer-motion'
import { BeakerIcon } from '@heroicons/react/24/outline'

export default function WarmwaterSettingsSection({ 
  localParameterSettings, 
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  isSaving,
  parameterLoading 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-0 overflow-hidden"
    >
      {/* Warmwater Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <BeakerIcon className="w-5 h-5 md:w-6 md:h-6" />
          <h2 className="text-base md:text-xl font-semibold">Warmwasser-Einstellungen</h2>
        </div>
        <p className="text-blue-100 text-xs md:text-sm mt-1">Schalttemperaturen für Warmwasser</p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Modus 1 + Leistung Heizstab in separaten Boxen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Modus 1: Vollständig EIN */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modus 1 &ldquo;Normalbetrieb - EIN&rdquo;</h3>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                    <input
                      type="number"
                      value={localParameterSettings.mode_1_switchon ?? 45}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_1_switchon: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_1_switchon?.value) {
                          updateParameterSetting('mode_1_switchon', value)
                        }
                      }}
                      className="input text-gray-900 w-full"
                      min="20"
                      max="70"
                      step="0.1"
                      placeholder="45"
                      disabled={isSaving || parameterLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                    <input
                      type="number"
                      value={localParameterSettings.mode_1_switchoff ?? 55}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_1_switchoff: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_1_switchoff?.value) {
                          updateParameterSetting('mode_1_switchoff', value)
                        }
                      }}
                      className="input text-gray-900 w-full"
                      min="20"
                      max="80"  
                      step="0.1"
                      placeholder="55"
                      disabled={isSaving || parameterLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Leistung Heizstab */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Leistung Heizstab</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leistung Heizstab (Watt)</label>
                <input
                  type="number"
                  value={localParameterSettings.power_heathing_rod ?? 380}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setLocalParameterSettings(prev => ({ ...prev, power_heathing_rod: value }))
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (value !== parameterSettings?.power_heathing_rod?.value) {
                      updateParameterSetting('power_heathing_rod', value)
                    }
                  }}
                  className="input text-gray-900 w-28"
                  min="100"
                  max="2000"
                  step="10"
                  placeholder="380"
                  disabled={isSaving || parameterLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

