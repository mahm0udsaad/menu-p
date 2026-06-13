"use client"

import { useState, Suspense } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  LayoutGrid,
  MenuIcon,
  LogOut,
  Eye,
  Trash2,
  Download,
  QrCode,
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
  Languages,
  Globe,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Sparkles,
  Share2,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  Image,
  Zap,
  Store,
  Settings,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  BarChart3,
} from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"
import { signOut } from "@/lib/actions"
import QrCardGenerator from "@/components/qr-card-generator"
import { useToast } from "@/components/ui/use-toast"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import { usePaymentStatus } from "@/lib/hooks/use-payment-status"
import MenuTabWithPreviews from "./men-tab"
import QrCardTab from "./qr-card-tab"

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
  { code: "LBP", name: "ليرة لبنانية", symbol: "ل.ل" },
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
  restaurant_id: string
  menu_name: string
  pdf_url: string
  language_code?: string
  is_primary_version?: boolean
  created_at: string
  _count?: { menu_items: number }
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

// ─── Navigation structure ────────────────────────────────────────────────────

type NavKey =
  | "overview" | "menus" | "qr-cards"
  | "editor" | "import" | "posters" | "social"
  | "restaurant-info" | "languages"

const NAV_GROUPS = [
  {
    label: "الرئيسية",
    items: [
      { id: "overview" as NavKey, label: "نظرة عامة", Icon: LayoutGrid },
    ],
  },
  {
    label: "القوائم",
    items: [
      { id: "menus" as NavKey, label: "القوائم", Icon: MenuIcon, badgeKey: "menus" },
      { id: "editor" as NavKey, label: "محرّر القوائم", Icon: Edit, href: "/menu-editor" },
      { id: "import" as NavKey, label: "استيراد بالذكاء", Icon: Sparkles, href: "/dashboard/import" },
      { id: "qr-cards" as NavKey, label: "بطاقات QR", Icon: QrCode, badgeKey: "qr" },
    ],
  },
  {
    label: "التسويق",
    items: [
      { id: "posters" as NavKey, label: "استوديو البوسترات", Icon: Image, href: "/dashboard/posters" },
      { id: "social" as NavKey, label: "النشر الاجتماعي", Icon: Share2, href: "/dashboard/social" },
    ],
  },
  {
    label: "المطعم",
    items: [
      { id: "restaurant-info" as NavKey, label: "معلومات المطعم", Icon: Store },
      { id: "languages" as NavKey, label: "اللغات", Icon: Languages, badgeKey: "langs" },
    ],
  },
]

