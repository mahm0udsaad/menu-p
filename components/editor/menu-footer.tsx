"use client"

import React, { useState, useEffect } from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Edit, Save, X } from 'lucide-react'

export const MenuFooter = () => {
  const { 
    restaurant, 
    handleUpdateRestaurantDetails, // Assuming this will be implemented to save the data
    isEditingFooter,
    setIsEditingFooter
  } = useMenuEditor()

  const [localRestaurant, setLocalRestaurant] = useState(restaurant)

  useEffect(() => {
    setLocalRestaurant(restaurant)
  }, [restaurant])

  const handleInputChange = (field: keyof typeof localRestaurant, value: string) => {
    setLocalRestaurant(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    handleUpdateRestaurantDetails(localRestaurant)
    setIsEditingFooter(false)
  }

  const handleCancel = () => {
    setLocalRestaurant(restaurant) // Revert changes
    setIsEditingFooter(false)
  }

  // Placeholder content if details are missing
  const footerContent = {
    address: localRestaurant?.address || '123 Foodie Lane, Flavor Town',
    phone: localRestaurant?.phone || '+1 (234) 567-890',
    website: localRestaurant?.website || 'www.your-restaurant.com'
  }

  return (
    <footer className="mt-12 p-6 bg-gray-50 text-center text-gray-600 text-sm relative">
      {isEditingFooter ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="footer-address">العنوان</Label>
              <Input 
                id="footer-address"
                value={footerContent.address} 
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="text-center bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="footer-phone">الهاتف</Label>
              <Input 
                id="footer-phone"
                value={footerContent.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-center bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="footer-website">الموقع الإلكتروني</Label>
              <Input 
                id="footer-website"
                value={footerContent.website} 
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="text-center bg-white"
              />
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-around items-center gap-4">
          <p>{footerContent.address}</p>
          <p>{footerContent.phone}</p>
          <p>{footerContent.website}</p>
          <Button 
            onClick={() => setIsEditingFooter(true)} 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
    </footer>
  )
} 