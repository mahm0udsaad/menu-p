"use client"

import { useState } from "react"
import { LuxuryMenuPreview } from "./luxury-menu-preview"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data for luxury template
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_002",
  name: "Think Unlimited",
  address: "123 Luxury Ave, Premium City, PC 12345",
  phoneNumber: "(555) 123-4567",
  website: "thinkunlimited.com",
}

const initialDesignSettings: MenuDesign = {
  templateId: "luxury",
  palette: {
    primary: "#D4AF37",
    secondary: "#F5F5DC",
    accent: "#FFD700",
    background: "#1A1A1A",
  },
  fonts: {
    headers: {
      fontFamily: "serif",
      fontWeight: "bold",
      fontSize: 28,
    },
    body: {
      fontFamily: "serif",
      fontWeight: "normal",
      fontSize: 16,
    },
  },
  layout: {
    columns: 2,
    showItemImages: false,
  },
}

const initialCategories: MenuCategory[] = [
  {
    id: "cat_001",
    name: "APPETIZERS",
    description: "",
    items: [
      {
        id: "item_a1",
        name: "ROASTED TOMATO SOUP",
        description: "Slow-roasted tomatoes blended with herbs, served with garlic toast",
        price: 7,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a2",
        name: "SPINACH ARTICHOKE DIP",
        description: "Spinach, creamy spinach and artichoke blend, served with crispy pita chips",
        price: 8,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a3",
        name: "CRISPY CALAMARI",
        description: "Lightly battered calamari rings with zesty marinara dipping sauce",
        price: 9,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "MAIN DISHES",
    description: "",
    items: [
      {
        id: "item_m1",
        name: "GRILLED CHICKEN",
        description: "Marinated grilled chicken breast served with roasted vegetables and garlic mashed potatoes",
        price: 15,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m2",
        name: "WILD MUSHROOM RISOTTO",
        description: "Creamy Arborio rice with wild mushrooms, Parmesan, and truffle oil drizzle",
        price: 16,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m3",
        name: "CLASSIC BEEF LASAGNA",
        description: "Layers of pasta, rich meat sauce, creamy béchamel, and melted cheese",
        price: 14,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m4",
        name: "HERB-CRUSTED SALMON",
        description: "Oven-baked salmon with herb crust, served with lemon butter sauce and seasonal veggies",
        price: 18,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_003",
    name: "SPECIAL",
    description: "",
    isSpecial: true,
    items: [
      {
        id: "item_s1",
        name: "CHEF'S SIGNATURE STEAK FRITES",
        description: "8 oz sirloin steak served with crispy fries and house-made chimichurri",
        price: 23,
        currency: "",
        isAvailable: true,
        isFeatured: true,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_004",
    name: "DESSERTS",
    description: "",
    items: [
      {
        id: "item_d1",
        name: "WARM APPLE CRUMBLE",
        description: "Baked apples with a cinnamon crumble topping, served with vanilla ice cream",
        price: 7,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d2",
        name: "CLASSIC TIRAMISU",
        description: "Layers of espresso-soaked ladyfingers, mascarpone, and cocoa powder",
        price: 7,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_005",
    name: "DRINKS",
    description: "",
    items: [
      {
        id: "item_dr1",
        name: "BLEND COFFEE",
        description: "Rich house-roasted coffee blend",
        price: 3,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_dr2",
        name: "LAVENDER ICED TEA",
        description: "Refreshing iced tea infused with lavender syrup",
        price: 4,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_dr3",
        name: "FRESHLY SQUEEZED ORANGE JUICE",
        description: "100% natural orange juice with no added sugar",
        price: 5,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export function LuxuryMenuEditor() {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_002",
    name: "Luxury Restaurant Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return <LuxuryMenuPreview menu={menu} onUpdateMenu={handleUpdateMenu} />
}
