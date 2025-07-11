## Painting Template:

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f5f1e8',
    padding: 60,
    fontFamily: 'Oswald',
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
  menuContent: {
    width: '100%',
    maxWidth: 450,
  },
  categoryHeader: {
    fontSize: 22,
    fontFamily: 'Oswald',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 25,
    fontWeight: 'bold',
    letterSpacing: 2,
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
    fontFamily: 'Oswald',
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    fontFamily: 'Oswald',
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
    fontFamily: 'Oswald',
    color: '#2c3e50',
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'right',
  },
});

const Quixote = () => (
  <Document>
    <Page style={styles.page} size="A4">
      <View style={styles.container}>
        {/* Menu Title */}
        <Image 
          style={styles.menuTitle}
          src="https://sdmntpritalynorth.oaiusercontent.com/files/00000000-3148-6246-a338-46eeacb74170/raw?se=2025-07-08T10%3A24%3A04Z&sp=r&sv=2024-08-04&sr=b&scid=d3b3101d-7e2b-5b19-a25f-349f5f949143&skoid=eb780365-537d-4279-a878-cae64e33aa9c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-08T07%3A50%3A37Z&ske=2025-07-09T07%3A50%3A37Z&sks=b&skv=2024-08-04&sig=Gg%2BNaW1eLR5GW7%2BtqDjiaBoMJQ3SoLZdkXVLxRl4kBY%3D"
        />

        <View style={styles.menuContent}>
          {/* Appetizers Section */}
          <Text style={styles.categoryHeader}>APPETIZERS</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Bruschetta</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>8</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Stuffed Mushrooms</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>12</Text>
          </View>

          {/* Salads Section */}
          <Text style={styles.categoryHeader}>SALADS</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Greek Salad</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>12</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Caesar Salad</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>10</Text>
          </View>

          {/* Main Courses Section */}
          <Text style={styles.categoryHeader}>MAIN COURSES</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Pasta Primavera</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>17</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Spaghetti Bolognese</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>18</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Desserts</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>9</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Tiramisu</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>8</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

ReactPDF.render(<Quixote />);





------------------------------------------
EXAMPLE GETTING FROM REACT PDF PLAYGOROUND

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f5f1e8',
    padding: 60,
    fontFamily: 'Oswald',
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
  menuContent: {
    width: '100%',
    maxWidth: 450,
  },
  categoryHeader: {
    fontSize: 22,
    fontFamily: 'Oswald',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 25,
    fontWeight: 'bold',
    letterSpacing: 2,
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
    fontFamily: 'Oswald',
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    fontFamily: 'Oswald',
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
    fontFamily: 'Oswald',
    color: '#2c3e50',
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'right',
  },
});

const Quixote = () => (
  <Document>
    <Page style={styles.page} size="A4">
      <View style={styles.container}>
        {/* Menu Title */}
        
       <Svg width="300" height="80" viewBox="0 0 300 80">
      <Path
        d="M10 40 Q5 30 20 25 Q40 15 60 25 Q90 35 120 30 Q150 25 180 30 Q210 40 240 35 Q270 30 290 40 Q270 50 240 55 Q210 60 180 55 Q150 50 120 55 Q90 60 60 50 Q40 45 20 50 Q5 50 10 40 Z"
        fill="#F3E2C7"
      />
    </Svg>
        <View style={styles.menuContent}>
          {/* Appetizers Section */}
          <Text style={styles.categoryHeader}>APPETIZERS</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Bruschetta</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>8</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Stuffed Mushrooms</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>12</Text>
          </View>

          {/* Salads Section */}
          <Text style={styles.categoryHeader}>SALADS</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Greek Salad</Text>
              <Text style={styles.menuItemDescription}>Lorem ipsum dolor sit amet</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>12</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Caesar Salad</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>10</Text>
          </View>

          {/* Main Courses Section */}
          <Text style={styles.categoryHeader}>MAIN COURSES</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Pasta Primavera</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>17</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Spaghetti Bolognese</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>18</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Desserts</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>9</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemName}>Tiramisu</Text>
            </View>
            <View style={styles.dotLeader} />
            <Text style={styles.menuItemPrice}>8</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

ReactPDF.render(<Quixote />);