import React from 'react';
import { Eye, Download, ExternalLink, Trash2, Plus, CheckCircle, MenuIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import PDFPreview from '@/components/pdf-preview';
import Link from 'next/link';

// Types
interface Menu {
  id: string;
  menu_name: string;
  pdf_url: string;
  created_at: string;
}

interface MenuTabProps {
  publishedMenus: Menu[];
  getMenuPublicUrl: (id: string) => string;
  handleDeleteMenu: (id: string, pdfUrl: string) => void;
}

// Updated Menu Component with WhatsApp-style previews
const MenuTabWithPreviews: React.FC<MenuTabProps> = ({ 
  publishedMenus, 
  getMenuPublicUrl, 
  handleDeleteMenu 
}) => {
  return (
    <TabsContent value="menus" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MenuIcon className="h-5 w-5 text-red-600" />
            القوائم المنشورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publishedMenus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedMenus.map((menu) => (
                  <div key={menu.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {/* WhatsApp-style PDF Preview */}
                    <div className="relative group cursor-pointer">
                      <PDFPreview 
                        pdfUrl={menu.pdf_url}
                        className="border-b border-gray-200"
                      />
                      
                      {/* PDF Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-600 text-white text-xs">PDF</Badge>
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
                    
                    {/* Menu Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{menu.menu_name}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          نشط
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        تم النشر في {new Date(menu.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          asChild
                        >
                          <a href={menu.pdf_url} target="_blank" rel="noopener noreferrer">
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
                          <a href={getMenuPublicUrl(menu.id)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 ml-1" />
                            عرض القائمة
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteMenu(menu.id, menu.pdf_url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MenuIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد قوائم منشورة</h3>
                <p className="text-gray-600 mb-4">ابدأ بإنشاء قائمتك الأولى</p>
                <Link href="/menu-editor">
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    إنشاء قائمة جديدة
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default MenuTabWithPreviews;