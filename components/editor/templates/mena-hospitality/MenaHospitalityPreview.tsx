"use client";

import React from 'react';
import { useMenuEditor } from '@/contexts/menu-editor-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import MenaHospitalityPDFTemplate from '@/lib/pdf-server-components/templates/MenaHospitalityPDFTemplate';

/**
 * Editor preview for the "mena-hospitality" template.
 *
 * It reuses the same renderer used for PDF export so what the user sees in the
 * editor matches the exported menu. Data is pulled from the editor context and
 * mapped onto the shape the template expects.
 */
const MenaHospitalityPreview = () => {
  const { categories, restaurant, currentLanguage } = useMenuEditor();

  const templateRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.category,
    logo_url: restaurant.logo_url,
    address: restaurant.address ?? null,
    phone: restaurant.phone ?? null,
    website: restaurant.website ?? null,
    color_palette: restaurant.color_palette
      ? {
          primary: restaurant.color_palette.primary,
          secondary: restaurant.color_palette.secondary,
          accent: restaurant.color_palette.accent,
        }
      : null,
    currency: restaurant.currency ?? undefined,
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex justify-center py-6">
        <div className="shadow-xl">
          <MenaHospitalityPDFTemplate
            restaurant={templateRestaurant}
            categories={categories as any}
            language={currentLanguage}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default MenaHospitalityPreview;
