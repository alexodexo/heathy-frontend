// src/components/system/OperationModeControls.js
import { FireIcon } from '@heroicons/react/24/outline'
import TimeSlotControls from './TimeSlotControls'
import BoosterSettings from './BoosterSettings'

export default function OperationModeControls({
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  timeSlots,
  updateTimeSlot,
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
      <div className="space-y-6">
        {/* Modus 1 - Normalbetrieb */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Normalbetrieb Beginn mit 1,5kW (L1)</h4>
          
          {/* Zeitsteuerung für Modus 1 - kommt ZUERST */}
          <div className="mb-4">
            <TimeSlotControls
              timeSlots={timeSlots}
              updateTimeSlot={updateTimeSlot}
              isSaving={isSaving}
            />
          </div>

          {/* Temperatur-Einstellungen */}
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-300">
            <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Temperatursteuerung</h5>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                <input
                  type="number"
                  value={localParameterSettings.mode_1_switchon ?? '--'}
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
                  placeholder="--"
                  disabled={isSaving || parameterLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                <input
                  type="number"
                  value={localParameterSettings.mode_1_switchoff ?? '--'}
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
                  placeholder="--"
                  disabled={isSaving || parameterLoading}
                />
              </div>
            </div>
            
          </div>

          {/* Kaltstart-Boost */}
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-300">
            <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">🚀 Booster</h5>
            <p className="text-xs text-gray-600 mb-3">
              Startet zu einer festen Uhrzeit und heizt mit allen drei Heizstäben (4,5kW) bis zur Zieltemperatur. Ideal für schnelles Aufheizen am Morgen.
            </p>
            
            {/* Aktivierung Checkbox */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="mode_1_coldstart_enabled"
                checked={localParameterSettings.mode_1_coldstart_enabled ?? false}
                onChange={(e) => {
                  const value = e.target.checked
                  setLocalParameterSettings(prev => ({ ...prev, mode_1_coldstart_enabled: value }))
                  updateParameterSetting('mode_1_coldstart_enabled', value)
                }}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                disabled={isSaving || parameterLoading}
              />
              <label htmlFor="mode_1_coldstart_enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                Booster aktivieren
              </label>
            </div>

            {/* Kaltstart-Boost Einstellungen */}
            {localParameterSettings.mode_1_coldstart_enabled && (
              <div className="pl-7 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Boosten bis Vorlauftemperatur</span>
                      <input
                        type="number"
                        value={localParameterSettings.mode_1_coldstart_target_temp ?? 45}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setLocalParameterSettings(prev => ({ ...prev, mode_1_coldstart_target_temp: value }))
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value)
                          if (value !== parameterSettings?.mode_1_coldstart_target_temp?.value) {
                            updateParameterSetting('mode_1_coldstart_target_temp', value)
                          }
                        }}
                        className="input text-gray-900 w-28"
                        min="30"
                        max="70"
                        step="0.5"
                        disabled={isSaving || parameterLoading}
                      />
                      <span className="text-sm text-gray-600">°C erreicht ist</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-800">
                    <strong>⚡ Funktion:</strong> Die Heizung startet mit allen drei Heizstäben (4,5kW gesamt) und heizt auf, bis die Vorlauftemperatur {localParameterSettings.mode_1_coldstart_target_temp ?? 45}°C erreicht hat. Danach schaltet das System automatisch auf die normale Regelung um.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* L2 und L3 Booster */}
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-300">
            <h5 className="text-xs font-semibold text-gray-800 mb-3">regulierter Normalbetrieb</h5>
            <p className="text-xs text-gray-600 mb-3">
              Automatisches Zuschalten zusätzlicher Heizstäbe, wenn die Zieltemperatur nicht rechtzeitig erreicht wird.
            </p>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">L2 Heizstab zuschalten:</p>
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
                  className="input text-gray-900 w-24"
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
                <span className="text-xs text-gray-600">min. Heizstab L2 zusätzlich zuschalten (dann L1+L2 = 3,0kW), wenn Zieltemperatur nicht erreicht wird.</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">L3 Heizstab zuschalten:</p>
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
                  className="input text-gray-900 w-24"
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
                <span className="text-xs text-gray-600">min. Heizstab L3 zusätzlich zuschalten (dann L1+L2+L3 = 4,5kW), wenn Zieltemperatur nicht erreicht wird.</span>
              </div>
            </div>
          </div>

          {/* Runterschalten-Einstellungen */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">📉 Intelligentes Runterschalten</h5>
            <p className="text-xs text-gray-600 mb-3">
              Konfiguriere, wann einzelne Heizstäbe abgeschaltet werden, wenn sich die Zieltemperatur nähert. Dies spart Energie und verhindert Überschwingen.
            </p>

            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    L3 abschalten bei:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Zieltemperatur minus</span>
                    <input
                      type="number"
                      value={localParameterSettings.mode_1_downshift_l3_offset ?? 3.0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_1_downshift_l3_offset: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_1_downshift_l3_offset?.value) {
                          updateParameterSetting('mode_1_downshift_l3_offset', value)
                        }
                      }}
                      className="input text-gray-900 w-28"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={isSaving || parameterLoading}
                    />
                    <span className="text-sm text-gray-600">°C</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (L1+L2+L3 → L1+L2)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    L2 abschalten bei:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Zieltemperatur minus</span>
                    <input
                      type="number"
                      value={localParameterSettings.mode_1_downshift_l2_offset ?? 1.5}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_1_downshift_l2_offset: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_1_downshift_l2_offset?.value) {
                          updateParameterSetting('mode_1_downshift_l2_offset', value)
                        }
                      }}
                      className="input text-gray-900 w-28"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={isSaving || parameterLoading}
                    />
                    <span className="text-sm text-gray-600">°C</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (L1+L2 → L1)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    L1 abschalten bei:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Zieltemperatur</span>
                    <input
                      type="number"
                      value={localParameterSettings.mode_1_switchoff ?? 45}
                      className="input text-gray-400 w-28 cursor-not-allowed"
                      disabled={true}
                    />
                    <span className="text-sm text-gray-600">°C</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (L1 → AUS) - siehe Ausschalten-Temperatur oben
                    </span>
                  </div>
                </div>
              </div>

              {/* Visueller Bereich */}
              <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                <p className="text-xs font-semibold text-blue-900 mb-2">📊 Beispiel-Berechnung:</p>
                <div className="text-xs text-gray-700 space-y-1">
                  <div>Zieltemperatur (Ausschalten): <strong>{localParameterSettings.mode_1_switchoff ?? 45}°C</strong></div>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-blue-400">
                    <div>🔴 L3 abschalten bei: <strong>{((localParameterSettings.mode_1_switchoff ?? 45) - (localParameterSettings.mode_1_downshift_l3_offset ?? 3.0)).toFixed(1)}°C</strong> (Ziel - {localParameterSettings.mode_1_downshift_l3_offset ?? 3.0}°C)</div>
                    <div>🟡 L2 abschalten bei: <strong>{((localParameterSettings.mode_1_switchoff ?? 45) - (localParameterSettings.mode_1_downshift_l2_offset ?? 1.5)).toFixed(1)}°C</strong> (Ziel - {localParameterSettings.mode_1_downshift_l2_offset ?? 1.5}°C)</div>
                    <div>🟢 L1 abschalten bei: <strong>{(localParameterSettings.mode_1_switchoff ?? 45).toFixed(1)}°C</strong> (Ziel erreicht)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zusammenfassung der kompletten Logik */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-2">🧠 Intelligente Regellogik - Zusammenfassung:</p>
            <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
              <li><strong>Zeitfenster:</strong> Heizung läuft nur in den konfigurierten Zeitslots</li>
              <li><strong>Kaltstart-Boost:</strong> Gezieltes Aufheizen zur Wunschzeit mit allen Heizstäben (L1+L2+L3 = 4,5kW) bis Zieltemperatur (optional)</li>
              <li><strong>Hochschalten:</strong> L1 (1,5kW) → L1+L2 (3,0kW) → L1+L2+L3 (4,5kW) wenn Zieltemperatur verzögert erreicht wird</li>
              <li><strong>Runterschalten:</strong> Konfigurierbare Schwellen zum stufenweisen Abschalten (L1+L2+L3 → L1+L2 → L1 → AUS)</li>
              <li><strong>Energieeffizienz:</strong> Nur so viele Heizstäbe wie nötig, so wenig wie möglich</li>
            </ul>
          </div>
        </div>

        {/* Modus 2 - Booster Einstellungen */}
        <BoosterSettings
          localParameterSettings={localParameterSettings}
          setLocalParameterSettings={setLocalParameterSettings}
          parameterSettings={parameterSettings}
          updateParameterSetting={updateParameterSetting}
          isSaving={isSaving}
          parameterLoading={parameterLoading}
        />
      </div>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Hinweis:</strong> Konfiguriere die Vorlauftemperaturen für jeden Betriebsmodus.
        </p>
      </div>
    </div>
  )
}

