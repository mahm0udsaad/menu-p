"use client"

import React from 'react'
import InlineEditable from "../inline-editable"

export const MenuFooter: React.FC = () => {
  return (
    <div className="mt-8 text-center space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <InlineEditable
              value="ساعات العمل"
              onSave={(value) => console.log("Hours title update:", value)}
              className="font-serif text-gray-800 mb-2 block text-center"
              placeholder="عنوان الساعات"
            />
            <InlineEditable
              value="الاثنين - الخميس: 7:00 ص - 9:00 م"
              onSave={(value) => console.log("Hours 1 update:", value)}
              className="block text-center"
              placeholder="ساعات العمل"
            />
            <InlineEditable
              value="الجمعة - السبت: 7:00 ص - 10:00 م"
              onSave={(value) => console.log("Hours 2 update:", value)}
              className="block text-center"
              placeholder="ساعات نهاية الأسبوع"
            />
            <InlineEditable
              value="الأحد: 8:00 ص - 8:00 م"
              onSave={(value) => console.log("Hours 3 update:", value)}
              className="block text-center"
              placeholder="ساعات الأحد"
            />
          </div>
          <div>
            <InlineEditable
              value="العنوان"
              onSave={(value) => console.log("Address title update:", value)}
              className="font-serif text-gray-800 mb-2 block text-center"
              placeholder="عنوان القسم"
            />
            <InlineEditable
              value="123 شارع الطعام"
              onSave={(value) => console.log("Address update:", value)}
              className="block text-center"
              placeholder="العنوان"
            />
            <InlineEditable
              value="المدينة، المنطقة 12345"
              onSave={(value) => console.log("City update:", value)}
              className="block text-center"
              placeholder="المدينة والرمز البريدي"
            />
          </div>
          <div>
            <InlineEditable
              value="التواصل"
              onSave={(value) => console.log("Contact title update:", value)}
              className="font-serif text-gray-800 mb-2 block text-center"
              placeholder="عنوان التواصل"
            />
            <InlineEditable
              value="(555) 123-4567"
              onSave={(value) => console.log("Phone update:", value)}
              className="block text-center"
              placeholder="رقم الهاتف"
            />
            <InlineEditable
              value="info@restaurant.com"
              onSave={(value) => console.log("Email update:", value)}
              className="block text-center"
              placeholder="البريد الإلكتروني"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 