"use client"

import { useState } from "react"
import { VintageCoffeePreview } from "./vintage-coffee-preview"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data for vintage coffee template
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_004",
  name: "Artisan Coffee Co.",
  address: "456 Vintage Street, Craft City, CC 67890",
  phoneNumber: "(555) 456-BREW",
  website: "artisancoffee.com",
}

const initialDesignSettings: MenuDesign = {
  templateId: "vintage",
  palette: {
    primary: "#92400E",
    secondary: "#78350F",
    accent: "#D97706",
    background: "#FEF3C7",
  },
  fonts: {
    headers: {
      fontFamily: "sans-serif",
      fontWeight: "bold",
      fontSize: 28,
    },
    body: {
      fontFamily: "sans-serif",
      fontWeight: "normal",
      fontSize: 18,
    },
  },
  layout: {
    columns: 1,
    showItemImages: false,
  },
}

const initialCategories: MenuCategory[] = [
  {
    id: "cat_001",
    name: "ESPRESSO",
    description: "",
    items: [
      {
        id: "item_e1",
        name: "Americano",
        description: "",
        price: 3.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e2",
        name: "Cappuccino",
        description: "",
        price: 3.2,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e3",
        name: "Espresso Ice Shaken",
        description: "",
        price: 3.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e4",
        name: "Coffee Latte",
        description: "",
        price: 4.2,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e5",
        name: "Caramel Macchiato",
        description: "",
        price: 4.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e6",
        name: "Mint Chocolate",
        description: "",
        price: 5.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e7",
        name: "Mocha Latte",
        description: "",
        price: 4.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_e8",
        name: "Choco Coffee",
        description: "",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "NON-COFFEE",
    description: "",
    items: [
      {
        id: "item_n1",
        name: "Caramel",
        description: "",
        price: 3.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n2",
        name: "Ice Choco Jelly",
        description: "",
        price: 3.2,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n3",
        name: "Cookies and Cream",
        description: "",
        price: 3.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n4",
        name: "Hazelnut Mocha",
        description: "",
        price: 4.2,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n5",
        name: "Matcha Cream",
        description: "",
        price: 4.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n6",
        name: "Mint Chocolate Chip",
        description: "",
        price: 5.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n7",
        name: "Strawberry Cream",
        description: "",
        price: 4.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_n8",
        name: "Vanilla Bean",
        description: "",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_003",
    name: "SNACKS",
    description: "",
    items: [
      {
        id: "item_s1",
        name: "French Fries",
        description: "",
        price: 5.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s2",
        name: "Toast",
        description: "",
        price: 4.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s3",
        name: "Salad",
        description: "",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export function VintageCoffeeEditor() {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_004",
    name: "Vintage Coffee Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return <VintageCoffeePreview menu={menu} onUpdateMenu={handleUpdateMenu} />
}
