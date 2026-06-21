import React from "react"
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react"

import PDFPreview from "@/components/pdf-preview"
import QrCardGenerator, { type QrPublishedMenu } from "@/components/qr-card-generator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PublishedQrCard {
  id: string
  card_name: string
  pdf_url: string
  qr_code_url: string
  custom_text: string
  card_options: unknown
  created_at: string
}

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
}

interface QrCardTabProps {
  publishedQrCards: PublishedQrCard[]
  publishedMenus: QrPublishedMenu[]
  restaurant: Restaurant
  initialMenuId?: string
  handleDeleteQrCard: (id: string, pdfUrl: string) => void
}

export default function QrCardTab({
  publishedQrCards,
  publishedMenus,
  restaurant,
  initialMenuId,
  handleDeleteQrCard,
}: QrCardTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[#171513] text-white">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#211e1b]">إنشاء بطاقة جديدة</h2>
            <p className="mt-1 text-sm text-[#746c66]">
              اختر القائمة، أضف شعارك ونصك، ثم حمّل ملفاً جاهزاً للطباعة.
            </p>
          </div>
        </div>

        <QrCardGenerator
          restaurant={restaurant}
          publishedMenus={publishedMenus}
          initialMenuId={initialMenuId}
        />
      </section>

      <section className="border-t border-[#e4dfda] pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#211e1b]">البطاقات المحفوظة</h2>
            <p className="mt-1 text-sm text-[#746c66]">حمّل أو اختبر أي بطاقة سبق إنشاؤها.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-[#d8d1ca] bg-white px-3 py-1 text-[#5f5751]">
            {publishedQrCards.length} بطاقة
          </Badge>
        </div>

        {publishedQrCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publishedQrCards.map((card) => (
              <article
                key={card.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-[#e4dfda] bg-white"
              >
                <div className="relative bg-[#f3f0ed] p-4">
                  <PDFPreview
                    pdfUrl={card.pdf_url}
                    className="overflow-hidden rounded-[var(--radius-md)] border border-[#ded8d1]"
                    aspectRatio="aspect-[3/4]"
                    maxWidth={260}
                    quality={0.9}
                  />
                  <Badge className="absolute right-6 top-6 rounded-full bg-[#171513] text-white">
                    <QrCode className="ml-1 h-3 w-3" />
                    QR
                  </Badge>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#211e1b]">{card.card_name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7b736d]">{card.custom_text}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2d7b57]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      نشط
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] text-[#938b84]">
                    {new Date(card.created_at).toLocaleDateString("ar-EG")}
                  </p>

                  <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Button variant="outline" size="sm" className="rounded-[var(--radius-md)]" asChild>
                      <a href={card.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="ml-1.5 h-3.5 w-3.5" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-[var(--radius-md)]" asChild>
                      <a href={card.qr_code_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        اختبار
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-[var(--radius-md)] border-[#e5c8c3] text-[#a53b32] hover:bg-[#fff3f1]"
                      aria-label={`حذف ${card.card_name}`}
                      onClick={() => handleDeleteQrCard(card.id, card.pdf_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[#d8d1ca] bg-white px-6 py-10 text-center">
            <QrCode className="mx-auto h-7 w-7 text-[#9c938b]" />
            <p className="mt-3 text-sm font-semibold text-[#554e48]">لا توجد بطاقات محفوظة بعد</p>
            <p className="mt-1 text-xs text-[#8d857e]">أول بطاقة تنشئها ستظهر هنا.</p>
          </div>
        )}
      </section>
    </div>
  )
}
