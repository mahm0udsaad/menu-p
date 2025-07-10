import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { RowStyleSettings, PageBackgroundSettings } from "@/contexts/menu-editor-context";

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


// Helper function to detect text direction (RTL for Arabic)
const getTextDirection = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? 'rtl' : 'ltr';
};

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
  background_image_url?: string;
}

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  website?: string;
  color_palette?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Helper functions - defined before they're used
const getFontFamily = (isRTL: boolean, appliedFontSettings?: {
  arabic: { font: string; weight: string };
  english: { font: string; weight: string };
}) => {
  if (!appliedFontSettings) return "Cairo";
  
  const fontSettings = isRTL ? appliedFontSettings.arabic : appliedFontSettings.english;
  switch (fontSettings.font) {
    case 'cairo': return 'Cairo';
    case 'amiri': return 'Amiri';
    case 'almarai': return 'Almarai';
    case 'noto-kufi': return 'NotoKufiArabic';
    case 'open-sans': return 'Open Sans';
    case 'roboto': return 'Roboto';
    default: return 'Cairo';
  }
};

const getPageBackgroundStyle = (appliedPageBackgroundSettings?: PageBackgroundSettings) => {
  if (appliedPageBackgroundSettings) {
    if (appliedPageBackgroundSettings.backgroundType === 'gradient') {
      return { backgroundColor: appliedPageBackgroundSettings.gradientFrom };
    }
    if (appliedPageBackgroundSettings.backgroundType === 'image') {
      // Don't apply background for images - they need to be rendered as Image components
      return {};
    }
    return { backgroundColor: appliedPageBackgroundSettings.backgroundColor };
  }
  return { backgroundColor: "#ffffff" };
};

// Improved styles with better proportions and spacing
const createStyles = (appliedFontSettings?: any, appliedPageBackgroundSettings?: any) => StyleSheet.create({
  page: {
    fontFamily: getFontFamily(true, appliedFontSettings),
    fontSize: 12,
  },
  pageWithBackground: {
    position: 'relative',
  },
  backgroundImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  documentContainer: {
    padding: 20,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  // Header styling - more compact
  header: {
    textAlign: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    objectFit: "cover",
    marginBottom: 8,
  },
  logoText: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 60,
    fontFamily: "Cairo",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Cairo",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Cairo",
  },
  tagline: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Cairo",
  },
  // Category styling - more compact
  categoryContainer: {
    marginBottom: 20,
    pageBreakInside: "avoid",
  },
  categoryHeader: {
    marginBottom: 12,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  categoryHeaderNoImage: {
    marginBottom: 12,
    height: 80,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  categoryGradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  categoryGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  categoryBackgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  categoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  categoryTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
    marginBottom: 6,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  categoryTitleNoImage: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
    marginBottom: 6,
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  categoryDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#ffffff",
    borderRadius: 1,
    alignSelf: "center",
  },
  categoryDividerNoImage: {
    width: 60,
    height: 2,
    backgroundColor: "#ffffff",
    borderRadius: 1,
    alignSelf: "center",
  },
  // Menu items styling - properly defined
  itemContainer: {
    marginBottom: 12,
    padding: 10,
    pageBreakInside: "avoid",
  },
  itemRowLTR: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemRowRTL: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemContentLTR: {
    flex: 1,
    paddingRight: 16,
  },
  itemContentRTL: {
    flex: 1,
    paddingLeft: 16,
  },
  featuredContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  featuredBadge: {
    fontSize: 10,
    color: "#f59e0b",
    marginRight: 4,
  },
  itemNameLTR: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
    fontFamily: "Cairo",
    lineHeight: 1.3,
  },
  itemNameRTL: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
    lineHeight: 1.3,
  },
  itemDescriptionLTR: {
    fontSize: 11,
    lineHeight: 1.4,
    textAlign: "left",
    fontFamily: "Cairo",
  },
  itemDescriptionRTL: {
    fontSize: 11,
    lineHeight: 1.4,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
  },
  priceContainer: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  priceBox: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Cairo",
    textAlign: "center",
  },
  // Footer styling - more compact
  footer: {
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footerSection: {
    width: "30%",
    paddingHorizontal: 8,
  },
  footerTitle: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Cairo",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 3,
  },
  footerText: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
    textAlign: "center",
    fontFamily: "Cairo",
    lineHeight: 1.3,
  },
  footerNote: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Cairo",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  // Page break indicator
  pageBreakIndicator: {
    marginVertical: 20,
    position: "relative",
    alignItems: "center",
  },
  pageBreakLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#3b82f6",
    borderStyle: "dashed",
  },
  pageBreakText: {
    position: "absolute",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 10,
    color: "#3b82f6",
    fontWeight: "500",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
})

