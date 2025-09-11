// src/pages/index.js
import Head from 'next/head'
import React from 'react'
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import { useCurrentData, useHeatingStatus, useHeatingModes, useSystemHealth, usePlugsData } from '@/hooks/useBackendData'
import {
  BeakerIcon,
  FireIcon,
  SunIcon,
  BoltIcon,
  CurrencyEuroIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading } = useHeatingModes()
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth()
  const { data: plugsData, isLoading: plugsLoading } = usePlugsData()

  // Calculate daily costs based on current power and electricity price
  const calculateDailyCost = () => {
    if (!currentData?.power?.total_power || !heatingStatus) return '0.00'
    const kWh = (currentData.power.total_power / 1000) * 24 // Rough daily estimate
    const cost = kWh * (heatingStatus.electricity_price || 0.25)
    return cost.toFixed(2)
  }

  // Get current active mode info
  const getActiveModeInfo = () => {
    if (!heatingModes?.modes || !heatingModes?.active_mode) return null
    return heatingModes.modes[heatingModes.active_mode]
  }

  const activeModeInfo = getActiveModeInfo()

  // Status data for overview table
  const statusItems = [
    {
      category: 'Warmwasser-Betrieb',
      items: [
        {
          name: 'Aktueller Modus',
          status: activeModeInfo?.active_heating ? 'active' : 'inactive',
          function: activeModeInfo?.name || 'Unbekannt',
          details: activeModeInfo?.description || 'Keine Details verfügbar',
        },
        {
          name: 'Warmwasser Temperatur',
          status: currentData?.temperatures?.water_temp > 50 ? 'active' : 'warning',
          function: `${currentData?.temperatures?.water_temp || '--'}°C`,
          details: `Zieltemperatur: ${activeModeInfo?.target_temp || '--'}°C`,
        },
        {
          name: 'PWM Steuerung',
          status: heatingStatus?.pwm_status?.status === 'healthy' ? 'active' : 'warning',
          function: `PWM: ${heatingStatus?.last_sent_pwm || 0}/255`,
          details: `Server: ${heatingStatus?.pwm_status?.server_reachable ? 'Erreichbar' : 'Nicht erreichbar'}`,
        },
      ],
    },
    {
      category: 'System-Status',
      items: [
        {
          name: 'System',
          status: systemHealth?.status === 'healthy' ? 'active' : 'warning',
          function: `Uptime: ${Math.floor((systemHealth?.uptime_seconds || 0) / 3600)}h ${Math.floor(((systemHealth?.uptime_seconds || 0) % 3600) / 60)}m`,
          details: `${systemHealth?.main_loops_executed || 0} Zyklen ausgeführt`,
        },
        {
          name: 'Datenquellen',
          status: heatingStatus?.data_status?.overall_status === 'healthy' ? 'active' : 'warning',
          function: 'Temperatur & Stromverbrauch',
          details: `Temp: ${Math.abs(Math.round(currentData?.data_age?.temp_data_age_minutes || 0))}min alt, EM3: ${Math.abs(Math.round(currentData?.data_age?.em3_data_age_minutes || 0))}min alt`,
        },
        {
          name: 'Fehlerrate',
          status: (systemHealth?.errors_total || 0) === 0 ? 'active' : 'warning',
          function: `${systemHealth?.errors_total || 0} Fehler insgesamt`,
          details: systemHealth?.last_error || 'Keine Fehler',
        },
      ],
    },
  ]

  return (
    <>
      <Head>
        <title>Dashboard - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Live Dashboard</h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2">Echtzeit-Übersicht aller Systeme</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <StatusCard
            title="Warmwasser"
            value={currentData?.temperatures?.water_temp?.toFixed(1) || '--'}
            unit="°C"
            secondaryValue={currentData?.warmwater?.target_temp?.toFixed(1) || '--'}
            secondaryUnit="°C"
            secondaryTitle="Ziel-Temperatur"
            tertiaryValue={currentData?.warmwater?.power_w?.toFixed(0) || '--'}
            tertiaryUnit="W"
            tertiaryTitle="aktuelle Heizleistung"
            quaternaryValue={currentData?.costs?.warmwater_week?.toFixed(2) || '--'}
            quaternaryUnit="€"
            quaternaryTitle="Warmwasserkosten rolling 7 days"
            quinternaryValue={currentData?.recirc_pump_no2 ? 'ein' : 'aus'}
            quinternaryTitle="Pumpe"
            icon={BeakerIcon}
            color="primary"
            loading={currentLoading}
          />
          <StatusCard
            title="Vorlauf Heizung"
            value={currentData?.temperatures?.vorlauf_temp?.toFixed(1) || '--'}
            unit="°C"
            secondaryValue={
              currentData?.temperatures?.vorlauf_temp && currentData?.temperatures?.ruecklauf_temp
                ? (currentData.temperatures.vorlauf_temp - currentData.temperatures.ruecklauf_temp).toFixed(1)
                : '--'
            }
            secondaryUnit="°C"
            secondaryTitle="Temperaturdifferenz"
            tertiaryValue={currentData?.heating?.power_kw?.toFixed(1) || '--'}
            tertiaryUnit="kW"
            tertiaryTitle="aktuelle Heizleistung"
            quaternaryValue={currentData?.costs?.heating_week?.toFixed(2) || '--'}
            quaternaryUnit="€"
            quaternaryTitle="Heizungskosten rolling 7 days"
            quinternaryValue={currentData?.circulator_no1 ? 'ein' : 'aus'}
            quinternaryTitle="Pumpe"
            icon={FireIcon}
            color="warning"
            loading={currentLoading}
          />
          <StatusCard
            title="Außentemperatur"
            value={currentData?.temperatures?.outdoor_temp?.toFixed(1) || '--'}
            unit="°C"
            secondaryValue={currentData?.weather?.forecast_temp?.toFixed(1) || '--'}
            secondaryUnit="°C"
            secondaryTitle="Prognose heute"
            tertiaryValue={currentData?.weather?.sunshine_hours?.toFixed(1) || '--'}
            tertiaryUnit="h"
            tertiaryTitle="Sonnenstunden heute"
            icon={() => (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
                <path d="M12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                <path d="M16 8h2"/>
                <path d="M16 12h2"/>
              </svg>
            )}
            color="primary"
            loading={currentLoading}
          />
          <StatusCard
            title="Tageskosten"
            value={`€${calculateDailyCost()}`}
            unit=""
            secondaryValue={currentData?.costs?.warmwater_today?.toFixed(2) || '--'}
            secondaryUnit="€"
            secondaryTitle="Warmwasser"
            tertiaryValue={currentData?.costs?.heating_today?.toFixed(2) || '--'}
            tertiaryUnit="€"
            tertiaryTitle="Heizung"
            icon={CurrencyEuroIcon}
            color="error"
            loading={currentLoading || statusLoading}
          />
        </div>

        {/* Current Power Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Energie-Monitoring</h2>
            <BoltIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {currentLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
                <p className="text-sm text-primary-600 mb-1">Gesamt</p>
                <p className="text-2xl font-bold text-primary-700">
                  {currentData?.power?.total_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">PV-Einspeisung</p>
                <p className="text-xl font-semibold text-gray-700">
                  {plugsData?.apower?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Heizung</p>
                <p className="text-xl font-semibold text-gray-700">
                  {currentData?.power?.b_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Warmwasser</p>
                <p className="text-xl font-semibold text-gray-700">
                  {currentData?.power?.c_power?.toFixed(0) || 0} W
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Mode Display */}

      </div>
    </>
  )
}