// src/hooks/useBackendData.js
import useSWR from 'swr'
import { API_CONFIG } from '@/lib/config'

const fetcher = (fn) => fn()

// Deprecated: Backend wurde entfernt, nur Supabase wird genutzt
// Diese Hooks geben Mock-Daten zurück für Abwärtskompatibilität
export function useHeatingStatus() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useHeatingModes() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useCurrentData() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useSystemHealth() {
  return {
    data: {
      status: 'healthy',
      uptime_seconds: 0,
    },
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useSystemStats() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useAllSettings() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useWarmwaterSettings() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useSensorSettings() {
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
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
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
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
  return {
    data: null,
    isLoading: false,
    isError: null,
    refresh: () => {},
  }
}

export function useFritzDevices() {
  const { data, error, isLoading, mutate } = useSWR(
    'fritz-devices-data',
    async () => {
      const response = await fetch('/api/fritz-devices/latest')
      if (!response.ok) throw new Error('Failed to fetch fritz devices data')
      return response.json()
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.CURRENT_DATA, // Same refresh as current data
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useWeatherData() {
  const { data, error, isLoading, mutate } = useSWR(
    'weather-data',
    async () => {
      const response = await fetch('/api/weather/latest')
      if (!response.ok) throw new Error('Failed to fetch weather data')
      return response.json()
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.CURRENT_DATA, // Same refresh as current data
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useEinstellungen() {
  const { data, error, isLoading, mutate } = useSWR(
    'einstellungen',
    async () => {
      const response = await fetch('/api/einstellungen')
      if (!response.ok) throw new Error('Failed to fetch einstellungen')
      return response.json()
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useAblesungen() {
  const { data, error, isLoading, mutate } = useSWR(
    'ablesungen',
    async () => {
      const response = await fetch('/api/ablesungen')
      if (!response.ok) throw new Error('Failed to fetch ablesungen')
      const result = await response.json()
      return result.data || []
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.SETTINGS,
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  return {
    data: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useEM3Data() {
  const { data, error, isLoading, mutate } = useSWR(
    'em3-data',
    async () => {
      const response = await fetch('/api/em3/latest')
      if (!response.ok) throw new Error('Failed to fetch em3 data')
      return response.json()
    },
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.CURRENT_DATA,
      // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}