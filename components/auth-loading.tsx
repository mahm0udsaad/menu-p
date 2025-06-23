'use client';

import { Loader2 } from 'lucide-react';

interface AuthLoadingProps {
  message?: string;
}

export default function AuthLoading({ message = 'جاري تسجيل الدخول...' }: AuthLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg border flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-700 text-center font-medium">{message}</p>
        <div className="text-xs text-gray-500 text-center">
          من فضلك انتظر بينما نقوم بتسجيل دخولك...
        </div>
      </div>
    </div>
  );
} 