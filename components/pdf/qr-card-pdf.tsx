"use client"

import React from 'react';

interface QRCardPDFProps {
  restaurantName: string
  qrCodeUrl: string
  menuUrl: string
  logoUrl?: string
}

export function QRCardPDF({ restaurantName, qrCodeUrl, menuUrl, logoUrl }: QRCardPDFProps) {
  return (
    <div className="qr-card-pdf min-h-[1123px] p-8 relative bg-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-16">
          {logoUrl && (
            <div className="mb-6">
              <img 
                src={logoUrl} 
                alt={restaurantName} 
                className="w-24 h-24 mx-auto object-contain rounded-full shadow-lg"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {restaurantName}
          </h1>
          <p className="text-xl text-gray-600">
            Scan to view our menu
          </p>
        </header>

        {/* QR Code */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200 inline-block">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-64 h-64 mx-auto"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to use:
          </h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>1. Open your camera app</p>
            <p>2. Point it at the QR code</p>
            <p>3. Tap the notification to view our menu</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Menu URL: {menuUrl}
          </p>
        </div>
      </div>
    </div>
  );
} 