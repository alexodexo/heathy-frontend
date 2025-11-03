// src/hooks/useBackendData.js
import useSWR from 'swr'
import { backendAPI } from '@/lib/api'
import { API_CONFIG } from '@/lib/config'

const fetcher = (fn) => fn()

export function useHeatingStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    'heating-status',
    () => backendAPI.getHeatingStatus(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.HEATING_STATUS,
      errorRetryCount: API_CONFIG.RETRY_CONFIG.COUNT,
      errorRetryInterval: API_CONFIG.RETRY_CONFIG.INTERVAL,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useHeatingModes() {
  const { data, error, isLoading, mutate } = useSWR(
    'heating-modes',
    () => backendAPI.getHeatingModes(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.HEATING_MODES,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useCurrentData() {
  const { data, error, isLoading, mutate } = useSWR(
    'current-data',
    () => backendAPI.getCurrentData(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.CURRENT_DATA,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useSystemHealth() {
  const { data, error, isLoading, mutate } = useSWR(
    'system-health',
    () => backendAPI.getSystemHealth(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SYSTEM_HEALTH,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useSystemStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'system-stats',
    () => backendAPI.getSystemStats(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SYSTEM_STATS,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useAllSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'all-settings',
    () => backendAPI.getAllSettings(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useWarmwaterSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'warmwater-settings',
    () => backendAPI.getWarmwaterSettings(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useSensorSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'sensor-settings',
    () => backendAPI.getSensorSettings(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function usePlugsData() {
  const { data, error, isLoading, mutate } = useSWR(
    'plugs-data',
    async () => {
      const response = await fetch('/api/plugs/latest')
      if (!response.ok) throw new Error('Failed to fetch plugs data')
      return response.json()
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.CURRENT_DATA, // Same refresh as current data
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useParameterSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'parameter-settings-v2', // Changed cache key to force reload
    () => backendAPI.getParameterSettings(),
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
      revalidateOnFocus: false, // Deaktiviert - zu störend beim Eingeben
    }
  )


  return {
    data: data?.data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}