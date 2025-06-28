import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, QrCode } from 'lucide-react'

export default function MenuNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            القائمة غير موجودة
          </CardTitle>
          <p className="text-gray-600 mt-2">
            عذراً، لم نتمكن من العثور على القائمة المطلوبة
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>قد يكون السبب:</p>
            <ul className="mt-2 space-y-1">
              <li>• الرابط غير صحيح</li>
              <li>• القائمة تم حذفها</li>
              <li>• انتهت صلاحية القائمة</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                العودة للصفحة الرئيسية
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <QrCode className="w-4 h-4 mr-2" />
                إنشاء قائمة جديدة
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              تحتاج مساعدة؟ تواصل مع فريق الدعم
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 