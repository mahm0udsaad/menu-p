"use client"

import { useState } from "react"
import { ModernCoffeePreview } from "./modern-coffee-preview"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data for coffee shop template
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_003",
  name: "Borcelle",
  address: "123 Coffee Street, Brew City, BC 12345",
  phoneNumber: "(555) 123-BREW",
  website: "borcelle.com",
}

const initialDesignSettings: MenuDesign = {
  templateId: "coffee",
  palette: {
    primary: "#D97706",
    secondary: "#92400E",
    accent: "#F59E0B",
    background: "#FEF3C7",
  },
  fonts: {
    headers: {
      fontFamily: "sans-serif",
      fontWeight: "bold",
      fontSize: 32,
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
    name: "COFFEE",
    description: "",
    items: [
      {
        id: "item_c1",
        name: "CAFE LATTE",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c2",
        name: "CAPPUCCINO",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c3",
        name: "MOCHACINO",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c4",
        name: "AMERICANO",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "SNACKS",
    description: "",
    items: [
      {
        id: "item_s1",
        name: "FRENCH FRIES",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s2",
        name: "CROISSANT",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s3",
        name: "SANDWICH",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s4",
        name: "BEEF TOAST",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_003",
    name: "ADD-ONS",
    description: "",
    items: [
      {
        id: "item_a1",
        name: "EXTRA ICE",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a2",
        name: "EXTRA SYRUP",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a3",
        name: "ICE CREAM",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_a4",
        name: "EXTRA ESPRESSO",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export function ModernCoffeeEditor() {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_003",
    name: "Coffee Shop Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return <ModernCoffeePreview menu={menu} onUpdateMenu={handleUpdateMenu} />
}
