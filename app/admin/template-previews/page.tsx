"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import TemplatePreviewGenerator from "@/components/template-preview-generator"
import { MenuEditorProvider } from "@/contexts/menu-editor-context"

export default function TemplatePreviewsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/50 to-indigo-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300 shadow-lg shadow-blue-500/50"></div>
        <div className="absolute top-40 left-32 w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-700 shadow-lg shadow-indigo-500/50"></div>
        <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-purple-500/50"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-500 shadow-lg shadow-blue-600/50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Template Preview Generator
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Generate preview images for all menu templates to display in the template selector
            </p>
          </div>
          
          <MenuEditorProvider
            restaurant={{
              id: "admin-sample",
              name: "مقهى الحبة الذهبية",
              category: "cafe",
              logo_url: null,
              color_palette: {
                id: "emerald",
                name: "زمردي كلاسيكي",
                primary: "#10b981",
                secondary: "#059669",
                accent: "#34d399"
              }
            }}
            initialCategories={[
              {
                id: "cat-1",
                name: "المقبلات",
                description: "مقبلات شهية ومتنوعة",
                menu_items: [
                  {
                    id: "item-1",
                    name: "حمص بالطحينة",
                    description: "حمص كريمي مع طحينة وزيت الزيتون",
                    price: 18.00,
                    is_available: true,
                    is_featured: true,
                    dietary_info: ["vegan", "gluten-free"],
                    image_url: null,
                    display_order: 1,
                    category_id: "cat-1"
                  }
                ]
              }
            ]}
            onRefresh={() => {}}
          >
            <TemplatePreviewGenerator />
          </MenuEditorProvider>
        </div>
      </div>
    </div>
  )
} 