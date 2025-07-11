import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { PageBackgroundSettings, RowStyleSettings } from "@/contexts/menu-editor-context";

// Define types for better type safety
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  is_featured: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  menu_items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
  currency?: string;
}

// Register local fonts from the public/fonts directory
Font.register({
  family: 'Cairo',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-SemiBold.ttf', fontWeight: 600 },
  ]
});

Font.register({
  family: 'Amiri',
  fonts: [
    { src: '/fonts/AR/Amiri/Amiri-Regular.ttf' },
    { src: '/fonts/AR/Amiri/Amiri-Bold.ttf', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'Almarai',
  fonts: [
    { src: '/fonts/AR/Almarai/Almarai-Regular.ttf' },
    { src: '/fonts/AR/Almarai/Almarai-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Almarai/Almarai-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Almarai/Almarai-ExtraBold.ttf', fontWeight: 800 },
  ],
});

Font.register({
  family: 'NotoKufiArabic',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-ExtraBold.ttf', fontWeight: 800 },
  ]
});

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-ExtraBold.ttf', fontWeight: 800 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Thin.ttf', fontWeight: 100 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Black.ttf', fontWeight: 900 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Italic.ttf', fontStyle: 'italic' },
  ]
});


const getPageBackgroundStyle = (appliedPageBackgroundSettings?: PageBackgroundSettings) => {
  if (!appliedPageBackgroundSettings) {
    return { backgroundColor: '#fdfaf3' };
  }
  
  switch (appliedPageBackgroundSettings.backgroundType) {
    case 'gradient':
      return { backgroundColor: appliedPageBackgroundSettings.gradientFrom };
    case 'image':
      return {}; // Image is handled separately
    case 'solid':
    default:
      return { backgroundColor: appliedPageBackgroundSettings.backgroundColor };
  }
};


const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fdfaf3',
    fontFamily: 'Amiri', // Use Amiri as the default
    fontSize: 10,
    color: '#3a2d25',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentContainer: {
    padding: 40,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    direction: 'ltr', // Keep header LTR for aesthetic reasons
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
    objectFit: 'contain',
  },
  restaurantName: {
    fontFamily: 'Cairo',
    fontSize: 40,
    color: '#3a2d25',
    textTransform: 'uppercase',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  column: {
    width: '48%',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontFamily: 'Cairo',
    fontSize: 18,
    color: '#5a3a2a',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#5a3a2a',
    textTransform: 'uppercase',
  },
  categoryTitleRTL: {
    textAlign: 'right',
  },
  menuItem: {
    marginBottom: 10,
    flexDirection: 'column',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  menuItemHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  menuItemName: {
    fontSize: 11,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  menuItemNameRTL: {
    textAlign: 'right',
  },
  dots: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2d25',
    borderBottomStyle: 'dotted',
    marginHorizontal: 4,
    height: 6, 
  },
  menuItemPrice: {
    fontSize: 11,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
  },
  menuItemDescription: {
    fontSize: 9,
    color: '#6c584c',
    lineHeight: 1.4,
    marginTop: 3,
    paddingLeft: 2, 
  },
  menuItemDescriptionRTL: {
    textAlign: 'right',
    paddingRight: 2,
    paddingLeft: 0,
  },
});