const MenuSectionPDF = ({
  title,
  sectionData,
  colorPalette,
  appliedFontSettings,
  styles,
  appliedRowStyles,
}: {
  title: string
  sectionData: MenuCategory
  colorPalette?: Restaurant['color_palette']
  appliedFontSettings?: any
  styles: any
  appliedRowStyles?: RowStyleSettings
}) => {
  const primaryColor = colorPalette?.primary || '#10b981'

  // Safety checks
  if (!sectionData || !sectionData.menu_items || !Array.isArray(sectionData.menu_items)) {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>No items available</Text>
      </View>
    )
  }

  const safeColorPalette = colorPalette || {
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399"
  }

  // Filter valid items
  const validItems = sectionData.menu_items.filter((item) =>
    item &&
    item.id &&
    item.name &&
    item.is_available &&
    item.price !== null &&
    typeof item.price === 'number'
  )

  if (validItems.length === 0) {
    return (
      <View style={styles.categoryContainer}>
        <View style={[styles.categoryHeader, { borderLeftColor: safeColorPalette.primary }]}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={[styles.categoryDivider, { backgroundColor: safeColorPalette.primary }]} />
        </View>
        <Text style={styles.itemDescriptionLTR}>No available items in this category</Text>
      </View>
    )
  }

  const titleIsRTL = getTextDirection(title) === 'rtl'

  return (
    <View style={styles.categoryContainer} wrap={false}>
      {sectionData.background_image_url ? (
        <View style={[styles.categoryHeader, { borderLeftColor: safeColorPalette.primary }]}>
          <Image src={sectionData.background_image_url} style={styles.categoryBackgroundImage} />
          <View style={styles.categoryOverlay}>
            <Text style={[
              styles.categoryTitle, 
              titleIsRTL ? { fontFamily: getFontFamily(true, appliedFontSettings) } : { fontFamily: getFontFamily(false, appliedFontSettings) }
            ]}>
              {title}
            </Text>
            <View style={styles.categoryDivider} />
          </View>
        </View>
      ) : (
        <View style={styles.categoryHeaderNoImage}>
          <View 
            style={[
              styles.categoryGradientBackground,
              { backgroundColor: safeColorPalette.primary }
            ]} 
          />
          <View style={styles.categoryGradientOverlay}>
            <Text style={[
              styles.categoryTitleNoImage, 
              titleIsRTL ? { fontFamily: getFontFamily(true, appliedFontSettings) } : { fontFamily: getFontFamily(false, appliedFontSettings) }
            ]}>
              {title}
            </Text>
            <View style={styles.categoryDividerNoImage} />
          </View>
        </View>
      )}

      {validItems.map((item) => {
        const itemIsRTL = getTextDirection(item.name) === 'rtl'
        const descriptionIsRTL = item.description ? getTextDirection(item.description) === 'rtl' : itemIsRTL

        const itemContainerStyle = [
          styles.itemContainer,
          appliedRowStyles?.backgroundType === 'solid' ? { backgroundColor: appliedRowStyles.backgroundColor } : {},
          appliedRowStyles?.border ? {
            borderWidth: 1,
            borderColor: appliedRowStyles.borderColor,
            borderRadius: appliedRowStyles.borderRadius,
          } : {}
        ];

        return (
          <View key={item.id} style={itemContainerStyle} wrap={false}>
            <View style={itemIsRTL ? styles.itemRowRTL : styles.itemRowLTR}>
              <View style={itemIsRTL ? styles.itemContentRTL : styles.itemContentLTR}>
                {item.is_featured && (
                  <View style={[styles.featuredContainer, itemIsRTL ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                    <Text style={styles.featuredBadge}>⭐</Text>
                    <Text style={[styles.featuredBadge, { fontSize: 10 }]}>مميز</Text>
                  </View>
                )}
                <Text style={{
                  ...(itemIsRTL ? styles.itemNameRTL : styles.itemNameLTR),
                  color: appliedRowStyles?.itemColor,
                  fontFamily: getFontFamily(itemIsRTL, appliedFontSettings),
                }}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={{
                    ...(itemIsRTL ? styles.itemDescriptionRTL : styles.itemDescriptionLTR),
                    color: appliedRowStyles?.descriptionColor,
                    fontFamily: getFontFamily(itemIsRTL, appliedFontSettings),
                  }}>
                    {item.description}
                  </Text>
                )}
              </View>
              
              <View style={styles.priceContainer}>
                <View style={[styles.priceBox, { borderColor: safeColorPalette.secondary, backgroundColor: `${safeColorPalette.secondary}20` }]}>
                  <Text style={{
                    ...styles.priceText,
                    color: appliedRowStyles?.priceColor,
                  }}>
                    ${item.price!.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export const CafeMenuPDF = ({ 
  restaurant, 
  categories, 
  qrCodeUrl, 
  showQrCode = false,
  pageBreaks = [] as number[],
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles
}: { 
  restaurant: Restaurant; 
  categories: MenuCategory[];
  qrCodeUrl?: string;
  showQrCode?: boolean;
  pageBreaks?: number[];
  appliedFontSettings?: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  };
  appliedPageBackgroundSettings?: PageBackgroundSettings;
  appliedRowStyles?: RowStyleSettings;
}) => {
  // Create styles with the applied settings
  const styles = createStyles(appliedFontSettings, appliedPageBackgroundSettings)
  const pageBackgroundStyle = getPageBackgroundStyle(appliedPageBackgroundSettings)

  // Safety checks
  if (!restaurant || !restaurant.name) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.documentContainer}>
            <Text style={styles.title}>خطأ: بيانات المطعم غير متوفرة</Text>    
          </View>
        </Page>
      </Document>
    )
  }

  if (!categories || !Array.isArray(categories)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.documentContainer}>
            <Text style={styles.title}>خطأ: فئات القائمة غير متوفرة</Text>      
          </View>
        </Page>
      </Document>
    )
  }

  const safeColorPalette = restaurant.color_palette || {
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399"
  }

  // Filter valid categories with items
  const validCategories = categories.filter((category) =>
    category &&
    category.id &&
    category.name &&
    category.menu_items &&
    Array.isArray(category.menu_items) &&
    category.menu_items.some((item) => 
      item &&
      item.id &&
      item.name &&
      item.is_available &&
      item.price !== null &&
      typeof item.price === 'number'
    )
  )

  if (validCategories.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.documentContainer}>
            <Text style={styles.title}>لا توجد عناصر متاحة في القائمة</Text>  
          </View>
        </Page>
      </Document>
    )
  }

  return (
    <Document>
      <Page size="A4" style={[
        styles.page, 
        pageBackgroundStyle, 
        { fontFamily: getFontFamily(true, appliedFontSettings) }
      ]}>
        {/* Background Image Layer - Uses fixed to appear on all pages */}
        {appliedPageBackgroundSettings?.backgroundType === 'image' && appliedPageBackgroundSettings.backgroundImage && (
          <View fixed style={{
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
          }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              src={appliedPageBackgroundSettings.backgroundImage}
            />
          </View>
        )}
        
        {/* Content Layer */}
        <View style={styles.documentContainer}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: safeColorPalette.primary }]} wrap={false}>
            <View style={styles.logoContainer}>
              {restaurant.logo_url ? (
                <Image src={restaurant.logo_url} style={styles.logoImage} />
              ) : (
                <Text style={[styles.logoText, { backgroundColor: safeColorPalette.primary }]}>
                  {restaurant.name.substring(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={[styles.title, { color: safeColorPalette.primary }]}>
              {restaurant.name}
            </Text>
            <Text style={styles.subtitle}>Fine Dining & Artisan Coffee</Text>
            <Text style={styles.tagline}>Est. 2018 | Farm to Table | Locally Sourced</Text>
          </View>

          {/* Categories */}
          {validCategories.map((category) => (
            <MenuSectionPDF
              key={category.id}
              title={category.name}
              sectionData={category}
              colorPalette={safeColorPalette}
              appliedFontSettings={appliedFontSettings}
              styles={styles}
              appliedRowStyles={appliedRowStyles}
            />
          ))}

          {/* Footer */} 
          <View style={[styles.footer, { borderTopColor: safeColorPalette.primary }]} wrap={false}>
            <View style={styles.footerContent}>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>Hours</Text>
                <Text style={styles.footerText}>Monday - Thursday: 7:00 AM - 9:00 PM</Text>
                <Text style={styles.footerText}>Friday - Saturday: 7:00 AM - 10:00 PM</Text>
                <Text style={styles.footerText}>Sunday: 8:00 AM - 8:00 PM</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>Location</Text>
                <Text style={styles.footerText}>425 Heritage Boulevard</Text>
                <Text style={styles.footerText}>Downtown Arts District</Text>
                <Text style={styles.footerText}>Reservations: (555) 234-5678</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>Notes</Text>
                <Text style={styles.footerText}>Gluten-free options available</Text>
                <Text style={styles.footerText}>Locally sourced ingredients</Text>
                <Text style={styles.footerText}>18% gratuity added to parties of 6+</Text>
              </View>
            </View>
            
            <Text style={styles.footerNote}>
              Please inform your server of any allergies or dietary restrictions
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}