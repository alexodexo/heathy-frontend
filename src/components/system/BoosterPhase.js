// src/components/system/BoosterPhase.js
export default function BoosterPhase({
  phase,
  title,
  description,
  color,
  localParameterSettings,
  setLocalParameterSettings,
  parameterSettings,
  updateParameterSetting,
  isSaving,
  parameterLoading
}) {
  const durationKey = `phase${phase}_duration`
  const powerKey = `phase${phase}_power`
  
  const defaultPowers = {
    1: ['L1', 'L2', 'L3'],
    2: ['L1', 'L2'],
    3: ['L1']
  }

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      title: 'text-red-700',
      desc: 'text-red-600',
      power: 'text-red-700',
      checkbox: 'text-red-600 focus:ring-red-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      title: 'text-yellow-700',
      desc: 'text-yellow-600',
      power: 'text-yellow-700',
      checkbox: 'text-yellow-600 focus:ring-yellow-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      title: 'text-green-700',
      desc: 'text-green-600',
      power: 'text-green-700',
      checkbox: 'text-green-600 focus:ring-green-500'
    },
    gray: {
      bg: 'bg-white',
      border: 'border-gray-300',
      title: 'text-gray-900',
      desc: 'text-gray-600',
      power: 'text-gray-900',
      checkbox: 'text-gray-600 focus:ring-gray-500'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className={`flex gap-6 items-start p-4 ${classes.bg} rounded-lg border-l-4 ${classes.border}`}>
      {/* Phase Label */}
      <div className="flex-shrink-0 w-[160px]">
        <h4 className={`text-sm font-semibold ${classes.title}`}>{title}</h4>
        <p className={`text-xs ${classes.desc}`}>{description}</p>
      </div>

      {/* Duration & Heizstäbe Column */}
      <div className="flex-1">
        {/* Duration & Heizstäbe on same line */}
        <div className="flex items-center gap-4">
          {/* Duration */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localParameterSettings[durationKey] ?? (phase === 1 ? 10 : phase === 2 ? 12 : 8)}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                setLocalParameterSettings(prev => ({ ...prev, [durationKey]: value }))
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value)
                if (value !== parameterSettings?.[durationKey]?.value) {
                  updateParameterSetting(durationKey, value)
                }
              }}
              className="input text-gray-900 w-28"
              min="0"
              max="120"
              step="1"
              disabled={isSaving || parameterLoading}
            />
            <span className="text-xs font-medium text-gray-700">min</span>
          </div>

          {/* Heizstäbe */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'L1', label: 'L1' },
              { value: 'L2', label: 'L2' },
              { value: 'L3', label: 'L3' }
            ].map((option) => (
              <label key={`phase${phase}_${option.value}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(localParameterSettings[powerKey]) 
                    ? localParameterSettings[powerKey].includes(option.value)
                    : defaultPowers[phase].includes(option.value)}
                  onChange={(e) => {
                    const value = e.target.value
                    const currentPowers = Array.isArray(localParameterSettings[powerKey]) 
                      ? localParameterSettings[powerKey] 
                      : defaultPowers[phase]
                    
                    let newPowers
                    if (e.target.checked) {
                      newPowers = [...currentPowers, value]
                    } else {
                      newPowers = currentPowers.filter(p => p !== value)
                    }
                    
                    setLocalParameterSettings(prev => ({ ...prev, [powerKey]: newPowers }))
                    updateParameterSetting(powerKey, newPowers)
                  }}
                  className={`w-4 h-4 ${classes.checkbox} focus:ring-2 rounded`}
                  disabled={isSaving || parameterLoading}
                />
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Power Display */}
      <div className="ml-6 text-right">
        <div className={`text-sm font-semibold ${classes.power}`}>
          {(Array.isArray(localParameterSettings[powerKey]) 
            ? localParameterSettings[powerKey].length 
            : defaultPowers[phase].length) * 1.5} kW
        </div>
        <div className={`text-xs ${classes.desc}`}>
          {phase === 1 ? 'Max. Power' : phase === 2 ? 'Mittlere Power' : 'Min. Power'}
        </div>
      </div>
    </div>
  )
}

