// src/components/system/BoosterPhase.js
export default function BoosterPhase({
  phase,
  title,
  description,
  color,
  localSettings,
  setLocalSettings,
  einstellungen,
  updateSetting,
  isSaving,
  einstellungenLoading
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

      {/* Duration Column */}
      <div className="flex-1">
        {/* Duration */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localSettings[durationKey] ?? (phase === 1 ? 10 : phase === 2 ? 12 : 8)}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                setLocalSettings(prev => ({ ...prev, [durationKey]: value }))
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value)
                if (value !== einstellungen?.[durationKey]?.value) {
                  updateSetting(durationKey, value)
                }
              }}
              className="input text-gray-900 w-28"
              min="0"
              max="120"
              step="1"
              disabled={isSaving || einstellungenLoading}
            />
            <span className="text-xs font-medium text-gray-700">min</span>
          </div>
        </div>
      </div>

      {/* Power Display */}
      <div className="ml-6 text-right">
        <div className={`text-sm font-semibold ${classes.power}`}>
          {defaultPowers[phase].length * 1.5} kW
        </div>
        <div className={`text-xs ${classes.desc}`}>
          {phase === 1 ? 'Max. Power' : phase === 2 ? 'Mittlere Power' : 'Min. Power'}
        </div>
      </div>
    </div>
  )
}

