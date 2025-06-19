// Pagination helper utility for consistent page breaks between PDF and preview components

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
  background_image_url?: string | null
}

// Constants for page size calculations (A4 in points)
export const PAGE_CONSTANTS = {
  A4_HEIGHT: 842,
  A4_WIDTH: 595,
  MARGIN: 40,
  HEADER_HEIGHT: 150,
  FOOTER_HEIGHT: 80,
  CATEGORY_HEADER_HEIGHT: 75,
  ITEM_HEIGHT_SINGLE_COLUMN: 35,
  ITEM_HEIGHT_DOUBLE_COLUMN: 30,
  ITEM_WITH_DESCRIPTION_EXTRA: 15,
  REACT_ITEM_HEIGHT: 80,
  REACT_CATEGORY_HEADER_HEIGHT: 120,
}

// Calculate available space for content on a page
export const getAvailablePageHeight = (hasHeader: boolean, hasFooter: boolean): number => {
  let availableHeight = PAGE_CONSTANTS.A4_HEIGHT - (PAGE_CONSTANTS.MARGIN * 2);
  
  if (hasHeader) {
    availableHeight -= PAGE_CONSTANTS.HEADER_HEIGHT;
  }
  
  if (hasFooter) {
    availableHeight -= PAGE_CONSTANTS.FOOTER_HEIGHT;
  }
  
  return availableHeight;
}

// Estimate the height needed for a category in PDF
export const estimateCategoryHeightPDF = (category: MenuCategory, useDoubleColumn: boolean = true): number => {
  const validItems = category.menu_items.filter((item) => 
    item && 
    item.id && 
    item.name && 
    item.is_available &&
    item.price !== null &&
    typeof item.price === 'number'
  );

  if (validItems.length === 0) return PAGE_CONSTANTS.CATEGORY_HEADER_HEIGHT;

  const itemsPerRow = useDoubleColumn ? 2 : 1;
  const itemHeight = useDoubleColumn ? PAGE_CONSTANTS.ITEM_HEIGHT_DOUBLE_COLUMN : PAGE_CONSTANTS.ITEM_HEIGHT_SINGLE_COLUMN;
  const rowsNeeded = Math.ceil(validItems.length / itemsPerRow);
  
  const itemsWithDescriptions = validItems.filter(item => item.description && item.description.trim().length > 0).length;
  const extraDescriptionHeight = Math.ceil(itemsWithDescriptions / itemsPerRow) * PAGE_CONSTANTS.ITEM_WITH_DESCRIPTION_EXTRA;
  
  return PAGE_CONSTANTS.CATEGORY_HEADER_HEIGHT + (rowsNeeded * itemHeight) + extraDescriptionHeight;
}

// Organize categories into pages based on content size (for PDF)
export const organizeCategoriesIntoPagesForPDF = (categories: MenuCategory[]): MenuCategory[][] => {
  const pages: MenuCategory[][] = [];
  let currentPage: MenuCategory[] = [];
  let currentPageHeight = 0;
  
  const firstPageAvailableHeight = getAvailablePageHeight(true, false);
  const regularPageAvailableHeight = getAvailablePageHeight(false, false);
  const lastPageAvailableHeight = getAvailablePageHeight(false, true);
  
  categories.forEach((category, index) => {
    const categoryHeight = estimateCategoryHeightPDF(category, false);
    const isFirstPage = pages.length === 0 && currentPage.length === 0;
    const isLastCategory = index === categories.length - 1;
    
    let availableHeight = regularPageAvailableHeight;
    if (isFirstPage) {
      availableHeight = firstPageAvailableHeight;
    }
    
    const needsFooterSpace = isLastCategory || (currentPageHeight + categoryHeight > availableHeight);
    if (needsFooterSpace) {
      availableHeight = Math.min(availableHeight, lastPageAvailableHeight);
    }
    
    const wouldExceedPage = currentPageHeight + categoryHeight > availableHeight;
    const isPageEmpty = currentPage.length === 0;
    
    if (wouldExceedPage && !isPageEmpty) {
      pages.push([...currentPage]);
      currentPage = [category];
      currentPageHeight = categoryHeight;
    } else {
      currentPage.push(category);
      currentPageHeight += categoryHeight;
    }
  });
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages.length > 0 ? pages : [[]];
}

// Organize categories into pages for React preview (matching PDF logic)
export const organizeCategoriesIntoPagesForPreview = (categories: MenuCategory[]): { 
  pages: MenuCategory[][], 
  pageBreaks: number[]
} => {
  const pdfPages = organizeCategoriesIntoPagesForPDF(categories);
  const pageBreaks: number[] = [];
  let categoryIndex = 0;
  
  pdfPages.forEach((page, pageIndex) => {
    if (pageIndex === 0) {
      pageBreaks.push(0);
    } else {
      pageBreaks.push(categoryIndex);
    }
    categoryIndex += page.length;
  });
  
  return { 
    pages: pdfPages, 
    pageBreaks 
  };
}

// Helper function to determine if a category starts a new page
export const getCategoryPageInfo = (categories: MenuCategory[], categoryIndex: number): {
  pageNumber: number;
  isFirstOnPage: boolean;
  isLastOnPage: boolean;
} => {
  const { pages, pageBreaks } = organizeCategoriesIntoPagesForPreview(categories);
  
  // Find which page this category is on
  let pageNumber = 1;
  let categoryCount = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const pageCategories = pages[i];
    if (categoryCount + pageCategories.length > categoryIndex) {
      pageNumber = i + 1;
      break;
    }
    categoryCount += pageCategories.length;
  }
  
  const isFirstOnPage = pageBreaks.includes(categoryIndex);
  
  // Check if this is the last category on its page
  const currentPageCategories = pages[pageNumber - 1] || [];
  const indexInPage = categoryIndex - (categoryCount - currentPageCategories.length);
  const isLastOnPage = indexInPage === currentPageCategories.length - 1;
  
  return {
    pageNumber,
    isFirstOnPage,
    isLastOnPage
  };
} 