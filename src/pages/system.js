// src/pages/system.js
import { useState, useCallback, useEffect, useMemo } from 'react'
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
  useParameterSettings,
} from '@/hooks/useBackendData'
import { backendAPI } from '@/lib/api'
import {
  CurrencyEuroIcon,
  ArrowPathIcon,
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
          <span className="text-gray-700 font-medium">≤</span>
          <input
            type="number"
            step="0.1"
            value={
              typeof localSettings[`heating_curve_outdoor_${rowId}`] === 'string' 
                ? localSettings[`heating_curve_outdoor_${rowId}`].replace('<=', '') 
                : (localSettings[`heating_curve_outdoor_${rowId}`] !== undefined 
                    ? localSettings[`heating_curve_outdoor_${rowId}`] 
                    : (defaultHeatingCurve[index]?.outdoor ?? ''))
            }
            onChange={(e) => {
              const value = `<=${e.target.value}`
              setLocalSettings(prev => ({ ...prev, [`heating_curve_outdoor_${rowId}`]: value }))
            }}
            onBlur={(e) => {
              const value = `<=${e.target.value}`
              const currentSetting = allSettings?.settings?.[`heating_curve_outdoor_${rowId}`]
              if (value !== currentSetting) {
                updateSetting(`heating_curve_outdoor_${rowId}`, value)
              }
            }}
            className="input text-gray-900"
            placeholder={defaultHeatingCurve[index]?.outdoor?.toString() || ""}
            disabled={isSaving}
          />
        </div>
      </td>
      <td className="border border-gray-300 px-3 py-2">
        <input
          type="number"
          step="0.1"
          value={localSettings[`heating_curve_flow_${rowId}`] !== undefined ? localSettings[`heating_curve_flow_${rowId}`] : (defaultHeatingCurve[index]?.flow ?? '')}
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
          className="input text-gray-900"
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
  const { data: parameterSettings, isLoading: parameterLoading, refresh: refreshParameterSettings } = useParameterSettings()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({})
  const [localParameterSettings, setLocalParameterSettings] = useState({})
  const [heatingCurveRows, setHeatingCurveRows] = useState([0, 1, 2, 3, 4, 5, 6, 7]) // Start with 8 rows
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Default heating curve values - using useMemo to prevent re-render loops
  const defaultHeatingCurve = useMemo(() => [
    { outdoor: 15, flow: 30 },   // +15°C → 30°C
    { outdoor: 10, flow: 40 },   // +10°C → 40°C
    { outdoor: 5, flow: 48 },    // +5°C → 48°C
    { outdoor: 0, flow: 55 },    // 0°C → 55°C
    { outdoor: -5, flow: 60 },   // -5°C → 60°C
    { outdoor: -10, flow: 65 },  // -10°C → 65°C
    { outdoor: -15, flow: 68 },  // -15°C → 68°C
    { outdoor: -20, flow: 70 },  // -20°C → 70°C
  ], [])
  
  // Initialize local settings when data loads (handled by useEffect below)

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
  }, [allSettings]) // Remove heatingCurveRows dependency to prevent re-render loops

  // Update local parameter settings when data changes
  useEffect(() => {
    if (parameterSettings) {
      const localParams = {}
      Object.keys(parameterSettings).forEach(key => {
        localParams[key] = parameterSettings[key].value
      })
      setLocalParameterSettings(localParams)
    }
  }, [parameterSettings])

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

  // Update parameter setting (for warmwater settings from database)
  const updateParameterSetting = useCallback(async (key, value) => {
    setIsSaving(true)
    try {
      const response = await backendAPI.updateParameterSetting(key, value)
      if (response.success) {
        toast.success(`Einstellung erfolgreich aktualisiert`)
        // Update local state optimistically
        setLocalParameterSettings(prev => ({ ...prev, [key]: value }))
        await refreshParameterSettings()
      } else {
        toast.error(`Fehler beim Aktualisieren der Einstellung`)
      }
    } catch (error) {
      console.error(`Error updating parameter setting ${key}:`, error)
      toast.error(`Fehler beim Aktualisieren der Einstellung`)
    } finally {
      setIsSaving(false)
    }
  }, [refreshParameterSettings])

  // Add heating curve row
  const addHeatingCurveRow = useCallback(() => {
    const newRowId = Math.max(...heatingCurveRows, -1) + 1
    setHeatingCurveRows(prev => [...prev, newRowId])
    
    // Set default values for the new row with operators
    setLocalSettings(prev => ({
      ...prev,
      [`heating_curve_outdoor_${newRowId}`]: `<=-25`,  // Default: -25°C
      [`heating_curve_flow_${newRowId}`]: 75  // Default: 75°C Vorlauf
    }))
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

  if (settingsLoading || parameterLoading) {
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

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">
        {/* LiveStatus entfernt gemäss Wunsch */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Systemeinstellungen</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">Konfiguration und Verwaltung</p>
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

        {/* Systemstatus-Bereich entfernt */}



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

          <div className="space-y-6">
            {/* Modus 1 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Modus 4 "Normalbetrieb + PV-Strom"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                  <input
                    type="number"
                    value={localParameterSettings.mode_4_switchon ?? 44}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_4_switchon: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.mode_4_switchon?.value) {
                        updateParameterSetting('mode_4_switchon', value)
                      }
                    }}
                    className="input text-gray-900"
                    min="20"
                    max="70"
                    step="0.1"
                    placeholder="44"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                  <input
                    type="number"
                    value={localParameterSettings.mode_4_switchoff ?? 45}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_4_switchoff: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.mode_4_switchoff?.value) {
                        updateParameterSetting('mode_4_switchoff', value)
                      }
                    }}
                    className="input text-gray-900"
                    min="20"
                    max="80"
                    placeholder="45"
                    step="0.1"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
              </div>
            </div>

            {/* Modus 2 + Modus 3 in einer Zeile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Modus 3 "Nur PV-Strom"</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                    <input
                      type="number"
                      value={localParameterSettings.mode_3_switchoff ?? 66}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_3_switchoff: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_3_switchoff?.value) {
                          updateParameterSetting('mode_3_switchoff', value)
                        }
                      }}
                      className="input text-gray-900"
                      min="20"
                      max="80"
                      placeholder="66"
                      step="0.1"
                      disabled={isSaving || parameterLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Modus 6 "Power-Modus 4.5kW"</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                    <input
                      type="number"
                      value={localParameterSettings.mode_6_switchoff ?? 45}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setLocalParameterSettings(prev => ({ ...prev, mode_6_switchoff: value }))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value !== parameterSettings?.mode_6_switchoff?.value) {
                          updateParameterSetting('mode_6_switchoff', value)
                        }
                      }}
                      className="input text-gray-900"
                      min="20"
                      max="80"
                      placeholder="45"
                      step="0.1"
                      disabled={isSaving || parameterLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modus 4 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Modus 5 "Gäste-Modus"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Einschalten ≤ °C</label>
                  <input
                    type="number"
                    value={localParameterSettings.mode_5_switchon ?? 44}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_5_switchon: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.mode_5_switchon?.value) {
                        updateParameterSetting('mode_5_switchon', value)
                      }
                    }}
                    className="input text-gray-900"
                    min="20"
                    max="80"
                    step="0.1"
                    placeholder="44"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                  <input
                    type="number"
                    value={localParameterSettings.mode_5_switchoff ?? 50}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, mode_5_switchoff: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.mode_5_switchoff?.value) {
                        updateParameterSetting('mode_5_switchoff', value)
                      }
                    }}
                    className="input text-gray-900"
                    min="20"
                    max="80"
                    step="0.1"
                    placeholder="50"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
              </div>
            </div>

            {/* Modus 5 + Leistung Heizstab in separaten Boxen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Modus 5: Vollständig EIN */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Modus 1 „Vollständig EIN"</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ausschalten ≥ °C</label>
                  <input
                    type="number"
                    value={localParameterSettings.mode_1_switchoff ?? 55}
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
                    className="input text-gray-900"
                    min="20"
                    max="80"
                    step="0.1"
                    placeholder="55"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
              </div>

              {/* Leistung Heizstab */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Leistung Heizstab</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leistung Heizstab (Watt)</label>
                  <input
                    type="number"
                    value={localParameterSettings.power_heathing_rod ?? 380}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      setLocalParameterSettings(prev => ({ ...prev, power_heathing_rod: value }))
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value)
                      if (value !== parameterSettings?.power_heathing_rod?.value) {
                        updateParameterSetting('power_heathing_rod', value)
                      }
                    }}
                    className="input text-gray-900"
                    min="100"
                    max="2000"
                    step="10"
                    placeholder="380"
                    disabled={isSaving || parameterLoading}
                  />
                </div>
              </div>
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Heizungs-Zeitsteuerung</h2>
          </div>


          {/* Simple Time Settings */}
          <div className="space-y-6">
            {/* Weekdays */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Wochentage (Mo-Fr)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Weekend */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Wochenende (Sa-So)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Sonnenschein-Absenkung entfernt (Duplikat) */}
          </div>

                      {/* Summary */}
           <div className="mt-6 p-4 bg-green-50 rounded-lg">
             <h4 className="text-sm font-semibold text-green-900 mb-2">Zusammenfassung:</h4>
             <div className="text-sm text-green-800 space-y-1">
               <p>• <strong>Wochentage:</strong> Heizung {localSettings.heating_weekday_start || '06:00'} - {localSettings.heating_weekday_end || '22:00'}</p>
               <p>• <strong>Wochenende:</strong> Heizung {localSettings.heating_weekend_start || '07:00'} - {localSettings.heating_weekend_end || '22:00'}</p>
               <p>• <strong>Sonnenschein-Absenkung:</strong> {(localSettings.sunshine_temperature_reduction || 0)}°C bei Sonnenschein</p>
             </div>
           </div>
        </div>

        {/* Weather-based Control */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Sonnenbasierte Steuerung</h2>
          </div>


          {/* Weather Control Settings */}
          <div className="grid grid-cols-1 gap-6">
            {/* Left Section: Temperature Reduction during Sunshine */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Temperaturreduzierung bei Sonnenschein</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduzierung um °C:
                  </label>
                  <input
                    type="number"
                    value={localSettings.sunshine_temperature_reduction ?? 3}
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
                    className="input text-gray-900"
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
                    value={localSettings.sunshine_threshold ?? 70}
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
                    className="input text-gray-900"
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold">Eigene Heizkurve</h2>
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
                        Außentemperatur °C
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Vorlauftemperatur °C
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
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
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
                className="input text-gray-900"
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
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
                    className="input text-gray-900"
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