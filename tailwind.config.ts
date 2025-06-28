import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'ibm-plex-arabic': ['IBM Plex Sans Arabic', 'Rubik', 'Segoe UI', 'system-ui', 'sans-serif'],
        'rubik': ['Rubik', 'IBM Plex Sans Arabic', 'Segoe UI', 'system-ui', 'sans-serif'],  
        'arabic': ['IBM Plex Sans Arabic', 'Rubik', 'Segoe UI', 'system-ui', 'sans-serif'],
        'english': ['Rubik', 'IBM Plex Sans Arabic', 'Segoe UI', 'system-ui', 'sans-serif'],
        'sans': ['IBM Plex Sans Arabic', 'Rubik', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "rgb(226 232 240)",
        input: "rgb(241 245 249)",
        ring: "rgb(220 38 127)",
        background: "rgb(250 252 254)",
        foreground: "rgb(15 23 42)",
        primary: {
          DEFAULT: "rgb(220 38 127)",
          foreground: "rgb(255 255 255)",
          50: "rgb(254 242 242)",
          100: "rgb(254 226 226)",
          200: "rgb(252 165 165)",
          300: "rgb(248 113 113)",
          400: "rgb(239 68 68)",
          500: "rgb(220 38 38)",
          600: "rgb(185 28 28)",
          700: "rgb(153 27 27)",
          800: "rgb(127 29 29)",
          900: "rgb(109 40 40)",
          950: "rgb(69 10 10)",
        },
        secondary: {
          DEFAULT: "rgb(241 245 249)",
          foreground: "rgb(51 65 85)",
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)",
          foreground: "rgb(255 255 255)",
        },
        muted: {
          DEFAULT: "rgb(248 250 252)",
          foreground: "rgb(100 116 139)",
        },
        accent: {
          DEFAULT: "rgb(254 242 242)",
          foreground: "rgb(153 27 27)",
        },
        popover: {
          DEFAULT: "rgb(255 255 255)",
          foreground: "rgb(15 23 42)",
        },
        card: {
          DEFAULT: "rgb(255 255 255)",
          foreground: "rgb(15 23 42)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(220, 38, 127, 0.05)',
        DEFAULT: '0 4px 6px rgba(220, 38, 127, 0.1)',
        'md': '0 6px 10px rgba(220, 38, 127, 0.1)',
        'lg': '0 10px 15px rgba(220, 38, 127, 0.1)',
        'xl': '0 15px 25px rgba(220, 38, 127, 0.1)',
        '2xl': '0 25px 50px rgba(220, 38, 127, 0.15)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { 
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, rgb(220 38 127) 0%, rgb(239 68 68) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, rgb(248 113 113) 0%, rgb(252 165 165) 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgb(252 165 165) 0%, rgb(254 226 226) 100%)',
        'gradient-background': 'linear-gradient(135deg, rgb(250 252 254) 0%, rgb(241 245 249) 50%, rgb(248 250 252) 100%)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('tailwindcss/plugin')(function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      })
    })
  ],
} satisfies Config

export default config
