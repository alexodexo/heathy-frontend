// src/components/WeatherIcon.js
import React from 'react'
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloudy,
  WiFog,
  WiStrongWind,
  WiRain,
  WiSleet,
  WiSnow,
  WiHail,
  WiThunderstorm,
} from 'react-icons/wi'

const WeatherIcon = ({ icon, className }) => {
  // Mapping von Datenbank-Werten zu react-icons Weather Icons
  const iconMapping = {
    'clear-day': WiDaySunny,
    'clear-night': WiNightClear,
    'partly-cloudy-day': WiDayCloudy,
    'partly-cloudy-night': WiNightAltCloudy,
    'cloudy': WiCloudy,
    'fog': WiFog,
    'wind': WiStrongWind,
    'rain': WiRain,
    'sleet': WiSleet,
    'snow': WiSnow,
    'hail': WiHail,
    'thunderstorm': WiThunderstorm,
  }

  // Wähle das passende Icon oder nutze Fallback
  const IconComponent = iconMapping[icon] || WiDaySunny

  return <IconComponent className={className} />
}

export default WeatherIcon

