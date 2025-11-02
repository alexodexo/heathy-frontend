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
  const calculateTotal = () => {
    return (localParameterSettings.phase1_duration ?? 10) + 
           (localParameterSettings.phase2_duration ?? 12) + 
           (localParameterSettings.phase3_duration ?? 8)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Modus 2 - Booster Einstellungen</h4>
      
      {/* Gesamtzeit Anzeige */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Gesamtzeit:</span>
            <span className="font-semibold text-gray-900">
              {calculateTotal()} min
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Restlaufzeit:</span>
            <span className="font-semibold text-gray-900">
              {calculateTotal()} min
            </span>
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
          Die Gesamtzeit ergibt sich automatisch aus der Summe aller Phasen.
        </p>
      </div>
    </div>
  )
}

