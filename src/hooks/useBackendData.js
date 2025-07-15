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