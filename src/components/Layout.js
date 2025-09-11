// src/components/Layout.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { ToastProvider } from '@/components/ToastProvider'
import { useSystemHealth } from '@/hooks/useBackendData'
import {
  HomeIcon,
  BeakerIcon,
  FireIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Warmwasser', href: '/warmwater', icon: BeakerIcon },
  { name: 'Heizung', href: '/heating', icon: FireIcon },
  { name: 'System', href: '/system', icon: Cog6ToothIcon },
  { name: 'Statistiken', href: '/statistics', icon: ChartBarIcon },

]

export default function Layout({ children }) {
  const router = useRouter()
  const { data: systemHealth } = useSystemHealth()

  const getSystemStatusIcon = () => {
    if (!systemHealth) return null
    
    if (systemHealth.status === 'healthy') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 safe-top">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg">
                <FireIcon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-gray-900">Heathy</h1>
                
                {/* Horizontales Menü auf gleicher Höhe wie Heathy */}
                <nav className="flex items-center space-x-2">
                  {navigation.map((item) => {
                    const isActive = router.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-3">
              {systemHealth && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                  <span className={`status-dot ${
                    systemHealth.status === 'healthy' ? 'status-active' : 'status-warning'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {systemHealth.status === 'healthy' ? 'Online' : 'Warnung'}
                  </span>
                </div>
              )}
            </div>


          </div>
        </div>


      </header>



      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20 safe-bottom">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
