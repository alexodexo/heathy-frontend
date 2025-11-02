// src/components/system/BoosterSettings.js
import { BoltIcon } from '@heroicons/react/24/outline'
import BoosterPhase from './BoosterPhase'

export default function BoosterSettings({
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  isSaving,
  parameterLoading
}) {
  const calculateRemaining = () => {
    return Math.max(0, (localParameterSettings.total_booster_duration ?? 30) - 
      (localParameterSettings.phase1_duration ?? 10) - 
      (localParameterSettings.phase2_duration ?? 12) - 
      (localParameterSettings.phase3_duration ?? 8))
  }

  const calculateTotal = () => {
    return (localParameterSettings.phase1_duration ?? 10) + 
           (localParameterSettings.phase2_duration ?? 12) + 
           (localParameterSettings.phase3_duration ?? 8)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Modus 2 - Booster Einstellungen</h4>
      
      {/* Gesamt-Boosterzeit */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Gesamt-Boosterzeit:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localParameterSettings.total_booster_duration ?? 30}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                setLocalParameterSettings(prev => ({ ...prev, total_booster_duration: value }))
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value)
                if (value !== parameterSettings?.total_booster_duration?.value) {
                  updateParameterSetting('total_booster_duration', value)
                }
              }}
              className="input text-gray-900 w-28"
              min="1"
              max="120"
              step="1"
              disabled={isSaving || parameterLoading}
            />
            <span className="text-sm font-medium text-gray-700">min</span>
          </div>
          
          {/* Restzeit Anzeige */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Verbleibend:</span>
              <span className={`font-semibold ${
                calculateRemaining() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculateRemaining()} min
              </span>
            </div>

            {/* Visueller Zeitbalken */}
            <div className="flex items-center gap-1">
              <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden flex">
                {/* Phase 1 */}
                <div 
                  className="bg-gray-400 h-full"
                  style={{
                    width: `${((localParameterSettings.phase1_duration ?? 10) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                  }}
                  title={`Phase 1: ${localParameterSettings.phase1_duration ?? 10} min`}
                />
                {/* Phase 2 */}
                <div 
                  className="bg-gray-500 h-full"
                  style={{
                    width: `${((localParameterSettings.phase2_duration ?? 12) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                  }}
                  title={`Phase 2: ${localParameterSettings.phase2_duration ?? 12} min`}
                />
                {/* Phase 3 */}
                <div 
                  className="bg-gray-600 h-full"
                  style={{
                    width: `${((localParameterSettings.phase3_duration ?? 8) / (localParameterSettings.total_booster_duration ?? 30)) * 100}%`
                  }}
                  title={`Phase 3: ${localParameterSettings.phase3_duration ?? 8} min`}
                />
              </div>
              <span className="text-xs text-gray-500 ml-1">
                {calculateTotal()}/{localParameterSettings.total_booster_duration ?? 30}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booster-Phasen */}
      <div className="space-y-3">
        <BoosterPhase
          phase={1}
          title="Phase 1: Aufheizen"
          description="Booster-Phase"
          color="gray"
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />

        <BoosterPhase
          phase={2}
          title="Phase 2: Stabilisieren"
          description="Temperatur halten"
          color="gray"
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />

        <BoosterPhase
          phase={3}
          title="Phase 3: Halten"
          description="Ausdauerbetrieb"
          color="gray"
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />
      </div>

      {/* Combined Info Text */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Intelligenter Booster-Sequenzer:</strong> Phase 1 startet die Booster-Phase mit maximaler Leistung. 
          Phase 2 stabilisiert die Temperatur (Mittlere Power). Phase 3 hält die Temperatur im Ausdauerbetrieb (Min. Power). 
          Die Summe aller Phasen darf die Gesamt-Boosterzeit nicht überschreiten.
        </p>
      </div>
    </div>
  )
}

