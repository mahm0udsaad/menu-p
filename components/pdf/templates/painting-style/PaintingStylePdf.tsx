import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

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
  family: 'Roboto',
  fonts: [
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Regular.ttf' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Light.ttf', fontWeight: 300 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Thin.ttf', fontWeight: 100 },
    { src: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto-Black.ttf', fontWeight: 900 },
  ]
});

// Helper function to get appropriate font family with fallbacks
const getFontFamily = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? 'Cairo' : 'Roboto';
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f5f1e8',
    padding: 60,
    fontFamily: 'Roboto', // Default fallback font
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  menuTitle: {
    width: 400,
    height: 100,
    marginBottom: 50,
    alignSelf: 'center',
  },
  menuTitleText: {
    fontSize: 32,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 3,
  },
  menuContent: {
    width: '100%',
    maxWidth: 450,
  },
  categoryHeader: {
    fontSize: 22,
    fontFamily: 'Roboto',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 25,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  menuItemLeft: {
    flexShrink: 0,
  },
  menuItemName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 1.2,
  },
  dotLeader: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    borderBottomStyle: 'dotted',
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
    height: 1,
  },
  menuItemPrice: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#2c3e50',
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'right',
  },
});

export const PaintingStylePdf = ({
  restaurant,
  categories,
}: {
  restaurant: Restaurant;
  categories: MenuCategory[];
}) => {
  // Safety checks
  if (!restaurant || !restaurant.name) {
    return (
      <Document>
        <Page style={styles.page} size="A4">
          <View style={styles.container}>
            <Text style={styles.menuTitleText}>Restaurant data not available</Text>
          </View>
        </Page>
      </Document>
    );
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <Document>
        <Page style={styles.page} size="A4">
          <View style={styles.container}>
            <Text style={styles.menuTitleText}>{restaurant.name}</Text>
            <Text style={styles.categoryHeader}>No menu items available</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={styles.container}>
          {restaurant.logo_url ? (
            <Image 
              style={styles.menuTitle}
              src={restaurant.logo_url}
            />
          ) : (
            <Text style={styles.menuTitleText}>{restaurant.name}</Text>
          )}

          <View style={styles.menuContent}>
            {categories.map((category) => {
              // Filter available items
              const availableItems = category.menu_items?.filter(item => 
                item && item.is_available && item.name && typeof item.price === 'number'
              ) || [];

              if (availableItems.length === 0) {
                return null; // Skip empty categories
              }

              return (
                <View key={category.id}>
                  <Text style={[
                    styles.categoryHeader,
                    { fontFamily: getFontFamily(category.name) }
                  ]}>
                    {category.name.toUpperCase()}
                  </Text>
                  {availableItems.map((item) => (
                    <View style={styles.menuItem} key={item.id}>
                      <View style={styles.menuItemLeft}>
                        <Text style={[
                          styles.menuItemName,
                          { fontFamily: getFontFamily(item.name) }
                        ]}>
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text style={[
                            styles.menuItemDescription,
                            { fontFamily: getFontFamily(item.description) }
                          ]}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.dotLeader} />
                      <Text style={styles.menuItemPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};