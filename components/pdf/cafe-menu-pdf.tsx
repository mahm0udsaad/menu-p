import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Register local Arabic fonts from public/fonts
Font.register({
  family: 'Cairo',
  fonts: [
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Light.ttf', fontWeight: 300 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-SemiBold.ttf', fontWeight: 600 },
  ]
});

Font.register({
  family: 'NotoKufiArabic',
  fonts: [
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Light.ttf', fontWeight: 300 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-SemiBold.ttf', fontWeight: 600 },
  ]
});

// Helper function to detect text direction (RTL for Arabic)
const getTextDirection = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF]/
  return arabicPattern.test(text) ? 'rtl' : 'ltr'
}

// Define types for better type safety
interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  is_available: boolean
  is_featured: boolean
}

interface MenuCategory {
  id: string
  name: string
  menu_items: MenuItem[]
  background_image_url?: string
}

interface Restaurant {
  id: string
  name: string
  logo_url?: string
  address?: string
  phone?: string
  website?: string
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  }
}

// Enhanced styles with color palette support and QR code integration
const styles = StyleSheet.create({
  page: {
    fontFamily: "Cairo",
    backgroundColor: "#ffffff",
    padding: 0,
    margin: 0,
  },
  documentContainer: {
    padding: 20,
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    position: "relative",
  },
  qrCodeContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: "#ffffff",
    padding: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrCodeImage: {
    width: 50,
    height: 50,
  },
  qrCodeLabel: {
    fontSize: 6,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
    fontFamily: "NotoKufiArabic",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    objectFit: "cover",
  },
  logoText: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 80,
    fontFamily: "Cairo",
  },
  title: {
    fontSize: 28,
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
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
    color: "#9ca3af",
    textAlign: "center",
    fontFamily: "Cairo",
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryHeader: {
    position: "relative",
    marginBottom: 15,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
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
    padding: 15,
  },
  categoryTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "NotoKufiArabic",
  },
  categoryDivider: {
    width: 60,
    height: 3,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemWrapper: {
    width: "100%",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 0.5,      
  },
  itemWrapperFull: {
    width: "100%",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 0.5,      
  },
  // Layout for LTR (Left-to-Right) languages
  itemHeaderLTR: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemNameLTR: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "bold",
    flex: 1,
    paddingRight: 8,
    textAlign: "left",
    fontFamily: "Cairo",
  },
  // Layout for RTL (Right-to-Left) languages
  itemHeaderRTL: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemNameRTL: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "bold",
    flex: 1,
    paddingLeft: 8,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  priceDots: {
    width: 15,
    borderBottomColor: "#9ca3af",
    borderBottomWidth: 1,
    borderStyle: "dotted",
    marginHorizontal: 5,
  },
  itemPrice: {
    fontSize: 13,
    color: "#d97706",
    fontWeight: "bold",
    fontFamily: "Cairo",
  },
  itemDescriptionLTR: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.3,
    textAlign: "left",
    fontFamily: "Cairo",
  },
  itemDescriptionRTL: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.3,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    position: "relative",
  },
  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerSection: {
    width: "30%",
  },
  footerTitle: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
    textAlign: "center",
    fontFamily: "Cairo",
  },
  footerNote: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Cairo",
  },
  footerQrSection: {
    position: "absolute",
    bottom: 15,
    right: 15,
    alignItems: "center",
  },
  footerQrCode: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  footerQrText: {
    fontSize: 7,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
  },
})

// Hardcoded section images for PDF generation
const sectionImages = {
  appetizers: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
  mains: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
  beverages: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
}

// Helper to get section image based on category name
const getSectionImage = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase()
  if (lowerCaseName.includes("appetizer") || lowerCaseName.includes("starter") || lowerCaseName.includes("مقبلات")) return sectionImages.appetizers
  if (lowerCaseName.includes("main") || lowerCaseName.includes("أطباق رئيسية")) return sectionImages.mains
  if (lowerCaseName.includes("beverage") || lowerCaseName.includes("coffee") || lowerCaseName.includes("drink") || lowerCaseName.includes("مشروبات"))
    return sectionImages.beverages
  if (lowerCaseName.includes("dessert") || lowerCaseName.includes("حلويات")) return sectionImages.desserts
  return sectionImages.mains // Default fallback
}

