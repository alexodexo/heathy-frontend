// src/lib/swrConfig.js
// Globale SWR-Konfiguration für ruhige, stabile Datenaktualisierung

// Helper: Prüft ob Seite sichtbar ist (für konditionelles Polling)
export const isPageVisible = () => {
  if (typeof window === 'undefined') return true
  return document.visibilityState === 'visible'
}

// Custom refreshInterval Funktion: Nur aktualisieren wenn Seite sichtbar ist
export const conditionalRefreshInterval = (interval) => {
  if (typeof window === 'undefined') return interval
  
  return () => {
    // Wenn Seite nicht sichtbar ist, kein Polling
    if (!isPageVisible()) {
      return 0 // Stoppt Polling
    }
    
    // Wenn Seite sichtbar ist, normaler Interval
    return interval
  }
}

// Globale SWR-Konfiguration
export const globalSWRConfig = {
  // Deaktiviere automatische Revalidierung bei Fokus/Reconnect
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  
  // Revalidiere beim Mount (erstes Laden)
  revalidateOnMount: true,
  
  // Retry-Konfiguration
  errorRetryCount: 2, // Reduziert von 3 auf 2 für weniger Störung
  errorRetryInterval: 5000,
  
  // Dedupe Requests (verhindert doppelte Requests innerhalb von 2 Sekunden)
  dedupingInterval: 2000,
  
  // Focus-Throttle (zusätzliche Sicherheit)
  focusThrottleInterval: 5000,
  
  // Fetcher mit Error-Handling
  fetcher: async (url) => {
    const res = await fetch(url)
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.')
      error.status = res.status
      throw error
    }
    return res.json()
  },
}

