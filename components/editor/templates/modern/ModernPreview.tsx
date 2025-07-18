import React from 'react';
import { useMenuEditor, type MenuItem } from '@/contexts/menu-editor-context';
import ModernEditableMenuItem from './ModernEditableMenuItem';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ModernPreview = () => {
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
    // Always use the menu background image for modern template
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
          id="modern-preview"
          className="min-h-[1123px] p-8 relative" // A4 height approx
          style={getPageBackgroundStyle()}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Modern Container with semi-transparent overlay */}
          <div className="relative w-full min-h-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
            
            {/* Simple Header */}
            <header className="text-center p-8 border-b-2 border-gray-200">
              {restaurant?.logo_url ? (
                <div className="inline-block mb-4">
                  <img
                    src={restaurant.logo_url}
                    alt="Logo"
                    className="w-16 h-16 mx-auto object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="inline-block mb-4">
                  <img
                    src="/assets/menu-header.png"
                    alt="Logo"
                    className="w-16 h-16 mx-auto rounded-full"
                  />
                </div>
              )}
              
              <h1 
                className="text-6xl font-bold mb-2 text-gray-800 tracking-wider"
                style={{
                  fontFamily: fontName,
                  fontWeight: activeFontSettings.weight,
                }}
              >
                {isArabic ? 'قائمة الطعام' : 'MENU'}
              </h1>
            </header>

            {/* Categories */}
            <div className="p-8 space-y-10">
              {categories?.map((category, index) => (
                <div key={category.id} className="space-y-4">
                  {/* Category Title */}
                  <h2 
                    className="text-xl font-semibold text-gray-800 tracking-widest uppercase text-center border-b border-gray-300 pb-2"
                    style={{
                      fontFamily: fontName,
                      fontWeight: activeFontSettings.weight,
                    }}
                  >
                    {category.name}
                  </h2>
                  
                  {/* Menu Items */}
                  <div className="space-y-3">
                    {category.menu_items?.map((item: MenuItem, itemIndex: number) => (
                      <ModernEditableMenuItem
                        key={item.id}
                        item={item}
                        index={itemIndex}
                        categoryId={category.id}
                        moveItem={(dragIndex: number, hoverIndex: number) => 
                          moveItem(category.id, dragIndex, hoverIndex)
                        }
                        fontSettings={fontSettings}
                        rowStyleSettings={rowStyleSettings}
                        appliedRowStyles={appliedRowStyles}
                        currentLanguage={currentLanguage}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Create New Category Button */}
              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleAddCategoryClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
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
          </div>
        </div>
      </ScrollArea>
    </DndProvider>
  );
};

export default ModernPreview; 