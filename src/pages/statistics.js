// src/pages/statistics.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import useSWR from 'swr'
import StatsSummaryCards from '@/components/statistics/StatsSummaryCards'
import TimeRangeSelector from '@/components/statistics/TimeRangeSelector'
import TemperatureChartSection from '@/components/statistics/TemperatureChartSection'
import EnergyChartSection from '@/components/statistics/EnergyChartSection'
import CostAnalysisSection from '@/components/statistics/CostAnalysisSection'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Statistics() {
  const [selectedRange, setSelectedRange] = useState('24h')

  // Fetch data from our new API endpoints
  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useSWR(
    '/api/statistics/summary',
    fetcher,
    { 
      refreshInterval: 60000, // Refresh every minute
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  const { data: energyData, error: energyError, isLoading: energyLoading } = useSWR(
    `/api/statistics/energy?range=${selectedRange}`,
    fetcher,
    { 
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false, // Verhindert Reload bei Tab-Wechsel
      revalidateOnReconnect: false, // Verhindert Reload bei Reconnect
    }
  )

  const { data: temperatureData, error: temperatureError, isLoading: temperatureLoading } = useSWR(
    `/api/statistics/temperatures?range=${selectedRange}`,
    fetcher,
    { 
      refreshInterval: 60000,
      revalidateOnFocus: false, // Verhindert Reload bei Tab-Wechsel
      revalidateOnReconnect: false, // Verhindert Reload bei Reconnect
    }
  )

  const { data: costsData, error: costsError, isLoading: costsLoading } = useSWR(
    `/api/statistics/costs?range=${selectedRange}`,
    fetcher,
    { 
      refreshInterval: 60000,
      revalidateOnFocus: false, // Verhindert Reload bei Tab-Wechsel
      revalidateOnReconnect: false, // Verhindert Reload bei Reconnect
    }
  )

  // Debug: Log errors
  useEffect(() => {
    if (summaryError) console.error('Summary API Error:', summaryError)
    if (energyError) console.error('Energy API Error:', energyError)
    if (temperatureError) console.error('Temperature API Error:', temperatureError)
    if (costsError) console.error('Costs API Error:', costsError)
  }, [summaryError, energyError, temperatureError, costsError])

  // Debug: Log data
  useEffect(() => {
    console.log('Summary Data:', summaryData)
    console.log('Energy Data:', energyData)
    console.log('Temperature Data:', temperatureData)
    console.log('Costs Data:', costsData)
  }, [summaryData, energyData, temperatureData, costsData])

  // Transform temperature data for chart component
  const transformTemperatureData = (tempData) => {
    if (!tempData?.data?.timeseries) return null

    const timeseries = tempData.data.timeseries
    return {
      labels: timeseries.map(d => {
        const date = new Date(d.timestamp)
        if (selectedRange === '7d' || selectedRange === '30d') {
          return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })
        }
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      }),
      warmwater: timeseries.map(d => d.water_temp),
      vorlauf: timeseries.map(d => d.vorlauf_temp),
      ruecklauf: timeseries.map(d => d.ruecklauf_temp),
    }
  }

  // Transform energy data for chart component
  const transformEnergyData = (energyApiData) => {
    if (!energyApiData?.data?.timeseries) return null

    const timeseries = energyApiData.data.timeseries
    return {
      labels: timeseries.map(d => {
        const date = new Date(d.timestamp)
        if (selectedRange === '7d' || selectedRange === '30d') {
          return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })
        }
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      }),
      values: timeseries.map(d => d.total_power),
    }
  }

  return (
    <>
      <Head>
        <title>Statistiken - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 px-3 md:px-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Live-Statistiken</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 md:mt-2">Detaillierte Analyse mit echten Daten aus der Datenbank</p>
        </div>

        {/* Summary Cards */}
        <StatsSummaryCards 
          summary={summaryData?.data} 
          loading={summaryLoading} 
        />

        {/* Time Range Selector */}
        <TimeRangeSelector 
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />

        {/* Temperature Chart */}
        <TemperatureChartSection 
          data={{
            chartData: transformTemperatureData(temperatureData),
            stats: temperatureData?.data?.stats,
          }}
          loading={temperatureLoading}
        />

        {/* Energy Chart */}
        <EnergyChartSection 
          data={{
            chartData: transformEnergyData(energyData),
            summary: energyData?.data?.summary,
          }}
          loading={energyLoading}
        />

        {/* Cost Analysis */}
        <CostAnalysisSection 
          data={costsData?.data}
          loading={costsLoading}
          selectedRange={selectedRange}
        />
      </div>
    </>
  )
}
