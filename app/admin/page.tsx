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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Admin - Template Image Generator
            </h1>
            <p className="text-slate-400 text-lg">
              Generate preview images for menu templates
            </p>
          </div>
          
          <AdminTemplateGenerator />
        </div>
      </div>
    </div>
  )
} 