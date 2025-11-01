// src/components/heating/HeatingStatusCards.js
import StatusCard from '@/components/StatusCard'
import { ArrowUpIcon, ArrowDownIcon, FireIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function HeatingStatusCards({ heatingData, currentData, currentLoading, statusLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatusCard
        title="Vorlauf"
        value={heatingData?.vorlaufTemp?.toFixed(1) || '--'}
        unit="°C"
        icon={ArrowUpIcon}
        color={heatingData?.vorlaufTemp > 40 ? 'success' : 'warning'}
        loading={currentLoading}
      />
      <StatusCard
        title="Rücklauf"
        value={heatingData?.ruecklaufTemp?.toFixed(1) || '--'}
        unit="°C"
        icon={ArrowDownIcon}
        color={heatingData?.ruecklaufTemp > 30 ? 'success' : 'warning'}
        loading={currentLoading}
      />
      <StatusCard
        title="Temperaturdifferenz"
        value={heatingData?.tempDiff?.toFixed(1) || '--'}
        unit="°C"
        icon={FireIcon}
        color={heatingData?.tempDiff > 5 ? 'success' : 'error'}
        loading={currentLoading}
      />
      <StatusCard
        title="Heizleistung"
        value={heatingData?.heatingPower?.toString() || '--'}
        unit="W"
        icon={BoltIcon}
        color="primary"
        loading={statusLoading}
        topRight={
          <div className="flex items-center gap-2">
            <span className={`status-dot ${currentData?.circulator_no1 ? 'status-active' : 'status-inactive'}`} />
            <span className="text-xs font-medium text-gray-700">
              {currentData?.circulator_no1 ? 'Pumpe ein' : 'Pumpe aus'}
            </span>
          </div>
        }
      />
    </div>
  )
}

