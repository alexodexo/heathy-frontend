// src/pages/index.js
import Head from 'next/head'
import React from 'react'
import { useCurrentData, useHeatingStatus, useHeatingModes, useSystemHealth, usePlugsData } from '@/hooks/useBackendData'
import DashboardStatusCards from '@/components/dashboard/DashboardStatusCards'
import EnergyMonitoring from '@/components/dashboard/EnergyMonitoring'

export default function Dashboard() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading } = useHeatingModes()
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth()
  const { data: plugsData, isLoading: plugsLoading } = usePlugsData()

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
        <DashboardStatusCards currentData={currentData} currentLoading={currentLoading} />

        {/* Current Power Usage */}
        <EnergyMonitoring 
          currentData={currentData} 
          plugsData={plugsData} 
          currentLoading={currentLoading} 
        />

        {/* Active Mode Display */}

      </div>
    </>
  )
}
