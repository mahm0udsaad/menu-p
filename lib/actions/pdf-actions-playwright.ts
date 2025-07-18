"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateHTMLContent } from '@/lib/playwright/pdf-generator'

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
  id:string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  color_palette?: {
    id?: string;
    name?: string;
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  currency?: string
}

export async function generateAndSaveMenuPdfWithPlaywright(
  restaurant: Restaurant,
  categories: MenuCategory[],
  templateId: string = 'cafe',
  language: string = 'ar',
  customizations: any = {},
  menuName?: string,
  parentMenuId?: string
): Promise<{ pdfUrl?: string; error?: string; menuId?: string }> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated." }
  }

  if (!restaurant || !restaurant.id) {
    return { error: "Restaurant data is missing." }
  }

  if (!categories || categories.length === 0) {
    return { error: "Menu categories are missing." }
  }

  try {
    console.log('🚀 Starting PDF generation process...', {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      templateId,
      language,
      categoriesCount: categories.length
    })

    // --- HTML Generation ---
    const restaurantData = {
      ...restaurant,
      name: restaurant.name || 'Restaurant',
      currency: restaurant.currency || 'EGP',
      color_palette: restaurant.color_palette || {
        primary: "#10b981",
        secondary: "#059669",
        accent: "#34d399"
      }
    }

    // Enhanced data validation and filtering
    const validCategories = categories.filter((cat: any) => {
      if (!cat || !cat.id || !cat.name) {
        console.warn('❌ Skipping invalid category:', cat);
        return false;
      }
      if (!Array.isArray(cat.menu_items)) {
        console.warn('❌ Category has no menu_items array:', cat.name);
        return false;
      }
      const validItems = cat.menu_items.filter((item: any) => 
        item && 
        item.id && 
        item.name && 
        item.is_available && 
        item.price !== null && 
        item.price !== undefined &&
        !isNaN(Number(item.price))
      );
      if (validItems.length === 0) {
        console.warn('❌ Category has no valid items:', cat.name);
        return false;
      }
      return true;
    }).map((cat: any) => ({
      ...cat,
      menu_items: cat.menu_items.filter((item: any) => 
        item && 
        item.id && 
        item.name && 
        item.is_available && 
        item.price !== null && 
        item.price !== undefined &&
        !isNaN(Number(item.price))
      )
    }));

    if (validCategories.length === 0) {
      return { error: "No valid menu categories found for PDF generation." }
    }

    console.log('📊 Validated categories:', {
      original: categories.length,
      valid: validCategories.length,
      totalItems: validCategories.reduce((sum, cat) => sum + cat.menu_items.length, 0)
    });

    const templateData = {
      restaurant: restaurantData,
      categories: validCategories
    }

    console.log('🎨 Generating HTML content...');

    const htmlContent = generateHTMLContent({
      templateId,
      data: templateData,
      language,
      customizations,
    });

    if (!htmlContent || htmlContent.length < 100) {
      console.error('❌ Generated HTML is too short or empty');
      return { error: "Failed to generate HTML content for PDF." }
    }
    
    console.log('✅ HTML content generated successfully');
    console.log('📄 HTML content length:', htmlContent.length);
    console.log('📄 HTML content preview:', htmlContent.substring(0, 200) + '...');
    
    // --- Call the PDF Generation API Route ---
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'}`;
    const apiUrl = `${baseUrl}/api/menu-pdf`;
    console.log('🌐 Calling PDF API at:', apiUrl);
    console.log('🌐 Base URL from env:', process.env.NEXT_PUBLIC_URL);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ htmlContent }),
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ PDF generation service error:', response.status, errorData);
      
      // Check if the response is HTML (indicating an error page)
      if (errorData.includes('<!DOCTYPE html>') || errorData.includes('<html')) {
        console.error('❌ API returned HTML instead of JSON error - this indicates a server error');
        return { error: `PDF generation failed: Server returned HTML error page (${response.status}). This might be due to browser configuration issues.` };
      }
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(errorData);
        return { error: `PDF generation failed: ${errorJson.error || 'Unknown error'}` };
      } catch (parseError) {
        console.error('❌ Error parsing error response:', parseError);
        return { error: `PDF generation failed: ${response.status} - ${errorData.substring(0, 200)}` };
      }
    }

    const pdfBuffer = await response.arrayBuffer();
    
    console.log('📄 Received response, buffer size:', pdfBuffer.byteLength);

    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      console.error('❌ PDF generation returned empty buffer');
      return { error: 'PDF generation returned empty buffer' };
    }

    // Enhanced PDF validation with detailed logging
    const pdfBytes = new Uint8Array(pdfBuffer);
    const pdfHeader = Buffer.from(pdfBytes.slice(0, 4)).toString('ascii');
    
    console.log('🔍 PDF Header check:', pdfHeader);
    console.log('🔍 First 20 bytes (hex):', Array.from(pdfBytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('🔍 First 50 bytes (ascii):', Buffer.from(pdfBytes.slice(0, 50)).toString('ascii'));
    
    if (pdfHeader !== '%PDF') {
      console.error('❌ Invalid PDF header:', pdfHeader);
      console.error('❌ This indicates the API returned HTML instead of PDF');
      console.error('❌ Response content type:', response.headers.get('content-type'));
      console.error('❌ Response size:', pdfBuffer.byteLength);
      
      // Check if it's HTML content - check only the first 100 bytes
      const firstChunk = pdfBytes.slice(0, 100);
      const responseText = Buffer.from(firstChunk).toString('utf8');
      if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        console.error('❌ API returned HTML page instead of PDF');
        return { error: 'PDF generation failed: Server returned HTML page instead of PDF. This might be due to browser configuration or authentication issues.' };
      }
      
      return { error: `Generated file is not a valid PDF. Header: ${pdfHeader}. This might be due to browser configuration issues.` };
    }

    // Check for EOF marker - check only the last 1KB of the file for efficiency
    const lastChunk = pdfBytes.slice(-1024);
    const lastChunkString = Buffer.from(lastChunk).toString('latin1');
    if (!lastChunkString.includes('%%EOF')) {
      console.error('❌ PDF missing EOF marker');
      return { error: 'Generated PDF is incomplete' };
    }

    // Check minimum size
    if (pdfBuffer.byteLength < 1000) {
      console.error('❌ PDF too small:', pdfBuffer.byteLength, 'bytes');
      return { error: `Generated PDF is too small: ${pdfBuffer.byteLength} bytes` };
    }
    
    console.log('✅ PDF validation passed');
    
    const pdfFile = new Blob([pdfBuffer], { type: 'application/pdf' })

    console.log('✅ PDF blob created successfully, size:', pdfBuffer.byteLength, 'bytes')

    // --- Save PDF to Storage ---
    const menuUuid = crypto.randomUUID()
    const fileName = `menu-version-${language}-${menuUuid}.pdf`;
    const filePath = `menus/menu-version-${language}/${fileName}`;

    console.log(`☁️ Uploading PDF to Supabase storage at path: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('restaurant-logos') // Use existing bucket temporarily
      .upload(filePath, pdfFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('❌ Supabase storage upload error:', error);
      return { error: `Failed to upload PDF to storage: ${error.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('restaurant-logos') // Use existing bucket temporarily
      .getPublicUrl(data.path);

    if (!publicUrlData.publicUrl) {
      console.error('❌ Could not get public URL for PDF');
      return { error: 'Failed to get public URL for PDF' };
    }

    console.log('✅ PDF uploaded to storage successfully');

    // --- Save Menu to Database ---
    const languageNames: { [key: string]: string } = {
      'ar': 'الأصل',
      'en': 'English',
      'fr': 'Français',
      'es': 'Español'
    }

    const insertResult = await supabase
      .from("published_menus")
      .insert({
        id: menuUuid,
        restaurant_id: restaurant.id,
        menu_name: menuName || "Current Menu",
        pdf_url: publicUrlData.publicUrl,
        language_code: language,
        version_name: languageNames[language] || language,
        parent_menu_id: parentMenuId,
        is_primary_version: language === 'ar' && !parentMenuId
      })

    if (insertResult.error) {
      console.error("❌ DB Insert Error:", insertResult.error)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("restaurant-logos").remove([filePath])
      return { error: `Failed to save menu details: ${insertResult.error.message}` }
    }

    console.log('✅ Menu saved to database with ID:', menuUuid)
    
    revalidatePath("/dashboard")
    return { pdfUrl: publicUrlData.publicUrl, menuId: menuUuid }

  } catch (error: any) {
    console.error("❌ PDF Save Action Error:", error)
    console.error("❌ Stack trace:", error.stack)
    return { error: `An unexpected error occurred: ${error.message}` }
  }
} 