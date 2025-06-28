import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminTemplateGenerator from "@/components/admin-template-generator"

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login")
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
              Admin - Template Image Generator
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Generate preview images for menu templates
            </p>
          </div>
          
          <AdminTemplateGenerator />
        </div>
      </div>
    </div>
  )
} 