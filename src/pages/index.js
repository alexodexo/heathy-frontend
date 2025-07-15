// src/pages/index.js
import Head from 'next/head'
import React from 'react'
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import { useCurrentData, useHeatingStatus, useHeatingModes, useSystemHealth } from '@/hooks/useBackendData'
import {
  BeakerIcon,
  FireIcon,
  SunIcon,
  BoltIcon,
  CurrencyEuroIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: currentData, isLoading: currentLoading } = useCurrentData()
  const { data: heatingStatus, isLoading: statusLoading } = useHeatingStatus()
  const { data: heatingModes, isLoading: modesLoading } = useHeatingModes()
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth()

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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
          <p className="text-gray-600 mt-1">Echtzeit-Übersicht aller Systeme</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatusCard
            title="Warmwasser"
            value={currentData?.temperatures?.water_temp?.toFixed(1) || '--'}
            unit="°C"
            icon={BeakerIcon}
            color="primary"
            loading={currentLoading}
          />
          <StatusCard
            title="Vorlauf Heizung"
            value={currentData?.temperatures?.vorlauf_temp?.toFixed(1) || '--'}
            unit="°C"
            icon={FireIcon}
            color="warning"
            loading={currentLoading}
          />
          <StatusCard
            title="Aktueller Modus"
            value={heatingModes?.active_mode || '--'}
            unit=""
            icon={SunIcon}
            color={activeModeInfo?.active_heating ? 'success' : 'error'}
            loading={modesLoading}
          />
          <StatusCard
            title="System Status"
            value={systemHealth?.status === 'healthy' ? '✓' : '⚠️'}
            unit=""
            icon={CheckCircleIcon}
            color={systemHealth?.status === 'healthy' ? 'success' : 'warning'}
            loading={healthLoading}
          />
          <StatusCard
            title="Heutige Kosten"
            value={`€${calculateDailyCost()}`}
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
            <h2 className="text-lg font-semibold text-gray-900">Aktueller Stromverbrauch</h2>
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
                <p className="text-sm text-gray-600 mb-1">Phase A</p>
                <p className="text-xl font-semibold text-gray-700">
                  {currentData?.power?.a_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Phase B</p>
                <p className="text-xl font-semibold text-gray-700">
                  {currentData?.power?.b_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Phase C</p>
                <p className="text-xl font-semibold text-gray-700">
                  {currentData?.power?.c_power?.toFixed(0) || 0} W
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Mode Display */}
        {activeModeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Aktiver Betriebsmodus</h2>
              <span className={`status-dot ${activeModeInfo.active_heating ? 'status-active' : 'status-inactive'}`} />
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-900">{activeModeInfo.name}</h3>
                <div className="text-sm text-blue-600 bg-blue-200 px-3 py-1 rounded-full">
                  Modus {heatingModes.active_mode}
                </div>
              </div>
              
              <p className="text-blue-700 mb-4">{activeModeInfo.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-600">PWM Wert</p>
                  <p className="text-lg font-semibold text-blue-900">{activeModeInfo.pwm_value}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Ausgangsspannung</p>
                  <p className="text-lg font-semibold text-blue-900">{activeModeInfo.output_voltage}V</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Geschätzte Leistung</p>
                  <p className="text-lg font-semibold text-blue-900">{activeModeInfo.estimated_power}W</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Kosten/Stunde</p>
                  <p className="text-lg font-semibold text-blue-900">€{activeModeInfo.estimated_cost_hour}</p>
                </div>
              </div>
              
              {activeModeInfo.reason && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Grund:</strong> {activeModeInfo.reason}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Status Overview Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <h2 className="text-lg font-semibold text-white">Live System-Status</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komponente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktueller Wert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusItems.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-2 text-sm font-medium text-gray-700">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`status-dot ${
                              item.status === 'active'
                                ? 'status-active'
                                : item.status === 'warning'
                                ? 'status-warning'
                                : 'status-inactive'
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.function}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.details}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  )
}