// src/hooks/useConditionalSWR.js
// Custom Hook für konditionelles Polling - nur wenn Seite sichtbar ist

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { isPageVisible } from '@/lib/swrConfig'

/**
 * SWR Hook mit konditionellem Polling
 * Aktualisiert nur wenn die Seite sichtbar ist
 * 
 * @param {string|Function} key - SWR cache key
 * @param {Function} fetcher - Data fetcher function
 * @param {Object} options - SWR options
 * @param {number} options.refreshInterval - Refresh interval in ms (wird konditionell angewendet)
 */
export function useConditionalSWR(key, fetcher, options = {}) {
  const [isVisible, setIsVisible] = useState(true)
  
  // Überwache Visibility State
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleVisibilityChange = () => {
      setIsVisible(isPageVisible())
    }
    
    // Initial check
    setIsVisible(isPageVisible())
    
    // Event Listener
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  // Konditionelles refreshInterval
  const conditionalOptions = {
    ...options,
    // Wenn Seite nicht sichtbar ist, kein Polling
    refreshInterval: isVisible ? (options.refreshInterval || 0) : 0,
    // Zusätzliche Sicherheit
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  }
  
  return useSWR(key, fetcher, conditionalOptions)
}

