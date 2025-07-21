export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  is_available: boolean
  is_featured: boolean
  isTemporary?: boolean
}

export interface MenuCategory {
  id: string
  name: string
  description: string
  items: MenuItem[]
  isSpecial: boolean
}

export interface Menu {
  id: string
  name: string
  description: string | null
  categories: MenuCategory[]
  restaurant?: RestaurantInfo
  designSettings?: MenuDesign
  customizations?: any
}

export interface RestaurantInfo {
  id?: string
  name: string
  description?: string
  address?: string
  phone?: string
  phoneNumber?: string
  website?: string
  logo?: string
  category?: string
  logo_url?: string | null
  currency?: string | null
  color_palette?: {
    id: string
    name: string
    primary: string
    secondary: string
    accent: string
  } | null
  template_name?: string
  page_background_url?: string | null
}

export interface MenuDesign {
  template?: string
  templateId?: string
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
  }
  palette?: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  fonts?: {
    heading?: string
    headers?: {
      fontFamily: string
      fontWeight: string
      fontSize: number
    }
    body?: {
      fontFamily: string
      fontWeight: string
      fontSize: number
    }
  }
  layout?: {
    columns?: number
    spacing?: number
    showItemImages?: boolean
  }
} 