"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Languages, Loader, X, AlertCircle, FileText, Database, Globe } from "lucide-react"

interface PublishingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon?: React.ComponentType<{ className?: string }>
}

interface PublishingProgressBoxProps {
  isOpen: boolean
  progress: {
    current: string
    total: number
    completed: number
    error?: string
    steps?: PublishingStep[]
  }
  onClose: () => void
}

export const PublishingProgressBox = ({ isOpen, progress, onClose }: PublishingProgressBoxProps) => {
  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0
  const hasError = !!progress.error
  const isCompleted = progress.completed === progress.total && !hasError

  const getStepIcon = (step: PublishingStep) => {
    if (step.status === 'error') return AlertCircle
    if (step.status === 'completed') return CheckCircle
    if (step.status === 'active') return Loader
    return step.icon || FileText
  }

  const getStepColor = (step: PublishingStep) => {
    switch (step.status) {
      case 'error': return 'text-red-500'
      case 'completed': return 'text-green-500'
      case 'active': return 'text-blue-500'
      default: return 'text-gray-400'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
          className="absolute top-full left-[-110px] mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center">
                <Languages className="w-4 h-4 mr-2" />
                {hasError ? 'Publishing Failed' : isCompleted ? 'Publishing Complete' : 'Publishing Menu'}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${hasError ? 'bg-red-400' : 'bg-white'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {hasError ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Publishing Error</p>
                  <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {progress.steps && progress.steps.length > 0 ? (
                  <div className="space-y-2">
                    {progress.steps.map((step, index) => {
                      const Icon = getStepIcon(step)
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            step.status === 'active' ? 'bg-blue-50 border border-blue-200' :
                            step.status === 'completed' ? 'bg-green-50' :
                            step.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
                          }`}
                        >
                          <Icon 
                            className={`w-4 h-4 ${getStepColor(step)} ${
                              step.status === 'active' ? 'animate-spin' : ''
                            }`} 
                          />
                          <span className={`text-sm ${
                            step.status === 'active' ? 'font-medium text-blue-800' :
                            step.status === 'completed' ? 'text-green-800' :
                            step.status === 'error' ? 'text-red-800' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </span>
                          {step.status === 'active' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-2 h-2 bg-blue-500 rounded-full ml-auto"
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {isCompleted 
                          ? 'All versions published successfully!' 
                          : `Publishing: ${progress.current}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {progress.total > 1 
                          ? `${progress.completed}/${progress.total} languages completed`
                          : 'Processing your menu...'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {(isCompleted || hasError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-3 text-center ${
                hasError ? 'bg-red-50 border-t border-red-200' : 'bg-green-50 border-t border-green-200'
              }`}
            >
              <p className={`text-xs ${hasError ? 'text-red-600' : 'text-green-600'}`}>
                {hasError 
                  ? 'Please try again or contact support if the issue persists.'
                  : 'You can now close this window and view your published menu.'
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 