// src/lib/timeUtils.js
// Utility functions for time conversion between HH:MM and minutes since midnight

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM" (e.g., "06:00", "22:30")
 * @returns {number} Minutes since midnight (e.g., 360 for "06:00")
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return 0
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 * @param {number} minutes - Minutes since midnight (e.g., 360, 1320)
 * @returns {string} Time in format "HH:MM" (e.g., "06:00", "22:00")
 */
export function minutesToTime(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) return '00:00'
  // Ensure minutes is within valid range (0-1439)
  const validMinutes = Math.max(0, Math.min(1439, Math.floor(minutes)))
  const hours = Math.floor(validMinutes / 60)
  const mins = validMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Validate time window
 * @param {number} start - Start time in minutes
 * @param {number} end - End time in minutes
 * @returns {boolean} True if valid
 */
export function validateTimeWindow(start, end) {
  const startMin = parseInt(start)
  const endMin = parseInt(end)
  
  // Both must be between 0 and 1439 (23:59 = 1439)
  if (startMin < 0 || startMin > 1439) return false
  if (endMin < 0 || endMin > 1439) return false
  
  return true
}

/**
 * Validate temperature value
 * @param {number} value - Temperature in °C
 * @returns {boolean} True if valid
 */
export function validateTemp(value) {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && num <= 100
}

/**
 * Validate duration in minutes
 * @param {number} value - Duration in minutes
 * @returns {boolean} True if valid
 */
export function validateDuration(value) {
  const num = parseInt(value)
  return !isNaN(num) && num >= 0 && num <= 1440 // Max 24 hours
}

/**
 * Get mode badge configuration
 * @param {number} modus - Mode number (0=Aus, 1=Normalbetrieb, 2=Booster)
 * @returns {object} Badge configuration {label, color}
 */
export function getModusBadge(modus) {
  const modusMap = {
    0: { label: 'Aus', color: 'gray' },
    1: { label: 'Normalbetrieb', color: 'green' },
    2: { label: 'Booster', color: 'red' }
  }
  return modusMap[parseInt(modus)] || modusMap[0]
}

