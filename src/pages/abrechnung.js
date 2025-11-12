// src/pages/abrechnung.js
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useEinstellungen, useAblesungen } from '@/hooks/useBackendData'
import { CurrencyEuroIcon, BoltIcon, CalendarIcon, PlusIcon, FireIcon, BeakerIcon } from '@heroicons/react/24/outline'

export default function Abrechnung() {
  const { data: einstellungen, isLoading: einstellungenLoading, refresh: refreshEinstellungen } = useEinstellungen()
  const { data: ablesungen, isLoading: ableaungenLoading, refresh: refreshAblesungen } = useAblesungen()
  
  const [isSaving, setIsSaving] = useState(false)
  const [localStrompreis, setLocalStrompreis] = useState(0.25)
  
  // Formular für neue Ablesung
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAblesung, setNewAblesung] = useState({
    ablesedatum: new Date().toISOString().split('T')[0],
    ht_zaehlerstand_kwh: '',
    nt_zaehlerstand_kwh: '',
    warmwasser_zaehlerstand_kwh: '',
    heizung_zaehlerstand_kwh: '',
    notizen: '',
  })

  // Strompreis aktualisieren, wenn einstellungen geladen werden
  useEffect(() => {
    if (einstellungen?.strompreis?.value) {
      setLocalStrompreis(einstellungen.strompreis.value)
    }
  }, [einstellungen])

  // Strompreis aktualisieren
  const updateStrompreis = useCallback(async (value) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/einstellungen/strompreis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          value, 
          description: 'Strompreis in Euro pro Kilowattstunde' 
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        toast.success('Strompreis erfolgreich aktualisiert')
        await refreshEinstellungen()
      } else {
        toast.error('Fehler beim Aktualisieren des Strompreises')
      }
    } catch (error) {
      console.error('Error updating strompreis:', error)
      toast.error('Fehler beim Aktualisieren des Strompreises')
    } finally {
      setIsSaving(false)
    }
  }, [refreshEinstellungen])

  // Neue Ablesung hinzufügen
  const addAblesung = useCallback(async () => {
    if (!newAblesung.ablesedatum) {
      toast.error('Bitte gib ein Ablesedatum an')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/ablesungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ablesedatum: newAblesung.ablesedatum,
          ht_zaehlerstand_kwh: parseFloat(newAblesung.ht_zaehlerstand_kwh) || 0,
          nt_zaehlerstand_kwh: parseFloat(newAblesung.nt_zaehlerstand_kwh) || 0,
          warmwasser_zaehlerstand_kwh: parseFloat(newAblesung.warmwasser_zaehlerstand_kwh) || 0,
          heizung_zaehlerstand_kwh: parseFloat(newAblesung.heizung_zaehlerstand_kwh) || 0,
          notizen: newAblesung.notizen || null,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        toast.success('Ablesung erfolgreich gespeichert')
        setShowAddForm(false)
        setNewAblesung({
          ablesedatum: new Date().toISOString().split('T')[0],
          ht_zaehlerstand_kwh: '',
          nt_zaehlerstand_kwh: '',
          warmwasser_zaehlerstand_kwh: '',
          heizung_zaehlerstand_kwh: '',
          notizen: '',
        })
        await refreshAblesungen()
      } else {
        toast.error('Fehler beim Speichern der Ablesung')
      }
    } catch (error) {
      console.error('Error adding ablesung:', error)
      toast.error('Fehler beim Speichern der Ablesung')
    } finally {
      setIsSaving(false)
    }
  }, [newAblesung, refreshAblesungen])

  if (einstellungenLoading || ableaungenLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-4">Lade Abrechnungsdaten...</p>
        </div>
      </div>
    )
  }

  // Aktuellste Ablesung für Anzeige
  const latestAblesung = ablesungen?.[0] || null

  return (
    <>
      <Head>
        <title>Abrechnung - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Abrechnung</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 md:mt-2">Strompreise und Zählerstände verwalten</p>
        </div>

        {/* Strompreis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-0 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <CurrencyEuroIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Strompreis</h2>
                <p className="text-green-100 text-sm mt-0.5">Aktueller Preis pro Kilowattstunde</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Strompreis (€/kWh)
              </label>
              <input
                type="number"
                value={localStrompreis}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setLocalStrompreis(value)
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value)
                  if (value !== einstellungen?.strompreis?.value) {
                    updateStrompreis(value)
                  }
                }}
                className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                step="0.01"
                min="0"
                placeholder="0.25"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Aktueller Strompreis für die Kostenberechnung
              </p>
            </div>
          </div>
        </motion.div>

        {/* Neue Ablesung hinzufügen Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            {showAddForm ? 'Abbrechen' : 'Neue Ablesung hinzufügen'}
          </button>
        </motion.div>

        {/* Formular für neue Ablesung */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-0 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <PlusIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Neue Ablesung</h2>
                  <p className="text-purple-100 text-sm mt-0.5">Zählerstände zum aktuellen Datum erfassen</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heizung Zählerstände */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FireIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">Haus (HT/NT)</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        HT-Zählerstand (kWh)
                      </label>
                      <input
                        type="number"
                        value={newAblesung.ht_zaehlerstand_kwh}
                        onChange={(e) => setNewAblesung(prev => ({ ...prev, ht_zaehlerstand_kwh: e.target.value }))}
                        className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NT-Zählerstand (kWh)
                      </label>
                      <input
                        type="number"
                        value={newAblesung.nt_zaehlerstand_kwh}
                        onChange={(e) => setNewAblesung(prev => ({ ...prev, nt_zaehlerstand_kwh: e.target.value }))}
                        className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Warmwasser und Heizung */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <BeakerIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Warmwasser & Heizung</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Warmwasser Zählerstand (kWh)
                      </label>
                      <input
                        type="number"
                        value={newAblesung.warmwasser_zaehlerstand_kwh}
                        onChange={(e) => setNewAblesung(prev => ({ ...prev, warmwasser_zaehlerstand_kwh: e.target.value }))}
                        className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Heizung Zählerstand (kWh)
                      </label>
                      <input
                        type="number"
                        value={newAblesung.heizung_zaehlerstand_kwh}
                        onChange={(e) => setNewAblesung(prev => ({ ...prev, heizung_zaehlerstand_kwh: e.target.value }))}
                        className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datum und Notizen */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ablesedatum
                  </label>
                  <input
                    type="date"
                    value={newAblesung.ablesedatum}
                    onChange={(e) => setNewAblesung(prev => ({ ...prev, ablesedatum: e.target.value }))}
                    className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notizen (optional)
                  </label>
                  <input
                    type="text"
                    value={newAblesung.notizen}
                    onChange={(e) => setNewAblesung(prev => ({ ...prev, notizen: e.target.value }))}
                    placeholder="z.B. Jahresablesung 2024"
                    className="w-full px-4 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Speichern Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={addAblesung}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Speichern...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      <span>Ablesung speichern</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ablesungen Historie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-0 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ablesungen Historie</h2>
                <p className="text-indigo-100 text-sm mt-0.5">Alle erfassten Zählerstände im Überblick</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
            {ablesungen.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Noch keine Ablesungen vorhanden</p>
                <p className="text-sm text-gray-400 mt-2">Füge deine erste Ablesung hinzu!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ablesungen.map((ablesung, index) => (
                  <motion.div
                    key={ablesung.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Datum */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <CalendarIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {new Date(ablesung.ablesedatum).toLocaleDateString('de-DE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {ablesung.notizen && (
                            <p className="text-sm text-gray-500">{ablesung.notizen}</p>
                          )}
                        </div>
                      </div>

                      {/* Zählerstände */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">HT</p>
                          <p className="font-semibold text-gray-900">
                            {ablesung.ht_zaehlerstand_kwh?.toFixed(1) || '0.0'} kWh
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">NT</p>
                          <p className="font-semibold text-gray-900">
                            {ablesung.nt_zaehlerstand_kwh?.toFixed(1) || '0.0'} kWh
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Warmwasser</p>
                          <p className="font-semibold text-gray-900">
                            {ablesung.warmwasser_zaehlerstand_kwh?.toFixed(1) || '0.0'} kWh
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Heizung</p>
                          <p className="font-semibold text-gray-900">
                            {ablesung.heizung_zaehlerstand_kwh?.toFixed(1) || '0.0'} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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

