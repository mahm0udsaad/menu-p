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

// Updated styles to match React component
const styles = StyleSheet.create({
  page: {
    fontFamily: "Cairo",
    backgroundColor: "#f8fafc", // Match React's bg-gray-50
    padding: 0,
    margin: 0,
    minHeight: "100vh",
  },
  documentContainer: {
    maxWidth: 1152, // Match React's max-w-6xl
    marginHorizontal: "auto",
    padding: 32, // Match React's p-8
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  // Header styling to match React component
  header: {
    textAlign: "center",
    marginBottom: 48, // Match React's mb-12
    paddingBottom: 32, // Match React's pb-8
    borderBottomWidth: 2,
    borderBottomColor: "#10b981", // Will be overridden by color palette
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 96, // Match React's w-24 h-24
    height: 96,
    borderRadius: 48,
    objectFit: "cover",
    borderWidth: 0,
    marginBottom: 16,
  },
  logoText: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 24, // Match React's text-2xl
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 96,
    fontFamily: "Cairo", // Match React's font-serif
    marginBottom: 16,
  },
  // Updated title styling to match React
  title: {
    fontSize: 48, // Match React's text-5xl
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 12, // Match React's mb-3
    textAlign: "center",
    fontFamily: "Cairo", // Match React's font-serif
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18, // Match React's text-lg
    color: "#6b7280",
    marginBottom: 8, // Match React's mb-2
    textAlign: "center",
    fontFamily: "Cairo",
    fontStyle: "italic",
  },
  tagline: {
    fontSize: 14, // Match React's text-sm
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Cairo",
  },
  // Main content container to match React's white card
  mainContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8, // Match React's rounded-lg
    padding: 48, // Match React's p-12
    marginBottom: 32,
    // Shadow effect (approximated for PDF)
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  // Category styling to match React component
  categoryContainer: {
    marginBottom: 32, // Increased spacing
    pageBreakInside: "avoid",
  },
  categoryHeader: {
    position: "relative",
    marginBottom: 24,
    height: 120, // Increased height
    borderRadius: 16, // Increased border radius
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  categoryTitle: {
    fontSize: 28, // Increased font size
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "NotoKufiArabic",
    letterSpacing: 0.5,
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  categoryDivider: {
    width: 100, // Increased width
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  // Items container
  itemsContainer: {
    paddingHorizontal: 8,
  },
  itemWrapper: {
    marginBottom: 20, // Increased spacing
    paddingBottom: 20,
    borderBottomColor: "#f3f4f6",
    borderBottomWidth: 1,
    pageBreakInside: "avoid",
  },
  itemWrapperFull: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomColor: "#f3f4f6",
    borderBottomWidth: 1,
    pageBreakInside: "avoid",
  },
  // Enhanced LTR layout
  itemHeaderLTR: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemNameLTR: {
    fontSize: 16, // Slightly larger
    color: "#1f2937",
    fontWeight: "bold",
    flex: 1,
    paddingRight: 16,
    textAlign: "left",
    fontFamily: "Cairo",
    lineHeight: 1.4,
  },
  // Enhanced RTL layout
  itemHeaderRTL: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemNameRTL: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "bold",
    flex: 1,
    paddingLeft: 16,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
    lineHeight: 1.4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "flex-end",
  },
  priceDots: {
    flex: 1,
    maxWidth: 80,
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 1,
    borderStyle: "dotted",
    marginHorizontal: 12,
    height: 1,
  },
  itemPrice: {
    fontSize: 16, // Larger price font
    color: "#d97706",
    fontWeight: "bold",
    fontFamily: "Cairo",
    minWidth: 60,
    textAlign: "right",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemDescriptionLTR: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.5,
    textAlign: "left",
    fontFamily: "Cairo",
    marginTop: 6,
    paddingLeft: 4,
  },
  itemDescriptionRTL: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.5,
    textAlign: "right",
    fontFamily: "NotoKufiArabic",
    marginTop: 6,
    paddingRight: 4,
  },
  featuredBadge: {
    fontSize: 14,
    color: "#f59e0b",
    marginLeft: 6,
    marginRight: 6,
  },
  // Footer styling to match React component
  footer: {
    marginTop: 32,
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  footerSection: {
    width: "30%",
    paddingHorizontal: 12,
  },
  footerTitle: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Cairo", // Match React's font-serif
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Cairo",
    lineHeight: 1.4,
  },
  footerNote: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    fontFamily: "Cairo",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  // Page break indicator (for visual reference)
  pageBreakIndicator: {
    marginVertical: 32,
    position: "relative",
    alignItems: "center",
  },
  pageBreakLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#3b82f6",
    borderStyle: "dashed",
  },
  pageBreakText: {
    position: "absolute",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
})

