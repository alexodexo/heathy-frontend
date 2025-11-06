// src/components/system/PumpSettings.js
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function PumpSettings({
  localSettings,
  setLocalSettings,
  einstellungen,
  updateSetting,
  isSaving,
  einstellungenLoading
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
            Nachlaufzeit
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localSettings.heizung_pump_overrun_time ?? 10}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                setLocalSettings(prev => ({ ...prev, heizung_pump_overrun_time: value }))
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value)
                if (value !== einstellungen?.heizung_pump_overrun_time?.value) {
                  updateSetting('heizung_pump_overrun_time', value)
                }
              }}
              className="input text-gray-900 w-28"
              min="0"
              max="60"
              step="1"
              placeholder="10"
              disabled={isSaving || einstellungenLoading}
            />
            <span className="text-sm font-medium text-gray-700">min</span>
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Hinweis:</strong> Die Zirkulationspumpe läuft automatisch nach dem Ausschalten der Heizstäbe noch diese Zeit weiter, um die Restwärme zu verteilen.
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
              value={(() => {
                // Konvertiere Minuten zu HH:MM
                const minutes = localSettings.heizung_pump_protection_time ?? 720
                const hours = Math.floor(minutes / 60)
                const mins = minutes % 60
                return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
              })()}
              onChange={(e) => {
                // Konvertiere HH:MM zu Minuten
                const [hours, mins] = e.target.value.split(':').map(Number)
                const totalMinutes = hours * 60 + mins
                setLocalSettings(prev => ({ ...prev, heizung_pump_protection_time: totalMinutes }))
              }}
              onBlur={(e) => {
                // Konvertiere HH:MM zu Minuten und speichere
                const [hours, mins] = e.target.value.split(':').map(Number)
                const totalMinutes = hours * 60 + mins
                if (totalMinutes !== einstellungen?.heizung_pump_protection_time?.value) {
                  updateSetting('heizung_pump_protection_time', totalMinutes, 'Heizung Pumpe täglich gegen Festsetzen (Minuten seit Mitternacht)')
                }
              }}
              className="input text-gray-900 w-28"
              disabled={isSaving || einstellungenLoading}
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

