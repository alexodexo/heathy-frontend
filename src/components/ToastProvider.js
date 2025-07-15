// src/components/ToastProvider.js
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

let toastId = 0
const toasts = []
const listeners = []

export const toast = {
  success: (message, options = {}) => addToast('success', message, options),
  error: (message, options = {}) => addToast('error', message, options),
  warning: (message, options = {}) => addToast('warning', message, options),
  info: (message, options = {}) => addToast('info', message, options),
}

function addToast(type, message, options) {
  const id = ++toastId
  const newToast = {
    id,
    type,
    message,
    duration: options.duration || 4000,
    ...options,
  }
  
  toasts.push(newToast)
  notifyListeners()
  
  if (newToast.duration > 0) {
    setTimeout(() => removeToast(id), newToast.duration)
  }
  
  return id
}

function removeToast(id) {
  const index = toasts.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    notifyListeners()
  }
}

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]))
}

export function ToastProvider() {
  const [toastList, setToastList] = useState(toasts)
  
  useEffect(() => {
    listeners.push(setToastList)
    return () => {
      const index = listeners.indexOf(setToastList)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])
  
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toastList.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm min-w-80 max-w-md ${colors[toast.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}