// Helper to get section image based on category name
const getSectionImage = (categoryName: string) => {
  const sectionImages = {
    appetizers: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    mains: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    beverages: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
  }

  const lowerCaseName = categoryName.toLowerCase()
  if (lowerCaseName.includes("appetizer") || lowerCaseName.includes("starter") || lowerCaseName.includes("مقبلات")) return sectionImages.appetizers
  if (lowerCaseName.includes("main") || lowerCaseName.includes("أطباق رئيسية")) return sectionImages.mains
  if (lowerCaseName.includes("beverage") || lowerCaseName.includes("coffee") || lowerCaseName.includes("drink") || lowerCaseName.includes("مشروبات"))
    return sectionImages.beverages
  if (lowerCaseName.includes("dessert") || lowerCaseName.includes("حلويات")) return sectionImages.desserts
  return sectionImages.mains // Default fallback
}

const MenuSectionPDF = ({
  title,
  sectionData,
  columns = 1,
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
          <Image
            src={sectionData.background_image_url || getSectionImage(title)}
            style={styles.categoryBackgroundImage} 
          />
          <View style={[styles.categoryOverlay, colorPalette ? { backgroundColor: `${colorPalette.primary}90` } : {}]}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <View style={[styles.categoryDivider, colorPalette ? { backgroundColor: colorPalette.accent } : {}]} />
          </View>
        </View>
        <Text style={styles.itemDescriptionLTR}>No available items in this category</Text>
      </View>
    )
  }

  return (
    <View style={styles.categoryContainer} wrap={false}>
      <View style={styles.categoryHeader}>
        <Image
          src={sectionData.background_image_url || getSectionImage(title)}
          style={styles.categoryBackgroundImage} 
        />
        <View style={[styles.categoryOverlay, colorPalette ? { backgroundColor: `${colorPalette.primary}90` } : {}]}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={[styles.categoryDivider, colorPalette ? { backgroundColor: colorPalette.accent } : {}]} />
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {validItems.map((item, index) => {
          const itemIsRTL = getTextDirection(item.name) === 'rtl';
          const ItemWrapper = columns === 2 ? styles.itemWrapper : styles.itemWrapperFull;

          return (
            <View key={item.id} style={ItemWrapper}>
              <View style={itemIsRTL ? styles.itemHeaderRTL : styles.itemHeaderLTR}>
                <View style={{ flexDirection: itemIsRTL ? 'row-reverse' : 'row', flex: 1, alignItems: 'center' }}>
                  {item.is_featured && (
                    <Text style={styles.featuredBadge}>⭐</Text>
                  )}
                  <Text style={itemIsRTL ? styles.itemNameRTL : styles.itemNameLTR}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <View style={styles.priceDots} />
                  <Text style={[styles.itemPrice, colorPalette ? { color: colorPalette.secondary, backgroundColor: `${colorPalette.secondary}15` } : {}]}>
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
  showQrCode = false, // Default to false to match React component
  pageBreaks = [] as number[] // Add page breaks array
}: { 
  restaurant: Restaurant; 
  categories: MenuCategory[];
  qrCodeUrl?: string;
  showQrCode?: boolean;
  pageBreaks?: number[];
}) => {
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
      <Page size="A4" style={styles.page}>
        <View style={styles.documentContainer}>
          {/* Header matching React component */}
          <View style={[styles.header, restaurant.color_palette ? { borderBottomColor: restaurant.color_palette.primary } : {}]}>
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

          {/* Main content container matching React's white card */}
          <View style={styles.mainContent}>
            {/* All Categories with page break indicators */}
            {validCategories.map((category, index) => (
              <View key={category.id}>
                {/* Page Break Indicator */}
                {pageBreaks.includes(index) && index > 0 && (
                  <View style={styles.pageBreakIndicator}>
                    <View style={styles.pageBreakLine} />
                    <Text style={styles.pageBreakText}>
                      📄 صفحة جديدة في PDF - Page {pageBreaks.indexOf(index) + 1}
                    </Text>
                  </View>
                )}
                
                <MenuSectionPDF
                  title={category.name}
                  sectionData={category}
                  columns={
                    category.name.toLowerCase().includes("appetizer") ||
                    category.name.toLowerCase().includes("starter") ||
                    category.name.toLowerCase().includes("beverage") ||
                    category.name.toLowerCase().includes("dessert")
                      ? 2
                      : 1
                  }
                  colorPalette={restaurant.color_palette}
                />
              </View>
            ))}
          </View>

          {/* Footer matching React component */}
          <View style={styles.footer}>
            <View style={styles.footerGrid}>
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