// src/pages/netzwerk.js
import Head from 'next/head'
import { useState } from 'react'
import useSWR from 'swr'
import { SignalIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import IPAddressRow from '@/components/network/IPAddressRow'
import { LoadingPage } from '@/components/Loading'
import { ErrorCard } from '@/components/Error'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function Network() {
  const { data: ipAddresses, error, mutate } = useSWR('/api/ip-addresses', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const handleUpdate = (updatedAddress) => {
    // Optimistically update the UI
    mutate(
      (currentData) =>
        currentData.map((addr) =>
          addr.id === updatedAddress.id ? updatedAddress : addr
        ),
      false
    )
    // Revalidate to ensure we have the latest data
    mutate()
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Netzwerk - Heizungssteuerung</title>
        </Head>
        <div className="max-w-7xl mx-auto">
          <ErrorCard 
            title="Fehler beim Laden" 
            message="Die IP-Adressen konnten nicht geladen werden."
            onRetry={() => mutate()}
          />
        </div>
      </>
    )
  }

  if (!ipAddresses) {
    return (
      <>
        <Head>
          <title>Netzwerk - Heizungssteuerung</title>
        </Head>
        <div className="max-w-7xl mx-auto">
          <LoadingPage message="Lade IP-Adressen..." />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Netzwerk - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
            <SignalIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Netzwerk-Verwaltung
            </h1>
            <p className="text-base md:text-lg text-gray-600 mt-1">
              IP-Adressen und Ports aller Geräte verwalten
            </p>
          </div>
        </div>


        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-sm font-medium text-blue-700">Geräte gesamt</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">
              {ipAddresses.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-sm font-medium text-green-700">Standard Port (80)</p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              {ipAddresses.filter((addr) => addr.port === 80).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-sm font-medium text-purple-700">Andere Ports</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">
              {ipAddresses.filter((addr) => addr.port !== 80).length}
            </p>
          </div>
        </div>

        {/* IP Address Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {ipAddresses.length === 0 ? (
              <div className="text-center py-12">
                <SignalIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Keine IP-Adressen konfiguriert
                </h3>
                <p className="text-gray-600">
                  Es wurden noch keine Geräte-IP-Adressen in der Datenbank gespeichert.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Schlüssel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      IP-Adresse
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Port
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Zuletzt aktualisiert
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ipAddresses.map((ipAddress) => (
                    <IPAddressRow
                      key={ipAddress.id}
                      ipAddress={ipAddress}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

