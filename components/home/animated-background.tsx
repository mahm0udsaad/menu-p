export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-sky-50/60 to-blue-50/70"></div>
      
      {/* Primary glass morphism panels */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-br from-red-200/20 to-sky-300/15 backdrop-blur-xl rounded-bl-[3rem] border border-sky-200/30 shadow-2xl shadow-sky-500/10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-sky-200/25 to-blue-200/20 backdrop-blur-xl rounded-tr-[3rem] border border-blue-200/30 shadow-2xl shadow-blue-500/10 animate-pulse delay-1000"></div>
      
      {/* Secondary glass panels */}
      <div className="absolute top-1/4 right-1/4 w-[35%] h-[35%] bg-gradient-to-bl from-red-300/15 to-sky-400/10 backdrop-blur-lg rounded-3xl border border-sky-300/25 shadow-xl shadow-sky-400/5 animate-pulse delay-500"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[40%] h-[30%] bg-gradient-to-tr from-sky-300/20 to-blue-300/15 backdrop-blur-lg rounded-3xl border border-blue-300/25 shadow-xl shadow-blue-400/5 animate-pulse delay-700"></div>
      
      {/* Floating glass orbs */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-r from-red-400/20 to-sky-400/15 backdrop-blur-md rounded-full border border-sky-400/30 shadow-lg shadow-sky-500/10 animate-float"></div>
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-sky-400/25 to-blue-400/20 backdrop-blur-md rounded-full border border-blue-400/30 shadow-lg shadow-blue-500/10 animate-float delay-1000"></div>
      
      {/* Enhanced gradient orbs with glass effect */}
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-gradient-to-r from-red-500/30 to-sky-500/20 rounded-full blur-3xl animate-pulse backdrop-blur-sm"></div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-gradient-to-r from-sky-500/25 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 backdrop-blur-sm"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-400/20 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-500 backdrop-blur-sm"></div>

      {/* Premium floating particles with glass effect */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-gradient-to-r from-red-500 to-sky-500 rounded-full animate-bounce delay-300 shadow-lg shadow-sky-500/50 backdrop-blur-sm border border-sky-400/30"></div>
      <div className="absolute top-40 left-32 w-3 h-3 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full animate-bounce delay-700 shadow-lg shadow-blue-500/50 backdrop-blur-sm border border-blue-400/30"></div>
      <div className="absolute bottom-32 right-1/3 w-3.5 h-3.5 bg-gradient-to-r from-blue-500 to-red-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-blue-500/50 backdrop-blur-sm border border-blue-400/30"></div>
      <div className="absolute top-1/3 left-20 w-2.5 h-2.5 bg-gradient-to-r from-red-600 to-sky-600 rounded-full animate-bounce delay-500 shadow-lg shadow-sky-600/50 backdrop-blur-sm border border-sky-500/30"></div>
      
      {/* Glass diamonds and geometric shapes */}
      <div className="absolute top-1/4 right-1/2 w-8 h-8 bg-gradient-to-r from-red-400/30 to-sky-400/25 backdrop-blur-md transform rotate-45 border border-sky-400/20 shadow-lg shadow-sky-500/10 animate-pulse delay-200"></div>
      <div className="absolute bottom-1/4 left-1/2 w-6 h-6 bg-gradient-to-r from-sky-400/35 to-blue-400/30 backdrop-blur-md transform rotate-45 border border-blue-400/20 shadow-lg shadow-blue-500/10 animate-pulse delay-800"></div>
      
      {/* Mobile-optimized smaller glass elements */}
      <div className="sm:hidden absolute top-16 right-8 w-16 h-16 bg-gradient-to-r from-red-300/20 to-sky-300/15 backdrop-blur-md rounded-full border border-sky-300/25 shadow-lg shadow-sky-400/5 animate-pulse"></div>
      <div className="sm:hidden absolute bottom-16 left-8 w-12 h-12 bg-gradient-to-r from-sky-300/25 to-blue-300/20 backdrop-blur-md rounded-full border border-blue-300/25 shadow-lg shadow-blue-400/5 animate-pulse delay-500"></div>
      
      {/* Ambient light effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-sky-50/10 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/10 to-transparent"></div>
    </div>
  )
}
