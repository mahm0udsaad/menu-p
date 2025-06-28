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
  AlertTriangle,
  Settings,
  Languages,
  Globe,
  ExternalLink,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={hasPaidPlan ? "default" : "secondary"} className="text-xs">
                    <Crown className="ml-1 h-3 w-3" />
                    {hasPaidPlan ? 'خطة مميزة' : 'خطة مجانية'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700">نشط</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            الإعدادات
          </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="menus" className="gap-2">
              <MenuIcon className="h-4 w-4" />
              القوائم
            </TabsTrigger>
            <TabsTrigger value="qr-cards" className="gap-2">
              <QrCode className="h-4 w-4" />
              QR كود
            </TabsTrigger>
            <TabsTrigger value="restaurant-info" className="gap-2">
              <Building className="h-4 w-4" />
              معلومات المطعم
            </TabsTrigger>
            <TabsTrigger value="languages" className="gap-2">
              <Languages className="h-4 w-4" />
              اللغات
            </TabsTrigger>
          </TabsList>

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