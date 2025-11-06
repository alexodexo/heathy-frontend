// src/components/dashboard/DashboardStatusCards.js
import StatusCard from '@/components/StatusCard'
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline'

export default function DashboardStatusCards({ currentData, currentLoading, fritzDevices, fritzLoading, weatherData, weatherLoading }) {
  // Extract temperature values from Fritz devices
  const roomAlexTemp = fritzDevices?.zimmer_alex?.temperature
  const roomBueroTemp = fritzDevices?.buero?.temperature
  
  // Extract weather data
  const outdoorTemp = weatherData?.temperature ? parseFloat(weatherData.temperature) : null
  const minTemp = weatherData?.min_temp_today != null ? weatherData.min_temp_today : null
  const maxTemp = weatherData?.max_temp_today != null ? weatherData.max_temp_today : null
  const sunshineHours = weatherData?.sunshine_hours_today
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      <StatusCard
        title="Vorlauf Heizung"
        value={currentData?.temperatures?.vorlauf_temp?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={
          currentData?.temperatures?.vorlauf_temp && currentData?.temperatures?.ruecklauf_temp
            ? (currentData.temperatures.vorlauf_temp - currentData.temperatures.ruecklauf_temp).toFixed(1)
            : '--'
        }
        secondaryUnit="°C"
        secondaryTitle="Temperaturdifferenz"
        tertiaryValue={currentData?.heating?.power_kw?.toFixed(1) || '--'}
        tertiaryUnit="kW"
        tertiaryTitle="aktuelle Heizleistung"
        quaternaryValue={currentData?.costs?.heating_week?.toFixed(2) || '--'}
        quaternaryUnit="€"
        quaternaryTitle="Heizungskosten letzte 7 Tage"
        icon={FireIcon}
        color="warning"
        loading={currentLoading}
      />
      <StatusCard
        title="Warmwasser"
        value={currentData?.temperatures?.water_temp?.toFixed(1) || '--'}
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
        icon={BeakerIcon}
        color="primary"
        loading={currentLoading}
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
        icon={() => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" opacity="0.3"/>
          </svg>
        )}
        color="primary"
        loading={weatherLoading}
      />
      <StatusCard
        title="Wohnzimmer"
        value={currentData?.temperatures?.room_wohnzimmer?.toFixed(1) || '--'}
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
        loading={currentLoading || fritzLoading}
      />
    </div>
  )
}

