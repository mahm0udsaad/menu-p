"use client"

import { useState, Suspense } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MenuIcon,
  BarChart3,
  LogOut,
  FileText,
  Eye,
  Trash2,
  Download,
  QrCode,
  Coffee,
  UtensilsCrossed,
  Star,
  Heart,
  Plus,
  Edit,
  Crown,
  Building,
  Phone,
  Mail,
  MapPin,
  Upload,
  Save,
  X,
  Users,
  Package,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"
import { signOut } from "@/lib/actions"
import QrCardGenerator from "@/components/qr-card-generator"
import { useToast } from "@/components/ui/use-toast"
import NotificationModal from "@/components/ui/notification-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import { usePaymentStatus } from "@/lib/hooks/use-payment-status"

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  available_menus?: number
}

interface PublishedMenu {
  id: string
  menu_name: string
  pdf_url: string
  created_at: string
  _count?: {
    menu_items: number
  }
}

interface PublishedQrCard {
  id: string
  card_name: string
  pdf_url: string
  qr_code_url: string
  custom_text: string
  card_options: any
  created_at: string
}

interface DashboardClientProps {
  restaurant: Restaurant
  publishedMenus: PublishedMenu[]
  publishedQrCards: PublishedQrCard[]
  user: any
}

function DashboardContent({ restaurant: initialRestaurant, publishedMenus: initialPublishedMenus, publishedQrCards: initialPublishedQrCards, user }: DashboardClientProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { hasPaidPlan, loading: paymentLoading } = usePaymentStatus()
  
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant)
  const [publishedMenus, setPublishedMenus] = useState<PublishedMenu[]>(initialPublishedMenus)
  const [publishedQrCards, setPublishedQrCards] = useState<PublishedQrCard[]>(initialPublishedQrCards)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview")
  
  // Restaurant editing state
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false)
  const [editRestaurantData, setEditRestaurantData] = useState({
    name: restaurant.name,
    category: restaurant.category,
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    email: restaurant.email || ""
  })
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  
  // Modal states
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  }>({
    show: false,
    type: "info",
    title: "",
    description: ""
  })
  
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean
    title: string
    description: string
    action: () => void
    type?: "danger" | "warning" | "success" | "info"
  }>({
    show: false,
    title: "",
    description: "",
    action: () => {},
    type: "warning"
  })

  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    setNotification({ show: true, type, title, description })
  }

  const showConfirmation = (title: string, description: string, action: () => void, type: "danger" | "warning" | "success" | "info" = "warning") => {
    setConfirmAction({ show: true, title, description, action, type })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard?tab=${value}`, { scroll: false })
  }

  const handleDeleteMenu = async (menuId: string, pdfUrl: string) => {
    showConfirmation(
      "حذف القائمة",
      "هل أنت متأكد من حذف هذه القائمة المنشورة؟ لا يمكن التراجع عن هذا الإجراء.",
      async () => {
        try {
          // Delete from DB
          const { error: dbError } = await supabase.from("published_menus").delete().eq("id", menuId)
          if (dbError) throw dbError

          // Delete from Storage
          try {
            const urlParts = new URL(pdfUrl)
            const pathParts = urlParts.pathname.split("/")
            const filePath = pathParts.slice(pathParts.indexOf("restaurant-logos") + 1).join("/")

            if (filePath) {
              const { error: storageError } = await supabase.storage.from("restaurant-logos").remove([filePath])
              if (storageError) {
                console.warn(`خطأ في حذف ملف PDF من التخزين (قد يكون الملف محذوف مسبقاً): ${storageError.message}`, filePath)
              }
            }
          } catch (e) {
            console.warn("لا يمكن تحليل رابط PDF للحذف من التخزين", e)
          }

          setPublishedMenus((prev) => prev.filter((menu) => menu.id !== menuId))
          showNotification("success", "تم الحذف بنجاح", "تم حذف القائمة المنشورة بنجاح")
        } catch (error) {
          showNotification("error", "خطأ في الحذف", "حدث خطأ أثناء محاولة حذف القائمة")
        }
      },
      "danger"
    )
  }

  const handleDeleteQrCard = async (cardId: string, pdfUrl: string) => {
    showConfirmation(
      "حذف بطاقة QR",
      "هل أنت متأكد من حذف بطاقة QR هذه؟ لا يمكن التراجع عن هذا الإجراء.",
      async () => {
        try {
          // Delete from DB
          const { error: dbError } = await supabase.from("published_qr_cards").delete().eq("id", cardId)
          if (dbError) throw dbError

          // Delete from Storage
          try {
            const urlParts = new URL(pdfUrl)
            const pathParts = urlParts.pathname.split("/")
            const filePath = pathParts.slice(pathParts.indexOf("restaurant-logos") + 1).join("/")

            if (filePath) {
              const { error: storageError } = await supabase.storage.from("restaurant-logos").remove([filePath])
              if (storageError) {
                console.warn(`خطأ في حذف ملف PDF من التخزين (قد يكون الملف محذوف مسبقاً): ${storageError.message}`, filePath)
              }
            }
          } catch (e) {
            console.warn("لا يمكن تحليل رابط PDF للحذف من التخزين", e)
          }

          setPublishedQrCards((prev) => prev.filter((card) => card.id !== cardId))
          showNotification("success", "تم الحذف بنجاح", "تم حذف بطاقة QR بنجاح")
        } catch (error) {
          showNotification("error", "خطأ في الحذف", "حدث خطأ أثناء محاولة حذف بطاقة QR")
        }
      },
      "danger"
    )
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${restaurant.id}-logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      // Update restaurant logo
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurant.id)

      if (updateError) throw updateError

      setRestaurant(prev => ({ ...prev, logo_url: publicUrl }))
      showNotification("success", "تم تحديث الشعار", "تم رفع شعار المطعم بنجاح")
    } catch (error) {
      console.error('Logo upload error:', error)
      showNotification("error", "فشل في رفع الشعار", "حدث خطأ أثناء رفع الشعار. حاول مرة أخرى.")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleUpdateRestaurant = async () => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: editRestaurantData.name,
          category: editRestaurantData.category,
          address: editRestaurantData.address || null,
          phone: editRestaurantData.phone || null,
          email: editRestaurantData.email || null,
        })
        .eq('id', restaurant.id)

      if (error) throw error

      setRestaurant(prev => ({
        ...prev,
        ...editRestaurantData
      }))
      setIsEditingRestaurant(false)
      showNotification("success", "تم التحديث بنجاح", "تم تحديث بيانات المطعم بنجاح")
    } catch (error) {
      console.error('Restaurant update error:', error)
      showNotification("error", "فشل في التحديث", "حدث خطأ أثناء تحديث بيانات المطعم")
    }
  }

  const getMenuPublicUrl = (restaurantOrMenuId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/menus/${restaurantOrMenuId}`
    }
    return `/menus/${restaurantOrMenuId}`
  }

  const getPlanInfo = () => {
    if (paymentLoading) return { name: "جاري التحميل...", status: "loading" }
    if (hasPaidPlan) return { name: "الخطة المدفوعة", status: "active" }
    return { name: "الخطة المجانية", status: "free" }
  }

  const getMenuItemsCount = async (menuId: string) => {
    try {
      const { count } = await supabase
        .from("menu_items")
        .select("*", { count: 'exact', head: true })
        .eq("menu_id", menuId)
        .eq("is_available", true)
      
      return count || 0
    } catch (error) {
      console.error("Error getting menu items count:", error)
      return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" dir="rtl">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/5" />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/5" />
        </div>
        <div className="absolute top-60 left-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/5" />
        </div>
        <div className="absolute bottom-40 right-20 animate-pulse delay-700">
          <MenuIcon className="h-14 w-14 text-emerald-400/5" />
        </div>
        <div className="absolute bottom-60 left-20 animate-bounce delay-1000">
          <Star className="h-8 w-8 text-emerald-300/5" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-200">
          <Star className="h-6 w-6 text-yellow-400/5" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-bounce delay-800">
          <Heart className="h-7 w-7 text-red-400/5" />
        </div>
        <div className="absolute top-1/2 left-10 animate-pulse delay-600">
          <BarChart3 className="h-9 w-9 text-emerald-400/5" />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <QrCode className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              {restaurant.logo_url && (
                <Image
                  src={restaurant.logo_url || "/placeholder.svg"}
                  alt={`${restaurant.name} logo`}
                  width={32}
                  height={32}
                  className="rounded-lg object-cover sm:w-10 sm:h-10 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{restaurant.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300 truncate">{restaurant.category === 'both' ? 'مطعم ومقهى' : restaurant.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Plan Badge */}
              <Badge 
                variant={getPlanInfo().status === "active" ? "default" : "outline"}
                className={`text-xs sm:text-sm ${getPlanInfo().status === "active" ? "bg-emerald-500 text-white" : "border-slate-600 text-slate-300"} hidden sm:flex`}
              >
                <Crown className="h-3 w-3 ml-1" />
                {getPlanInfo().name}
              </Badge>
              
              <form action={signOut}>
                <Button
                  variant="ghost"
                  type="submit"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl p-2 sm:px-4 sm:py-2"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </Button>
              </form>
            </div>
          </div>
          
          {/* Mobile Plan Badge */}
          <div className="mt-2 sm:hidden">
            <Badge 
              variant={getPlanInfo().status === "active" ? "default" : "outline"}
              className={`text-xs ${getPlanInfo().status === "active" ? "bg-emerald-500 text-white" : "border-slate-600 text-slate-300"}`}
            >
              <Crown className="h-3 w-3 ml-1" />
              {getPlanInfo().name}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          <TabsList className="bg-slate-800/50 p-1 rounded-xl w-full flex flex-wrap h-auto sm:h-10 gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500 text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="menus" className="data-[state=active]:bg-emerald-500 text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none">
              القوائم
            </TabsTrigger>
            <TabsTrigger value="qr-cards" className="data-[state=active]:bg-emerald-500 text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none">
              بطاقات QR
            </TabsTrigger>
            <TabsTrigger value="restaurant-info" className="data-[state=active]:bg-emerald-500 text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none">
              معلومات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-emerald-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">القوائم المنشورة</span>
                    <span className="sm:hidden">القوائم</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{publishedMenus.length}</div>
                  <p className="text-slate-400 text-xs sm:text-sm">قوائم نشطة</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-emerald-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">بطاقات QR</span>
                    <span className="sm:hidden">البطاقات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{publishedQrCards.length}</div>
                  <p className="text-slate-400 text-xs sm:text-sm">بطاقات مُنشأة</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-emerald-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">الخطة الحالية</span>
                    <span className="sm:hidden">الخطة</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-sm sm:text-lg font-bold text-white">{getPlanInfo().name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getPlanInfo().status === "active" ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                    )}
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {getPlanInfo().status === "active" ? "نشطة" : "محدودة"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-emerald-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">القوائم المتاحة</span>
                    <span className="sm:hidden">المتاحة</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{restaurant.available_menus || 0}</div>
                  <p className="text-slate-400 text-xs sm:text-sm">قوائم متبقية</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-white text-lg sm:text-xl">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-16 text-sm sm:text-base justify-start"
                  >
                    <Link href="/menu-editor">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                      إنشاء قائمة جديدة
                    </Link>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button
                      onClick={() => setActiveTab("qr-cards")}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 h-12 sm:h-16 text-xs sm:text-base flex-col sm:flex-row gap-1 sm:gap-2"
                    >
                      <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>إنشاء بطاقة QR</span>
                    </Button>
                    
                    <Button
                      onClick={() => setActiveTab("restaurant-info")}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 h-12 sm:h-16 text-xs sm:text-base flex-col sm:flex-row gap-1 sm:gap-2"
                    >
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>تعديل المعلومات</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menus" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">القوائم المنشورة</h2>
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                <Link href="/menu-editor">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء قائمة جديدة
                </Link>
              </Button>
            </div>
            
            {publishedMenus.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <MenuIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">لا توجد قوائم منشورة</h3>
                  <p className="text-slate-400 mb-4 text-sm sm:text-base">ابدأ بإنشاء قائمتك الأولى</p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/menu-editor">إنشاء قائمة</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {publishedMenus.map((menu) => (
                  <Card key={menu.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="px-4 sm:px-6">
                      <CardTitle className="text-emerald-400 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm sm:text-base truncate">{menu.menu_name}</span>
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          <Package className="h-3 w-3 ml-1" />
                          {menu._count?.menu_items || 0} عنصر
                        </Badge>
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        نُشرت في: {new Date(menu.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6">
                      <div className="flex justify-center bg-white p-3 sm:p-4 rounded-lg">
                        <QRCodeCanvas value={getMenuPublicUrl(menu.id)} size={100} className="sm:w-[120px] sm:h-[120px]" />
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <Link
                          href={getMenuPublicUrl(menu.id)}
                          target="_blank"
                          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-700/30"
                        >
                          <Eye className="h-4 w-4" />
                          عرض القائمة
                        </Link>
                        <a
                          href={menu.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-700/30"
                        >
                          <Download className="h-4 w-4" />
                          تحميل PDF
                        </a>
                        <button
                          onClick={() => handleDeleteMenu(menu.id, menu.pdf_url)}
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qr-cards" className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              {/* QR Card Generator */}
              <QrCardGenerator 
                restaurant={restaurant} 
                menuPublicUrl={getMenuPublicUrl(restaurant.id)} 
              />

              {/* Published QR Cards */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">بطاقات QR المنشورة</h2>
                {publishedQrCards.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-8 sm:py-12 px-4">
                      <QrCode className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-600" />
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">لا توجد بطاقات QR</h3>
                      <p className="text-slate-400 text-sm sm:text-base">استخدم المولد أعلاه لإنشاء بطاقة QR</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {publishedQrCards.map((card) => (
                      <Card key={card.id} className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="px-4 sm:px-6">
                          <CardTitle className="text-emerald-400 text-sm sm:text-base">{card.card_name}</CardTitle>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            نُشرت في: {new Date(card.created_at).toLocaleDateString("ar-SA")}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 sm:px-6">
                          <div className="flex justify-center bg-white p-3 sm:p-4 rounded-lg">
                            <QRCodeCanvas value={card.qr_code_url} size={100} className="sm:w-[120px] sm:h-[120px]" />
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <a
                              href={card.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-700/30"
                            >
                              <Download className="h-4 w-4" />
                              تحميل PDF
                            </a>
                            <button
                              onClick={() => handleDeleteQrCard(card.id, card.pdf_url)}
                              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="restaurant-info" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Building className="h-5 w-5" />
                    معلومات المطعم
                  </CardTitle>
                  {!isEditingRestaurant && (
                    <Button
                      onClick={() => setIsEditingRestaurant(true)}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {isEditingRestaurant ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">اسم المطعم</Label>
                        <Input
                          value={editRestaurantData.name}
                          onChange={(e) => setEditRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">نوع النشاط</Label>
                        <Select
                          value={editRestaurantData.category}
                          onValueChange={(value) => setEditRestaurantData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="restaurant">مطعم</SelectItem>
                            <SelectItem value="cafe">مقهى</SelectItem>
                            <SelectItem value="both">مطعم ومقهى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">رقم الهاتف</Label>
                        <Input
                          value={editRestaurantData.phone}
                          onChange={(e) => setEditRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="+966 50 123 4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">البريد الإلكتروني</Label>
                        <Input
                          value={editRestaurantData.email}
                          onChange={(e) => setEditRestaurantData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="info@restaurant.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">العنوان</Label>
                        <Textarea
                          value={editRestaurantData.address}
                          onChange={(e) => setEditRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="العنوان الكامل للمطعم"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleUpdateRestaurant}
                        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                      >
                        <Save className="h-4 w-4 ml-2" />
                        حفظ التغييرات
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingRestaurant(false)
                          setEditRestaurantData({
                            name: restaurant.name,
                            category: restaurant.category,
                            address: restaurant.address || "",
                            phone: restaurant.phone || "",
                            email: restaurant.email || ""
                          })
                        }}
                        variant="outline"
                        className="border-slate-600 text-slate-300 w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Logo Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="relative group">
                        {restaurant.logo_url ? (
                          <Image
                            src={restaurant.logo_url}
                            alt={`${restaurant.name} logo`}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                            <Building className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <label htmlFor="logo-upload" className="cursor-pointer text-white">
                            <Upload className="h-6 w-6" />
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              disabled={isUploadingLogo}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <h3 className="text-lg font-semibold text-white">{restaurant.name}</h3>
                        <p className="text-slate-400">{restaurant.category === 'both' ? 'مطعم ومقهى' : restaurant.category}</p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-slate-400 text-sm">رقم الهاتف</p>
                          <p className="text-white truncate">{restaurant.phone || "غير محدد"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Mail className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-slate-400 text-sm">البريد الإلكتروني</p>
                          <p className="text-white truncate">{restaurant.email || "غير محدد"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-slate-400 text-sm">العنوان</p>
                          <p className="text-white break-words">{restaurant.address || "غير محدد"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction(prev => ({ ...prev, show: false }))}
        onConfirm={() => {
          confirmAction.action()
          setConfirmAction(prev => ({ ...prev, show: false }))
        }}
        title={confirmAction.title}
        description={confirmAction.description}
        type={confirmAction.type}
        confirmText="تأكيد"
        cancelText="إلغاء"
      />

      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </div>
  )
}

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <DashboardContent {...props} />
    </Suspense>
  )
} 