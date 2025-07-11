import Link from "next/link"
import { QrCode } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

const AnimatedLogo = dynamic(() => import('@/components/ui/animated-logo'))

interface HeaderSectionProps {
  user: any; // Replace 'any' with actual user type if available
}

export default function HeaderSection({ user }: HeaderSectionProps) {
  return (
    <header className="relative z-50 px-4 lg:px-6 h-24 flex items-center justify-between border-b border-red-200/50 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 sticky top-0 shadow-lg shadow-red-500/10">
      <Link className="flex items-center group" href="#">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <QrCode className="h-7 w-7 text-white animate-pulse" />
          </div>
        </div>
        <AnimatedLogo />
      </Link>

      <nav className="hidden md:flex gap-8 mr-auto">
        <Link
          className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
          href="#features"
        >
          المميزات
          <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
        </Link>
        <Link
          className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
          href="#pricing"
        >
          الأسعار
          <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
        </Link>
        <Link
          className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
          href="#contact"
        >
          اتصل بنا
          <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
        </Link>
        <Link
          className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
          href="/about-creator"
        >
          عن المطور
          <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
        </Link>
      </nav>

      <Button asChild className="mx-2 md:mx-8 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-110 border border-red-400/50 text-lg px-4 md:px-6 py-2 md:py-3 text-white">
        <Link href={user?.email ? "/dashboard" : "/auth/sign-up"}>
          {user?.email ? "لوحة التحكم" : "ابدأ الآن"}
        </Link>
      </Button>
    </header>
  )
}
