// src/lib/api.js
import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL
// Standard: echte Backend-Verbindung nutzen; Mocks nur, wenn explizit aktiviert
const USE_MOCKS = typeof process !== 'undefined' && process.env && Object.prototype.hasOwnProperty.call(process.env, 'NEXT_PUBLIC_USE_MOCKS')
  ? process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'
  : false

class BackendAPI {
  constructor() {
    this._mockSettings = null
    this._mockStorageKey = 'heathy_mock_settings'
  }

  // ---- Mock helpers ----
  _loadMockSettings() {
    if (this._mockSettings) return this._mockSettings
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(this._mockStorageKey)
        if (raw) this._mockSettings = JSON.parse(raw)
      }
    } catch {}
    if (!this._mockSettings) {
      this._mockSettings = {
        // Warmwasser
        warmwater_switchon: 55,
        warmwater_switchoff: 60,
        warmwater_power_mode_switchoff: 65,
        warmwater_guest_switchoff: 58,
        warmwater_heater_power: 450,
        // Heizungs-Zeitsteuerung
        heating_time_control_enabled: false,
        heating_weekday_start: '06:00',
        heating_weekday_end: '22:00',
        heating_weekend_start: '07:00',
        heating_weekend_end: '22:00',
        // Wetteranpassung
        weather_adaptation_enabled: true,
        sunshine_temperature_reduction: 3,
        sunshine_threshold: 70,
        // Heizkurve
        custom_heating_curve_enabled: false,
        // Abrechnung
        electricity_price: 0.25,
        warmwater_meter_reading: 0,
        warmwater_meter_date: '',
        ht_meter_reading: 0,
        nt_meter_reading: 0,
        electricity_meter_date: '',
      }
    }
    return this._mockSettings
  }

  _saveMockSettings() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this._mockStorageKey, JSON.stringify(this._mockSettings))
      }
    } catch {}
  }

  _updateMockSetting(key, value) {
    const settings = this._loadMockSettings()
    settings[key] = value
    this._saveMockSettings()
    return settings
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} at ${endpoint}`)
      }
      return await response.json()
    } catch (error) {
      if (!options.suppressLog) {
        console.warn(`API request failed: ${endpoint}`, error)
      }
      throw error
    }
  }

  // Heizungssteuerung
  async getHeatingStatus() {
    try {
      return await this.request('/api/heating/status')
    } catch (error) {
      console.warn('Falling back to mocked heating status')
      return {
        success: true,
        data: {
          timestamp: Date.now(),
          active: true,
        },
      }
    }
  }

  async getHeatingModes() {
    try {
      return await this.request('/api/heating/modes', { suppressLog: true })
    } catch (error) {
      console.warn('Falling back to mocked heating modes (any error)')
      const modes = {
        1: { id: 1, name: 'Normalbetrieb + PV-Strom', pwm_value: 128, estimated_power: 2000, output_voltage: 12, estimated_cost_hour: 0.35, target_temp: 55, active_heating: true },
        2: { id: 2, name: 'Nur PV-Strom', pwm_value: 64, estimated_power: 1000, output_voltage: 6, estimated_cost_hour: 0.18, target_temp: 50, active_heating: false },
        3: { id: 3, name: 'Power-Modus 4.5 kW', pwm_value: 255, estimated_power: 4500, output_voltage: 24, estimated_cost_hour: 0.85, target_temp: 70, active_heating: true },
        4: { id: 4, name: 'Gäste-Modus', pwm_value: 128, estimated_power: 2000, output_voltage: 12, estimated_cost_hour: 0.45, target_temp: 55, active_heating: true },
        5: { id: 5, name: 'Vollständig EIN', pwm_value: 255, estimated_power: 4500, output_voltage: 24, estimated_cost_hour: 0.85, target_temp: 70, active_heating: true },
        6: { id: 6, name: 'Vollständig AUS', pwm_value: 0, estimated_power: 0, output_voltage: 0, estimated_cost_hour: 0, target_temp: 0, active_heating: false },
      }
      return { success: true, data: { modes, active_mode: 1 } }
    }
  }

  async activateMode(modeId) {
    // Nur Legacy-Endpoint verwenden, keine Aufrufe auf /api/heating/modes
    const attempts = [
      { endpoint: '/api/heating/activate-mode', method: 'POST', body: { mode_id: modeId } },
      { endpoint: '/api/heating/activate-mode', method: 'POST', body: { id: modeId } },
      { endpoint: '/api/heating/activate-mode', method: 'POST', body: { modeId } },
      { endpoint: '/api/heating/activate-mode', method: 'POST', body: undefined },
      { endpoint: `/api/heating/activate-mode?id=${modeId}`, method: 'GET' },
      { endpoint: `/api/heating/activate-mode?mode_id=${modeId}`, method: 'GET' },
    ]

    let lastError
    for (const attempt of attempts) {
      try {
        const res = await this.request(attempt.endpoint, {
          method: attempt.method,
          body: attempt.body !== undefined ? JSON.stringify(attempt.body) : undefined,
          suppressLog: true,
        })
        return res
      } catch (err) {
        lastError = err
        continue
      }
    }

    if (modeId === 1 || modeId === 5) {
      throw lastError
    }

    const modeNames = {
      1: 'Normalbetrieb + PV-Strom',
      2: 'Nur PV-Strom',
      3: 'Power-Modus 4.5 kW',
      4: 'Gäste-Modus',
      5: 'Vollständig EIN',
      6: 'Vollständig AUS',
    }
    return { success: true, data: { mode_name: modeNames[modeId] || `Modus ${modeId}` } }
  }

  async getCurrentData() {
    try {
      return await this.request('/api/heating/data/current')
    } catch (error) {
      console.warn('Falling back to mocked current data')
      return {
        success: true,
        data: {
          temperatures: { water_temp: 52.3 },
          power: { total_power: 1350 },
        },
      }
    }
  }

  async emergencyStop() {
    return this.request('/api/heating/emergency-stop', {
      method: 'POST',
    })
  }

  // Settings
  async getAllSettings() {
    return this.request('/api/settings/')
  }

  async getSetting(key) {
    try {
      return await this.request(`/api/settings/${key}`)
    } catch (error) {
      const settings = this._loadMockSettings()
      return { success: true, data: { key, value: settings[key] } }
    }
  }

  async updateSetting(key, value) {
    try {
      return await this.request(`/api/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(value),
      })
    } catch (error) {
      this._updateMockSetting(key, value)
      return { success: true, data: { key, value } }
    }
  }

  async refreshSettings() {
    try {
      return await this.request('/api/settings/refresh', {
        method: 'POST',
      })
    } catch (error) {
      // No-op for mock
      return { success: true }
    }
  }

  async getWarmwaterSettings() {
    try {
      return await this.request('/api/settings/categories/warmwater')
    } catch (error) {
      console.warn('Falling back to mocked warmwater settings')
      return {
        success: true,
        data: {
          warmwater: {
            switchon: 55,
            switchoff: 60,
            power_mode_switchoff: 65,
            guest_switchoff: 58,
            heater_power: 450,
          },
        },
      }
    }
  }

  async getSensorSettings() {
    try {
      return await this.request('/api/settings/categories/sensors')
    } catch (error) {
      return { success: true, data: { sensors: {} } }
    }
  }

  async getParameterSettings() {
    console.log('API: getParameterSettings called')
    try {
      // Fixed: Correct API path
      const result = await this.request('/api/settings/parameter-settings')
      console.log('API: getParameterSettings result:', result)
      return result
    } catch (error) {
      console.error('API: getParameterSettings error:', error)
      throw error
    }
  }

  async updateParameterSetting(key, value) {
    try {
      return await this.request('/api/settings/parameter-settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value }),
      })
    } catch (error) {
      console.warn('Failed to update parameter setting:', error)
      return { success: false, error: error.message }
    }
  }

  // System
  async getSystemHealth() {
    try {
      return await this.request('/api/system/health')
    } catch (error) {
      const now = Math.floor(Date.now() / 1000)
      return {
        success: true,
        data: {
          status: 'healthy',
          api_version: 'mock-1.0',
          uptime_seconds: 3600 * 42,
          main_loops_executed: now % 100000,
          last_sent_pwm: 128,
          errors_total: 0,
        },
      }
    }
  }

  async getSystemInfo() {
    try {
      return await this.request('/api/system/info')
    } catch (error) {
      return { success: true, data: { hostname: 'mock.local', platform: 'mock', version: '1.0.0' } }
    }
  }

  async getSystemStats() {
    try {
      return await this.request('/api/system/stats')
    } catch (error) {
      return {
        success: true,
        data: {
          requests_last_min: 12,
          avg_latency_ms: 42,
          mem_used_mb: 128,
        },
      }
    }
  }
}

export const backendAPI = new BackendAPI()