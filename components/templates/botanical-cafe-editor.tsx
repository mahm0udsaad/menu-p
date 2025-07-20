"use client"

import { memo, useState } from "react"
import { BotanicalCafePreview } from "./botanical-cafe-preview"
import { MenuCustomizationPanel } from "./menu-customization-panel"
import type { Menu, MenuCategory, RestaurantInfo, MenuDesign } from "@/types/menu"

// Sample initial data for botanical cafe template
const initialRestaurantInfo: RestaurantInfo = {
  id: "rest_006",
  name: "Botanical Cafe",
  address: "123 Garden Street, Bloom City, BC 12345",
  phoneNumber: "+123-456-7890",
  website: "reallygreatsite",
}

const initialDesignSettings: MenuDesign = {
  templateId: "botanical",
  palette: {
    primary: "#57534E",
    secondary: "#78716C",
    accent: "#CA8A04",
    background: "#F5F5F4",
  },
  fonts: {
    headers: {
      fontFamily: "cursive",
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
    showItemImages: true,
  },
}

const initialCategories: MenuCategory[] = [
  {
    id: "cat_001",
    name: "Drink",
    description: "",
    items: [
      {
        id: "item_d1",
        name: "Espresso (Hot/Ice)",
        description: "",
        price: 7.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d2",
        name: "Americano (Hot/Ice)",
        description: "",
        price: 8.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d3",
        name: "Vanilla Latte",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d4",
        name: "Caramel Latte",
        description: "",
        price: 10.5,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d5",
        name: "Caramel Macchiato",
        description: "",
        price: 11.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d6",
        name: "Cappuccino",
        description: "",
        price: 8.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d7",
        name: "Mochaccino",
        description: "",
        price: 9.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d8",
        name: "Frapuccino",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d9",
        name: "Milk Tea",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d10",
        name: "Hot Chocolate",
        description: "",
        price: 7.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_d11",
        name: "Mint Chocolate",
        description: "",
        price: 8.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "cat_002",
    name: "Snack",
    description: "",
    items: [
      {
        id: "item_s1",
        name: "Waffle",
        description: "",
        price: 7.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s2",
        name: "Croissant",
        description: "",
        price: 8.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s3",
        name: "Donut",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s4",
        name: "Cake",
        description: "",
        price: 10.5,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s5",
        name: "Pancake",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "item_s6",
        name: "Sandwich",
        description: "",
        price: 10.0,
        currency: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

const BotanicalCafeEditorComponent = () => {
  const [menu, setMenu] = useState<Menu>({
    id: "menu_006",
    name: "Botanical Cafe Menu",
    restaurant: initialRestaurantInfo,
    categories: initialCategories,
    designSettings: initialDesignSettings,
  })

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setMenu(updatedMenu)
  }

  return (
    <div className="flex h-screen">
      {/* Customization Panel */}
      <MenuCustomizationPanel menu={menu} onUpdateMenu={handleUpdateMenu} />

      {/* Preview */}
      <div className="flex-1 overflow-auto">
        <BotanicalCafePreview menu={menu} />
      </div>
    </div>
  )
}

const BotanicalCafeEditor = memo(BotanicalCafeEditorComponent)

BotanicalCafeEditor.displayName = "BotanicalCafeEditor"

export { BotanicalCafeEditor }
