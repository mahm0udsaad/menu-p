import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, QrCode, Home } from 'lucide-react'

export default function QrDesignNotFound() {
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
            عذراً، تعذر العثور على القائمة المطلوبة لإنشاء بطاقة QR
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <QrCode className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 ml-2" />
                الصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
