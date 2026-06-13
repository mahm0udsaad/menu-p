import type { MenuItem, MenuCategory } from '@/types/menu'
export type { MenuItem, MenuCategory } from '@/types/menu'

export interface PageCategory {
  id: string
  name: string
  items: MenuItem[]
  continued?: boolean
}

export interface MenuPage {
  categories: PageCategory[]
}

export interface PaginationOptions {
  itemsPerPage: number
  firstPageItems?: number
  headingCost?: number
}

export function paginateCategories(
  categories: any[],
  options: PaginationOptions
): MenuPage[] {
  const pages: MenuPage[] = []
  let page: MenuPage = { categories: [] }
  const headingCost = options.headingCost ?? 2
  const firstPageBudget = options.firstPageItems ?? options.itemsPerPage
  
  let remaining = firstPageBudget
  let pageIndex = 0

  const openNextPage = () => {
    if (page.categories.length > 0) pages.push(page)
    pageIndex += 1
    page = { categories: [] }
    remaining = options.itemsPerPage
  }

  for (const category of categories) {
    let offset = 0
    const items = category.menu_items || category.items || []

    while (offset < items.length) {
      const currentHeadingCost = page.categories.some((entry) => entry.id === category.id) ? 0 : headingCost
      const available = remaining - currentHeadingCost

      if (available <= 0) {
        openNextPage()
        continue
      }

      const chunkSize = Math.min(items.length - offset, available)
      const chunk = items.slice(offset, offset + chunkSize)

      page.categories.push({
        id: category.id,
        name: category.name,
        items: chunk,
        continued: offset > 0 || (pageIndex > 0 && offset === 0 && pages.some((existing) =>
          existing.categories.some((entry) => entry.id === category.id)
        )),
      })

      remaining -= currentHeadingCost + chunk.length
      offset += chunkSize

      if (offset < items.length) {
        openNextPage()
      }
    }
  }

  if (page.categories.length > 0) pages.push(page)
  return pages
}

export function splitColumns(categories: PageCategory[], headingCost: number = 2) {
  const totalSlots = categories.reduce((sum, category) => sum + headingCost + category.items.length, 0)
  const target = totalSlots / 2
  const left: PageCategory[] = []
  const right: PageCategory[] = []
  let used = 0
  let overflowed = false

  for (const category of categories) {
    if (overflowed) {
      right.push(category)
      continue
    }

    const capacityLeft = target - used - headingCost

    if (capacityLeft >= category.items.length) {
      // Whole category still fits in the left column.
      left.push(category)
      used += headingCost + category.items.length
    } else if (capacityLeft >= 1 && category.items.length >= 2) {
      // Split this category between the two columns.
      const splitAt = Math.min(category.items.length - 1, Math.max(1, Math.floor(capacityLeft)))
      left.push({ ...category, items: category.items.slice(0, splitAt) })
      right.push({ ...category, items: category.items.slice(splitAt), continued: true })
      overflowed = true
    } else {
      // Too little room left — start the right column with this category.
      right.push(category)
      overflowed = true
    }
  }

  return { left, right }
}

export const A4_PAGE_WIDTH = 794
export const A4_PAGE_HEIGHT = 1123

export const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
export const toArabicDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)])

export function formatCurrency(currency?: string) {
  if (!currency || currency === 'SAR') return 'ر.س'
  if (currency === 'EGP') return 'ج.م'
  if (currency === 'AED') return 'د.إ'
  return currency
}

export function formatPrice(price: number | null, currency?: string) {
  if (price === null || price === undefined) return ''
  return `${toArabicDigits(Number(price).toLocaleString('en-US', { maximumFractionDigits: 2 }))} ${formatCurrency(currency)}`
}