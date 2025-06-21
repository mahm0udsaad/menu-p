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
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Rubik-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Rubik-Regular.ttf', fontWeight: 'bold' },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Rubik-Regular.ttf', fontWeight: 300 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Rubik-Regular.ttf', fontWeight: 500 },
    { src: '/fonts/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Rubik-Regular.ttf', fontWeight: 600 },
  ]
});

// Helper function to detect text direction (RTL for Arabic)
const getTextDirection = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF]/
  return arabicPattern.test(text) ? 'rtl' : 'ltr'
}

// Define interfaces for QR card data
interface Restaurant {
  id: string
  name: string
  logo_url?: string
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  }
}

interface QRCardOptions {
  customText: string
  cardBgColor: string
  textColor: string
  qrCodeSize: number
  showBorder: boolean
  borderColor: string
  logoPosition: 'none' | 'top' | 'middle' | 'both'
}

// Styles matching the React preview exactly
const styles = StyleSheet.create({
  page: {
    fontFamily: "Cairo",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 12,
    width: 100 * 2.83465, // 100mm to points
    height: 150 * 2.83465, // 150mm to points
  },
  // Outer container with background color (like React's outer div)
  outerContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  // Inner white card container (like React's white div)
  innerCardContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 200,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cardWithBorder: {
    borderWidth: 2,
    borderStyle: "solid",
  },
  // Logo at top
  topLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: "cover",
    marginBottom: 8,
  },
  topLogoText: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 60,
    fontFamily: "Cairo",
    marginBottom: 8,
  },
  // QR Code container
  qrContainer: {
    position: "relative",
    marginBottom: 8,
  },
  qrCode: {
    width: 160,
    height: 160,
  },
  // Logo overlay on QR code (middle position)
  qrLogoOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  qrLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    objectFit: "cover",
    margin: 2,
  },
  // Restaurant name
  restaurantNameRTL: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
    marginTop: 8,
    marginBottom: 4,
  },
  restaurantNameLTR: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Cairo",
    marginTop: 8,
    marginBottom: 4,
  },
  // Custom text
  customTextRTL: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "NotoKufiArabic",
    marginTop: 4,
    lineHeight: 1.3,
  },
  customTextLTR: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Cairo",
    marginTop: 4,
    lineHeight: 1.3,
  },
})

export const QRCardPDF = ({ 
  restaurant, 
  qrCodeUrl, 
  qrCodeDataUrl,
  options
}: { 
  restaurant: Restaurant; 
  qrCodeUrl: string;
  qrCodeDataUrl: string;
  options: QRCardOptions;
}) => {
  // Safety checks
  if (!restaurant || !restaurant.name) {
    return (
      <Document>
        <Page size={[100 * 2.83465, 150 * 2.83465]} style={styles.page}>
          <View style={styles.outerContainer}>
            <Text style={styles.restaurantNameLTR}>خطأ: بيانات المطعم غير متوفرة</Text>    
          </View>
        </Page>
      </Document>
    )
  }

  if (!qrCodeDataUrl) {
    return (
      <Document>
        <Page size={[100 * 2.83465, 150 * 2.83465]} style={styles.page}>
          <View style={styles.outerContainer}>
            <Text style={styles.restaurantNameLTR}>خطأ: كود QR غير متوفر</Text>      
          </View>
        </Page>
      </Document>
    )
  }

  // Detect text directions
  const restaurantNameIsRTL = getTextDirection(restaurant.name) === 'rtl'
  const customTextIsRTL = getTextDirection(options.customText) === 'rtl'

  return (
    <Document>
      <Page size={[100 * 2.83465, 150 * 2.83465]} style={styles.page}>
        {/* Outer container with background color */}
        <View 
          style={[
            styles.outerContainer,
            { backgroundColor: options.cardBgColor }
          ]}
        >
          {/* Inner white card container */}
          <View 
            style={[
              styles.innerCardContainer,
              options.showBorder && styles.cardWithBorder,
              options.showBorder && { borderColor: options.borderColor }
            ]}
          >
            {/* Top logo if enabled */}
            {(options.logoPosition === 'top' || options.logoPosition === 'both') && restaurant.logo_url && (
              <Image src={restaurant.logo_url} style={styles.topLogo} />
            )}
            
            {/* QR Code section */}
            <View style={styles.qrContainer}>
              <Image src={qrCodeDataUrl} style={styles.qrCode} />
              
              {/* Logo overlay on QR code (middle position) */}
              {(options.logoPosition === 'middle' || options.logoPosition === 'both') && restaurant.logo_url && (
                <View style={styles.qrLogoOverlay}>
                  <Image src={restaurant.logo_url} style={styles.qrLogoImage} />
                </View>
              )}
            </View>

            {/* Restaurant name */}
            <Text 
              style={[
                restaurantNameIsRTL ? styles.restaurantNameRTL : styles.restaurantNameLTR,
                { color: options.textColor }
              ]}
            >
              {restaurant.name}
            </Text>

            {/* Custom text */}
            <Text 
              style={[
                customTextIsRTL ? styles.customTextRTL : styles.customTextLTR,
                { color: options.textColor }
              ]}
            >
              {options.customText}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
} 