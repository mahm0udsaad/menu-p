import { Users, Globe, QrCode, Trophy } from "lucide-react"

export default function StatsSection() {
  return (
    <section className="w-full py-12 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/50 to-transparent"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-4 md:gap-8 grid-cols-2 lg:grid-cols-4 md:gap-12">
          <div className="flex flex-col items-center space-y-2 md:space-y-6 text-center group hover:scale-105 md:hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                <Users className="h-5 md:h-8 w-5 md:w-8 md:h-12 md:w-12 text-white" />
              </div>
            </div>
            <div className="text-xl md:text-3xl lg:text-6xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              +500
            </div>
            <div className="text-gray-600 font-bold text-xs md:text-sm lg:text-xl">مطعم متميز</div>
          </div>

          <div className="flex flex-col items-center space-y-2 md:space-y-6 text-center group hover:scale-105 md:hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                <Globe className="h-5 md:h-8 w-5 md:w-8 md:h-12 md:w-12 text-white" />
              </div>
            </div>
            <div className="text-xl md:text-3xl lg:text-6xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              15
            </div>
            <div className="text-gray-600 font-bold text-xs md:text-sm lg:text-xl">دولة عربية</div>
          </div>

          <div className="flex flex-col items-center space-y-2 md:space-y-6 text-center group hover:scale-105 md:hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                <QrCode className="h-5 md:h-8 w-5 md:w-8 md:h-12 md:w-12 text-white" />
              </div>
            </div>
            <div className="text-xl md:text-3xl lg:text-6xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              +50k
            </div>
            <div className="text-gray-600 font-bold text-xs md:text-sm lg:text-xl">كود QR نشط</div>
          </div>

          <div className="flex flex-col items-center space-y-2 md:space-y-6 text-center group hover:scale-105 md:hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                <Trophy className="h-5 md:h-8 w-5 md:w-8 md:h-12 md:w-12 text-white" />
              </div>
            </div>
            <div className="text-xl md:text-3xl lg:text-6xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-gray-600 font-bold text-xs md:text-sm lg:text-xl">ضمان التشغيل</div>
          </div>
        </div>
      </div>
    </section>
  )
}
