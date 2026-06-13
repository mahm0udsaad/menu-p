import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Download, ExternalLink, Trash2, Plus, CheckCircle, MenuIcon, Languages, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PDFPreview from '@/components/pdf-preview';
import MenuTranslationDrawer from '@/components/menu-translation-drawer';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// Types
interface Menu {
  id: string;
  menu_name: string;
  pdf_url: string;
  created_at: string;
  language_code?: string;
  restaurant_id: string;
  is_primary_version?: boolean;
}

interface GroupedMenu {
  id: string;
  menu_name: string;
  pdf_url: string;
  created_at: string;
  restaurant_id: string;
  language_versions: Menu[];
  primary_version: Menu;
}

interface MenuLanguageVersion {
  id: string;
  language: string;
  menu_name: string;
}

interface MenuTabProps {
  publishedMenus: Menu[];
  getMenuPublicUrl: (id: string) => string;
  handleDeleteMenu: (id: string, pdfUrl: string) => void;
}

// Updated Menu Component with language indicators  
const MenuTabWithPreviews: React.FC<MenuTabProps> = ({ 
  publishedMenus, 
  getMenuPublicUrl, 
  handleDeleteMenu 
}) => {
  const [showTranslationDrawer, setShowTranslationDrawer] = useState(false);
  const [selectedMenuForTranslation, setSelectedMenuForTranslation] = useState<Menu | null>(null);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);

  // Group menus by menu_name and restaurant_id to avoid duplicates
  const groupedMenus = useMemo(() => {
    const grouped: { [key: string]: GroupedMenu } = {};
    
    publishedMenus.forEach(menu => {
      const groupKey = `${menu.restaurant_id}-${menu.menu_name}`;
      
      if (!grouped[groupKey]) {
        // Find the primary version (Arabic or first one)
        const primaryVersion = publishedMenus.find(m => 
          m.restaurant_id === menu.restaurant_id && 
          m.menu_name === menu.menu_name && 
          (m.is_primary_version || m.language_code === 'ar')
        ) || menu;
        
        grouped[groupKey] = {
          id: primaryVersion.id,
          menu_name: menu.menu_name,
          pdf_url: primaryVersion.pdf_url,
          created_at: primaryVersion.created_at,
          restaurant_id: menu.restaurant_id,
          language_versions: [],
          primary_version: primaryVersion
        };
      }
      
      // Add this menu to the language versions
      grouped[groupKey].language_versions.push(menu);
    });
    
    return Object.values(grouped);
  }, [publishedMenus]);

  // Get language flag and name helper
  const getLanguageInfo = (langCode: string) => {
    const languageMap: { [key: string]: { flag: string; name: string; nativeName: string } } = {
      'ar': { flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
      'en': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
      'fr': { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
      'es': { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' }
    };
    return languageMap[langCode] || { flag: '🌐', name: langCode, nativeName: langCode };
  };

  const handleAddLanguage = async (menu: GroupedMenu) => {
    try {
      console.log('Add Language clicked for menu:', menu.id, 'restaurant:', menu.restaurant_id);
      
      if (!menu.restaurant_id) {
        console.error('No restaurant_id found for menu:', menu);
        return;
      }

      // Fetch menu categories for translation using restaurant_id
      const { data: categories } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          description,
          background_image_url,
          menu_items(
            id,
            name,
            description,
            price,
            image_url,
            is_available,
            is_featured,
            dietary_info
          )
        `)
        .eq('restaurant_id', menu.restaurant_id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      console.log('Categories found:', categories?.length || 0);

      if (categories && categories.length > 0) {
        console.log('Opening translation drawer');
        setMenuCategories(categories);
        setSelectedMenuForTranslation(menu.primary_version);
        setShowTranslationDrawer(true);
      } else {
        console.error('No categories found for restaurant:', menu.restaurant_id);
        alert('لم يتم العثور على فئات قائمة لترجمتها. تأكد من وجود عناصر في قائمتك أولاً.');
      }
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      alert('حدث خطأ أثناء تحميل بيانات القائمة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleTranslationComplete = (translatedCategories: any[], targetLanguage: string) => {
    // Handle successful translation
    console.log('Translation completed for language:', targetLanguage);
    setShowTranslationDrawer(false);
    setSelectedMenuForTranslation(null);
    setMenuCategories([]);
    
    // Refresh language versions
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[18px] border-[#e8ded2] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#2f2923]">
            <MenuIcon className="h-5 w-5 text-[#b03a2e]" />
            القوائم المنشورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupedMenus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMenus.map((menu) => {
                  const languageVersions = menu.language_versions;
                  const hasMultipleLanguages = languageVersions.length > 1;
                  
                  return (
                    <div key={menu.id} className="overflow-hidden rounded-[16px] border border-[#e8ded2] bg-white shadow-sm transition-shadow hover:shadow-md">
                    {/* WhatsApp-style PDF Preview */}
                    <div className="relative group cursor-pointer">
                      <PDFPreview 
                        pdfUrl={menu.pdf_url}
                        className="border-b border-[#e8ded2]"
                      />
                      
                      {/* PDF Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-[#b03a2e] text-white text-xs">PDF</Badge>
                      </div>
                        
                        {/* Language indicator */}
                        {languageVersions.length > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-[#143229] text-white text-xs">
                              <Languages className="h-3 w-3 mr-1" />
                              {languageVersions.length} {languageVersions.length === 1 ? 'لغة' : 'لغات'}
                            </Badge>
                          </div>
                        )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg">
                            <Eye className="h-4 w-4 text-[#463d35]" />
                            <span className="text-sm text-[#463d35]">معاينة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[#2f2923] text-sm line-clamp-1">{menu.menu_name}</h3>
                        <Badge className="bg-[#eef9f2] text-[#2f8f5b] border-[#bfe0cd] text-xs flex-shrink-0">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          نشط
                        </Badge>
                      </div>
                        
                        {/* Language versions display */}
                        {languageVersions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">اللغات المتاحة:</p>
                            <div className="flex flex-wrap gap-1">
                              {languageVersions.map((version: Menu) => (
                                <Badge 
                                  key={version.id} 
                                  variant="outline" 
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {getLanguageInfo(version.language_code || 'ar').flag} {getLanguageInfo(version.language_code || 'ar').nativeName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mb-3">
                          تم النشر في {new Date(menu.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      
                        {/* Actions */}
                        <div className="space-y-2">
                          {/* Primary Actions */}
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
                          
                          {/* Add Language Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            onClick={() => handleAddLanguage(menu)}
                          >
                            <Languages className="h-3 w-3 ml-1" />
                            إضافة لغة جديدة
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* Translation Drawer */}
      {selectedMenuForTranslation && (
        <MenuTranslationDrawer
          isOpen={showTranslationDrawer}
          onClose={() => {
            setShowTranslationDrawer(false);
            setSelectedMenuForTranslation(null);
            setMenuCategories([]);
          }}
          categories={menuCategories}
          onTranslationComplete={handleTranslationComplete}
        />
      )}
    </div>
  );
};

export default MenuTabWithPreviews;
