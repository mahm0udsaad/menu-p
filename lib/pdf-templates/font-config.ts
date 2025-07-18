export interface FontVariant {
  weight: number
  style: 'normal' | 'italic'
  file: string
}

export interface FontFamily {
  name: string
  display: string
  variants: FontVariant[]
  language?: string[]
  direction?: 'rtl' | 'ltr'
}

export const FONT_FAMILIES: FontFamily[] = [
  // Arabic Fonts
  {
    name: 'Cairo',
    display: 'القاهرة',
    language: ['ar'],
    direction: 'rtl',
    variants: [
      {
        weight: 200,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-ExtraLight.ttf'
      },
      {
        weight: 300,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Light.ttf'
      },
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Regular.ttf'
      },
      {
        weight: 500,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Medium.ttf'
      },
      {
        weight: 600,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-SemiBold.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Bold.ttf'
      },
      {
        weight: 800,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-ExtraBold.ttf'
      },
      {
        weight: 900,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Cairo/static/Cairo-Black.ttf'
      }
    ]
  },
  {
    name: 'Noto Kufi Arabic',
    display: 'نوتو كوفي عربي',
    language: ['ar'],
    direction: 'rtl',
    variants: [
      {
        weight: 100,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Thin.ttf'
      },
      {
        weight: 200,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-ExtraLight.ttf'
      },
      {
        weight: 300,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Light.ttf'
      },
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Regular.ttf'
      },
      {
        weight: 500,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Medium.ttf'
      },
      {
        weight: 600,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-SemiBold.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Bold.ttf'
      },
      {
        weight: 800,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-ExtraBold.ttf'
      },
      {
        weight: 900,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Noto_Kufi_Arabic/static/NotoKufiArabic-Black.ttf'
      }
    ]
  },
  {
    name: 'Almarai',
    display: 'المرئي',
    language: ['ar'],
    direction: 'rtl',
    variants: [
      {
        weight: 300,
        style: 'normal',
        file: '/fonts/AR/Almarai/Almarai-Light.ttf'
      },
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Almarai/Almarai-Regular.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Almarai/Almarai-Bold.ttf'
      },
      {
        weight: 800,
        style: 'normal',
        file: '/fonts/AR/Almarai/Almarai-ExtraBold.ttf'
      }
    ]
  },
  {
    name: 'Amiri',
    display: 'أميري',
    language: ['ar'],
    direction: 'rtl',
    variants: [
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Amiri/Amiri-Regular.ttf'
      },
      {
        weight: 400,
        style: 'italic',
        file: '/fonts/AR/Amiri/Amiri-Italic.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Amiri/Amiri-Bold.ttf'
      },
      {
        weight: 700,
        style: 'italic',
        file: '/fonts/AR/Amiri/Amiri-BoldItalic.ttf'
      }
    ]
  },
  // Latin Fonts
  {
    name: 'Open Sans',
    display: 'Open Sans',
    language: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru'],
    direction: 'ltr',
    variants: [
      {
        weight: 300,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-Light.ttf'
      },
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-Regular.ttf'
      },
      {
        weight: 500,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-Medium.ttf'
      },
      {
        weight: 600,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-SemiBold.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-Bold.ttf'
      },
      {
        weight: 800,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Open_Sans/static/OpenSans_Condensed-ExtraBold.ttf'
      }
    ]
  },
  {
    name: 'Roboto',
    display: 'Roboto',
    language: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru'],
    direction: 'ltr',
    variants: [
      {
        weight: 100,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Thin.ttf'
      },
      {
        weight: 300,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Light.ttf'
      },
      {
        weight: 400,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Regular.ttf'
      },
      {
        weight: 500,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Medium.ttf'
      },
      {
        weight: 700,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Bold.ttf'
      },
      {
        weight: 900,
        style: 'normal',
        file: '/fonts/AR/Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto/Roboto/static/Roboto_Condensed-Black.ttf'
      }
    ]
  }
]

export function generateFontFaceCSS(): string {
  return FONT_FAMILIES.map(family => 
    family.variants.map(variant => 
      `@font-face {
        font-family: '${family.name}';
        src: url('${variant.file}') format('truetype');
        font-weight: ${variant.weight};
        font-style: ${variant.style};
        font-display: block;
      }`
    ).join('\n')
  ).join('\n')
}

export function getFontFamilyForLanguage(language: string): string {
  const arabicLanguages = ['ar', 'fa', 'ur', 'he']
  
  if (arabicLanguages.includes(language)) {
    return 'Cairo'
  }
  
  return 'Open Sans'
}

export function getFontWeight(weight: string): number {
  const weightMap: { [key: string]: number } = {
    'thin': 100,
    'extralight': 200,
    'light': 300,
    'normal': 400,
    'regular': 400,
    'medium': 500,
    'semibold': 600,
    'bold': 700,
    'extrabold': 800,
    'black': 900
  }
  
  return weightMap[weight.toLowerCase()] || 400
} 