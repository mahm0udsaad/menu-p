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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  AlertTriangle,
  Settings,
  Languages,
  Globe,
  ExternalLink,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign
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
import PdfPreviewModal from "@/components/pdf-preview-modal"
import MenuTabWithPreviews from "./men-tab"
import QrCardTab from "./qr-card-tab"

// Currency options for Middle East region
const currencies = [
  { code: "EGP", name: "جنيه مصري", symbol: "ج.م" },
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "USD", name: "دولار أمريكي", symbol: "$" },
  { code: "EUR", name: "يورو", symbol: "€" },
  { code: "QAR", name: "ريال قطري", symbol: "ر.ق" },
  { code: "KWD", name: "دينار كويتي", symbol: "د.ك" },
  { code: "BHD", name: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "ريال عماني", symbol: "ر.ع" },
  { code: "JOD", name: "دينار أردني", symbol: "د.أ" },
  { code: "LBP", name: "ليرة لبنانية", symbol: "ل.ل" }
]

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  currency?: string | null
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
    email: restaurant.email || "",
    currency: restaurant.currency || "EGP"
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
    if (type === "success") {
      toast({
        title,
        description,
        variant: "default",
      })
    } else if (type === "error") {
      toast({
        title,
        description,
        variant: "destructive",
      })
    } else {
      toast({
        title,
        description,
        variant: "default",
      })
    }
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
          currency: editRestaurantData.currency || null,
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Simple Header */}
      <header className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/80 shadow-sm backdrop-blur-sm">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25">
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={hasPaidPlan ? "default" : "secondary"} 
              className={`text-xs h-6 px-2 font-medium ${
                hasPaidPlan 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 border-amber-300 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              <Crown className={`ml-1 h-3 w-3 ${hasPaidPlan ? 'text-amber-800' : 'text-gray-500'}`} />
              <span className="hidden sm:inline">{hasPaidPlan ? 'خطة مميزة' : 'خطة مجانية'}</span>
              <span className="sm:hidden">{hasPaidPlan ? 'مميزة' : 'مجانية'}</span>
            </Badge>
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">نشط</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 sm:px-4 text-xs font-medium gap-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
        >
          <Settings className="h-3.5 w-3.5 text-gray-600" />
          <span className="hidden sm:inline text-gray-700">الإعدادات</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 sm:px-4 text-xs font-medium gap-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:shadow-sm" 
          onClick={() => signOut()}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">خروج</span>
        </Button>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-white border border-gray-200 shadow-sm w-full sm:w-auto min-w-max">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">نظرة عامة</span>
                <span className="sm:hidden">عامة</span>
              </TabsTrigger>
              <TabsTrigger value="menus" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <MenuIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">القوائم</span>
                <span className="sm:hidden">قوائم</span>
              </TabsTrigger>
              <TabsTrigger value="qr-cards" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                QR
              </TabsTrigger>
              <TabsTrigger value="restaurant-info" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">المطعم</span>
                <span className="sm:hidden">مطعم</span>
              </TabsTrigger>
              <TabsTrigger value="languages" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">اللغات</span>
                <span className="sm:hidden">لغات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-red-600" />
                  إجراءات سريعة
                </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/menu-editor">
                    <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="h-4 w-4" />
                      إنشاء قائمة جديدة
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    تحميل QR كود
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Globe className="h-4 w-4" />
                    إضافة لغة
                  </Button>
                </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MenuIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">القوائم النشطة</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {publishedMenus.length}
                  </div>
                  <p className="text-sm text-gray-600">قوائم منشورة</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-rose-600" />
                    </div>
                    <CardTitle className="text-lg">المشاهدات</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">127</div>
                  <p className="text-sm text-gray-600">مشاهدة هذا الأسبوع</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Languages className="h-5 w-5 text-pink-600" />
                    </div>
                    <CardTitle className="text-lg">اللغات المتاحة</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">2</div>
                  <p className="text-sm text-gray-600">العربية والإنجليزية</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

         <MenuTabWithPreviews getMenuPublicUrl={getMenuPublicUrl} handleDeleteMenu={handleDeleteMenu} publishedMenus={publishedMenus} />

          <QrCardTab 
            publishedQrCards={publishedQrCards}
            restaurant={restaurant}
            handleDeleteQrCard={handleDeleteQrCard}
            getMenuPublicUrl={getMenuPublicUrl}
          />

          <TabsContent value="restaurant-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-red-600" />
                  معلومات المطعم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                    {/* Logo Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                        {restaurant.logo_url ? (
                          <Image
                            src={restaurant.logo_url}
                            alt={`${restaurant.name} logo`}
                            width={80}
                            height={80}
                        className="rounded-lg object-cover border-2 border-gray-200"
                          />
                        ) : (
                      <div className="w-20 h-20 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                    <label htmlFor="logo-upload" className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer">
                      <Upload className="h-6 w-6 text-white" />
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                    <p className="text-gray-600">
                      {restaurant.category === 'both' ? 'مطعم ومقهى' : restaurant.category}
                    </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="font-semibold text-gray-900">{restaurant.phone || "غير محدد"}</p>
                        </div>
                      </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-semibold text-gray-900">{restaurant.email || "غير محدد"}</p>
                        </div>
                      </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mt-1">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">العنوان</p>
                      <p className="font-semibold text-gray-900">{restaurant.address || "غير محدد"}</p>
                        </div>
                      </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">العملة المستخدمة</p>
                      <p className="font-semibold text-gray-900">
                        {currencies.find(c => c.code === restaurant.currency)?.name || "جنيه مصري"} 
                        ({currencies.find(c => c.code === restaurant.currency)?.symbol || "ج.م"})
                      </p>
                    </div>
                  </div>
                    </div>

                {/* Edit Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setIsEditingRestaurant(true)}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    تحديث المعلومات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-red-600" />
                  إدارة اللغات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Languages className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ميزة قريباً</h3>
                  <p className="text-gray-600">سيتم إضافة المزيد من اللغات قريباً</p>
                </div>
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

      {/* Edit Restaurant Modal */}
      <Dialog open={isEditingRestaurant} onOpenChange={setIsEditingRestaurant}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-red-600" />
              تحديث معلومات المطعم
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم المطعم</Label>
              <Input
                id="edit-name"
                value={editRestaurantData.name}
                onChange={(e) => setEditRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">نوع النشاط</Label>
              <Select
                value={editRestaurantData.category}
                onValueChange={(value) => setEditRestaurantData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">مقهى</SelectItem>
                  <SelectItem value="restaurant">مطعم</SelectItem>
                  <SelectItem value="both">مطعم ومقهى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currency">العملة</Label>
              <Select
                value={editRestaurantData.currency}
                onValueChange={(value) => setEditRestaurantData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={editRestaurantData.phone}
                onChange={(e) => setEditRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full"
                placeholder="رقم الهاتف"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">البريد الإلكتروني</Label>
              <Input
                id="edit-email"
                type="email"
                value={editRestaurantData.email}
                onChange={(e) => setEditRestaurantData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full"
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Textarea
                id="edit-address"
                value={editRestaurantData.address}
                onChange={(e) => setEditRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full"
                placeholder="عنوان المطعم"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditingRestaurant(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateRestaurant}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-lg flex items-center justify-center">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <p className="text-lg font-semibold text-gray-900">جاري التحميل...</p>
        </div>
      </div>
    }>
      <DashboardContent {...props} />
    </Suspense>
  )
} 