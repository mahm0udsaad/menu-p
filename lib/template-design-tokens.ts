export const TEMPLATE_DESIGN_TOKENS = {
  borcelle: {
    colors: {
      background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)',
      primary: '#78350f',
      secondary: '#d97706',
      accent: '#fed7aa',
      text: '#78350f'
    },
    fonts: {
      family: 'Arial, sans-serif',
      sizes: {
        title: '48px',
        category: '28px',
        item: '18px',
        price: '20px'
      }
    },
    spacing: {
      section: '64px',
      card: '32px',
      item: '24px'
    }
  },
  botanical: {
    colors: {
      background: 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)',
      primary: '#166534',
      secondary: '#22c55e',
      accent: '#dcfce7',
      text: '#166534'
    },
    fonts: {
      family: 'Georgia, serif',
      sizes: {
        title: '48px',
        category: '28px',
        item: '18px',
        price: '20px'
      }
    },
    spacing: {
      section: '64px',
      card: '32px',
      item: '24px'
    }
  },
  modern: {
    colors: {
      background: '#fef3c7',
      primary: '#111827',
      secondary: '#92400e',
      accent: '#fed7aa',
      text: '#111827'
    },
    fonts: {
      family: 'Arial, sans-serif',
      sizes: {
        title: '96px',
        category: '30px',
        item: '18px',
        price: '20px'
      }
    },
    spacing: {
      section: '48px',
      card: '32px',
      item: '16px'
    }
  },
  luxury: {
    colors: {
      background: '#0f0f0f',
      primary: '#d4af37',
      secondary: '#F5F2E7',
      text: '#F5F2E7',
            accent: '#333333',
      backgroundGradient: `
        linear-gradient(45deg, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
        linear-gradient(-45deg, rgba(212, 175, 55, 0.05) 0%, transparent 50%)
      `,
    },
    fonts: {
      family: 'Georgia, serif',
      sizes: {
        title: '56px',
        category: '32px',
        item: '22px',
        price: '28px'
      }
    },
    spacing: {
      section: '80px',
      card: '48px',
      item: '32px'
    }
  },
  chalkboard: {
    colors: {
      background: `
        radial-gradient(circle at 20% 30%, rgba(64,64,64,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(96,96,96,0.2) 0%, transparent 50%),
        linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)
      `,
      primary: '#ffffff',
      secondary: '#f3f4f6',
      accent: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      chalkDust: 'rgba(255, 255, 255, 0.05)'
    },
    fonts: {
      family: 'Arial, sans-serif',
      sizes: {
        title: '48px',
        category: '32px',
        item: '18px',
        price: '20px'
      }
    },
    spacing: {
      section: '64px',
      card: '32px',
      item: '24px'
    }
  }
}

export type TemplateTheme = keyof typeof TEMPLATE_DESIGN_TOKENS