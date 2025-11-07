// src/components/dashboard/DashboardStatusCards.js
import StatusCard from '@/components/StatusCard'
import WeatherIcon from '@/components/WeatherIcon'
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline'

export default function DashboardStatusCards({ currentData, currentLoading, fritzDevices, fritzLoading, weatherData, weatherLoading, temperatureData, temperatureLoading }) {
  // Extract temperature values from Fritz devices
  const roomAlexTemp = fritzDevices?.zimmer_alex?.temperature
  const roomBueroTemp = fritzDevices?.buero?.temperature
  
  // Extract weather data
  const outdoorTemp = weatherData?.temperature ? parseFloat(weatherData.temperature) : null
  const minTemp = weatherData?.min_temp_today != null ? weatherData.min_temp_today : null
  const maxTemp = weatherData?.max_temp_today != null ? weatherData.max_temp_today : null
  const sunshineHours = weatherData?.sunshine_hours_today
  
  // Extract heating temperature data from temperature_data (t1 = Warmwasser, t2 = Vorlauf, t3 = Rücklauf, t4 = Wohnzimmer)
  const warmwasserTemp = temperatureData?.t1
  const vorlaufTemp = temperatureData?.t2
  const ruecklaufTemp = temperatureData?.t3
  const wohnzimmerTemp = temperatureData?.t4
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      <StatusCard
        title="Vorlauf Heizung"
        value={vorlaufTemp?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={ruecklaufTemp?.toFixed(1) || '--'}
        secondaryUnit="°C"
        secondaryTitle="Rücklauf Heizung"
        tertiaryValue={currentData?.heating?.power_kw?.toFixed(1) || '--'}
        tertiaryUnit="kW"
        tertiaryTitle="aktuelle Heizleistung"
        quaternaryValue={currentData?.costs?.heating_week?.toFixed(2) || '--'}
        quaternaryUnit="€"
        quaternaryTitle="Heizungskosten letzte 7 Tage"
        icon={() => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.71 17.99A.75.75 0 1 1 12.45 19c-1.43.1-3.94-.55-5.78-2.28C4.84 14.96 4 12.81 4 10.5c0-1.48.36-2.42.84-3.05.88-1.15 2.17-1.45 2.17-1.45.39-.05.75.18.88.55.16.4-.03.86-.41 1.04 0 0-.6.21-1.09.87-.23.3-.39.76-.39 2.04 0 2.19.76 3.94 2.14 5.24 1.49 1.4 3.46 1.98 4.57 2.1l.1.01h.1Zm.55-4.5l.3-.59c1.31-2.41 2.79-3.73 4.13-4.72 1.48-1.09 2.82-1.68 3.55-1.65.52.02.85.44.92.92.08.48-.09 1.11-.67 1.97-.57.85-1.58 1.83-3.25 3.27-.96.83-2.04 1.72-3.16 2.71l-.31.3-.51-.21Z"/>
          </svg>
        )}
        color="warning"
        loading={currentLoading || temperatureLoading}
      />
      <StatusCard
        title="Warmwasser"
        value={warmwasserTemp?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={currentData?.warmwater?.target_temp?.toFixed(1) || '--'}
        secondaryUnit="°C"
        secondaryTitle="Ziel-Temperatur"
        tertiaryValue={currentData?.warmwater?.power_w?.toFixed(0) || '--'}
        tertiaryUnit="W"
        tertiaryTitle="aktuelle Heizleistung"
        quaternaryValue={currentData?.costs?.warmwater_week?.toFixed(2) || '--'}
        quaternaryUnit="€"
        quaternaryTitle="Warmwasserkosten letzte 7 Tage"
        icon={() => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2C10.9 2 10 2.9 10 4V14.5C8.8 15.2 8 16.5 8 18C8 20.2 9.8 22 12 22S16 20.2 16 18C16 16.5 15.2 15.2 14 14.5V4C14 2.9 13.1 2 12 2M12 4C12.6 4 13 4.4 13 5V8H11V5C11 4.4 11.4 4 12 4M12 10H13V11H12V10M12 12H13V14.3C14.2 14.9 15 16.3 15 18C15 19.7 13.7 21 12 21S9 19.7 9 18C9 16.3 9.8 14.9 11 14.3V12Z"/>
          </svg>
        )}
        color="primary"
        loading={currentLoading || temperatureLoading}
      />
      <StatusCard
        title="Außentemperatur"
        value={outdoorTemp !== null ? outdoorTemp.toFixed(1) : '--'}
        unit="°C"
        secondaryValue={
          minTemp !== null && maxTemp !== null
            ? `${minTemp.toFixed(1)} min. ${maxTemp.toFixed(1)} max. °C`
            : '-- min. -- max. °C'
        }
        secondaryUnit=""
        secondaryTitle="Prognose heute"
        tertiaryValue={sunshineHours !== null && sunshineHours !== undefined ? sunshineHours.toFixed(1) : '--'}
        tertiaryUnit="h"
        tertiaryTitle="Sonnenstunden heute"
        icon={(props) => <WeatherIcon icon={weatherData?.icon} {...props} />}
        color="primary"
        loading={weatherLoading}
      />
      <StatusCard
        title="Wohnzimmer"
        value={wohnzimmerTemp?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={roomBueroTemp ? roomBueroTemp.toFixed(1) : '--'}
        secondaryUnit="°C"
        secondaryTitle="Büro"
        tertiaryValue={currentData?.temperatures?.room_bad?.toFixed(1) || '--'}
        tertiaryUnit="°C"
        tertiaryTitle="Bad"
        quaternaryValue={roomAlexTemp ? roomAlexTemp.toFixed(1) : '--'}
        quaternaryUnit="°C"
        quaternaryTitle="Zimmer Alex"
        icon={() => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
            <path d="M12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
            <path d="M16 8h2"/>
            <path d="M16 12h2"/>
          </svg>
        )}
        color="primary"
        loading={currentLoading || fritzLoading || temperatureLoading}
      />
    </div>
  )
}

