import React from 'react';
import { Eye, Download, ExternalLink, Trash2, Plus, CheckCircle, QrCode, Palette, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PDFPreview from '@/components/pdf-preview';
import QrCardGenerator from '@/components/qr-card-generator';
import { qrCardTemplates } from '@/components/qr-card-templates';
import { QrTemplateExampleCard } from '@/components/qr-card-template-preview';
import pdfTemplateMetadata from '@/data/pdf-templates-metadata.json';

// Types
interface PublishedQrCard {
  id: string;
  card_name: string;
  pdf_url: string;
  qr_code_url: string;
  custom_text: string;
  card_options: any;
  created_at: string;
}

interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
}

interface QrCardTabProps {
  publishedQrCards: PublishedQrCard[];
  restaurant: Restaurant;
  handleDeleteQrCard: (id: string, pdfUrl: string) => void;
  getMenuPublicUrl: (id: string) => string;
}

const existingMenuPdfTemplates = Object.values(pdfTemplateMetadata.templates).map((template) => ({
  id: template.id,
  name: template.name,
  category: template.category,
  previewImageUrl: template.previewImageUrl,
}));

const QrCardTab: React.FC<QrCardTabProps> = ({ 
  publishedQrCards, 
  restaurant,
  handleDeleteQrCard,
  getMenuPublicUrl
}) => {
  return (
    <div className="space-y-6">
      {/* Existing QR Cards */}
      {publishedQrCards.length > 0 && (
        <Card className="rounded-[18px] border-[#e8ded2] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[#2f2923]">
              <QrCode className="h-5 w-5 text-[#b03a2e]" />
              بطاقات QR المنشورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedQrCards.map((card) => (
                  <div key={card.id} className="overflow-hidden rounded-[16px] border border-[#e8ded2] bg-white shadow-sm transition-shadow hover:shadow-md">
                    {/* PDF Preview for QR Cards */}
                    <div className="relative group cursor-pointer">
                      <PDFPreview 
                        pdfUrl={card.pdf_url}
                        className="border-b border-[#e8ded2]"
                        aspectRatio="aspect-[3/4]" // QR cards are taller
                        maxWidth={250}
                        quality={0.9} // Higher quality for QR cards
                      />
                      
                      {/* QR Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-[#143229] text-white text-xs">QR Card</Badge>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-[#463d35]">معاينة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[#2f2923] text-sm line-clamp-1">{card.card_name}</h3>
                        <Badge className="bg-[#eef9f2] text-[#2f8f5b] border-[#bfe0cd] text-xs">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          نشط
                        </Badge>
                      </div>
                      <p className="text-xs text-[#827466] mb-2 line-clamp-2">{card.custom_text}</p>
                      <p className="text-xs text-[#827466] mb-3">
                        تم النشر في {new Date(card.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-[10px] border-[#d9cbb9] text-xs text-[#463d35] hover:bg-[#f7f2ed]"
                          asChild
                        >
                          <a href={card.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3 ml-1" />
                            تحميل PDF
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-[10px] border-[#d9cbb9] text-xs text-[#463d35] hover:bg-[#f7f2ed]"
                          asChild
                        >
                          <a href={card.qr_code_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 ml-1" />
                            عرض القائمة
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-[10px] border-[#e4c7c2] text-[#b03a2e] hover:bg-[#fff3f1]"
                          onClick={() => handleDeleteQrCard(card.id, card.pdf_url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New QR Card */}
      <Card className="rounded-[18px] border-[#e8ded2] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#2f2923]">
            <Plus className="h-5 w-5 text-[#b03a2e]" />
            إنشاء بطاقة QR جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[16px] border border-[#e8ded2] bg-[#fbf8f4] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#463d35]">
              <Palette className="h-4 w-4 text-[#b03a2e]" />
              قوالب بطاقات QR المتاحة
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {qrCardTemplates.map((template) => (
                <QrTemplateExampleCard
                  key={template.id}
                  templateId={template.id}
                  name={template.name}
                  restaurantName={restaurant.name}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[16px] border border-[#e8ded2] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#463d35]">
                <FileText className="h-4 w-4 text-[#b03a2e]" />
                قوالب القوائم الموجودة في المشروع
              </div>
              <span className="rounded-full bg-[#f4eee7] px-3 py-1 text-xs font-bold text-[#7a4a2b]">
                {existingMenuPdfTemplates.length} قالب PDF
              </span>
            </div>
            <p className="mb-4 text-xs leading-5 text-[#827466]">
              هذه قوالب PDF للقائمة نفسها، وليست قوالب بطاقة QR. نعرضها هنا حتى لا تضيع القوالب القديمة أثناء تصميم بطاقة QR.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              {existingMenuPdfTemplates.map((template) => (
                <div key={template.id} className="overflow-hidden rounded-[14px] border border-[#e2d3c1] bg-[#fbf8f4]">
                  <div className="aspect-[3/4] bg-[#f4eee7]">
                    <img
                      src={template.previewImageUrl || "/placeholder.svg?height=220&width=160"}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 p-2">
                    <div className="truncate text-xs font-bold text-[#2f2923]">{template.name}</div>
                    <div className="truncate text-[11px] text-[#827466]">{template.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <QrCardGenerator 
            restaurant={restaurant}
            menuPublicUrl={getMenuPublicUrl(restaurant.id)}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {publishedQrCards.length === 0 && (
        <Card className="rounded-[18px] border-[#e8ded2] bg-white shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#f4eee7] rounded-[18px] flex items-center justify-center">
                <QrCode className="h-8 w-8 text-[#b03a2e]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2f2923] mb-2">لا توجد بطاقات QR منشورة</h3>
              <p className="text-[#6f6257] mb-4">ابدأ بإنشاء بطاقة QR الأولى لمطعمك</p>
              <p className="text-sm text-[#827466] mb-6">
                بطاقات QR تساعد عملائك في الوصول السريع لقائمتك الرقمية
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QrCardTab; 
