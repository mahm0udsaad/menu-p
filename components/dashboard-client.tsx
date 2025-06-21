"use client"

import { useState, Suspense } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"
import { signOut } from "@/lib/actions"
import QrCardGenerator from "@/components/qr-card-generator"

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
}

interface PublishedMenu {
  id: string
  menu_name: string
  pdf_url: string
  created_at: string
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

function DashboardContent({ restaurant, publishedMenus: initialPublishedMenus, publishedQrCards: initialPublishedQrCards, user }: DashboardClientProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [publishedMenus, setPublishedMenus] = useState<PublishedMenu[]>(initialPublishedMenus)
  const [publishedQrCards, setPublishedQrCards] = useState<PublishedQrCard[]>(initialPublishedQrCards)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard?tab=${value}`, { scroll: false })
  }

  const handleDeleteMenu = async (menuId: string, pdfUrl: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القائمة المنشورة؟ لا يمكن التراجع عن هذا الإجراء.")) return

    // Delete from DB
    const { error: dbError } = await supabase.from("published_menus").delete().eq("id", menuId)
    if (dbError) {
      alert(`خطأ في حذف القائمة من قاعدة البيانات: ${dbError.message}`)
      return
    }

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
    alert("تم حذف القائمة بنجاح.")
  }

  const handleDeleteQrCard = async (cardId: string, pdfUrl: string) => {
    if (!confirm("هل أنت متأكد من حذف بطاقة QR هذه؟ لا يمكن التراجع عن هذا الإجراء.")) return

    // Delete from DB
    const { error: dbError } = await supabase.from("published_qr_cards").delete().eq("id", cardId)
    if (dbError) {
      alert(`خطأ في حذف بطاقة QR من قاعدة البيانات: ${dbError.message}`)
      return
    }

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
    alert("تم حذف بطاقة QR بنجاح.")
  }

  const getMenuPublicUrl = (menuId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/menus/${menuId}`
    }
    return `/menus/${menuId}` // Fallback for server or if window is not available
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/5" />
        </div>
        <div className="absolute top-40 left-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/5" />
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/5" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-700">
          <MenuIcon className="h-14 w-14 text-emerald-400/5" />
        </div>
        <div className="absolute bottom-60 right-20 animate-bounce delay-1000">
          <Star className="h-8 w-8 text-emerald-300/5" />
        </div>
        <div className="absolute top-1/3 left-1/4 animate-pulse delay-200">
          <Star className="h-6 w-6 text-yellow-400/5" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-800">
          <Heart className="h-7 w-7 text-red-400/5" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-600">
          <BarChart3 className="h-9 w-9 text-emerald-400/5" />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl shadow-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              {restaurant.logo_url && (
                <Image
                  src={restaurant.logo_url || "/placeholder.svg"}
                  alt={`${restaurant.name} logo`}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
                <p className="text-slate-300">{restaurant.category === 'Both' ? 'Restaurant & Cafe' : restaurant.category}</p>
              </div>
            </div>
            <form action={signOut}>
              <Button
                variant="ghost"
                type="submit"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger
              value="edit-menu"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg"
            >
              <MenuIcon className="h-4 w-4 mr-2" />
              تحرير القائمة
            </TabsTrigger>
            <TabsTrigger
              value="published-menus"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              القوائم المنشورة
            </TabsTrigger>
            <TabsTrigger
              value="qr-cards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg"
            >
              <QrCode className="h-4 w-4 mr-2" />
              بطاقات QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">مرحباً بك في لوحة التحكم!</h2>
              <p className="text-slate-300">أدر قائمتك الرقمية وأكواد QR من هنا.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-white">
                    <MenuIcon className="h-5 w-5 mr-2 text-emerald-400" />
                    عناصر القائمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">...</div>
                  <p className="text-sm text-slate-400">عناصر في قائمتك</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit-menu">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">تحرير قائمتك</CardTitle>
                <p className="text-slate-300">
                  ادخل إلى محرر القائمة الكامل لتحديث العناصر والفئات ونشر إصدارات جديدة.
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl"
                >
                  <Link href="/menu-editor">
                    <MenuIcon className="mr-2 h-5 w-5" />
                    فتح محرر القائمة
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published-menus">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">قوائمك المنشورة</CardTitle>
                <p className="text-slate-300">اعرض وحمل وأدر قوائم PDF المُنشأة وأكواد QR الخاصة بها.</p>
              </CardHeader>
              <CardContent>
                {publishedMenus.length === 0 ? (
                  <p className="text-slate-400">لم تنشر أي قوائم بعد. اذهب إلى "تحرير القائمة" لإنشاء ونشر واحدة.</p>
                ) : (
                  <div className="space-y-6">
                    {publishedMenus.map((menu) => (
                      <div
                        key={menu.id}
                        className="p-6 border border-slate-700 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{menu.menu_name}</h3>
                          <p className="text-sm text-slate-400">
                            نُشرت في: {new Date(menu.created_at).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg">
                            <QRCodeCanvas value={getMenuPublicUrl(menu.id)} size={80} level="M" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-slate-600 hover:bg-slate-700 rounded-lg"
                            >
                              <Link href={`/menus/${menu.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-2" /> عرض
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-slate-600 hover:bg-slate-700 rounded-lg"
                            >
                              <a href={menu.pdf_url} download={`${menu.menu_name}.pdf`}>
                                <Download className="h-4 w-4 mr-2" /> تحميل
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMenu(menu.id, menu.pdf_url)}
                              className="rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr-cards">
            <div className="space-y-6">
              {/* QR Card Generator */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">إنشاء بطاقة QR جديدة</CardTitle>
                  <p className="text-slate-300">أنشئ بطاقة QR مخصصة لمطعمك</p>
                </CardHeader>
                <CardContent>
                  {restaurant && <QrCardGenerator restaurant={restaurant} menuPublicUrl={getMenuPublicUrl(restaurant.id)} />}
                </CardContent>
              </Card>

              {/* Published QR Cards */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">بطاقات QR المنشورة</CardTitle>
                  <p className="text-slate-300">اعرض وحمل وأدر بطاقات QR المُنشأة.</p>
                </CardHeader>
                <CardContent>
                  {publishedQrCards.length === 0 ? (
                    <p className="text-slate-400">لم تنشئ أي بطاقات QR بعد. استخدم المولد أعلاه لإنشاء واحدة.</p>
                  ) : (
                    <div className="space-y-6">
                      {publishedQrCards.map((card) => (
                        <div
                          key={card.id}
                          className="p-6 border border-slate-700 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{card.card_name}</h3>
                            <p className="text-sm text-slate-400 mb-1">
                              نُشرت في: {new Date(card.created_at).toLocaleDateString("ar-SA")}
                            </p>
                            <p className="text-sm text-slate-300">{card.custom_text}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              يشير إلى: {card.qr_code_url}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">
                              <QRCodeCanvas value={card.qr_code_url} size={80} level="M" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-slate-600 hover:bg-slate-700 rounded-lg"
                              >
                                <a href={card.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-2" /> عرض
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-slate-600 hover:bg-slate-700 rounded-lg"
                              >
                                <a href={card.pdf_url} download={`${card.card_name}.pdf`}>
                                  <Download className="h-4 w-4 mr-2" /> تحميل
                                </a>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteQrCard(card.id, card.pdf_url)}
                                className="rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> حذف
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        </div>
      }
    >
      <DashboardContent {...props} />
    </Suspense>
  )
} 