import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Menu-p.com - قوائم طعام رقمية وأكواد QR",
  description: "منصة شاملة لإنشاء قوائم طعام رقمية وأكواد QR للمطاعم والمقاهي",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body style={{ fontFamily: "'IBM Plex Sans Arabic', 'Rubik', sans-serif" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
            {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                direction: 'rtl',
                fontFamily: "'IBM Plex Sans Arabic', 'Rubik', sans-serif",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
