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
  currency?: string;
}

// Register fonts
// Using Oswald for titles as per the example and a classic feel.
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// A generic serif font will be used for body, Times-Roman is a safe bet.
// Font.register({ family: 'Times-Roman', src: ... }); // Not needed for standard fonts

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fdfaf3',
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#3a2d25',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Oswald',
    fontSize: 32,
    color: '#5a3a2a',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  divider: {
    borderBottom: '1pt solid #5a3a2a',
    marginVertical: 2,
    width: 60,
    alignSelf: 'center'
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  section: {
    width: '48%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Oswald',
    fontSize: 16,
    color: '#5a3a2a',
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#5a3a2a',
    paddingBottom: 3,
    textTransform: 'uppercase',
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
  },
  menuItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
  },
  menuItemDescription: {
    fontSize: 10,
    color: '#6c584c',
    lineHeight: 1.3,
  },
});


export const VintagePdf = ({
  restaurant,
  categories,
}: {
  restaurant: Restaurant;
  categories: MenuCategory[];
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

  const currencySymbol = restaurant.currency || '$';

  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={styles.header}>
          <Image style={styles.logo} src="/assets/menu-header.png" />
          <Text style={styles.title}>Menu</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.categoryContainer}>
          {categories.map((category) => {
            const availableItems = category.menu_items?.filter(item => item.is_available) || [];
            if (availableItems.length === 0) return null;

            return (
              <View key={category.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{category.name}</Text>
                {availableItems.map((item) => (
                  <View key={item.id} style={styles.menuItem}>
                    <View style={styles.menuItemHeader}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemPrice}>{currencySymbol}{item.price}</Text>
                    </View>
                    {item.description && (
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}; 