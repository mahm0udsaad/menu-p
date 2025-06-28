import React from 'react';
import { Eye, Download, ExternalLink, Trash2, Plus, CheckCircle, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import PDFPreview from '@/components/pdf-preview';
import QrCardGenerator from '@/components/qr-card-generator';
import Link from 'next/link';

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

const QrCardTab: React.FC<QrCardTabProps> = ({ 
  publishedQrCards, 
  restaurant,
  handleDeleteQrCard,
  getMenuPublicUrl
}) => {
  return (
    <TabsContent value="qr-cards" className="space-y-6">
      {/* Existing QR Cards */}
      {publishedQrCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-red-600" />
              بطاقات QR المنشورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedQrCards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {/* PDF Preview for QR Cards */}
                    <div className="relative group cursor-pointer">
                      <PDFPreview 
                        pdfUrl={card.pdf_url}
                        className="border-b border-gray-200"
                        aspectRatio="aspect-[3/4]" // QR cards are taller
                        maxWidth={250}
                        quality={0.9} // Higher quality for QR cards
                      />
                      
                      {/* QR Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-600 text-white text-xs">QR Card</Badge>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600">معاينة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{card.card_name}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          نشط
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{card.custom_text}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        تم النشر في {new Date(card.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
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
                          className="flex-1 text-xs"
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
                          className="text-red-600 hover:bg-red-50"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-red-600" />
            إنشاء بطاقة QR جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QrCardGenerator 
            restaurant={restaurant}
            menuPublicUrl={getMenuPublicUrl(restaurant.id)}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {publishedQrCards.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بطاقات QR منشورة</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء بطاقة QR الأولى لمطعمك</p>
              <p className="text-sm text-gray-500 mb-6">
                بطاقات QR تساعد عملائك في الوصول السريع لقائمتك الرقمية
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};

export default QrCardTab; 