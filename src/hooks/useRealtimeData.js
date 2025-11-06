// hooks/useRealtimeData.js
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export function useEM3Data() {
  const { data, error, isLoading } = useSWR('/api/em3/latest', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds (erhöht für ruhigere Seiten)
    // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}

export function useTemperatureData() {
  const { data, error, isLoading } = useSWR('/api/temperature/latest', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds (erhöht)
    // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}

export function useWeatherData() {
  const { data, error, isLoading } = useSWR('/api/weather/latest', fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    // revalidateOnFocus und revalidateOnReconnect werden global deaktiviert
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}