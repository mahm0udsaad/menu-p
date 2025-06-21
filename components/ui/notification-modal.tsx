"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type: "success" | "error" | "warning" | "info"
  buttonText?: string
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  buttonText = "حسناً",
}: NotificationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "error":
        return <XCircle className="h-8 w-8 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case "info":
        return <Info className="h-8 w-8 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "from-green-50 to-emerald-50 border-green-200"
      case "error":
        return "from-red-50 to-rose-50 border-red-200"
      case "warning":
        return "from-yellow-50 to-amber-50 border-yellow-200"
      case "info":
        return "from-blue-50 to-indigo-50 border-blue-200"
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700"
      case "error":
        return "bg-red-600 hover:bg-red-700"
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "info":
        return "bg-blue-600 hover:bg-blue-700"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-gradient-to-br ${getBgColor()}`}>
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-lg">
            {getIcon()}
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-700">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onClose}
            className={`w-full text-white ${getButtonColor()}`}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 