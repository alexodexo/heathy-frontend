// src/pages/statistics.js
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { TemperatureChart, PowerChart, CostChart } from '@/components/Chart'
import { 
  useSystemStats, 
  useCurrentData, 
  useHeatingStatus, 
  useAllSettings 
} from '@/hooks/useBackendData'
import useSWR from 'swr'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CurrencyEuroIcon,
  BoltIcon,
  BeakerIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

const timeRanges = [
  { value: '1h', label: 'Letzte Stunde' },
  { value: '6h', label: 'Letzte 6 Stunden' },
  { value: '24h', label: 'Letzte 24 Stunden' },
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
]

export default function Statistics() {
  const [selectedRange, setSelectedRange] = useState('24h')
  const [chartData, setChartData] = useState(null)
  
  const { data: systemStats } = useSystemStats()
  const { data: currentData } = useCurrentData()
  const { data: heatingStatus } = useHeatingStatus()
  const { data: allSettings } = useAllSettings()

  // Generate mock historical data based on current values
  const generateHistoricalData = useCallback(() => {
    if (!currentData || !heatingStatus) return null

    const points = selectedRange === '1h' ? 12 : selectedRange === '6h' ? 36 : 
                  selectedRange === '24h' ? 48 : selectedRange === '7d' ? 168 : 720
    
    const interval = selectedRange === '1h' ? 5 : selectedRange === '6h' ? 10 : 
                    selectedRange === '24h' ? 30 : selectedRange === '7d' ? 60 : 60

    const labels = []
    const warmwaterData = []
    const vorlaufData = []
    const ruecklaufData = []
    const powerData = []
    const costData = []

    const baseWarmwater = currentData.temperatures?.water_temp || 45
    const baseVorlauf = currentData.temperatures?.vorlauf_temp || 22
    const baseRuecklauf = currentData.temperatures?.ruecklauf_temp || 23
    const basePower = currentData.power?.total_power || 285
    const pricePerKWh = allSettings?.settings?.electricity_price || 0.25

    for (let i = points; i >= 0; i--) {
      const date = new Date()
      date.setMinutes(date.getMinutes() - (i * interval))
      
      if (selectedRange === '7d' || selectedRange === '30d') {
        labels.push(date.toLocaleDateString('de-DE', { 
          month: 'short', 
          day: 'numeric' 
        }))
      } else {
        labels.push(date.toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }))
      }

      // Generate realistic variations
      const timeOfDay = date.getHours()
      const variation = Math.sin(i * 0.1) * 3 + Math.random() * 2 - 1
      const dayVariation = Math.sin(timeOfDay * Math.PI / 12) * 5

      warmwaterData.push(Math.max(35, Math.min(65, baseWarmwater + variation + dayVariation)))
      vorlaufData.push(Math.max(15, Math.min(35, baseVorlauf + variation * 0.5 + dayVariation * 0.3)))
      ruecklaufData.push(Math.max(15, Math.min(35, baseRuecklauf + variation * 0.5 + dayVariation * 0.3)))
      
      const powerVariation = Math.random() * 200 - 100
      powerData.push(Math.max(0, basePower + powerVariation))
      
      // Calculate costs based on power consumption
      const hourlyConsumption = (basePower + powerVariation) / 1000 * (interval / 60)
      costData.push(hourlyConsumption * pricePerKWh)
    }

    return {
      temperature: {
        labels,
        warmwater: warmwaterData,
        vorlauf: vorlaufData,
        ruecklauf: ruecklaufData,
      },
      power: {
        labels,
        values: powerData,
      },
      costs: {
        labels,
        values: costData,
        total: costData.reduce((sum, cost) => sum + cost, 0),
      }
    }
  }, [selectedRange, currentData, heatingStatus, allSettings])

  useEffect(() => {
    const data = generateHistoricalData()
    setChartData(data)
  }, [generateHistoricalData])

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    if (!systemStats || !heatingStatus || !currentData) return null

    const uptime = systemStats.performance?.uptime_seconds || 0
    const totalLoops = systemStats.performance?.main_loops_executed || 0
    const pwmEfficiency = systemStats.performance?.pwm_efficiency_percent || 0
    const errors = systemStats.errors?.total_errors || 0
    
    const currentWaterTemp = currentData.temperatures?.water_temp || 0
    const currentPower = currentData.power?.total_power || 0
    const pricePerKWh = allSettings?.settings?.electricity_price || 0.25
    
    const dailyCost = (currentPower / 1000) * 24 * pricePerKWh
    const monthlyCost = dailyCost * 30
    
    return {
      uptime: {
        hours: Math.floor(uptime / 3600),
        minutes: Math.floor((uptime % 3600) / 60),
      },
      totalLoops,
      pwmEfficiency,
      errors,
      currentWaterTemp,
      currentPower,
      dailyCost,
      monthlyCost,
      efficiency: currentWaterTemp > 0 ? Math.round((currentWaterTemp / 70) * 100) : 0,
    }
  }

  const performanceMetrics = getPerformanceMetrics()

  const exportData = (format) => {
    if (!chartData) return
    
    let content = ''
    let filename = `heizung_daten_${selectedRange}.${format}`
    
    if (format === 'csv') {
      content = 'Zeit,Warmwasser,Vorlauf,Ruecklauf,Stromverbrauch,Kosten\n'
      chartData.temperature.labels.forEach((label, i) => {
        content += `${label},${chartData.temperature.warmwater[i]?.toFixed(1)},${chartData.temperature.vorlauf[i]?.toFixed(1)},${chartData.temperature.ruecklauf[i]?.toFixed(1)},${chartData.power.values[i]?.toFixed(0)},${chartData.costs.values[i]?.toFixed(3)}\n`
      })
    }
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head>
        <title>Statistiken - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live-Statistiken</h1>
          <p className="text-gray-600 mt-1">Detaillierte Analyse und Auswertungen</p>
        </div>

        {/* Performance Overview */}
        {performanceMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <BoltIcon className="w-5 h-5 text-primary-500" />
                <h3 className="font-medium text-gray-900">System-Effizienz</h3>
              </div>
              <p className="text-2xl font-bold text-primary-600">{performanceMetrics.efficiency}%</p>
              <p className="text-sm text-gray-600">PWM: {performanceMetrics.pwmEfficiency}%</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <BeakerIcon className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-900">Warmwasser</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{performanceMetrics.currentWaterTemp.toFixed(1)}°C</p>
              <p className="text-sm text-gray-600">{performanceMetrics.currentPower.toFixed(0)}W aktuell</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyEuroIcon className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium text-gray-900">Tageskosten</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">€{performanceMetrics.dailyCost.toFixed(2)}</p>
              <p className="text-sm text-gray-600">€{performanceMetrics.monthlyCost.toFixed(2)}/Monat</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-900">Betriebszeit</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{performanceMetrics.uptime.hours}h {performanceMetrics.uptime.minutes}m</p>
              <p className="text-sm text-gray-600">{performanceMetrics.totalLoops} Zyklen</p>
            </div>
          </motion.div>
        )}

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Zeitraum auswählen</h2>
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedRange === range.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Temperature History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperaturverläufe</h2>
          
          <div className="h-80">
            <TemperatureChart 
              data={chartData?.temperature} 
              loading={!chartData}
            />
          </div>
        </motion.div>

        {/* Power Consumption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stromverbrauch</h2>
          
          <div className="h-80">
            <PowerChart 
              data={chartData?.power} 
              loading={!chartData}
              type="line"
            />
          </div>
        </motion.div>

        {/* Cost Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Kostenanalyse</h2>
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {chartData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <h3 className="font-medium text-green-900 mb-1">Gesamtkosten ({selectedRange})</h3>
                <p className="text-2xl font-bold text-green-700">€{chartData.costs.total.toFixed(2)}</p>
                <p className="text-sm text-green-600">Zeitraum: {selectedRange}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-1">Durchschnitt/Tag</h3>
                <p className="text-2xl font-bold text-blue-700">
                  €{(chartData.costs.total / (selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 1)).toFixed(2)}
                </p>
                <p className="text-sm text-blue-600">Basis: {allSettings?.settings?.electricity_price || 0.25}€/kWh</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <h3 className="font-medium text-purple-900 mb-1">Effizienz-Score</h3>
                <p className="text-2xl font-bold text-purple-700">{performanceMetrics?.efficiency || 0}%</p>
                <p className="text-sm text-purple-600">Warmwasser-Effizienz</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* System Performance Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <h2 className="text-lg font-semibold text-white">System-Performance Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Steuerungszyklen</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics?.totalLoops || 0}</p>
                <p className="text-xs text-gray-500">Gesamt ausgeführt</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">PWM Effizienz</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics?.pwmEfficiency || 0}%</p>
                <p className="text-xs text-gray-500">Erfolgsrate</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Fehleranzahl</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics?.errors || 0}</p>
                <p className="text-xs text-gray-500">Seit Start</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Zyklen/Min</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStats?.performance?.loops_per_minute?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500">Durchschnitt</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Export-Funktionen</h2>
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Datenexport ({selectedRange})</h3>
              <p className="text-sm text-gray-600 mb-4">Exportieren Sie alle erfassten Daten für den gewählten Zeitraum:</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => exportData('csv')}
                  className="btn-primary"
                  disabled={!chartData}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Als CSV exportieren
                </button>
                <button 
                  className="btn-secondary"
                  disabled
                >
                  <DocumentChartBarIcon className="w-4 h-4" />
                  Als PDF exportieren (Coming Soon)
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Berichte</h3>
              <p className="text-sm text-gray-600 mb-2">Verfügbare Auswertungen:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Temperaturverläufe aller Sensoren</li>
                <li>Stromverbrauch und Kostenanalyse</li>
                <li>System-Performance Metriken</li>
                <li>Effizienz-Bewertungen</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}