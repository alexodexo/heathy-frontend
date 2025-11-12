// src/components/network/IPAddressRow.js
import { useState } from 'react'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function IPAddressRow({ ipAddress, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedIP, setEditedIP] = useState(ipAddress.ip)
  const [editedPort, setEditedPort] = useState(ipAddress.port)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/ip-addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ipAddress.id,
          ip: editedIP,
          port: parseInt(editedPort),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Speichern')
      }

      const updatedData = await response.json()
      onUpdate(updatedData)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating IP address:', err)
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedIP(ipAddress.ip)
    setEditedPort(ipAddress.port)
    setIsEditing(false)
    setError(null)
  }

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isEditing) {
    return (
      <>
        <tr className="bg-blue-50">
          <td className="px-6 py-4">
            <div className="font-medium font-mono text-gray-900">
              {ipAddress.key}
            </div>
          </td>
          <td className="px-6 py-4">
            <input
              type="text"
              value={editedIP}
              onChange={(e) => setEditedIP(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="192.168.1.1"
              disabled={isSaving}
            />
          </td>
          <td className="px-6 py-4">
            <input
              type="number"
              value={editedPort}
              onChange={(e) => setEditedPort(e.target.value)}
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="80"
              min="1"
              max="65535"
              disabled={isSaving}
            />
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-500">
              {formatDate(ipAddress.updated_at)}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Speichern"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Abbrechen"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
        {error && (
          <tr className="bg-red-50">
            <td colSpan="5" className="px-6 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </td>
          </tr>
        )}
      </>
    )
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium font-mono text-gray-900">
          {ipAddress.key}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block">
          {ipAddress.ip}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-mono text-gray-900">
          {ipAddress.port}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500">
          {formatDate(ipAddress.updated_at)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Bearbeiten"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

