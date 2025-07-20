"use client"

import { useState } from "react"
import { ChalkboardCoffeePreview } from "./chalkboard-coffee-preview"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data for chalkboard coffee template
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_005",
  name: "Faucet Coffee",
  address: "789 Chalk Street, Board City, BC 12345",
  phoneNumber: "(555) 789-BREW",
  website: "faucetcoffee.com",
}

const initialDesignSettings: MenuDesign = {
  templateId: "chalkboard",
  palette: {
    primary: "#FFFFFF",
    secondary: "#E5E5E5",
    accent: "#CCCCCC",
    background: "#1A1A1A",
  },
  fonts: {
    headers: {
      fontFamily: "cursive",
      fontWeight: "bold",
      fontSize: 32,
    },
    body: {
      fontFamily: "cursive",
      fontWeight: "normal",
      fontSize: 18,
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
    name: "Coffee",
    description: "",
    items: [
      {
        id: "item_c1",
        name: "Espresso",
        description: "",
        price: 12.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c2",
        name: "Cappuccino",
        description: "",
        price: 23.55,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c3",
        name: "Mochacino",
        description: "",
        price: 22,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c4",
        name: "Americano",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_c5",
        name: "Coffee Milk",
        description: "",
        price: 17,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "Tea",
    description: "",
    items: [
      {
        id: "item_t1",
        name: "Iced Tea",
        description: "",
        price: 12.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_t2",
        name: "Matcha Latte",
        description: "",
        price: 23.55,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_t3",
        name: "Lemon Tea",
        description: "",
        price: 22,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_t4",
        name: "Jasmine Tea",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_t5",
        name: "Milk Tea",
        description: "",
        price: 17,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_003",
    name: "Snacks",
    description: "",
    items: [
      {
        id: "item_s1",
        name: "French Fries",
        description: "",
        price: 12.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s2",
        name: "Mix Platter",
        description: "",
        price: 23.55,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s3",
        name: "Crispy Mushroom",
        description: "",
        price: 22,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s4",
        name: "Seafood Mix",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s5",
        name: "Spicy Wings",
        description: "",
        price: 17,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_004",
    name: "More Coffee",
    description: "",
    items: [
      {
        id: "item_mc1",
        name: "Machiato",
        description: "",
        price: 12.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_mc2",
        name: "Iced Cappuccino",
        description: "",
        price: 23.55,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_mc3",
        name: "Mocha Latte",
        description: "",
        price: 22,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_mc4",
        name: "Vanilla Latte",
        description: "",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_mc5",
        name: "Brown Sugar Coffee",
        description: "",
        price: 17,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export function ChalkboardCoffeeEditor() {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_005",
    name: "Chalkboard Coffee Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return <ChalkboardCoffeePreview menu={menu} onUpdateMenu={handleUpdateMenu} />
}