// Helper to generate QR code URL
const generateQrCodeUrl = (restaurantId: string, menuUrl?: string) => {
  const baseUrl = menuUrl || `https://menu-p.com/menus/${restaurantId}`
  // Using a QR code service for better PDF compatibility
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}&bgcolor=FFFFFF&color=000000&format=png&margin=10`
}

const MenuSectionPDF = ({
  title,
  sectionData,
  columns = 2,
  colorPalette,
}: {
  title: string
  sectionData: MenuCategory
  columns?: 1 | 2
  colorPalette?: Restaurant['color_palette']
}) => {
  // Safety checks
  if (!sectionData || !sectionData.menu_items || !Array.isArray(sectionData.menu_items)) {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>No items available</Text>
      </View>
    )
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
        <View style={styles.categoryHeader} wrap={false}>
          {/* Use custom background image if available */}
          {sectionData.background_image_url && (
            <Image
              src={sectionData.background_image_url}
              style={styles.categoryBackgroundImage} 
            />
          )}
          <View style={[styles.categoryOverlay, colorPalette ? { backgroundColor: `${colorPalette.primary}90` } : {}]}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <View style={[styles.categoryDivider, colorPalette ? { backgroundColor: colorPalette.accent } : {}]} />
          </View>
        </View>
        <Text style={styles.itemDescriptionLTR}>No available items in this category</Text>
      </View>
    )
  }

  const isRTL = getTextDirection(title) === 'rtl';

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader} wrap={false}>
        {/* Use custom background image if available */}
        {sectionData.background_image_url && (
          <Image
            src={sectionData.background_image_url}
            style={styles.categoryBackgroundImage} 
          />
        )}
        <View style={[styles.categoryOverlay, colorPalette ? { backgroundColor: `${colorPalette.primary}90` } : {}]}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={[styles.categoryDivider, colorPalette ? { backgroundColor: colorPalette.accent } : {}]} />
        </View>
      </View>

      <View style={columns === 2 ? styles.itemsContainer : {}}>
        {validItems.map((item) => {
          const itemIsRTL = getTextDirection(item.name) === 'rtl';
          const ItemWrapper = columns === 2 ? styles.itemWrapper : styles.itemWrapperFull;

          return (
            <View key={item.id} style={ItemWrapper} wrap={false}>
              <View style={itemIsRTL ? styles.itemHeaderRTL : styles.itemHeaderLTR}>
                <Text style={itemIsRTL ? styles.itemNameRTL : styles.itemNameLTR}>
                  {item.is_featured ? `⭐ ${item.name}` : item.name}
                </Text>
                <View style={styles.priceContainer}>
                  <View style={styles.priceDots} />
                                      <Text style={[styles.itemPrice, colorPalette ? { color: colorPalette.secondary } : {}]}>
                      ${item.price!.toFixed(2)}
                    </Text>
                </View>
              </View>
              {item.description && (
                <Text style={getTextDirection(item.description) === 'rtl' ? styles.itemDescriptionRTL : styles.itemDescriptionLTR}>
                  {item.description}
                </Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

export const CafeMenuPDF = ({ 
  restaurant, 
  categories, 
  qrCodeUrl, 
  showQrCode = true 
}: { 
  restaurant: Restaurant; 
  categories: MenuCategory[];
  qrCodeUrl?: string;
  showQrCode?: boolean;
}) => {
  // Safety checks
  if (!restaurant || !restaurant.name) {
    return (
      <Document>
        <Page size="A4" style={styles.page} wrap>
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
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.documentContainer}>
            <Text style={styles.title}>خطأ: فئات القائمة غير متوفرة</Text>      
          </View>
        </Page>
      </Document>
    )
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
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.documentContainer}>
            <Text style={styles.title}>لا توجد عناصر متاحة في القائمة</Text>  
          </View>
        </Page>
      </Document>
    )
  }

  // Generate QR code URL for the menu
  const menuQrCodeUrl = qrCodeUrl || generateQrCodeUrl(restaurant.id, restaurant.website)

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.documentContainer}>
          {/* Header with QR Code */}
          <View style={styles.header}>
            {/* QR Code in top-right corner */}
            {showQrCode && (
              <View style={styles.qrCodeContainer}>
                <Image src={menuQrCodeUrl} style={styles.qrCodeImage} />
                <Text style={styles.qrCodeLabel}>امسح للقائمة</Text>
              </View>
            )}
            
            <View style={styles.logoContainer}>
              {restaurant.logo_url ? (
                <Image src={restaurant.logo_url} style={styles.logoImage} />
              ) : (
                                  <Text style={[styles.logoText, restaurant.color_palette ? { backgroundColor: restaurant.color_palette.primary } : {}]}>
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </Text>
              )}
            </View>
                          <Text style={[styles.title, restaurant.color_palette ? { color: restaurant.color_palette.primary } : {}]}>
                {restaurant.name}
              </Text>
            <Text style={styles.subtitle}>Fine Dining & Artisan Coffee</Text>
            <Text style={styles.tagline}>Est. 2018 | Farm to Table | Locally Sourced</Text>
          </View>

          {/* All Categories - let react-pdf handle page breaks automatically */}
          {validCategories.map((category) => (
            <MenuSectionPDF
              key={category.id}
              title={category.name}
              sectionData={category}
              columns={1}
              colorPalette={restaurant.color_palette}
            />
          ))}

          {/* Footer with contact info and QR code */}
          <View style={styles.footer} wrap={false}>
            <View style={styles.footerGrid}>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>ساعات العمل</Text>
                <Text style={styles.footerText}>السبت - الخميس: 8:00 ص - 10:00 م</Text>
                <Text style={styles.footerText}>الجمعة: 2:00 م - 10:00 م</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>تواصل معنا</Text>
                <Text style={styles.footerText}>{restaurant.phone || "+966 11 123 4567"}</Text>
                <Text style={styles.footerText}>info@restaurant.com</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerTitle}>العنوان</Text>
                <Text style={styles.footerText}>{restaurant.address || "شارع الملك فهد"}</Text>
                <Text style={styles.footerText}>الرياض، المملكة العربية السعودية</Text>
              </View>
            </View>
            
            {/* Small QR code in footer */}
            {showQrCode && (
              <View style={styles.footerQrSection}>
                <Image src={menuQrCodeUrl} style={styles.footerQrCode} />
                <Text style={styles.footerQrText}>قائمة رقمية</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
