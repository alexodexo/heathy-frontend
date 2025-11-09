// src/components/system/TimeSlotControls.js
import { minutesToTime, timeToMinutes } from '@/lib/timeUtils'

export default function TimeSlotControls({ 
  localSettings,
  setLocalSettings,
  einstellungen,
  updateSetting,
  isSaving,
  einstellungenLoading
}) {
  // Zeitsteuerung aktiv?
  const zeitsteuerungAktiv = !!parseInt(localSettings.heizung_zeitsteuerung_aktiv ?? 0)
  
  // Zeitfenster 1 (immer sichtbar wenn aktiv)
  const zeitfenster1Start = minutesToTime(parseInt(localSettings.heizung_zeitfenster1_start ?? 360))
  const zeitfenster1Ende = minutesToTime(parseInt(localSettings.heizung_zeitfenster1_ende ?? 1320))
  
  // Zeitfenster 2 (optional)
  const zeitfenster2Aktiv = !!parseInt(localSettings.heizung_zeitfenster2_aktiv ?? 0)
  const zeitfenster2Start = minutesToTime(parseInt(localSettings.heizung_zeitfenster2_start ?? 0))
  const zeitfenster2Ende = minutesToTime(parseInt(localSettings.heizung_zeitfenster2_ende ?? 0))

  return (
    <div className="space-y-4">
      {/* Zeitsteuerung aktivieren/deaktivieren */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="heizung_zeitsteuerung_aktiv"
          checked={zeitsteuerungAktiv}
          onChange={(e) => {
            const value = e.target.checked ? 1 : 0
            setLocalSettings(prev => ({ ...prev, heizung_zeitsteuerung_aktiv: value }))
            updateSetting('heizung_zeitsteuerung_aktiv', value, 'Zeitsteuerung aktiviert (0=AUS, 1=EIN)')
          }}
          className="w-4 h-4 text-blue-600 rounded"
          disabled={isSaving || einstellungenLoading}
        />
        <label htmlFor="heizung_zeitsteuerung_aktiv" className="text-sm font-medium text-gray-700 cursor-pointer">
          Zeitsteuerung aktivieren
        </label>
      </div>

      {zeitsteuerungAktiv && (
        <>
          {/* Zeitfenster 1 */}
          <div className="pl-7 space-y-3 bg-blue-50 p-4 rounded-lg">
            <h6 className="text-sm font-semibold text-gray-900">Zeitfenster 1</h6>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                <input
                  type="time"
                  value={zeitfenster1Start}
                  onChange={(e) => {
                    const minutes = timeToMinutes(e.target.value)
                    setLocalSettings(prev => ({ ...prev, heizung_zeitfenster1_start: minutes }))
                  }}
                  onBlur={(e) => {
                    const minutes = timeToMinutes(e.target.value)
                    if (minutes !== einstellungen?.heizung_zeitfenster1_start?.value) {
                      updateSetting('heizung_zeitfenster1_start', minutes, 'Zeitfenster 1 Start (Minuten seit Mitternacht)')
                    }
                  }}
                  className="input text-gray-900 w-full"
                  disabled={isSaving || einstellungenLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ende</label>
                <input
                  type="time"
                  value={zeitfenster1Ende}
                  onChange={(e) => {
                    const minutes = timeToMinutes(e.target.value)
                    setLocalSettings(prev => ({ ...prev, heizung_zeitfenster1_ende: minutes }))
                  }}
                  onBlur={(e) => {
                    const minutes = timeToMinutes(e.target.value)
                    if (minutes !== einstellungen?.heizung_zeitfenster1_ende?.value) {
                      updateSetting('heizung_zeitfenster1_ende', minutes, 'Zeitfenster 1 Ende (Minuten seit Mitternacht)')
                    }
                  }}
                  className="input text-gray-900 w-full"
                  disabled={isSaving || einstellungenLoading}
                />
              </div>
            </div>
          </div>

          {/* Zeitfenster 2 Toggle */}
          <div className="pl-7">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="heizung_zeitfenster2_aktiv"
                checked={zeitfenster2Aktiv}
                onChange={(e) => {
                  const value = e.target.checked ? 1 : 0
                  setLocalSettings(prev => ({ ...prev, heizung_zeitfenster2_aktiv: value }))
                  updateSetting('heizung_zeitfenster2_aktiv', value, 'Zeitfenster 2 aktiviert (0=AUS, 1=EIN)')
                }}
                className="w-4 h-4 text-blue-600 rounded"
                disabled={isSaving || einstellungenLoading}
              />
              <label htmlFor="heizung_zeitfenster2_aktiv" className="text-sm font-medium text-gray-700 cursor-pointer">
                Zweites Zeitfenster aktivieren
              </label>
            </div>
          </div>

          {/* Zeitfenster 2 (wenn aktiv) */}
          {zeitfenster2Aktiv && (
            <div className="pl-7 space-y-3 bg-green-50 p-4 rounded-lg">
              <h6 className="text-sm font-semibold text-gray-900">Zeitfenster 2</h6>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                  <input
                    type="time"
                    value={zeitfenster2Start}
                    onChange={(e) => {
                      const minutes = timeToMinutes(e.target.value)
                      setLocalSettings(prev => ({ ...prev, heizung_zeitfenster2_start: minutes }))
                    }}
                    onBlur={(e) => {
                      const minutes = timeToMinutes(e.target.value)
                      if (minutes !== einstellungen?.heizung_zeitfenster2_start?.value) {
                        updateSetting('heizung_zeitfenster2_start', minutes, 'Zeitfenster 2 Start (Minuten seit Mitternacht)')
                      }
                    }}
                    className="input text-gray-900 w-full"
                    disabled={isSaving || einstellungenLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ende</label>
                  <input
                    type="time"
                    value={zeitfenster2Ende}
                    onChange={(e) => {
                      const minutes = timeToMinutes(e.target.value)
                      setLocalSettings(prev => ({ ...prev, heizung_zeitfenster2_ende: minutes }))
                    }}
                    onBlur={(e) => {
                      const minutes = timeToMinutes(e.target.value)
                      if (minutes !== einstellungen?.heizung_zeitfenster2_ende?.value) {
                        updateSetting('heizung_zeitfenster2_ende', minutes, 'Zeitfenster 2 Ende (Minuten seit Mitternacht)')
                      }
                    }}
                    className="input text-gray-900 w-full"
                    disabled={isSaving || einstellungenLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

