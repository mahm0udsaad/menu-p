import React from 'react';
import { useMenuEditor } from '@/contexts/menu-editor-context';
import VintageMenuSection from './VintageMenuSection';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScrollArea } from '@/components/ui/scroll-area';

const VintagePreview = () => {
  const {
    categories,
    restaurant,
    pageBackgroundSettings,
    fontSettings,
    rowStyleSettings,
    appliedRowStyles,
    currentLanguage,
  } = useMenuEditor();

  const getPageBackgroundStyle = () => {
    if (!pageBackgroundSettings) {
      return { backgroundColor: '#fdfaf3' };
    }
    switch (pageBackgroundSettings.backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(to bottom right, ${pageBackgroundSettings.gradientFrom}, ${pageBackgroundSettings.gradientTo})`,
        };
      case 'image':
        return {
          backgroundImage: `url(${pageBackgroundSettings.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'solid':
      default:
        return { backgroundColor: pageBackgroundSettings.backgroundColor };
    }
  };

  const middleIndex = Math.ceil(categories.length / 2);
  const leftColumnCategories = categories.slice(0, middleIndex);
  const rightColumnCategories = categories.slice(middleIndex);

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_');
  const headerFontName = isArabic ? 'Cairo' : 'Amiri';
  
  const currencySymbol = restaurant?.currency || '$';

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollArea className="h-full w-full">
        <div
          id="vintage-preview"
          className="p-8 bg-[#fdfaf3] font-serif text-[#3a2d25] min-h-[1123px]" // A4 height approx
          style={{
            ...getPageBackgroundStyle(),
            fontFamily: fontName,
            fontWeight: activeFontSettings.weight,
            color: rowStyleSettings.itemColor || '#3a2d25',
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <header className="text-center mb-12">
            {restaurant?.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt="Logo"
                className="w-20 h-20 mx-auto mb-4 object-contain"
              />
            ) : (
              <img
                src="/assets/menu-header.png"
                alt="Logo"
                className="w-20 h-20 mx-auto mb-4"
              />
            )}
            <h1
              className="text-5xl uppercase"
              style={{
                fontFamily: headerFontName,
                color: '#3a2d25',
              }}
            >
              {restaurant?.name || 'Your Restaurant'}
            </h1>
          </header>

          <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-[48%]">
              {leftColumnCategories.map((category, index) => (
                <VintageMenuSection
                  key={category.id || `cat-${index}`}
                  category={category}
                  currencySymbol={currencySymbol}
                  appliedRowStyles={appliedRowStyles}
                />
              ))}
            </div>
            <div className="w-[48%]">
              {rightColumnCategories.map((category, index) => (
                <VintageMenuSection
                  key={category.id || `cat-${index + middleIndex}`}
                  category={category}
                  currencySymbol={currencySymbol}
                  appliedRowStyles={appliedRowStyles}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DndProvider>
  );
};

export default VintagePreview; 