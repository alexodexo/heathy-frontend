// src/lib/api.js
import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL

class BackendAPI {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Heizungssteuerung
  async getHeatingStatus() {
    return this.request('/api/heating/status')
  }

  async getHeatingModes() {
    return this.request('/api/heating/modes')
  }

  async activateMode(modeId) {
    return this.request(`/api/heating/modes/${modeId}/activate`, {
      method: 'POST',
    })
  }

  async getCurrentData() {
    return this.request('/api/heating/data/current')
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
    return this.request(`/api/settings/${key}`)
  }

  async updateSetting(key, value) {
    return this.request(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(value),
    })
  }

  async refreshSettings() {
    return this.request('/api/settings/refresh', {
      method: 'POST',
    })
  }

  async getWarmwaterSettings() {
    return this.request('/api/settings/categories/warmwater')
  }

  async getSensorSettings() {
    return this.request('/api/settings/categories/sensors')
  }

  // System
  async getSystemHealth() {
    return this.request('/api/system/health')
  }

  async getSystemInfo() {
    return this.request('/api/system/info')
  }

  async getSystemStats() {
    return this.request('/api/system/stats')
  }
}

export const backendAPI = new BackendAPI()