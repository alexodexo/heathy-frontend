// src/components/LiveStatus.js
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemHealth } from '@/hooks/useBackendData'
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function LiveStatus() {
  const { data: systemHealth, isLoading, isError, refresh } = useSystemHealth()
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [connectionStatus, setConnectionStatus] = useState('online')

  useEffect(() => {
    if (systemHealth) {
      setLastUpdate(new Date())
      setConnectionStatus('online')
    } else if (isError) {
      setConnectionStatus('offline')
    }
  }, [systemHealth, isError])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: ArrowPathIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Verbinde...',
        details: 'System wird überprüft',
      }
    }

    if (connectionStatus === 'offline' || isError) {
      return {
        icon: XCircleIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Offline',
        details: 'Verbindung zum Backend verloren',
      }
    }

    if (systemHealth?.status === 'healthy') {
      return {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Online',
        details: `Letztes Update: ${lastUpdate.toLocaleTimeString('de-DE')}`,
      }
    }

    return {
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      text: 'Warnung',
      details: 'System-Status nicht optimal',
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-20 right-4 z-40 ${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-3 shadow-lg backdrop-blur-sm max-w-64`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Icon className={`w-5 h-5 ${statusInfo.color}`} />
              </motion.div>
            ) : (
              <Icon className={`w-5 h-5 ${statusInfo.color}`} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {systemHealth && (
                <span className="text-xs text-gray-500">
                  v{systemHealth.api_version}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">{statusInfo.details}</p>
          </div>

          {(isError || connectionStatus === 'offline') && (
            <button
              onClick={refresh}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              title="Erneut versuchen"
            >
              <ArrowPathIcon className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Additional system info when online */}
        {systemHealth?.status === 'healthy' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
            className="mt-3 pt-3 border-t border-green-200"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Uptime:</span>
                <p className="font-medium text-green-700">
                  {Math.floor((systemHealth.uptime_seconds || 0) / 3600)}h {Math.floor(((systemHealth.uptime_seconds || 0) % 3600) / 60)}m
                </p>
              </div>
              <div>
                <span className="text-gray-500">PWM:</span>
                <p className="font-medium text-green-700">
                  {systemHealth.last_sent_pwm || 0}/255
                </p>
              </div>
              <div>
                <span className="text-gray-500">Zyklen:</span>
                <p className="font-medium text-green-700">
                  {systemHealth.main_loops_executed || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fehler:</span>
                <p className="font-medium text-green-700">
                  {systemHealth.errors_total || 0}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Optional: Compact version for mobile
export function LiveStatusCompact() {
  const { data: systemHealth, isError } = useSystemHealth()
  
  if (isError) {
    return (
      <div className="flex items-center gap-2">
        <span className="status-dot status-warning" />
        <span className="text-xs text-red-600">Offline</span>
      </div>
    )
  }

  if (!systemHealth) {
    return (
      <div className="flex items-center gap-2">
        <span className="status-dot bg-gray-400" />
        <span className="text-xs text-gray-500">Verbinde...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`status-dot ${systemHealth.status === 'healthy' ? 'status-active' : 'status-warning'}`} />
      <span className="text-xs text-green-600">Online</span>
    </div>
  )
}