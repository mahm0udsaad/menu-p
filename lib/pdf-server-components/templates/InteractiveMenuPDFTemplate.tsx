import React from 'react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  } | null
  currency?: string
}

interface InteractiveMenuPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function InteractiveMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: InteractiveMenuPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  // Sample data for demo
  const sampleRestaurant = {
    id: '1',
    name: 'مطعم النخبة',
    category: 'Fine Dining',
    logo_url: null,
    address: 'الرياض، المملكة العربية السعودية',
    phone: null,
    website: null,
    color_palette: null,
    currency: '$'
  }
  
  const sampleCategories = [
    {
      id: '1',
      name: 'المشروبات الساخنة',
      description: null,
      menu_items: [
        {
          id: '1',
          name: 'اسبريسو',
          description: 'قهوة إيطالية أصيلة غنية الطعم',
          price: 12.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '2',
          name: 'كابتشينو',
          description: 'اسبريسو مع حليب مخفوق وغرة كريمية',
          price: 15.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '3',
          name: 'لاتيه',
          description: 'اسبريسو ناعم مع حليب مخفوق',
          price: 16.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '4',
          name: 'موكا',
          description: 'اسبريسو مع شوكولاتة وحليب مخفوق',
          price: 18.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '5',
          name: 'شوكولاتة ساخنة',
          description: 'شوكولاتة بلجيكية غنية مع كريمة مخفوقة',
          price: 16.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        }
      ]
    },
    {
      id: '2',
      name: 'الغداء والعشاء',
      description: null,
      menu_items: [
        {
          id: '6',
          name: 'ساندويتش دجاج مشوي',
          description: 'صدر دجاج مشوي مع خس وطماطم ومايونيز',
          price: 32.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '7',
          name: 'سلطة سيزر',
          description: 'خس روماني مع صلصة سيزر وجبن البارميزان',
          price: 28.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '8',
          name: 'برجر لحم',
          description: 'قطعة لحم عصيرة مع جبن وخس وبطاطس مقلية',
          price: 38.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '9',
          name: 'بيتزا مارجريتا',
          description: 'موتزاريلا طازجة وصلصة طماطم وريحان',
          price: 35.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        },
        {
          id: '10',
          name: 'سلمون مشوي',
          description: 'سلمون أطلسي مع خضروات محمصة',
          price: 55.00,
          image_url: null,
          is_available: true,
          is_featured: false,
          dietary_info: []
        }
      ]
    }
  ]
  
  const displayRestaurant = restaurant || sampleRestaurant
  const displayCategories = categories.length > 0 ? categories : sampleCategories
  
  return (
    <div className="pdf-page" style={{ 
      backgroundColor: '#f5f1eb', 
      minHeight: '100vh', 
      fontFamily: 'Arial, sans-serif',
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      <div style={{ padding: '48px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {/* Menu Title */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h1 style={{ 
              fontSize: '128px', 
              fontWeight: '800', 
              color: '#000000',
              marginBottom: '16px',
              letterSpacing: '0.2em',
              margin: '0 0 16px 0'
            }}>
              MENU
            </h1>
            <div style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#000000',
              margin: '0 auto'
            }}></div>
          </div>

          {/* Menu Content - Two Column Layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '64px'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {displayCategories.slice(0, Math.ceil(displayCategories.length / 2)).map((category) => (
                <div key={category.id}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                  }}>
                    <h2 style={{ 
                      fontSize: '32px', 
                      fontWeight: '800', 
                      color: '#000000',
                      marginBottom: '24px',
                      margin: '0 0 24px 0'
                    }}>
                      {category.name}.
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {category.menu_items.map((item) => (
                        <div key={item.id}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ 
                                fontSize: '18px', 
                                fontWeight: '600', 
                                color: '#000000',
                                marginBottom: '4px',
                                margin: '0 0 4px 0'
                              }}>
                                {item.name}
                              </h3>
                              {item.description && (
                                <p style={{ 
                                  fontSize: '14px', 
                                  color: '#666666', 
                                  lineHeight: '1.5',
                                  margin: 0,
                                  paddingRight: language === 'ar' ? '0' : '16px',
                                  paddingLeft: language === 'ar' ? '16px' : '0'
                                }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '18px', 
                              fontWeight: '600', 
                              color: '#000000',
                              marginLeft: language === 'ar' ? '0' : '16px',
                              marginRight: language === 'ar' ? '16px' : '0'
                            }}>
                              {currency}{(item.price || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {displayCategories.slice(Math.ceil(displayCategories.length / 2)).map((category) => (
                <div key={category.id}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                  }}>
                    <h2 style={{ 
                      fontSize: '32px', 
                      fontWeight: '800', 
                      color: '#000000',
                      marginBottom: '24px',
                      margin: '0 0 24px 0'
                    }}>
                      {category.name}.
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {category.menu_items.map((item) => (
                        <div key={item.id}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ 
                                fontSize: '18px', 
                                fontWeight: '600', 
                                color: '#000000',
                                marginBottom: '4px',
                                margin: '0 0 4px 0'
                              }}>
                                {item.name}
                              </h3>
                              {item.description && (
                                <p style={{ 
                                  fontSize: '14px', 
                                  color: '#666666', 
                                  lineHeight: '1.5',
                                  margin: 0,
                                  paddingRight: language === 'ar' ? '0' : '16px',
                                  paddingLeft: language === 'ar' ? '16px' : '0'
                                }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '18px', 
                              fontWeight: '600', 
                              color: '#000000',
                              marginLeft: language === 'ar' ? '0' : '16px',
                              marginRight: language === 'ar' ? '16px' : '0'
                            }}>
                              {currency}{(item.price || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          {displayRestaurant.address && (
            <div style={{ 
              marginTop: '64px', 
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#666666', 
                fontWeight: '500',
                fontSize: '16px',
                margin: 0
              }}>
                {displayRestaurant.address}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}