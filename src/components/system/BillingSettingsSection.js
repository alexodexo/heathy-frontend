// src/components/system/BillingSettingsSection.js
import { motion } from 'framer-motion'
import { CurrencyEuroIcon } from '@heroicons/react/24/outline'

export default function BillingSettingsSection({
  localSettings,
  setLocalSettings,
  allSettings,
  updateSetting,
  isSaving
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card p-0 overflow-hidden"
    >
      {/* Billing Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <CurrencyEuroIcon className="w-5 h-5 md:w-6 md:h-6" />
          <h2 className="text-base md:text-xl font-semibold">Abrechnungseinstellungen</h2>
        </div>
        <p className="text-orange-100 text-xs md:text-sm mt-1">Strompreise und Zählerstände für die Kostenberechnung</p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strompreis (€/kWh)
            </label>
            <input
              type="number"
              value={localSettings.electricity_price || ''}
              onChange={(e) => {
                const value = Number(e.target.value)
                setLocalSettings(prev => ({ ...prev, electricity_price: value }))
              }}
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (value !== allSettings?.settings?.electricity_price) {
                  updateSetting('electricity_price', value)
                }
              }}
                  className="input text-gray-900 w-40"
                  step="0.01"
                  min="0"
                  max="1"
                  disabled={isSaving}
            />
          </div>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Zählerstand Heizung */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">🔥 Heizung</h3>
            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zählerstand Heizung
                </label>
                <input
                  type="number"
                  value={localSettings.heating_meter_reading || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setLocalSettings(prev => ({ ...prev, heating_meter_reading: value }))
                  }}
                  onBlur={(e) => {
                    const value = Number(e.target.value)
                    if (value !== allSettings?.settings?.heating_meter_reading) {
                      updateSetting('heating_meter_reading', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  min="0"
                  step="0.1"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum Ablesung Heizung
                </label>
                <input
                  type="date"
                  value={localSettings.heating_meter_date || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setLocalSettings(prev => ({ ...prev, heating_meter_date: value }))
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    if (value !== allSettings?.settings?.heating_meter_date) {
                      updateSetting('heating_meter_date', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Zählerstand Warmwasser */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">💧 Warmwasser</h3>
            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zählerstand Warmwasser
                </label>
                <input
                  type="number"
                  value={localSettings.warmwater_meter_reading || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setLocalSettings(prev => ({ ...prev, warmwater_meter_reading: value }))
                  }}
                  onBlur={(e) => {
                    const value = Number(e.target.value)
                    if (value !== allSettings?.settings?.warmwater_meter_reading) {
                      updateSetting('warmwater_meter_reading', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  min="0"
                  step="0.1"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum Ablesung Warmwasser
                </label>
                <input
                  type="date"
                  value={localSettings.warmwater_meter_date || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setLocalSettings(prev => ({ ...prev, warmwater_meter_date: value }))
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    if (value !== allSettings?.settings?.warmwater_meter_date) {
                      updateSetting('warmwater_meter_date', value)
                    }
                  }}
                  className="input text-gray-900 w-48"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Zählerstand HT/NT */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">⚡ Stromzähler (HT/NT)</h3>
            <div className="flex gap-6 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zählerstand HT
                </label>
                <input
                  type="number"
                  value={localSettings.ht_meter_reading || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setLocalSettings(prev => ({ ...prev, ht_meter_reading: value }))
                  }}
                  onBlur={(e) => {
                    const value = Number(e.target.value)
                    if (value !== allSettings?.settings?.ht_meter_reading) {
                      updateSetting('ht_meter_reading', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  min="0"
                  step="0.1"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zählerstand NT
                </label>
                <input
                  type="number"
                  value={localSettings.nt_meter_reading || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setLocalSettings(prev => ({ ...prev, nt_meter_reading: value }))
                  }}
                  onBlur={(e) => {
                    const value = Number(e.target.value)
                    if (value !== allSettings?.settings?.nt_meter_reading) {
                      updateSetting('nt_meter_reading', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  min="0"
                  step="0.1"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum Ablesung HT/NT
                </label>
                <input
                  type="date"
                  value={localSettings.electricity_meter_date || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setLocalSettings(prev => ({ ...prev, electricity_meter_date: value }))
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    if (value !== allSettings?.settings?.electricity_meter_date) {
                      updateSetting('electricity_meter_date', value)
                    }
                  }}
                  className="input text-gray-900 w-40"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

