// src/lib/config.js
// Konfiguration für das Heizungssteuerungs-System

export const API_CONFIG = {
  // Backend API Basis-URL
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:12345',
  
  // Refresh-Intervalle in Millisekunden
  REFRESH_INTERVALS: {
    HEATING_STATUS: 5000,      // 5 Sekunden - Live-Status
    CURRENT_DATA: 3000,        // 3 Sekunden - Sensor-Daten
    HEATING_MODES: 10000,      // 10 Sekunden - Modi
    SYSTEM_HEALTH: 15000,      // 15 Sekunden - System-Health
    SYSTEM_STATS: 10000,       // 10 Sekunden - System-Statistiken
    SETTINGS: 30000,           // 30 Sekunden - Einstellungen
  },
  
  // Retry-Konfiguration
  RETRY_CONFIG: {
    COUNT: 3,
    INTERVAL: 2000,
  },
  
  // Toast-Konfiguration
  TOAST_DURATION: 4000,
}

export const SYSTEM_CONFIG = {
  // App-Informationen
  APP_NAME: 'Heizungssteuerung',
  APP_VERSION: '2.0.0',
  
  // Standard-Temperaturbereiche
  TEMPERATURE_RANGES: {
    WARMWATER: { MIN: 30, MAX: 70, DEFAULT_ON: 45, DEFAULT_OFF: 55 },
    HEATING_VORLAUF: { MIN: 15, MAX: 80 },
    HEATING_RUECKLAUF: { MIN: 15, MAX: 60 },
    SENSOR_OFFSET: { MIN: -10, MAX: 10 },
  },
  
  // PWM-Konfiguration
  PWM: {
    MIN: 0,
    MAX: 255,
  },
  
  // Standard-Strompreis
  DEFAULT_ELECTRICITY_PRICE: 0.25,
  
  // Chart-Konfiguration
  CHART_CONFIG: {
    ANIMATION_DURATION: 300,
    COLORS: {
      PRIMARY: '#0ea5e9',
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444',
      WARMWATER: '#3b82f6',
      VORLAUF: '#fb923c',
      RUECKLAUF: '#22c55e',
    }
  }
}

// Hilfsfunktionen
export const formatUptime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export const formatTemperature = (temp) => {
  return `${temp.toFixed(1)}°C`
}

export const formatPower = (watts) => {
  if (watts >= 1000) {
    return `${(watts / 1000).toFixed(1)} kW`
  }
  return `${watts.toFixed(0)} W`
}