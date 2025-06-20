const cafeMenuExample = {
    restaurant: {
      id: "rest_001",
      name: "مقهى الحبة الذهبية",
      name_en: "The Golden Bean Cafe",
      category: "Cafe & Restaurant",
      logo_url: "https://example.com/logo.png"
    },
    categories: [
      {
        id: "cat_001",
        name: "المشروبات الساخنة",
        name_en: "Hot Beverages",
        description: "قهوة طازجة ومشروبات ساخنة مميزة",
        menu_items: [
          {
            id: "item_001",
            name: "إسبريسو",
            name_en: "Espresso",
            description: "قهوة إيطالية أصيلة غنية الطعم",
            price: 12.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_002",
            name: "كابتشينو",
            name_en: "Cappuccino", 
            description: "إسبريسو مع حليب مبخر ورغوة كريمية",
            price: 15.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_003",
            name: "لاتيه",
            name_en: "Latte",
            description: "إسبريسو ناعم مع حليب مبخر",
            price: 16.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_004",
            name: "موكا",
            name_en: "Mocha",
            description: "إسبريسو مع شوكولاتة وحليب مبخر",
            price: 18.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_005",
            name: "شوكولاتة ساخنة",
            name_en: "Hot Chocolate",
            description: "شوكولاتة بلجيكية غنية مع كريمة مخفوقة",
            price: 16.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_006",
            name: "قهوة عربية",
            name_en: "Arabic Coffee",
            description: "قهوة عربية تقليدية مع الهيل والزعفران",
            price: 10.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_007",
            name: "شاي كرك",
            name_en: "Karak Tea",
            description: "شاي هندي بالحليب والهيل والزنجبيل",
            price: 8.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_002",
        name: "المشروبات الباردة",
        name_en: "Cold Beverages", 
        description: "مشروبات منعشة وعصائر طبيعية",
        menu_items: [
          {
            id: "item_008",
            name: "قهوة مثلجة",
            name_en: "Iced Coffee",
            description: "قهوة باردة مع الثلج",
            price: 14.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_009",
            name: "فرابتشينو",
            name_en: "Frappuccino",
            description: "مشروب قهوة مخلوط مع الثلج والحليب",
            price: 20.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_010",
            name: "سموذي المانجو",
            name_en: "Mango Smoothie",
            description: "مانجو طازج مخلوط مع اللبن والعسل",
            price: 22.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian", "gluten-free"]
          },
          {
            id: "item_011",
            name: "عصير برتقال طازج",
            name_en: "Fresh Orange Juice",
            description: "عصير برتقال معصور طازج",
            price: 15.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_012",
            name: "شاي مثلج بالنعناع",
            name_en: "Iced Mint Tea",
            description: "شاي مثلج منعش بأوراق النعناع الطازجة",
            price: 12.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_003",
        name: "الإفطار",
        name_en: "Breakfast",
        description: "ابدأ يومك مع خيارات الإفطار اللذيذة",
        menu_items: [
          {
            id: "item_013",
            name: "فطائر كلاسيكية",
            name_en: "Classic Pancakes",
            description: "فطائر هشة مع شراب القيقب والزبدة",
            price: 25.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_014",
            name: "بيض بنديكت",
            name_en: "Eggs Benedict",
            description: "بيض مسلوق على خبز إنجليزي مع صلصة الهولنديز",
            price: 35.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_015",
            name: "توست الأفوكادو",
            name_en: "Avocado Toast",
            description: "أفوكادو مهروس على خبز العجين المخمر مع طماطم كرزية",
            price: 28.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan"]
          },
          {
            id: "item_016",
            name: "فطور إنجليزي كامل",
            name_en: "Full English Breakfast",
            description: "بيض وبيكون وسجق وفاصوليا وفطر وتوست",
            price: 45.00,
            is_available: true,
            is_featured: false,
            dietary_info: []
          },
          {
            id: "item_017",
            name: "شكشوكة",
            name_en: "Shakshuka",
            description: "بيض مطبوخ في صلصة طماطم حارة مع الفلفل والبصل",
            price: 30.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian", "gluten-free"]
          },
          {
            id: "item_018",
            name: "مناقيش بالزعتر",
            name_en: "Manakish Zaatar",
            description: "خبز مسطح مع زعتر وزيت زيتون",
            price: 20.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan"]
          }
        ]
      },
      {
        id: "cat_004",
        name: "الغداء والعشاء",
        name_en: "Lunch & Dinner",
        description: "وجبات شهية للغداء والعشاء",
        menu_items: [
          {
            id: "item_019",
            name: "ساندويتش دجاج مشوي",
            name_en: "Grilled Chicken Sandwich",
            description: "صدر دجاج مشوي مع خس وطماطم ومايونيز",
            price: 32.00,
            is_available: true,
            is_featured: false,
            dietary_info: []
          },
          {
            id: "item_020",
            name: "سلطة سيزر",
            name_en: "Caesar Salad",
            description: "خس روماني مع صلصة سيزر وجبن البارميزان",
            price: 28.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_021",
            name: "برجر لحم",
            name_en: "Beef Burger",
            description: "قطعة لحم عصيرة مع جبن وخس وبطاطس مقلية",
            price: 38.00,
            is_available: true,
            is_featured: true,
            dietary_info: []
          },
          {
            id: "item_022",
            name: "بيتزا مارجريتا",
            name_en: "Margherita Pizza",
            description: "موزاريلا طازجة وصلصة طماطم وريحان",
            price: 35.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_023",
            name: "سلمون مشوي",
            name_en: "Grilled Salmon",
            description: "سلمون أطلسي مع خضروات محمصة",
            price: 55.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["gluten-free"]
          },
          {
            id: "item_024",
            name: "كباب لحم",
            name_en: "Meat Kebab",
            description: "كباب لحم مشوي مع أرز وسلطة",
            price: 42.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["gluten-free"]
          },
          {
            id: "item_025",
            name: "فلافل",
            name_en: "Falafel",
            description: "كرات الحمص المقلية مع سلطة وطحينة",
            price: 25.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_005",
        name: "الحلويات",
        name_en: "Desserts",
        description: "حلويات لذيذة لإنهاء وجبتك",
        menu_items: [
          {
            id: "item_026",
            name: "كيك الشوكولاتة",
            name_en: "Chocolate Cake",
            description: "كيك شوكولاتة غني مع جاناش الشوكولاتة",
            price: 22.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_027",
            name: "تشيز كيك",
            name_en: "Cheesecake",
            description: "تشيز كيك نيويورك مع مربى التوت",
            price: 25.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_028",
            name: "بقلاوة",
            name_en: "Baklava",
            description: "معجنات لبنانية محشوة بالمكسرات والعسل",
            price: 18.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_029",
            name: "أم علي",
            name_en: "Om Ali",
            description: "حلوى مصرية تقليدية بالحليب والمكسرات",
            price: 20.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_030",
            name: "مهلبية",
            name_en: "Muhallebi",
            description: "حلوى الحليب التركية مع ماء الورد والفستق",
            price: 16.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_006",
        name: "المقبلات",
        name_en: "Appetizers",
        description: "مقبلات مثالية للمشاركة",
        menu_items: [
          {
            id: "item_031",
            name: "حمص",
            name_en: "Hummus",
            description: "حمص محضر في البيت مع خبز البيتا والخضروات",
            price: 18.00,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegan"]
          },
          {
            id: "item_032",
            name: "متبل",
            name_en: "Mutabal",
            description: "سلطة الباذنجان المشوي بالطحينة",
            price: 20.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_033",
            name: "تبولة",
            name_en: "Tabbouleh",
            description: "سلطة البقدونس والطماطم والبرغل",
            price: 22.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan"]
          },
          {
            id: "item_034",
            name: "كبة مقلية",
            name_en: "Fried Kibbeh",
            description: "كبة لحم مقلية مع اللبن",
            price: 28.00,
            is_available: true,
            is_featured: false,
            dietary_info: []
          },
          {
            id: "item_035",
            name: "فتة حمص",
            name_en: "Fattet Hummus",
            description: "حمص مع خبز محمص ولبن زبادي",
            price: 25.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          }
        ]
      }
    ]
  };
  
  export default cafeMenuExample;