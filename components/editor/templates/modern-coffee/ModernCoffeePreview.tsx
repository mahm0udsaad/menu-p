"use client"

import React from 'react';
import { useMenuEditor, type MenuItem } from '@/contexts/menu-editor-context';
import ModernCoffeeEditableMenuItem from './ModernCoffeeEditableMenuItem';
import ModernCoffeeMenuSection from './ModernCoffeeMenuSection';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Coffee } from 'lucide-react';

const ModernCoffeePreview = () => {
  const {
    categories,
    restaurant,
    pageBackgroundSettings,
    fontSettings,
    rowStyleSettings,
    appliedRowStyles,
    currentLanguage,
    moveItem,
    handleAddCategory,
  } = useMenuEditor();

  const getPageBackgroundStyle = () => {
    return {
      backgroundImage: `url('/assets/menu-bg.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_');
  const currencySymbol = restaurant?.currency || '$';

  const handleAddCategoryClick = () => {
    handleAddCategory();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollArea className="h-full w-full">
        <div
          id="modern-coffee-preview"
          className="min-h-[1123px] p-8 relative bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200"
          style={getPageBackgroundStyle()}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400 to-transparent rounded-full opacity-30 -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-400 to-transparent rounded-full opacity-20 translate-y-48 -translate-x-48"></div>

          {/* Modern Coffee Container */}
          <div className="relative w-full min-h-full max-w-4xl mx-auto">
            
            {/* Coffee Bean Decorations */}
            <div className="absolute left-8 top-32 w-32 h-32 opacity-20">
              <div className="w-full h-full bg-amber-800 rounded-full relative">
                <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
              </div>
            </div>
            <div className="absolute left-16 bottom-32 w-24 h-24 opacity-15">
              <div className="w-full h-full bg-amber-800 rounded-full relative">
                <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
              </div>
            </div>

            {/* Menu Header */}
            <div className="text-left mb-12 relative">
              <div className="mb-8">
                <h1 
                  className="text-4xl font-bold text-gray-900 mb-2 tracking-wide"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  {restaurant?.name?.toUpperCase() || "BORCELLE"}
                </h1>
                <p 
                  className="text-lg text-gray-700 font-medium tracking-wider"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  COFFEESHOP
                </p>
              </div>
              <div className="text-right">
                <h2 
                  className="text-8xl font-black text-gray-900 tracking-tight"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  {isArabic ? 'قائمة الطعام' : 'MENU'}
                </h2>
              </div>
            </div>

            {/* Menu Content */}
            <div className="space-y-12">
              {categories?.map((category, index) => (
                <ModernCoffeeMenuSection
                  key={category.id}
                  category={category}
                  index={index}
                  moveItem={(dragIndex: number, hoverIndex: number) => 
                    moveItem(category.id, dragIndex, hoverIndex)
                  }
                  fontSettings={fontSettings}
                  rowStyleSettings={rowStyleSettings}
                  appliedRowStyles={appliedRowStyles}
                  currentLanguage={currentLanguage}
                />
              ))}

              {/* Create New Category Button */}
              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleAddCategoryClick}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {isArabic ? 'إضافة قسم جديد' : 'Create a New Category'}
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
                <p 
                  className="text-gray-700 font-medium"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  {isArabic ? 'متاح من' : 'Available at'}
                </p>
                <p 
                  className="text-gray-900 font-bold text-lg"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  9:00 am - 10:00 pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DndProvider>
  );
};

export default ModernCoffeePreview; 