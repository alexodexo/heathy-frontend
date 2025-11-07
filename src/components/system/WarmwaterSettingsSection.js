// src/components/system/WarmwaterSettingsSection.js
import { motion } from 'framer-motion'
import { BeakerIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function WarmwaterSettingsSection({ 
  localSettings, 
  setLocalSettings,
  einstellungen,
  updateSetting,
  isSaving,
  einstellungenLoading 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-0 overflow-hidden"
    >
      {/* Header mit Gradient */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6">
        <div className="flex items-center gap-3 text-white">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <BeakerIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Einstellungen</h2>
            <p className="text-blue-100 text-sm mt-0.5">Schalttemperaturen und Leistung konfigurieren</p>
          </div>
        </div>
      </div>
      
      {/* Settings Content */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Normalbetrieb Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <BeakerIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Normalbetrieb</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Einschalten ≤ °C
                </label>
                <input
                  type="number"
                  value={localSettings.warmwasser_einschalt_temperatur ?? 45}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setLocalSettings(prev => ({ ...prev, warmwasser_einschalt_temperatur: value }))
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (value !== einstellungen?.warmwasser_einschalt_temperatur?.value) {
                      updateSetting('warmwasser_einschalt_temperatur', value, 'Temperatur, bei der die Warmwasserheizung einschaltet')
                    }
                  }}
                  className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="20"
                  max="70"
                  step="0.1"
                  placeholder="45"
                  disabled={isSaving || einstellungenLoading}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Temperatur, bei der die Heizung einschaltet
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Ausschalten ≥ °C
                </label>
                <input
                  type="number"
                  value={localSettings.warmwasser_ausschalt_temperatur ?? 55}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setLocalSettings(prev => ({ ...prev, warmwasser_ausschalt_temperatur: value }))
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (value !== einstellungen?.warmwasser_ausschalt_temperatur?.value) {
                      updateSetting('warmwasser_ausschalt_temperatur', value, 'Temperatur, bei der die Warmwasserheizung ausschaltet')
                    }
                  }}
                  className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="20"
                  max="80"  
                  step="0.1"
                  placeholder="55"
                  disabled={isSaving || einstellungenLoading}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Temperatur, bei der die Heizung ausschaltet
                </p>
              </div>
            </div>
          </div>

          {/* Leistung Heizstab Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-orange-50 rounded-xl">
                <BoltIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Leistung Heizstab</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Leistung (Watt)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={localSettings.warmwasser_heizstab_leistung ?? 380}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setLocalSettings(prev => ({ ...prev, warmwasser_heizstab_leistung: value }))
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (value !== einstellungen?.warmwasser_heizstab_leistung?.value) {
                      updateSetting('warmwasser_heizstab_leistung', value, 'Maximale Leistung des Heizstabs in Watt')
                    }
                  }}
                  className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  min="100"
                  max="2000"
                  step="10"
                  placeholder="380"
                  disabled={isSaving || einstellungenLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                Maximale Leistung des Heizstabs in Watt
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Update-Frequenz (Sekunden)
              </label>
              <input
                type="number"
                value={localSettings.warmwasser_update_frequenz ?? 60}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwasser_update_frequenz: value }))
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value)
                  if (value !== einstellungen?.warmwasser_update_frequenz?.value) {
                    updateSetting('warmwasser_update_frequenz', value, 'Warmwasser Update-Frequenz in Sekunden (wie oft Warmwasserwerte überprüft werden)')
                  }
                }}
                className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                min="10"
                max="300"
                step="1"
                placeholder="60"
                disabled={isSaving || einstellungenLoading}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                Wie oft Warmwasserwerte überprüft werden (in Sekunden)
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

