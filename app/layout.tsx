import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import AuthHandler from "@/components/auth-handler"

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
})

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
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              direction: 'rtl',
              fontFamily: cairo.style.fontFamily,
            },
          }}
        />
      </body>
    </html>
  )
}
