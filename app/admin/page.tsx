"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AdminTemplateGenerator from "@/components/admin-template-generator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Settings, ArrowRight } from "lucide-react"
import { MenuEditorProvider } from "@/contexts/menu-editor-context"

export default function AdminPage() {
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
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For now, we'll allow any authenticated user to access admin
  // In production, you might want to check for admin role
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
        <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-red-600 rounded-full animate-bounce delay-500 shadow-lg shadow-red-600/50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Manage templates and generate preview images
            </p>
          </div>
          
          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-red-500" />
                  Template Image Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate individual template images with custom settings and download them.
                </p>
                <Link href="/admin">
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    Open Generator
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Template Preview Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate preview images for all templates to display in the template selector modal.
                </p>
                <Link href="/admin/template-previews">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Generate All Previews
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <MenuEditorProvider
            restaurant={{
              id: "00000000-0000-0000-0000-000000000001",
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
            <AdminTemplateGenerator />
          </MenuEditorProvider>
        </div>
      </div>
    </div>
  )
} 