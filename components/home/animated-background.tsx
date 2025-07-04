export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Enhanced Floating Particles - Updated for better mobile alignment */}
      <div className="hidden sm:block absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
      <div className="hidden sm:block absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
      <div className="hidden sm:block absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
      <div className="hidden sm:block absolute top-1/3 left-20 w-2 h-2 bg-red-600 rounded-full animate-bounce delay-500 shadow-lg shadow-red-600/50"></div>
      
      {/* Additional floating elements - Updated for mobile */}
      <div className="hidden sm:block absolute top-1/4 right-1/3 w-4 h-4 bg-gradient-to-r from-red-400 to-rose-400 rounded-full animate-pulse delay-200 shadow-xl"></div>
      <div className="hidden sm:block absolute bottom-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-pulse delay-800 shadow-xl"></div>
    </div>
  )
}
