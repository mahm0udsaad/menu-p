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
  dietary_info?: string[];
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
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-SemiBold.ttf', fontWeight: 600 },
  ]
});

Font.register({
  family: 'OpenSans',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans-SemiBold.ttf', fontWeight: 600 },
  ]
});

const createStyles = (appliedFontSettings?: any) => StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    fontSize: 12,
    backgroundColor: '#ffffff',
    padding: 30,
  },
  
  // Main container with semi-transparent overlay - matches ModernPreview
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    minHeight: '100%',
    maxWidth: 672, // max-w-2xl
    margin: '0 auto',
    overflow: 'hidden',
  },
  
  // Header - matches ModernPreview
  header: {
    textAlign: 'center',
    padding: 32,
    borderBottom: '2px solid #e5e7eb',
    backgroundColor: 'transparent',
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    objectFit: 'cover',
    margin: '0 auto',
  },
  
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    letterSpacing: 1.6,
    fontFamily: appliedFontSettings?.arabic?.font?.replace(/\s/g, '_') || 'Cairo',
  },
  
  // Categories section - matches ModernPreview
  categoriesContainer: {
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
  
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  
  categoryTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1f2937',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    borderBottom: '1px solid #d1d5db',
    paddingBottom: 8,
    fontFamily: appliedFontSettings?.arabic?.font?.replace(/\s/g, '_') || 'Cairo',
  },
  
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  
  // Menu item - matches ModernEditableMenuItem structure
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
  },
  
  itemContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  itemLeft: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 18,
    fontWeight: 500,
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: appliedFontSettings?.arabic?.font?.replace(/\s/g, '_') || 'Cairo',
  },
  
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: 4,
    fontFamily: appliedFontSettings?.arabic?.font?.replace(/\s/g, '_') || 'Cairo',
  },
  
  featuredBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
  },
  
  dietaryInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  
  dietaryTag: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  
  itemPrice: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
    marginLeft: 16,
    fontFamily: appliedFontSettings?.arabic?.font?.replace(/\s/g, '_') || 'Cairo',
  },
});

// Helper function to format price
const formatPrice = (price: number, currency: string = '$', isRTL: boolean = true): string => {
  if (isRTL) {
    return `${currency} ${price.toFixed(2)}`;
  }
  return `${price.toFixed(2)} ${currency}`;
};

// Helper function to filter valid items
const getValidItems = (items: MenuItem[]): MenuItem[] => {
  return items.filter(item => 
    item && 
    item.name && 
    item.is_available && 
    item.price !== null && 
    item.price !== undefined &&
    !isNaN(Number(item.price))
  );
};

export const ModernPdf = ({ 
  restaurant, 
  categories, 
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: { 
  restaurant: Restaurant; 
  categories: MenuCategory[];
  appliedFontSettings?: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  };
  appliedPageBackgroundSettings?: PageBackgroundSettings;
  appliedRowStyles?: RowStyleSettings;
  currentLanguage?: string;
}) => {
  const styles = createStyles(appliedFontSettings);
  const isArabic = currentLanguage === 'ar';
  const currencySymbol = restaurant?.currency || '$';

  // Filter valid categories
  const validCategories = categories.filter((category) =>
    category &&
    category.id &&
    category.name &&
    category.menu_items &&
    Array.isArray(category.menu_items) &&
    getValidItems(category.menu_items).length > 0
  );

  if (validCategories.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <Text style={styles.title}>لا توجد عناصر متاحة في القائمة</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header - matches ModernPreview */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {restaurant?.logo_url ? (
                <Image src={restaurant.logo_url} style={styles.logo} />
              ) : (
                <Image src="/assets/menu-header.png" style={styles.logo} />
              )}
            </View>
            
            <Text style={styles.title}>
              {isArabic ? 'قائمة الطعام' : 'MENU'}
            </Text>
          </View>

          {/* Categories - matches ModernPreview */}
          <View style={styles.categoriesContainer}>
            {validCategories.map((category) => {
              const validItems = getValidItems(category.menu_items);
              
              return (
                <View key={category.id} style={styles.categorySection}>
                  {/* Category Title - matches ModernPreview */}
                  <Text style={styles.categoryTitle}>
                    {category.name}
                  </Text>
                  
                  {/* Menu Items - matches ModernEditableMenuItem structure */}
                  <View style={styles.itemsContainer}>
                    {validItems.map((item) => (
                      <View key={item.id} style={styles.menuItem}>
                        <View style={styles.itemContent}>
                          <View style={styles.itemLeft}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={styles.itemName}>
                                {item.name}
                              </Text>
                              {item.is_featured && (
                                <Text style={styles.featuredBadge}>
                                  ⭐
                                </Text>
                              )}
                            </View>
                            
                            {item.description && (
                              <Text style={styles.itemDescription}>
                                {item.description}
                              </Text>
                            )}
                            
                            {/* Dietary Info */}
                            {item.dietary_info && item.dietary_info.length > 0 && (
                              <View style={styles.dietaryInfo}>
                                {item.dietary_info.map((info, idx) => (
                                  <Text key={idx} style={styles.dietaryTag}>
                                    {info}
                                  </Text>
                                ))}
                              </View>
                            )}
                          </View>

                          {/* Price */}
                          <Text style={styles.itemPrice}>
                            {formatPrice(item.price, currencySymbol, isArabic)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
}; 