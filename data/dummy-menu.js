const cafeMenuExample = {
    restaurant: {
      id: "rest_001",
      name: "The Golden Bean Cafe",
      category: "Cafe & Restaurant",
      logo_url: "https://example.com/logo.png"
    },
    categories: [
      {
        id: "cat_001",
        name: "Hot Beverages",
        description: "Fresh brewed coffee and specialty hot drinks",
        menu_items: [
          {
            id: "item_001",
            name: "Espresso",
            description: "Rich, full-bodied Italian espresso",
            price: 3.50,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_002",
            name: "Cappuccino",
            description: "Espresso with steamed milk and foam",
            price: 4.25,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_003",
            name: "Latte",
            description: "Smooth espresso with steamed milk",
            price: 4.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_004",
            name: "Mocha",
            description: "Espresso with chocolate and steamed milk",
            price: 5.25,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_005",
            name: "Hot Chocolate",
            description: "Rich Belgian chocolate with whipped cream",
            price: 4.50,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          }
        ]
      },
      {
        id: "cat_002",
        name: "Cold Beverages",
        description: "Refreshing iced drinks and smoothies",
        menu_items: [
          {
            id: "item_006",
            name: "Iced Coffee",
            description: "Cold brew coffee served over ice",
            price: 3.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          },
          {
            id: "item_007",
            name: "Frappuccino",
            description: "Blended coffee drink with ice and milk",
            price: 5.50,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_008",
            name: "Mango Smoothie",
            description: "Fresh mango blended with yogurt and honey",
            price: 6.25,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian", "gluten-free"]
          },
          {
            id: "item_009",
            name: "Fresh Orange Juice",
            description: "Freshly squeezed orange juice",
            price: 4.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_003",
        name: "Breakfast",
        description: "Start your day with our delicious breakfast options",
        menu_items: [
          {
            id: "item_010",
            name: "Classic Pancakes",
            description: "Fluffy pancakes served with maple syrup and butter",
            price: 8.50,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_011",
            name: "Eggs Benedict",
            description: "Poached eggs on English muffin with hollandaise sauce",
            price: 12.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_012",
            name: "Avocado Toast",
            description: "Smashed avocado on sourdough with cherry tomatoes",
            price: 9.25,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan"]
          },
          {
            id: "item_013",
            name: "Full English Breakfast",
            description: "Eggs, bacon, sausage, beans, mushrooms, and toast",
            price: 14.50,
            is_available: true,
            is_featured: false,
            dietary_info: []
          },
          {
            id: "item_014",
            name: "Granola Bowl",
            description: "House-made granola with fresh berries and yogurt",
            price: 7.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          }
        ]
      },
      {
        id: "cat_004",
        name: "Lunch & Dinner",
        description: "Hearty meals for lunch and dinner",
        menu_items: [
          {
            id: "item_015",
            name: "Grilled Chicken Sandwich",
            description: "Grilled chicken breast with lettuce, tomato, and mayo",
            price: 11.50,
            is_available: true,
            is_featured: false,
            dietary_info: []
          },
          {
            id: "item_016",
            name: "Caesar Salad",
            description: "Romaine lettuce with Caesar dressing and parmesan",
            price: 9.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_017",
            name: "Beef Burger",
            description: "Juicy beef patty with cheese, lettuce, and fries",
            price: 13.25,
            is_available: true,
            is_featured: true,
            dietary_info: []
          },
          {
            id: "item_018",
            name: "Margherita Pizza",
            description: "Fresh mozzarella, tomato sauce, and basil",
            price: 12.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_019",
            name: "Grilled Salmon",
            description: "Atlantic salmon with roasted vegetables",
            price: 18.50,
            is_available: true,
            is_featured: true,
            dietary_info: ["gluten-free"]
          },
          {
            id: "item_020",
            name: "Vegetarian Pasta",
            description: "Penne pasta with seasonal vegetables in marinara sauce",
            price: 10.75,
            is_available: false,
            is_featured: false,
            dietary_info: ["vegetarian"]
          }
        ]
      },
      {
        id: "cat_005",
        name: "Desserts",
        description: "Sweet treats to end your meal",
        menu_items: [
          {
            id: "item_021",
            name: "Chocolate Cake",
            description: "Rich chocolate cake with chocolate ganache",
            price: 6.50,
            is_available: true,
            is_featured: true,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_022",
            name: "Cheesecake",
            description: "New York style cheesecake with berry compote",
            price: 7.25,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_023",
            name: "Apple Pie",
            description: "Traditional apple pie with vanilla ice cream",
            price: 5.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_024",
            name: "Ice Cream Sundae",
            description: "Three scoops with toppings of your choice",
            price: 4.50,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian", "gluten-free"]
          }
        ]
      },
      {
        id: "cat_006",
        name: "Appetizers",
        description: "Perfect starters to share",
        menu_items: [
          {
            id: "item_025",
            name: "Bruschetta",
            description: "Toasted bread with tomatoes, garlic, and basil",
            price: 7.50,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_026",
            name: "Chicken Wings",
            description: "Buffalo wings with blue cheese dip",
            price: 9.75,
            is_available: true,
            is_featured: false,
            dietary_info: ["gluten-free"]
          },
          {
            id: "item_027",
            name: "Mozzarella Sticks",
            description: "Crispy breaded mozzarella with marinara sauce",
            price: 6.25,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegetarian"]
          },
          {
            id: "item_028",
            name: "Hummus Platter",
            description: "House-made hummus with pita bread and vegetables",
            price: 8.00,
            is_available: true,
            is_featured: false,
            dietary_info: ["vegan"]
          }
        ]
      }
    ]
  };
  
  export default cafeMenuExample;