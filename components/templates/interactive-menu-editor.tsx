"use client"

import { useState } from "react"
import { InteractiveMenuPreview } from "./interactive-menu-preview"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_001",
  name: "Bella Vista",
  address: "123 Anywhere St., Any City, ST 12345",
  phoneNumber: "123-456-7890",
  website: "reallygreatsite.com",
}

const initialDesignSettings: MenuDesign = {
  templateId: "modern",
  palette: {
    primary: "#000000",
    secondary: "#555555",
    accent: "#000000",
    background: "#f5f1eb",
  },
  fonts: {
    headers: {
      fontFamily: "serif",
      fontWeight: "bold",
      fontSize: 24,
    },
    body: {
      fontFamily: "serif",
      fontWeight: "normal",
      fontSize: 14,
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
    name: "Appetizer",
    description: "",
    items: [
      {
        id: "item_a1",
        name: "Garlic Bread",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a2",
        name: "Potato Wedges",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a3",
        name: "Meat Ball",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a4",
        name: "Onion Rings",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a5",
        name: "French Fries",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a6",
        name: "Ratatouille",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "Main Course",
    description: "",
    items: [
      {
        id: "item_m1",
        name: "Grilled Fingerlings",
        description: "Grilled potatoes with a Western flair served with sauce of choice.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m2",
        name: "Asian Pear Salad",
        description: "Crisp pears and pecans with tender frisée, and maple syrup with cheese.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m3",
        name: "Roasted Acorn Squash",
        description: "Spicy-sweet, soft wedges potatoes which makes a no-fuss holiday meal.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_m4",
        name: "Smothered Chicken",
        description: "Grilled chicken breast topped with mushrooms, onions and Cheese.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_003",
    name: "Chef's Specials",
    description: "",
    isSpecial: true,
    items: [
      {
        id: "item_s1",
        name: "Grilled Fingerlings",
        description: "Grilled potatoes with a Western flair served with sauce of choice.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s2",
        name: "Asian Pear Salad",
        description: "Crisp pears and pecans with tender frisée, and maple syrup with cheese.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s3",
        name: "Roasted Acorn Squash",
        description: "Spicy-sweet, soft wedges potatoes which makes a no-fuss holiday meal.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s4",
        name: "Smothered Chicken",
        description: "Grilled chicken breast topped with mushrooms, onions and Cheese.",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_004",
    name: "Dessert",
    description: "",
    items: [
      {
        id: "item_d1",
        name: "Banana Split",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d2",
        name: "Cheese Cake",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d3",
        name: "Chocolate Ice Cream",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d4",
        name: "Fruit Cake",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_005",
    name: "Drinks",
    description: "",
    items: [
      {
        id: "item_dr1",
        name: "Coffee",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_dr2",
        name: "Ice / Hot Tea",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_dr3",
        name: "Thai Tea",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_dr4",
        name: "Soda",
        description: "",
        price: 6.99,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export function InteractiveMenuEditor() {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_001",
    name: "Restaurant Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return <InteractiveMenuPreview menu={menu} onUpdateMenu={handleUpdateMenu} />
}