const renderCategory = (category: MenuCategory, currencySymbol: string, appliedRowStyles?: RowStyleSettings, isRTL?: boolean) => {
  const availableItems = category.menu_items?.filter(item => item.is_available) || [];
  if (availableItems.length === 0) return null;

  return (
    <View key={category.id} style={styles.categorySection}>
      <Text style={[styles.categoryTitle, isRTL && styles.categoryTitleRTL]}>{category.name}</Text>
      {availableItems.map((item) => {
        // Build row style based on appliedRowStyles
        const rowStyle: any = { ...styles.menuItem };
        if (appliedRowStyles) {
          if (appliedRowStyles.backgroundType === 'solid') {
            rowStyle.backgroundColor = appliedRowStyles.backgroundColor;
          }
          // Borders
          if (appliedRowStyles.borderTop.enabled) {
            rowStyle.borderTopWidth = appliedRowStyles.borderTop.width;
            rowStyle.borderTopColor = appliedRowStyles.borderTop.color;
          }
          if (appliedRowStyles.borderBottom.enabled) {
            rowStyle.borderBottomWidth = appliedRowStyles.borderBottom.width;
            rowStyle.borderBottomColor = appliedRowStyles.borderBottom.color;
          }
          if (appliedRowStyles.borderLeft.enabled) {
            rowStyle.borderLeftWidth = appliedRowStyles.borderLeft.width;
            rowStyle.borderLeftColor = appliedRowStyles.borderLeft.color;
          }
          if (appliedRowStyles.borderRight.enabled) {
            rowStyle.borderRightWidth = appliedRowStyles.borderRight.width;
            rowStyle.borderRightColor = appliedRowStyles.borderRight.color;
          }
          rowStyle.borderRadius = appliedRowStyles.borderRadius;
        }
        // Text styles
        const nameStyle = [styles.menuItemName, { color: appliedRowStyles?.itemColor }, isRTL && styles.menuItemNameRTL];
        const priceStyle = { ...styles.menuItemPrice, color: appliedRowStyles?.priceColor };
        const descStyle = [styles.menuItemDescription, { color: appliedRowStyles?.descriptionColor }, isRTL && styles.menuItemDescriptionRTL];
        return (
          <View key={item.id} style={rowStyle}>
            <View style={[styles.menuItemHeader, isRTL && styles.menuItemHeaderRTL]}>
              <Text style={nameStyle}>{item.name}</Text>
              <View style={styles.dots} />
              <Text style={priceStyle}>{currencySymbol}{item.price}</Text>
            </View>
            {item.description && (
              <Text style={descStyle}>{item.description}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export const VintagePdf = ({
  restaurant,
  categories,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage,
}: {
  restaurant: Restaurant;
  categories: MenuCategory[];
  appliedPageBackgroundSettings?: PageBackgroundSettings;
  appliedRowStyles?: RowStyleSettings;
  currentLanguage?: string;
}) => {
  if (!restaurant || !categories) {
    return (
      <Document>
        <Page style={styles.page} size="A4">
          <Text>Loading...</Text>
        </Page>
      </Document>
    );
  }

  const isRTL = currentLanguage === 'ar';
  const currencySymbol = restaurant.currency || '$';
  const middleIndex = Math.ceil(categories.length / 2);
  const leftColumnCategories = categories.slice(0, middleIndex);
  const rightColumnCategories = categories.slice(middleIndex);
  const pageBackgroundStyle = getPageBackgroundStyle(appliedPageBackgroundSettings);

  return (
    <Document>
      <Page style={[styles.page, pageBackgroundStyle]} size="A4">
        {appliedPageBackgroundSettings?.backgroundType === 'image' && appliedPageBackgroundSettings.backgroundImage && (
          <Image
            style={styles.backgroundImage}
            src={appliedPageBackgroundSettings.backgroundImage}
            fixed
          />
        )}
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            {restaurant.logo_url ? (
              <Image style={styles.logo} src={restaurant.logo_url} />
            ) : (
              <Image style={styles.logo} src="/assets/menu-header.png" />
            )}
            <Text style={styles.restaurantName}>{restaurant.name || 'Menu'}</Text>
          </View>

          <View style={[styles.columnsContainer, isRTL && styles.columnsContainerRTL]}>
            <View style={styles.column}>
              {leftColumnCategories.map(cat => renderCategory(cat, currencySymbol, appliedRowStyles, isRTL))}
            </View>
            <View style={styles.column}>
              {rightColumnCategories.map(cat => renderCategory(cat, currencySymbol, appliedRowStyles, isRTL))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}; 