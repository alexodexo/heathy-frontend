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
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <CurrencyEuroIcon className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Abrechnungseinstellungen</h2>
        </div>
        <p className="text-orange-100 text-sm mt-1">Strompreise und Zählerstände für die Kostenberechnung</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
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
              className="input text-gray-900 w-32"
              step="0.01"
              min="0"
              max="1"
              disabled={isSaving}
            />
          </div>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          <div>
            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zählerstand Heizung
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
                  className="input text-gray-900 w-32"
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
                  className="input text-gray-900 w-40"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          <div>
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
                  className="input text-gray-900 w-32"
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
                  className="input text-gray-900 w-32"
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