const PAGE_TITLES: Record<NavKey, { title: string; sub: string }> = {
  overview: { title: "نظرة عامة", sub: "ملخّص أداء مطعمك" },
  menus: { title: "القوائم", sub: "إدارة قوائمك المنشورة ولغاتها" },
  "qr-cards": { title: "بطاقات QR", sub: "أنشئ وأدر بطاقات الباركود" },
  editor: { title: "محرّر القوائم", sub: "صمّم وحرّر قوائمك مباشرة" },
  import: { title: "استيراد بالذكاء", sub: "حوّل قائمتك القديمة إلى رقمية" },
  posters: { title: "استوديو البوسترات", sub: "صمّم بوسترات تسويقية" },
  social: { title: "النشر الاجتماعي", sub: "انشر إلى منصّات التواصل" },
  "restaurant-info": { title: "معلومات المطعم", sub: "بيانات وإعدادات المطعم" },
  languages: { title: "اللغات", sub: "إدارة وترجمة لغات القوائم" },
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  active,
  onNav,
  menuCount,
  qrCount,
  langCount,
  restaurant,
  hasPaidPlan,
  open,
  onClose,
}: {
  active: NavKey
  onNav: (key: NavKey) => void
  menuCount: number
  qrCount: number
  langCount: number
  restaurant: Restaurant
  hasPaidPlan: boolean
  open: boolean
  onClose: () => void
}) {
  const maxMenus = restaurant.available_menus ?? 3
  const meterPct = Math.round((menuCount / maxMenus) * 100)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed top-0 right-0 h-full z-50 flex flex-col",
          "w-64 bg-[#fafaf9] border-l border-[#e8e5e1]",
          "transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
          "lg:sticky lg:top-0 lg:right-auto lg:col-start-2 lg:row-start-1",
          "lg:translate-x-0 lg:z-auto lg:h-screen lg:w-64 lg:flex-none",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-[18px]">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-red-500 to-red-700 grid place-items-center text-white flex-shrink-0 shadow-sm">
            <QrCode size={19} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[16px] leading-tight tracking-tight text-gray-900">Menu‑P</div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">منصّة القوائم الرقمية</div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.label} className="mb-1">
              <div className="px-2.5 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
                {grp.label}
              </div>
              {grp.items.map((item) => {
                const isActive = active === item.id
                const badge =
                  item.badgeKey === "menus"
                    ? menuCount
                    : item.badgeKey === "qr"
                    ? qrCount
                    : item.badgeKey === "langs"
                    ? langCount
                    : null

                if ("href" in item && item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors w-full"
                    >
                      <item.Icon size={17} className="flex-shrink-0 text-gray-400" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  )
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => { onNav(item.id); onClose(); }}
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors w-full text-start",
                      isActive
                        ? "bg-red-50 text-red-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                    ].join(" ")}
                  >
                    <item.Icon
                      size={17}
                      className={["flex-shrink-0", isActive ? "text-red-600" : "text-gray-400"].join(" ")}
                    />
                    <span className="flex-1">{item.label}</span>
                    {badge !== null && (
                      <span
                        className={[
                          "text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center",
                          isActive
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Plan card */}
        <div className="p-3 border-t border-[#e8e5e1]">
          <div className="bg-white border border-[#e8e5e1] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-red-500" />
                <span className="text-[13px] font-bold text-gray-800">
                  {hasPaidPlan ? "الخطة المميزة" : "الخطة المجانية"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                نشط
              </span>
            </div>

            {!hasPaidPlan && (
              <>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                    style={{ width: `${Math.min(meterPct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-gray-400 mb-3">
                  <span>{menuCount} من {maxMenus} قوائم</span>
                </div>
              </>
            )}

            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-[12.5px] font-semibold text-white bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg py-2 transition-colors"
            >
              <Crown size={13} />
              {hasPaidPlan ? "إدارة الاشتراك" : "الترقية إلى المميّزة"}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

function Topbar({
  active,
  restaurant,
  hasPaidPlan,
  onMenuOpen,
}: {
  active: NavKey
  restaurant: Restaurant
  hasPaidPlan: boolean
  onMenuOpen: () => void
}) {
  const meta = PAGE_TITLES[active]
  const initials = restaurant.name.trim().slice(0, 2).toUpperCase()

  return (
    <header className="h-16 flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-[#e8e5e1] flex items-center gap-4 px-6 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MenuIcon size={19} />
      </button>

      {/* Title */}
      <div>
        <h1 className="text-[17px] font-bold text-gray-900 leading-tight tracking-tight">{meta.title}</h1>
        <div className="text-[12.5px] text-gray-400 font-medium hidden sm:block">{meta.sub}</div>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-[#f5f4f2] border border-[#e8e5e1] rounded-xl px-3 py-2 text-gray-400 min-w-[220px] text-[13px] cursor-text">
        <Search size={14} />
        <span className="flex-1 text-gray-400">ابحث عن قائمة أو إجراء…</span>
        <kbd className="text-[10.5px] bg-white border border-[#e8e5e1] rounded-md px-1.5 py-0.5 text-gray-400">⌘K</kbd>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-[#e8e5e1] bg-white shadow-xs">
        <Bell size={17} />
        <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
      </button>

      {/* User menu */}
      <div className="flex items-center gap-2.5 bg-white border border-[#e8e5e1] rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold grid place-items-center flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-start">
          <div className="text-[13px] font-semibold text-gray-800 leading-tight">{restaurant.name}</div>
          <div className="text-[11px] text-gray-400">{hasPaidPlan ? "الخطة المميزة" : "الخطة المجانية"}</div>
        </div>
        <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-[#e8e5e1] bg-white shadow-xs"
        title="تسجيل الخروج"
      >
        <LogOut size={16} />
      </button>
    </header>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  tone?: "primary" | "info" | "success" | "warning" | "violet"
}) {
  const toneMap = {
    primary: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  }
  return (
    <div className="bg-white border border-[#e8e5e1] rounded-xl p-4 shadow-xs">
      <div className={`w-9 h-9 rounded-xl grid place-items-center mb-3 ${toneMap[tone]}`}>
        <Icon size={17} />
      </div>
      <div className="text-[28px] font-black tracking-tight text-gray-900 leading-none mb-1">{value}</div>
      <div className="text-[12.5px] font-semibold text-gray-500">{label}</div>
      {sub && <div className="text-[11.5px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Overview page ───────────────────────────────────────────────────────────

function OverviewPage({
  restaurant,
  publishedMenus,
  publishedQrCards,
  hasPaidPlan,
  onNav,
  onRefresh,
}: {
  restaurant: Restaurant
  publishedMenus: PublishedMenu[]
  publishedQrCards: PublishedQrCard[]
  hasPaidPlan: boolean
  onNav: (key: NavKey) => void
  onRefresh: () => void
}) {
  const langs = [...new Set(publishedMenus.map((m) => m.language_code).filter(Boolean))]

  const quickActions = [
    { label: "إنشاء قائمة جديدة", icon: Plus, primary: true, href: "/menu-editor" },
    { label: "استيراد قائمة بالذكاء", icon: Sparkles, href: "/dashboard/import" },
    { label: "استوديو البوسترات", icon: Image, href: "/dashboard/posters" },
    { label: "النشر الاجتماعي", icon: Share2, href: "/dashboard/social" },
    { label: "تحميل كود QR", icon: QrCode, onClick: () => onNav("qr-cards") },
    { label: "إضافة لغة", icon: Languages, onClick: () => onNav("languages") },
  ]

  const activity = publishedMenus.slice(0, 4).map((m) => ({
    id: m.id,
    text: `تم نشر قائمة «${m.menu_name}»`,
    time: new Date(m.created_at).toLocaleDateString("ar-EG"),
    icon: CheckCircle2,
    tone: "success",
  }))

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight mb-1">
            أهلاً بعودتك 👋
          </h2>
          <p className="text-[13.5px] text-gray-400">
            هذه نظرة سريعة على أداء{" "}
            <b className="text-gray-700">{restaurant.name}</b> هذا الأسبوع.
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-gray-700 bg-white border border-[#e8e5e1] hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw size={14} />
            تحديث
          </button>
          <Link
            href="/menu-editor"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus size={14} />
            قائمة جديدة
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-[#e8e5e1] rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 mb-3">
          <Zap size={14} className="text-red-500" />
          إجراءات سريعة
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {quickActions.map((q) => {
            const cls = [
              "flex items-center gap-2.5 px-4 h-[50px] rounded-xl text-[14px] font-semibold transition-colors text-start",
              q.primary
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white border border-[#e8e5e1] text-gray-700 hover:bg-gray-50 hover:border-gray-300",
            ].join(" ")

            const inner = (
              <>
                <span
                  className={[
                    "w-7 h-7 rounded-lg grid place-items-center flex-shrink-0",
                    q.primary ? "bg-white/20 text-white" : "bg-red-50 text-red-600",
                  ].join(" ")}
                >
                  <q.icon size={16} />
                </span>
                <span className="flex-1">{q.label}</span>
                <ChevronLeft size={14} className="opacity-40" />
              </>
            )

            if ("href" in q && q.href) {
              return (
                <Link key={q.label} href={q.href} className={cls}>
                  {inner}
                </Link>
              )
            }
            return (
              <button key={q.label} onClick={q.onClick} className={cls}>
                {inner}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={MenuIcon}
          tone="primary"
          value={publishedMenus.length}
          label="قوائم منشورة نشطة"
          sub={`من أصل ${restaurant.available_menus ?? 3} قوائم`}
        />
        <StatCard
          icon={Eye}
          tone="info"
          value="—"
          label="مشاهدات هذا الأسبوع"
        />
        <StatCard
          icon={Languages}
          tone="violet"
          value={langs.length || "—"}
          label="اللغات المتاحة"
        />
        <StatCard
          icon={QrCode}
          tone="warning"
          value={publishedQrCards.length}
          label="بطاقات QR نشطة"
        />
      </div>

      {/* Two-column: menus list + activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Published menus */}
        <div className="bg-white border border-[#e8e5e1] rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#e8e5e1]">
            <MenuIcon size={15} className="text-gray-400" />
            <h3 className="text-[14.5px] font-semibold text-gray-800">قوائمك</h3>
            <button
              onClick={() => onNav("menus")}
              className="ms-auto flex items-center gap-1 text-[12.5px] font-semibold text-gray-500 hover:text-red-600 transition-colors"
            >
              عرض الكل
              <ChevronLeft size={13} />
            </button>
          </div>

          {publishedMenus.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <MenuIcon size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">لا توجد قوائم منشورة بعد</p>
              <Link
                href="/menu-editor"
                className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-red-600 hover:text-red-700"
              >
                <Plus size={14} /> إنشاء قائمة
              </Link>
            </div>
          ) : (
            <div>
              {publishedMenus.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#f0ede9] last:border-0"
                >
                  <div className="w-9 h-12 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <MenuIcon size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-gray-800 truncate">{m.menu_name}</span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        منشور
                      </span>
                    </div>
                    {m.language_code && (
                      <div className="text-[11.5px] text-gray-400 mt-0.5">{m.language_code.toUpperCase()}</div>
                    )}
                  </div>
                  <Link
                    href="/menu-editor"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Edit size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-white border border-[#e8e5e1] rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#e8e5e1]">
            <Clock size={15} className="text-gray-400" />
            <h3 className="text-[14.5px] font-semibold text-gray-800">آخر النشاطات</h3>
          </div>
          <div className="p-2">
            {activity.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Activity size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">لا توجد نشاطات بعد</p>
              </div>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center flex-shrink-0 mt-0.5">
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-gray-700 leading-snug">{a.text}</div>
                    <div className="text-[11.5px] text-gray-400 mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Restaurant Info page ─────────────────────────────────────────────────────

function RestaurantInfoPage({
  restaurant,
  hasPaidPlan,
  isUploadingLogo,
  onLogoUpload,
  onEdit,
  onDelete,
  isDeletingRestaurant,
}: {
  restaurant: Restaurant
  hasPaidPlan: boolean
  isUploadingLogo: boolean
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onDelete: () => void
  isDeletingRestaurant: boolean
}) {
  const catLabel: Record<string, string> = {
    cafe: "مقهى",
    restaurant: "مطعم",
    both: "مقهى ومطعم",
  }
  const currencyLabel =
    currencies.find((c) => c.code === restaurant.currency)?.name ?? "غير محدد"

  const infoRows = [
    { icon: Store, label: "اسم المطعم", value: restaurant.name },
    { icon: Building, label: "التصنيف", value: catLabel[restaurant.category] ?? restaurant.category },
    { icon: Phone, label: "الهاتف", value: restaurant.phone || "غير محدد", ltr: true },
    { icon: Mail, label: "البريد الإلكتروني", value: restaurant.email || "غير محدد", ltr: true },
    { icon: MapPin, label: "العنوان", value: restaurant.address || "غير محدد" },
    { icon: DollarSign, label: "العملة", value: currencyLabel },
  ]

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight mb-1">
            معلومات المطعم
          </h2>
          <p className="text-[13.5px] text-gray-400">بيانات مطعمك الظاهرة في القوائم والبطاقات.</p>
        </div>
        <button
          onClick={onEdit}
          className="ms-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
        >
          <Edit size={14} />
          تعديل المعلومات
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Logo + summary card */}
        <div className="bg-white border border-[#e8e5e1] rounded-xl p-5 shadow-xs text-center">
          <div className="relative w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden cursor-pointer group">
            {restaurant.logo_url ? (
              <NextImage
                src={restaurant.logo_url}
                alt={restaurant.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 grid place-items-center">
                <span className="text-4xl font-black text-white">{restaurant.name[0]}</span>
              </div>
            )}
            <label
              htmlFor="logo-upload"
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Upload size={20} className="text-white" />
              <span className="text-[11px] text-white font-semibold">تغيير الشعار</span>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={onLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
            </label>
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1">{restaurant.name}</h3>
          <p className="text-[13px] text-gray-400 mb-3">{catLabel[restaurant.category] ?? restaurant.category}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              نشط
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              <Building size={11} />
              {catLabel[restaurant.category] ?? restaurant.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <Crown size={11} />
              {hasPaidPlan ? "مميزة" : "مجاني"}
            </span>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white border border-[#e8e5e1] rounded-xl shadow-xs">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#e8e5e1]">
            <h3 className="text-[14.5px] font-semibold text-gray-800">التفاصيل</h3>
          </div>
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f0ede9] last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 grid place-items-center flex-shrink-0">
                <row.icon size={15} />
              </div>
              <div className="w-36 flex-shrink-0 text-[12.5px] font-semibold text-gray-400">{row.label}</div>
              <div
                className={[
                  "flex-1 text-[13.5px] font-semibold text-gray-800",
                  row.ltr ? "direction-ltr text-left" : "",
                ].join(" ")}
                dir={row.ltr ? "ltr" : undefined}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-xl shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 grid place-items-center flex-shrink-0">
              <AlertTriangle size={19} />
            </div>
            <div>
              <div className="text-[14.5px] font-bold text-red-600">منطقة الخطر</div>
              <div className="text-[13px] text-gray-400 mt-0.5">
                حذف المطعم نهائياً مع كل بياناته. لا يمكن التراجع.
              </div>
            </div>
          </div>
          <button
            onClick={onDelete}
            disabled={isDeletingRestaurant}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
          >
            {isDeletingRestaurant ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                حذف المطعم
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Languages page ───────────────────────────────────────────────────────────

function LanguagesPage({ publishedMenus }: { publishedMenus: PublishedMenu[] }) {
  const langMap: Record<string, { name: string; flag: string; native: string }> = {
    ar: { name: "العربية", flag: "🇸🇦", native: "Arabic" },
    en: { name: "الإنجليزية", flag: "🇺🇸", native: "English" },
    fr: { name: "الفرنسية", flag: "🇫🇷", native: "Français" },
    tr: { name: "التركية", flag: "🇹🇷", native: "Türkçe" },
    de: { name: "الألمانية", flag: "🇩🇪", native: "Deutsch" },
    it: { name: "الإيطالية", flag: "🇮🇹", native: "Italiano" },
    es: { name: "الإسبانية", flag: "🇪🇸", native: "Español" },
    zh: { name: "الصينية", flag: "🇨🇳", native: "中文" },
    ru: { name: "الروسية", flag: "🇷🇺", native: "Русский" },
    ja: { name: "اليابانية", flag: "🇯🇵", native: "日本語" },
    ko: { name: "الكورية", flag: "🇰🇷", native: "한국어" },
    fa: { name: "الفارسية", flag: "🇮🇷", native: "فارسی" },
    ur: { name: "الأردية", flag: "🇵🇰", native: "اردو" },
  }

  const activeCodes = [...new Set(publishedMenus.map((m) => m.language_code).filter(Boolean) as string[])]
  if (!activeCodes.includes("ar")) activeCodes.unshift("ar")

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight mb-1">اللغات</h2>
          <p className="text-[13.5px] text-gray-400">أدر لغات قوائمك وترجمها تلقائياً بالذكاء الاصطناعي.</p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-gray-700 bg-white border border-[#e8e5e1] hover:bg-gray-50 transition-colors shadow-xs">
            <Sparkles size={14} className="text-violet-500" />
            ترجمة بالذكاء
          </button>
          <Link
            href="/menu-editor"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus size={14} />
            إضافة لغة
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Globe} tone="primary" value={activeCodes.length} label="لغات نشطة" />
        <StatCard icon={CheckCircle2} tone="success" value="—" label="اكتمال الترجمة" />
        <StatCard icon={Sparkles} tone="violet" value="—" label="ترجمات بالذكاء هذا الشهر" />
      </div>

      {/* Active languages */}
      <div className="bg-white border border-[#e8e5e1] rounded-xl shadow-xs">
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#e8e5e1]">
          <Languages size={15} className="text-gray-400" />
          <h3 className="text-[14.5px] font-semibold text-gray-800">اللغات النشطة</h3>
        </div>
        {activeCodes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Languages size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">لا توجد لغات مضافة بعد</p>
          </div>
        ) : (
          activeCodes.map((code) => {
            const lang = langMap[code] ?? { name: code.toUpperCase(), flag: "🌐", native: code }
            const isDefault = code === "ar"
            const menuCount = publishedMenus.filter((m) => m.language_code === code).length
            return (
              <div
                key={code}
                className="flex items-center gap-4 px-4 py-4 border-b border-[#f0ede9] last:border-0"
              >
                <span className="text-3xl flex-shrink-0">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[14px] font-semibold text-gray-800">{lang.name}</span>
                    {isDefault && (
                      <span className="text-[10.5px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        افتراضية
                      </span>
                    )}
                    <span className="text-[12px] text-gray-400">{lang.native}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                    <span className="text-[11.5px] text-gray-400">{menuCount} قائمة</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* AI translation teaser */}
      <div className="bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 grid place-items-center flex-shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15.5px] font-bold text-gray-900">قاموس المصطلحات الخاص بك</h3>
                <span className="text-[10.5px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                  قريباً
                </span>
              </div>
              <p className="text-[13px] text-gray-400 max-w-lg">
                ثبّت ترجمات أسماء أطباقك وعلامتك التجارية ليستخدمها الذكاء الاصطناعي في كل قائمة.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold text-gray-700 bg-white border border-[#e8e5e1] hover:bg-gray-50 transition-colors shadow-xs">
            أعلمني عند الإطلاق
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

function DashboardContent({
  restaurant: initialRestaurant,
  publishedMenus: initialPublishedMenus,
  publishedQrCards: initialPublishedQrCards,
  user,
}: DashboardClientProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { hasPaidPlan, loading: paymentLoading } = usePaymentStatus()

  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant)
  const [publishedMenus, setPublishedMenus] = useState<PublishedMenu[]>(initialPublishedMenus)
  const [publishedQrCards, setPublishedQrCards] = useState<PublishedQrCard[]>(initialPublishedQrCards)

  const rawTab = searchParams.get("tab") ?? "overview"
  const [activeKey, setActiveKey] = useState<NavKey>(rawTab as NavKey)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Restaurant editing state
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false)
  const [editData, setEditData] = useState({
    name: restaurant.name,
    category: restaurant.category,
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    currency: restaurant.currency ?? "EGP",
  })
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDeletingRestaurant, setIsDeletingRestaurant] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{
    show: boolean
    title: string
    description: string
    action: () => void
    type?: "danger" | "warning" | "success" | "info"
  }>({ show: false, title: "", description: "", action: () => {}, type: "warning" })

  const showConfirmation = (
    title: string,
    description: string,
    action: () => void,
    type: "danger" | "warning" | "success" | "info" = "warning"
  ) => setConfirmAction({ show: true, title, description, action, type })

  const handleNav = (key: NavKey) => {
    setActiveKey(key)
    router.push(`/dashboard?tab=${key}`, { scroll: false })
  }

  const getStoragePathFromPublicUrl = (url: string | null | undefined, bucketName: string) => {
    if (!url) return null
    try {
      const parsedUrl = new URL(url)
      const marker = `/storage/v1/object/public/${bucketName}/`
      const idx = parsedUrl.pathname.indexOf(marker)
      if (idx === -1) return null
      return decodeURIComponent(parsedUrl.pathname.slice(idx + marker.length))
    } catch {
      return null
    }
  }

  const getMenuPublicUrl = (id: string) => {
    if (typeof window !== "undefined") return `${window.location.origin}/menus/${id}`
    return `/menus/${id}`
  }

  const handleDeleteMenu = async (menuId: string, pdfUrl: string) => {
    showConfirmation(
      "حذف القائمة",
      "هل أنت متأكد من حذف هذه القائمة المنشورة؟ لا يمكن التراجع عن هذا الإجراء.",
      async () => {
        try {
          const { error: dbError } = await supabase.from("published_menus").delete().eq("id", menuId)
          if (dbError) throw dbError
          try {
            const urlParts = new URL(pdfUrl)
            const parts = urlParts.pathname.split("/")
            const filePath = parts.slice(parts.indexOf("restaurant-logos") + 1).join("/")
            if (filePath) await supabase.storage.from("restaurant-logos").remove([filePath])
          } catch {}
          setPublishedMenus((prev) => prev.filter((m) => m.id !== menuId))
          toast({ title: "تم الحذف بنجاح", description: "تم حذف القائمة المنشورة بنجاح" })
        } catch {
          toast({ title: "خطأ في الحذف", description: "حدث خطأ أثناء محاولة حذف القائمة", variant: "destructive" })
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
          const { error: dbError } = await supabase.from("published_qr_cards").delete().eq("id", cardId)
          if (dbError) throw dbError
          try {
            const urlParts = new URL(pdfUrl)
            const parts = urlParts.pathname.split("/")
            const filePath = parts.slice(parts.indexOf("restaurant-logos") + 1).join("/")
            if (filePath) await supabase.storage.from("restaurant-logos").remove([filePath])
          } catch {}
          setPublishedQrCards((prev) => prev.filter((c) => c.id !== cardId))
          toast({ title: "تم الحذف بنجاح", description: "تم حذف بطاقة QR بنجاح" })
        } catch {
          toast({ title: "خطأ في الحذف", description: "حدث خطأ أثناء محاولة حذف بطاقة QR", variant: "destructive" })
        }
      },
      "danger"
    )
  }

  const handleDeleteRestaurant = () => {
    showConfirmation(
      "حذف المطعم",
      "سيتم حذف المطعم وكل القوائم والعناصر وبطاقات QR والبيانات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء.",
      async () => {
        setIsDeletingRestaurant(true)
        try {
          const storageTargets: Record<string, Set<string>> = {
            "restaurant-logos": new Set(),
            "menu-pdfs": new Set(),
            "menu-images": new Set(),
          }
          const addPath = (url: string | null | undefined) => {
            Object.keys(storageTargets).forEach((b) => {
              const p = getStoragePathFromPublicUrl(url, b)
              if (p) storageTargets[b].add(p)
            })
          }
          addPath(restaurant.logo_url)
          publishedMenus.forEach((m) => addPath(m.pdf_url))
          publishedQrCards.forEach((c) => { addPath(c.pdf_url); addPath(c.qr_code_url) })

          const [{ data: imageAssets }, { data: importJobs }, { data: posters }] = await Promise.all([
            supabase.from("image_assets").select("storage_path, public_url").eq("restaurant_id", restaurant.id),
            supabase.from("menu_import_jobs").select("source_file_url").eq("restaurant_id", restaurant.id),
            supabase.from("posters").select("payload, final_image_url").eq("restaurant_id", restaurant.id),
          ])
          imageAssets?.forEach((a) => { if (a.storage_path) storageTargets["menu-images"].add(a.storage_path); addPath(a.public_url) })
          importJobs?.forEach((j) => addPath(j.source_file_url))
          posters?.forEach((p) => { const rp = (p.payload as any)?.render?.storage_path; if (rp) storageTargets["menu-images"].add(rp); addPath(p.final_image_url) })

          const { error } = await supabase.from("restaurants").delete().eq("id", restaurant.id).eq("user_id", user.id)
          if (error) throw error

          await Promise.all(
            Object.entries(storageTargets).map(async ([b, paths]) => {
              const arr = Array.from(paths)
              if (arr.length) await supabase.storage.from(b).remove(arr)
            })
          )
          toast({ title: "تم حذف المطعم", description: "تم حذف المطعم والبيانات المرتبطة به بنجاح" })
          router.replace("/onboarding")
          router.refresh()
        } catch {
          toast({ title: "فشل حذف المطعم", description: "حدث خطأ أثناء حذف المطعم. حاول مرة أخرى.", variant: "destructive" })
          setIsDeletingRestaurant(false)
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
      const ext = file.name.split(".").pop()
      const fileName = `${restaurant.id}-logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("restaurant-logos").upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from("restaurant-logos").getPublicUrl(fileName)
      const { error: updateError } = await supabase.from("restaurants").update({ logo_url: publicUrl }).eq("id", restaurant.id)
      if (updateError) throw updateError
      setRestaurant((prev) => ({ ...prev, logo_url: publicUrl }))
      toast({ title: "تم تحديث الشعار", description: "تم رفع شعار المطعم بنجاح" })
    } catch {
      toast({ title: "فشل في رفع الشعار", description: "حدث خطأ أثناء رفع الشعار. حاول مرة أخرى.", variant: "destructive" })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleUpdateRestaurant = async () => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: editData.name,
          category: editData.category,
          address: editData.address || null,
          phone: editData.phone || null,
          email: editData.email || null,
          currency: editData.currency || null,
        })
        .eq("id", restaurant.id)
      if (error) throw error
      setRestaurant((prev) => ({ ...prev, ...editData }))
      setIsEditingRestaurant(false)
      toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات المطعم بنجاح" })
    } catch {
      toast({ title: "فشل في التحديث", description: "حدث خطأ أثناء تحديث بيانات المطعم", variant: "destructive" })
    }
  }

  const langCount = [...new Set(publishedMenus.map((m) => m.language_code).filter(Boolean))].length || 1

  return (
    <div
      className="relative min-h-screen bg-[#f9f8f6] lg:grid lg:grid-cols-[minmax(0,1fr)_16rem]"
      dir="rtl"
    >
      <Sidebar
        active={activeKey}
        onNav={handleNav}
        menuCount={publishedMenus.length}
        qrCount={publishedQrCards.length}
        langCount={langCount}
        restaurant={restaurant}
        hasPaidPlan={hasPaidPlan}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 w-full flex flex-col overflow-hidden lg:col-start-1 lg:row-start-1">
        <Topbar
          active={activeKey}
          restaurant={restaurant}
          hasPaidPlan={hasPaidPlan}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Overview */}
          {activeKey === "overview" && (
            <OverviewPage
              restaurant={restaurant}
              publishedMenus={publishedMenus}
              publishedQrCards={publishedQrCards}
              hasPaidPlan={hasPaidPlan}
              onNav={handleNav}
              onRefresh={() => router.refresh()}
            />
          )}

          {/* Menus */}
          {activeKey === "menus" && (
            <div className="p-6 max-w-[1240px] mx-auto">
              <div className="flex items-start gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight mb-1">القوائم</h2>
                  <p className="text-[13.5px] text-gray-400">أدر قوائمك المنشورة ونسخها اللغوية.</p>
                </div>
                <div className="ms-auto flex items-center gap-2">
                  <Link
                    href="/dashboard/import"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-gray-700 bg-white border border-[#e8e5e1] hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    <Sparkles size={14} className="text-violet-500" />
                    استيراد بالذكاء
                  </Link>
                  <Link
                    href="/menu-editor"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
                  >
                    <Plus size={14} />
                    قائمة جديدة
                  </Link>
                </div>
              </div>
              <MenuTabWithPreviews
                getMenuPublicUrl={getMenuPublicUrl}
                handleDeleteMenu={handleDeleteMenu}
                publishedMenus={publishedMenus}
              />
            </div>
          )}

          {/* QR Cards */}
          {activeKey === "qr-cards" && (
            <div className="p-6 max-w-[1240px] mx-auto">
              <div className="flex items-start gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-[21px] font-bold text-gray-900 tracking-tight leading-tight mb-1">بطاقات QR</h2>
                  <p className="text-[13.5px] text-gray-400">أنشئ وأدر بطاقات الباركود.</p>
                </div>
              </div>
              <QrCardTab
                publishedQrCards={publishedQrCards}
                restaurant={restaurant}
                handleDeleteQrCard={handleDeleteQrCard}
                getMenuPublicUrl={getMenuPublicUrl}
              />
            </div>
          )}

          {/* Restaurant Info */}
          {activeKey === "restaurant-info" && (
            <RestaurantInfoPage
              restaurant={restaurant}
              hasPaidPlan={hasPaidPlan}
              isUploadingLogo={isUploadingLogo}
              onLogoUpload={handleLogoUpload}
              onEdit={() => { setEditData({ name: restaurant.name, category: restaurant.category, address: restaurant.address ?? "", phone: restaurant.phone ?? "", email: restaurant.email ?? "", currency: restaurant.currency ?? "EGP" }); setIsEditingRestaurant(true) }}
              onDelete={handleDeleteRestaurant}
              isDeletingRestaurant={isDeletingRestaurant}
            />
          )}

          {/* Languages */}
          {activeKey === "languages" && (
            <LanguagesPage publishedMenus={publishedMenus} />
          )}
        </main>
      </div>

      {/* Confirm modal */}
      <ConfirmationModal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction((p) => ({ ...p, show: false }))}
        onConfirm={() => { confirmAction.action(); setConfirmAction((p) => ({ ...p, show: false })) }}
        title={confirmAction.title}
        description={confirmAction.description}
        type={confirmAction.type}
        confirmText="تأكيد"
        cancelText="إلغاء"
      />

      {/* Edit restaurant modal */}
      <Dialog open={isEditingRestaurant} onOpenChange={setIsEditingRestaurant}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-start">
              <Edit className="h-5 w-5 text-red-600" />
              تعديل معلومات المطعم
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم المطعم</Label>
                <Input id="edit-name" value={editData.name} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={editData.category} onValueChange={(v) => setEditData((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">مقهى</SelectItem>
                    <SelectItem value="restaurant">مطعم</SelectItem>
                    <SelectItem value="both">مقهى ومطعم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">الهاتف</Label>
                <Input id="edit-phone" value={editData.phone} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input id="edit-email" type="email" value={editData.email} onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))} placeholder="البريد الإلكتروني" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>العملة</Label>
                <Select value={editData.currency} onValueChange={(v) => setEditData((p) => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-address">العنوان</Label>
                <Textarea id="edit-address" value={editData.address} onChange={(e) => setEditData((p) => ({ ...p, address: e.target.value }))} rows={2} placeholder="عنوان المطعم" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditingRestaurant(false)}>إلغاء</Button>
            <Button onClick={handleUpdateRestaurant} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Save size={14} />
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-xl grid place-items-center shadow-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <p className="text-[16px] font-semibold text-gray-700">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <DashboardContent {...props} />
    </Suspense>
  )
}
