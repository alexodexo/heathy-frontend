// src/components/system/TimeSlotControls.js
import { TrashIcon } from '@heroicons/react/24/outline'

export default function TimeSlotControls({ 
  timeSlots, 
  updateTimeSlot, 
  removeTimeSlot, 
  isSaving 
}) {
  return (
    <div className="pt-3 border-t border-gray-300 mt-3">
      <p className="text-xs font-medium text-gray-700 mb-3">Zeitsteuerung:</p>
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div key={slot.id} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {index === 0 && 'Heizung einschalten um'}
              </label>
              <input
                type="time"
                value={slot.start}
                onChange={(e) => updateTimeSlot(slot.id, 'start', e.target.value)}
                className="input text-gray-900 w-full"
                disabled={isSaving}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {index === 0 && 'Heizung ausschalten um'}
              </label>
              <input
                type="time"
                value={slot.end}
                onChange={(e) => updateTimeSlot(slot.id, 'end', e.target.value)}
                className="input text-gray-900 w-full"
                disabled={isSaving}
              />
            </div>
            {timeSlots.length > 1 && (
              <button
                type="button"
                onClick={() => removeTimeSlot(slot.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                disabled={isSaving}
                title="Zeitfenster entfernen"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

