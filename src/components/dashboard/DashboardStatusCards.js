// src/components/dashboard/DashboardStatusCards.js
import StatusCard from '@/components/StatusCard'
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline'

export default function DashboardStatusCards({ currentData, currentLoading }) {
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
        quaternaryTitle="Heizungskosten rolling 7 days"
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
        quaternaryTitle="Warmwasserkosten rolling 7 days"
        icon={BeakerIcon}
        color="primary"
        loading={currentLoading}
      />
      <StatusCard
        title="Außentemperatur"
        value={currentData?.temperatures?.outdoor_temp?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={currentData?.weather?.forecast_temp?.toFixed(1) || '--'}
        secondaryUnit="°C"
        secondaryTitle="Prognose heute"
        tertiaryValue={currentData?.weather?.sunshine_hours?.toFixed(1) || '--'}
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
        loading={currentLoading}
      />
      <StatusCard
        title="Wohnzimmer"
        value={currentData?.temperatures?.room_wohnzimmer?.toFixed(1) || '--'}
        unit="°C"
        secondaryValue={currentData?.temperatures?.room_buero?.toFixed(1) || '--'}
        secondaryUnit="°C"
        secondaryTitle="Büro"
        tertiaryValue={currentData?.temperatures?.room_bad?.toFixed(1) || '--'}
        tertiaryUnit="°C"
        tertiaryTitle="Bad"
        icon={() => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
            <path d="M12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
            <path d="M16 8h2"/>
            <path d="M16 12h2"/>
          </svg>
        )}
        color="primary"
        loading={currentLoading}
      />
    </div>
  )
}

