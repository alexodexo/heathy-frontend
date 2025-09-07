// src/pages/system.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  useAllSettings, 
  useSensorSettings, 
  useWarmwaterSettings, 
  useSystemHealth,
  useSystemStats
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  Cog6ToothIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ServerIcon,
  ChartBarIcon,
  Bars3Icon,
  TrashIcon,
  BeakerIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

// Sortable Row Component
function SortableRow({ rowId, index, localSettings, setLocalSettings, allSettings, updateSetting, isSaving, defaultHeatingCurve, removeHeatingCurveRow, heatingCurveRows }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <td className="border border-gray-300 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
            disabled={isSaving}
          >
            <Bars3Icon className="w-4 h-4" />
          </button>
          <input
            type="number"
            step="0.1"
            value={localSettings[`heating_curve_outdoor_${rowId}`] || ''}
            onChange={(e) => {
              const value = Number(e.target.value)
              setLocalSettings(prev => ({ ...prev, [`heating_curve_outdoor_${rowId}`]: value }))
            }}
            onBlur={(e) => {
              const value = Number(e.target.value)
              if (value !== allSettings?.settings?.[`heating_curve_outdoor_${rowId}`]) {
                updateSetting(`heating_curve_outdoor_${rowId}`, value)
              }
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder={defaultHeatingCurve[index]?.outdoor?.toString() || ""}
            disabled={isSaving}
          />
        </div>
      </td>
      <td className="border border-gray-300 px-3 py-2">
        <input
          type="number"
          step="0.1"
          value={localSettings[`heating_curve_flow_${rowId}`] || ''}
          onChange={(e) => {
            const value = Number(e.target.value)
            setLocalSettings(prev => ({ ...prev, [`heating_curve_flow_${rowId}`]: value }))
          }}
          onBlur={(e) => {
            const value = Number(e.target.value)
            if (value !== allSettings?.settings?.[`heating_curve_flow_${rowId}`]) {
              updateSetting(`heating_curve_flow_${rowId}`, value)
            }
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder={defaultHeatingCurve[index]?.flow?.toString() || ""}
          disabled={isSaving}
        />
      </td>
      <td className="border border-gray-300 px-3 py-2 text-center">
        <button
          type="button"
          onClick={() => removeHeatingCurveRow(rowId)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
          disabled={isSaving || heatingCurveRows.length === 1}
          title="Zeile entfernen"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

export default function SystemSettings() {
  const { data: allSettings, isLoading: settingsLoading, refresh: refreshSettings } = useAllSettings()
  const { data: sensorSettings, refresh: refreshSensorSettings } = useSensorSettings()
  const { data: warmwaterSettings, refresh: refreshWarmwaterSettings } = useWarmwaterSettings()
  const { data: systemHealth } = useSystemHealth()
  const { data: systemStats } = useSystemStats()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({})
  const [heatingCurveRows, setHeatingCurveRows] = useState([0, 1, 2, 3, 4, 5, 6, 7]) // Start with 8 rows
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Default heating curve values
  const defaultHeatingCurve = [
    { outdoor: 15, flow: 30 },   // +15°C → 30°C
    { outdoor: 10, flow: 40 },   // +10°C → 40°C
    { outdoor: 5, flow: 48 },    // +5°C → 48°C
    { outdoor: 0, flow: 55 },    // 0°C → 55°C
    { outdoor: -5, flow: 60 },   // -5°C → 60°C
    { outdoor: -10, flow: 65 },  // -10°C → 65°C
    { outdoor: -15, flow: 68 },  // -15°C → 68°C
    { outdoor: -20, flow: 70 },  // -20°C → 70°C
  ]
  
  // Initialize local settings when data loads
  useState(() => {
    if (allSettings?.settings) {
      setLocalSettings(allSettings.settings)
    }
  }, [allSettings])

  // Update local settings when backend data changes
  useEffect(() => {
    if (allSettings?.settings) {
      setLocalSettings(allSettings.settings)
    } else {
      // Load default heating curve values if no settings exist
      const defaultSettings = {}
      heatingCurveRows.forEach((rowId, index) => {
        if (defaultHeatingCurve[index]) {
          defaultSettings[`heating_curve_outdoor_${rowId}`] = defaultHeatingCurve[index].outdoor
          defaultSettings[`heating_curve_flow_${rowId}`] = defaultHeatingCurve[index].flow
        }
      })
      setLocalSettings(defaultSettings)
    }
  }, [allSettings, heatingCurveRows])

  // Update individual setting
  const updateSetting = useCallback(async (key, value) => {
    setIsSaving(true)
    try {
      const response = await backendAPI.updateSetting(key, value)
      if (response.success) {
        toast.success(`${key} erfolgreich aktualisiert`)
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        await refreshSettings()
        await refreshSensorSettings()
        await refreshWarmwaterSettings()
      } else {
        toast.error(`Fehler beim Aktualisieren von ${key}`)
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      toast.error(`Fehler beim Aktualisieren von ${key}`)
    } finally {
      setIsSaving(false)
    }
  }, [refreshSettings, refreshSensorSettings, refreshWarmwaterSettings])

  // Add heating curve row
  const addHeatingCurveRow = useCallback(() => {
    const newRowId = Math.max(...heatingCurveRows, -1) + 1
    setHeatingCurveRows(prev => [...prev, newRowId])
  }, [heatingCurveRows])

  // Remove heating curve row
  const removeHeatingCurveRow = useCallback((rowId) => {
    if (heatingCurveRows.length > 1) {
      setHeatingCurveRows(prev => prev.filter(id => id !== rowId))
      // Clear the data for this row
      setLocalSettings(prev => {
        const newSettings = { ...prev }
        delete newSettings[`heating_curve_outdoor_${rowId}`]
        delete newSettings[`heating_curve_flow_${rowId}`]
        return newSettings
      })
    }
  }, [heatingCurveRows])

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setHeatingCurveRows((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  // Refresh all settings
  const handleRefreshSettings = useCallback(async () => {
    try {
      const response = await backendAPI.refreshSettings()
      if (response.success) {
        toast.success('Einstellungen neu geladen')
        await refreshSettings()
      } else {
        toast.error('Fehler beim Neuladen der Einstellungen')
      }
    } catch (error) {
      console.error('Error refreshing settings:', error)
      toast.error('Fehler beim Neuladen der Einstellungen')
    }
  }, [refreshSettings])

  if (settingsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Lade Systemeinstellungen...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>System - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Systemeinstellungen</h1>
            <p className="text-gray-600 mt-1">Konfiguration und Verwaltung</p>
          </div>
          <button
            onClick={handleRefreshSettings}
            className="btn-secondary"
            disabled={isSaving}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Neu laden
          </button>
        </div>



        {/* Warmwater Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-0 overflow-hidden"
        >
          {/* Warmwater Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Warmwasser-Einstellungen</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">Ausschalttemperaturen für alle Betriebsmodi</p>
          </div>
          
          <div className="p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modus 1 "Normalbetrieb + PV-Strom" (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_switchon || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_switchon: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_switchon) {
                    updateSetting('warmwater_switchon', value)
                  }
                }}
                className="input"
                min="20"
                max="60"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modus 2 "Nur PV-Strom" (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_switchoff || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_switchoff: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_switchoff) {
                    updateSetting('warmwater_switchoff', value)
                  }
                }}
                className="input"
                min="30"
                max="70"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modus 3 "4,5KW Power-Modus" (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_power_mode_switchoff || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_power_mode_switchoff: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_power_mode_switchoff) {
                    updateSetting('warmwater_power_mode_switchoff', value)
                  }
                }}
                className="input"
                min="30"
                max="70"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modus 4 "Gäste-Modus" (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_guest_switchoff || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_guest_switchoff: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_guest_switchoff) {
                    updateSetting('warmwater_guest_switchoff', value)
                  }
                }}
                className="input"
                min="30"
                max="70"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modus 5 "Vollständig EIN" (°C)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_switchoff || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_switchoff: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_switchoff) {
                    updateSetting('warmwater_switchoff', value)
                  }
                }}
                className="input"
                min="30"
                max="70"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leistung Heizstab (Watt)
              </label>
              <input
                type="number"
                value={localSettings.warmwater_heater_power || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, warmwater_heater_power: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.warmwater_heater_power) {
                    updateSetting('warmwater_heater_power', value)
                  }
                }}
                className="input"
                min="100"
                max="1000"
                step="10"
                disabled={isSaving}
              />
            </div>
          </div>
          </div>
        </motion.div>

        {/* Heating Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-0 overflow-hidden"
        >
          {/* Heating Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <FireIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Heizungs-Einstellungen</h2>
            </div>
            <p className="text-green-100 text-sm mt-1">Zeitsteuerung, Sonnenanpassung und individuelle Heizkurve</p>
          </div>
          
          <div className="p-6 space-y-8">

        {/* Heating Time Control */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Heizungs-Zeitsteuerung</h2>
          </div>

          {/* Activation Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.heating_time_control_enabled || false}
                onChange={(e) => {
                  const value = e.target.checked
                  setLocalSettings(prev => ({ ...prev, heating_time_control_enabled: value }))
                  updateSetting('heating_time_control_enabled', value)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSaving}
              />
              <span className="text-sm font-medium text-gray-700">Zeitsteuerung aktivieren</span>
            </label>
          </div>

          {/* Simple Time Settings */}
          <div className="space-y-6">
            {/* Weekdays */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Wochentage (Mo-Fr)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heizung einschalten um
                  </label>
                  <input
                    type="time"
                    value={localSettings.heating_weekday_start || '06:00'}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, heating_weekday_start: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.heating_weekday_start) {
                        updateSetting('heating_weekday_start', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heizung ausschalten um
                  </label>
                  <input
                    type="time"
                    value={localSettings.heating_weekday_end || '22:00'}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, heating_weekday_end: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.heating_weekday_end) {
                        updateSetting('heating_weekday_end', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Weekend */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Wochenende (Sa-So)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heizung einschalten um
                  </label>
                  <input
                    type="time"
                    value={localSettings.heating_weekend_start || '07:00'}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, heating_weekend_start: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.heating_weekend_start) {
                        updateSetting('heating_weekend_start', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heizung ausschalten um
                  </label>
                  <input
                    type="time"
                    value={localSettings.heating_weekend_end || '22:00'}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, heating_weekend_end: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.heating_weekend_end) {
                        updateSetting('heating_weekend_end', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

                         {/* Temperature Reduction */}
             <div className="bg-gray-50 p-4 rounded-lg">
               <h3 className="text-md font-semibold text-gray-900 mb-4">Sonnenschein-Absenkung</h3>
               
               {/* Activation Checkbox */}
               <div className="mb-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={localSettings.sunshine_reduction_enabled || false}
                     onChange={(e) => {
                       const value = e.target.checked
                       setLocalSettings(prev => ({ ...prev, sunshine_reduction_enabled: value }))
                       updateSetting('sunshine_reduction_enabled', value)
                     }}
                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     disabled={isSaving}
                   />
                   <span className="text-sm font-medium text-gray-700">Sonnenschein-Absenkung aktivieren</span>
                 </label>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Temperaturreduzierung bei Sonnenschein
                   </label>
                   <input
                     type="number"
                     value={localSettings.heating_temperature_reduction || ''}
                     onChange={(e) => {
                       const value = Number(e.target.value)
                       setLocalSettings(prev => ({ ...prev, heating_temperature_reduction: value }))
                     }}
                     onBlur={(e) => {
                       const value = Number(e.target.value)
                       if (value !== allSettings?.settings?.heating_temperature_reduction) {
                         updateSetting('heating_temperature_reduction', value)
                       }
                     }}
                     className="input"
                     min="0"
                     max="10"
                     step="0.5"
                     placeholder="z.B. 3"
                     disabled={isSaving}
                   />
                 </div>
                 <div className="text-sm text-gray-600 mt-6">
                   °C
                 </div>
               </div>
             </div>
          </div>

                     {/* Summary */}
           <div className="mt-6 p-4 bg-blue-50 rounded-lg">
             <h4 className="text-sm font-semibold text-blue-900 mb-2">Zusammenfassung:</h4>
             <div className="text-sm text-blue-800 space-y-1">
               <p>• <strong>Wochentage:</strong> Heizung {localSettings.heating_weekday_start || '06:00'} - {localSettings.heating_weekday_end || '22:00'}</p>
               <p>• <strong>Wochenende:</strong> Heizung {localSettings.heating_weekend_start || '07:00'} - {localSettings.heating_weekend_end || '22:00'}</p>
               <p>• <strong>Sonnenschein-Absenkung:</strong> {(localSettings.heating_temperature_reduction || 0)}°C bei Sonnenschein</p>
             </div>
           </div>
        </div>

        {/* Weather-based Control */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Sonnenbasierte Steuerung</h2>
          </div>

          {/* Activation Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.weather_adaptation_enabled || false}
                onChange={(e) => {
                  const value = e.target.checked
                  setLocalSettings(prev => ({ ...prev, weather_adaptation_enabled: value }))
                  updateSetting('weather_adaptation_enabled', value)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSaving}
              />
              <span className="text-sm font-medium text-gray-700">Sonnenanpassung aktivieren</span>
            </label>
          </div>

          {/* Weather Control Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Left Section: Temperature Reduction during Sunshine */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Temperaturreduzierung bei Sonnenschein</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduzierung um (°C):
                  </label>
                  <input
                    type="number"
                    value={localSettings.sunshine_temperature_reduction || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, sunshine_temperature_reduction: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.sunshine_temperature_reduction) {
                        updateSetting('sunshine_temperature_reduction', value)
                      }
                    }}
                    className="input"
                    min="0"
                    max="10"
                    step="0.5"
                    placeholder="3"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ab Sonnenschein (%):
                  </label>
                  <input
                    type="number"
                    value={localSettings.sunshine_threshold || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, sunshine_threshold: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.sunshine_threshold) {
                        updateSetting('sunshine_threshold', value)
                      }
                    }}
                    className="input"
                    min="0"
                    max="100"
                    step="5"
                    placeholder="70"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Heating Curve */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Eigene Heizkurve</h2>
          </div>

          {/* Activation Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.custom_heating_curve_enabled || false}
                onChange={(e) => {
                  const value = e.target.checked
                  setLocalSettings(prev => ({ ...prev, custom_heating_curve_enabled: value }))
                  updateSetting('custom_heating_curve_enabled', value)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSaving}
              />
              <span className="text-sm font-medium text-gray-700">Eigene Heizkurve aktivieren</span>
            </label>
          </div>

          {/* Heating Curve Table */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Heizkurven-Einstellungen</h3>
            
            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Außentemperatur [°C]
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Vorlauftemperatur [°C]
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                        Aktion
                      </th>
                    </tr>
                  </thead>
                  <SortableContext items={heatingCurveRows} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {heatingCurveRows.map((rowId, index) => (
                        <SortableRow
                          key={rowId}
                          rowId={rowId}
                          index={index}
                          localSettings={localSettings}
                          setLocalSettings={setLocalSettings}
                          allSettings={allSettings}
                          updateSetting={updateSetting}
                          isSaving={isSaving}
                          defaultHeatingCurve={defaultHeatingCurve}
                          removeHeatingCurveRow={removeHeatingCurveRow}
                          heatingCurveRows={heatingCurveRows}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>

            {/* Add Row Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={addHeatingCurveRow}
                className="btn-secondary text-sm"
                disabled={isSaving}
              >
                + Weitere Zeile hinzufügen
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Die Heizkurve definiert die Vorlauftemperatur basierend auf der Außentemperatur. 
                Bei niedrigeren Außentemperaturen wird eine höhere Vorlauftemperatur benötigt.
              </p>
            </div>
          </div>
        </div>
          </div>
        </motion.div>

        {/* Billing Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-0 overflow-hidden"
        >
          {/* Billing Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <CurrencyEuroIcon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Abrechnungseinstellungen</h2>
            </div>
            <p className="text-orange-100 text-sm mt-1">Strompreise und Zählerstände für die Kostenberechnung</p>
          </div>
          
          <div className="p-6">

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strompreis (€/kWh)
              </label>
              <input
                type="number"
                value={localSettings.electricity_price || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setLocalSettings(prev => ({ ...prev, electricity_price: value }))
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (value !== allSettings?.settings?.electricity_price) {
                    updateSetting('electricity_price', value)
                  }
                }}
                className="input"
                step="0.01"
                min="0"
                max="1"
                disabled={isSaving}
              />
            </div>
            
            <div className="border-t border-gray-200 my-6"></div>
            
            <div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand Warmwasser
                  </label>
                  <input
                    type="number"
                    value={localSettings.warmwater_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, warmwater_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.warmwater_meter_reading) {
                        updateSetting('warmwater_meter_reading', value)
                      }
                    }}
                    className="input"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum Ablesung Warmwasser
                  </label>
                  <input
                    type="date"
                    value={localSettings.warmwater_meter_date || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, warmwater_meter_date: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.warmwater_meter_date) {
                        updateSetting('warmwater_meter_date', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 my-6"></div>
            
            <div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand HT
                  </label>
                  <input
                    type="number"
                    value={localSettings.ht_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, ht_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.ht_meter_reading) {
                        updateSetting('ht_meter_reading', value)
                      }
                    }}
                    className="input"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zählerstand NT
                  </label>
                  <input
                    type="number"
                    value={localSettings.nt_meter_reading || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setLocalSettings(prev => ({ ...prev, nt_meter_reading: value }))
                    }}
                    onBlur={(e) => {
                      const value = Number(e.target.value)
                      if (value !== allSettings?.settings?.nt_meter_reading) {
                        updateSetting('nt_meter_reading', value)
                      }
                    }}
                    className="input"
                    min="0"
                    step="0.1"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum Ablesung HT/NT
                  </label>
                  <input
                    type="date"
                    value={localSettings.electricity_meter_date || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocalSettings(prev => ({ ...prev, electricity_meter_date: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== allSettings?.settings?.electricity_meter_date) {
                        updateSetting('electricity_meter_date', value)
                      }
                    }}
                    className="input"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </motion.div>



        {/* Save Status */}
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Speichere...</span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}