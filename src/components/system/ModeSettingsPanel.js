// src/components/system/ModeSettingsPanel.js
export default function ModeSettingsPanel({ 
  mode, 
  title, 
  description,
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  isSaving,
  parameterLoading,
  children 
}) {
  const switchOnKey = `mode_${mode}_switchon`
  const switchOffKey = `mode_${mode}_switchoff`

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
      {description && <p className="text-xs text-gray-600 mb-3">{description}</p>}
      <div className="space-y-3">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
            <input
              type="number"
              value={localParameterSettings[switchOnKey] ?? '--'}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setLocalParameterSettings(prev => ({ ...prev, [switchOnKey]: value }))
              }}
              onBlur={(e) => {
                const value = parseFloat(e.target.value)
                if (value !== parameterSettings?.[switchOnKey]?.value) {
                  updateParameterSetting(switchOnKey, value)
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
              value={localParameterSettings[switchOffKey] ?? '--'}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setLocalParameterSettings(prev => ({ ...prev, [switchOffKey]: value }))
              }}
              onBlur={(e) => {
                const value = parseFloat(e.target.value)
                if (value !== parameterSettings?.[switchOffKey]?.value) {
                  updateParameterSetting(switchOffKey, value)
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
        {children}
      </div>
    </div>
  )
}

