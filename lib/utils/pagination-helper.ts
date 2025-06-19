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
  A4_HEIGHT: 842, // A4 height in points
  A4_WIDTH: 595,  // A4 width in points
  MARGIN: 40,     // Page margins (20pt top/bottom, converted to total usable space reduction)
  HEADER_HEIGHT: 120, // Reduced from 150 - header is more compact
  FOOTER_HEIGHT: 60,  // Reduced from 80 - footer is more compact
  CATEGORY_HEADER_HEIGHT: 60, // Reduced from 75 - category headers are more compact
  ITEM_HEIGHT_SINGLE_COLUMN: 30, // Reduced from 35 - items are more compact
  ITEM_HEIGHT_DOUBLE_COLUMN: 25, // Reduced from 30 - items in double column are more compact
  ITEM_WITH_DESCRIPTION_EXTRA: 10, // Reduced from 15 - descriptions add less height
  // React component specific constants (different from PDF)
  REACT_ITEM_HEIGHT: 80, // Approximate height per item in React component
  REACT_CATEGORY_HEADER_HEIGHT: 120, // Category header height in React
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
  
  // Add extra height for items with descriptions
  const itemsWithDescriptions = validItems.filter(item => item.description && item.description.trim().length > 0).length;
  const extraDescriptionHeight = Math.ceil(itemsWithDescriptions / itemsPerRow) * PAGE_CONSTANTS.ITEM_WITH_DESCRIPTION_EXTRA;
  
  return PAGE_CONSTANTS.CATEGORY_HEADER_HEIGHT + (rowsNeeded * itemHeight) + extraDescriptionHeight;
}

// Estimate the height needed for a category in React component
export const estimateCategoryHeightReact = (category: MenuCategory): number => {
  const validItems = category.menu_items.filter((item) => 
    item && 
    item.id && 
    item.name && 
    item.is_available &&
    item.price !== null &&
    typeof item.price === 'number'
  );

  if (validItems.length === 0) return PAGE_CONSTANTS.REACT_CATEGORY_HEADER_HEIGHT;

  // In React component, we use single column layout similar to PDF
  const totalItemHeight = validItems.length * PAGE_CONSTANTS.REACT_ITEM_HEIGHT;
  
  return PAGE_CONSTANTS.REACT_CATEGORY_HEADER_HEIGHT + totalItemHeight;
}

// Organize categories into pages based on content size (for PDF)
export const organizeCategoriesIntoPagesForPDF = (categories: MenuCategory[]): MenuCategory[][] => {
  const pages: MenuCategory[][] = [];
  let currentPage: MenuCategory[] = [];
  let currentPageHeight = 0;
  
  const firstPageAvailableHeight = getAvailablePageHeight(true, false); // Has header, no footer
  const regularPageAvailableHeight = getAvailablePageHeight(false, false); // No header, no footer
  const lastPageAvailableHeight = getAvailablePageHeight(false, true); // No header, has footer
  
  categories.forEach((category, index) => {
    // Use double column layout for PDF since that's how it actually renders
    const categoryHeight = estimateCategoryHeightPDF(category, true); // Use double column
    const isFirstPage = pages.length === 0 && currentPage.length === 0;
    const isLastCategory = index === categories.length - 1;
    
    // Determine available height for current page
    let availableHeight = regularPageAvailableHeight;
    if (isFirstPage) {
      availableHeight = firstPageAvailableHeight;
    }
    
    // Only reduce available height for footer on the very last category
    if (isLastCategory) {
      availableHeight = Math.min(availableHeight, lastPageAvailableHeight);
    }
    
    // Check if category fits on current page
    const wouldExceedPage = currentPageHeight + categoryHeight > availableHeight;
    const isPageEmpty = currentPage.length === 0;
    
    if (wouldExceedPage && !isPageEmpty) {
      // Start new page
      pages.push([...currentPage]);
      currentPage = [category];
      currentPageHeight = categoryHeight;
    } else {
      // Add to current page
      currentPage.push(category);
      currentPageHeight += categoryHeight;
    }
    
    // Debug logging
    console.log(`PDF Pagination - Category: ${category.name}, Items: ${category.menu_items.length}, Height: ${categoryHeight}, Page Height: ${currentPageHeight}, Available: ${availableHeight}`);
    
    // If this category alone exceeds page height, it will get wrapped automatically by react-pdf
    if (categoryHeight > availableHeight) {
      console.warn(`Category "${category.name}" may be too large for a single page and might get split`);
    }
  });
  
  // Add the last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  // Ensure we have at least one page
  return pages.length > 0 ? pages : [[]];
}

// Organize categories into pages based on content size (for React preview - matching PDF logic)
export const organizeCategoriesIntoPagesForPreview = (categories: MenuCategory[]): { 
  pages: MenuCategory[][], 
  pageBreaks: number[] // Index of categories that start new pages
} => {
  const pages: MenuCategory[][] = [];
  const pageBreaks: number[] = []; // Track which category indices start new pages
  let currentPage: MenuCategory[] = [];
  let currentPageHeight = 0;
  
  // Use same logic as PDF but with React-specific heights
  const firstPageAvailableHeight = getAvailablePageHeight(true, false);
  const regularPageAvailableHeight = getAvailablePageHeight(false, false);
  const lastPageAvailableHeight = getAvailablePageHeight(false, true);
  
  categories.forEach((category, index) => {
    const categoryHeight = estimateCategoryHeightReact(category);
    const isFirstPage = pages.length === 0 && currentPage.length === 0;
    const isLastCategory = index === categories.length - 1;
    
    // Determine available height for current page
    let availableHeight = regularPageAvailableHeight;
    if (isFirstPage) {
      availableHeight = firstPageAvailableHeight;
    }
    
    // If this would be the last page and we need to fit the footer, reduce available height
    const needsFooterSpace = isLastCategory || (currentPageHeight + categoryHeight > availableHeight);
    if (needsFooterSpace) {
      availableHeight = Math.min(availableHeight, lastPageAvailableHeight);
    }
    
    // Check if category fits on current page
    const wouldExceedPage = currentPageHeight + categoryHeight > availableHeight;
    const isPageEmpty = currentPage.length === 0;
    
    if (wouldExceedPage && !isPageEmpty) {
      // Start new page
      pages.push([...currentPage]);
      pageBreaks.push(index); // Mark this category as starting a new page
      currentPage = [category];
      currentPageHeight = categoryHeight;
    } else {
      // Add to current page
      currentPage.push(category);
      currentPageHeight += categoryHeight;
      
      // Mark first category as page break
      if (isFirstPage) {
        pageBreaks.push(index);
      }
    }
  });
  
  // Add the last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  // Ensure we have at least one page
  return { 
    pages: pages.length > 0 ? pages : [[]], 
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