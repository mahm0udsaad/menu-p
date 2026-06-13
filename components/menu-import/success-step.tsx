"use client"

/** Success step after the extraction was imported into the menu. */

import Link from "next/link"
import { CheckCircle2, PencilRuler, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const STRINGS = {
  title: "تم استيراد قائمتك بنجاح 🎉",
  summary: (categories: number, items: number) => `تمت إضافة ${categories} قسم و ${items} صنف إلى قائمتك`,
  goToEditor: "فتح محرر القائمة",
  importAnother: "استيراد قائمة أخرى",
} as const

export interface SuccessStepProps {
  categoriesCreated: number
  itemsCreated: number
  onImportAnother: () => void
}

export default function SuccessStep({ categoriesCreated, itemsCreated, onImportAnother }: SuccessStepProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="py-16 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{STRINGS.title}</h2>
          <p className="text-gray-600 mt-2">{STRINGS.summary(categoriesCreated, itemsCreated)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link href="/menu-editor" className="flex-1">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              <PencilRuler className="h-4 w-4" />
              {STRINGS.goToEditor}
            </Button>
          </Link>
          <Button variant="outline" onClick={onImportAnother} className="flex-1 gap-2 text-gray-700">
            <RotateCcw className="h-4 w-4" />
            {STRINGS.importAnother}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
