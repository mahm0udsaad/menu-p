"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { FileText, PenLine, ArrowLeft, QrCode, AlertTriangle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MenuSourceChoice({ logoFailed = false }: { logoFailed?: boolean }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">أضف قائمتك</h1>
          <p className="text-gray-500 mt-2">كيف تريد إضافة أطباقك؟</p>
        </div>

        {logoFailed && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              تعذّر حفظ الشعار أثناء الإعداد. لا تقلق — يمكنك رفعه مرة أخرى من محرّر القائمة في أي وقت.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* menus-sa option */}
          <button
            onClick={() => router.push("/dashboard/import?source=menus-sa")}
            className="w-full group bg-white border-2 border-violet-200 hover:border-violet-500 rounded-lg p-5 text-right transition-all shadow-sm hover:shadow-md flex items-start gap-4"
          >
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src="/partners/menus-sa-logo.png"
                alt="قائمة الطلبات MENU"
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900">استيراد من قائمة الطلبات</h2>
                <span className="inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full">
                  <Zap className="h-3 w-3" />
                  بدون تكلفة AI
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                الصق رابط menus-sa وسنستورد الأقسام والأصناف والأسعار والصور مباشرةً
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-violet-500 flex-shrink-0 mt-1 transition-colors" />
          </button>

          {/* Import option */}
          <button
            onClick={() => router.push("/dashboard/import")}
            className="w-full group bg-white border-2 border-gray-200 hover:border-red-500 rounded-2xl p-6 text-right transition-all shadow-sm hover:shadow-md flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-900">استيراد من PDF أو صورة</h2>
                <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                  الأسرع
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                حوّل قائمتك الورقية أو الصورة إلى قائمة رقمية بالذكاء الاصطناعي في ثوانٍ
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-red-500 flex-shrink-0 mt-1 transition-colors" />
          </button>

          {/* Manual entry option */}
          <button
            onClick={() => router.push("/menu-editor")}
            className="w-full group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-6 text-right transition-all shadow-sm hover:shadow-md flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <PenLine className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">إدخال يدوي</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                أضف أطباقك وأسعارها مباشرةً وخصّص مظهر القائمة
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
          </button>
        </div>

        {/* Skip */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/menu-editor")}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            تخطّي الآن
          </Button>
        </div>
      </div>
    </div>
  )
}
