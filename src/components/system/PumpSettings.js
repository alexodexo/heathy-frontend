// src/components/system/PumpSettings.js
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function PumpSettings({
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  isSaving,
  parameterLoading
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-100">
          <ArrowPathIcon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Heizungs-Zirkulationspumpe</h3>
      </div>
      <div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperaturdifferenz ≤
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localParameterSettings.pump_overrun_time ?? 5}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setLocalParameterSettings(prev => ({ ...prev, pump_overrun_time: value }))
              }}
              onBlur={(e) => {
                const value = parseFloat(e.target.value)
                if (value !== parameterSettings?.pump_overrun_time?.value) {
                  updateParameterSetting('pump_overrun_time', value)
                }
              }}
              className="input text-gray-900 w-28"
              min="0"
              max="20"
              step="0.1"
              placeholder="5.0"
              disabled={isSaving || parameterLoading}
            />
            <span className="text-sm font-medium text-gray-700">°C</span>
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Hinweis:</strong> Differenz zwischen Heizungsvor- und Rücklauf. Die Zirkulationspumpe läuft automatisch weiter, bis die Temperaturdifferenz ≤ diesem Wert ist.
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pumpenlauf gegen Festsetzen
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Täglich um</span>
            <input
              type="time"
              value={localParameterSettings.pump_protection_time ?? '12:00'}
              onChange={(e) => {
                const value = e.target.value
                setLocalParameterSettings(prev => ({ ...prev, pump_protection_time: value }))
              }}
              onBlur={(e) => {
                const value = e.target.value
                if (value !== parameterSettings?.pump_protection_time?.value) {
                  updateParameterSetting('pump_protection_time', value)
                }
              }}
              className="input text-gray-900 w-28"
              disabled={isSaving || parameterLoading}
            />
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Hinweis:</strong> Regelmäßige Betätigung zur Erhaltung der Funktionsfähigkeit. Die Pumpe startet automatisch für 1min, auch wenn keine Heizung aktiv ist.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

