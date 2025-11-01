// src/components/system/OperationModeControls.js
import { FireIcon } from '@heroicons/react/24/outline'
import ModeSettingsPanel from './ModeSettingsPanel'
import TimeSlotControls from './TimeSlotControls'

export default function OperationModeControls({
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-100">
          <FireIcon className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Betriebsmodus Steuerung</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">Konfiguriere die Vorlauftemperaturen für die einzelnen Betriebsmodi.</p>

      {/* Modi Einstellungen */}
      <div className="space-y-4">
        {/* First Row - Modus 1 Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <ModeSettingsPanel
            mode={1}
            title="Modus 1 - Normalbetrieb Beginn mit 1,5kW (L1)"
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          >
            <div className="pt-2 border-t border-gray-200 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">L2 Booster bei verzögerter Erreichung:</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Nach</span>
                  <input
                    type="number"
                    value={localParameterSettings.mode_1_l2_boost_time ?? '--'}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_1_l2_boost_time: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value)
                      if (value !== parameterSettings?.mode_1_l2_boost_time?.value) {
                        updateParameterSetting('mode_1_l2_boost_time', value)
                      }
                    }}
                    className="input text-gray-900 w-16"
                    min="0"
                    max="60"
                    step="1"
                    placeholder="--"
                    disabled={isSaving || parameterLoading}
                    style={{
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                  />
                  <span className="text-xs text-gray-600">min. L2 zuschalten, wenn Vorlauftemperatur &quot;Ausschalten&quot; nicht erreicht wird.</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">L3 Booster bei verzögerter Erreichung:</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Nach</span>
                  <input
                    type="number"
                    value={localParameterSettings.mode_1_l3_boost_time ?? '--'}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_1_l3_boost_time: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value)
                      if (value !== parameterSettings?.mode_1_l3_boost_time?.value) {
                        updateParameterSetting('mode_1_l3_boost_time', value)
                      }
                    }}
                    className="input text-gray-900 w-16"
                    min="0"
                    max="60"
                    step="1"
                    placeholder="--"
                    disabled={isSaving || parameterLoading}
                    style={{
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                  />
                  <span className="text-xs text-gray-600">min. L3 zuschalten, wenn Vorlauftemperatur &quot;Ausschalten&quot; nicht erreicht wird.</span>
                </div>
              </div>
              
              {/* Zeitsteuerung für Modus 1 */}
              <TimeSlotControls
                timeSlots={timeSlots}
                updateTimeSlot={updateTimeSlot}
                removeTimeSlot={removeTimeSlot}
                isSaving={isSaving}
              />
            </div>
          </ModeSettingsPanel>
        </div>

        {/* Second Row - Modi 4, 5, 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModeSettingsPanel
            mode={4}
            title="Modus 4"
            description="1.5 kW Dauerbetrieb (L1)"
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          />

          <ModeSettingsPanel
            mode={5}
            title="Modus 5"
            description="3.0 kW Dauerbetrieb (L1, L2)"
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          />

          <ModeSettingsPanel
            mode={6}
            title="Modus 6"
            description="4.5 kW Dauerbetrieb (L1, L2, L3)"
            localParameterSettings={localParameterSettings}
            setLocalParameterSettings={setLocalParameterSettings}
            parameterSettings={parameterSettings}
            updateParameterSetting={updateParameterSetting}
            isSaving={isSaving}
            parameterLoading={parameterLoading}
          />
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Hinweis:</strong> Konfiguriere die Vorlauftemperaturen für jeden Betriebsmodus.
        </p>
      </div>
    </div>
  )
}

