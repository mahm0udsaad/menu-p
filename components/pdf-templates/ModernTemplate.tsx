"use client"

import React from 'react';
import TemplateBase from './TemplateBase';
import { useTemplateData } from './TemplateDataProvider';

export default function ModernTemplate() {
  const { data } = useTemplateData();
  
  if (!data.restaurant || !data.categories) {
    return <div>Loading...</div>;
  }

  const { restaurant, categories } = data;
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(data.language || 'ar');

  return (
    <TemplateBase className="modern-template">
      <div className="modern-container">
        {/* Modern Header */}
        <header className="modern-header">
          {restaurant.logo_url && (
            <div className="modern-logo-container">
              <img src={restaurant.logo_url} alt="Logo" className="modern-logo" />
            </div>
          )}
          
          <h1 className="modern-title">{restaurant.name}</h1>
          <div className="modern-subtitle">{isRTL ? 'قائمة الطعام' : 'Menu'}</div>
        </header>

        {/* Modern Categories */}
        <div className="modern-categories">
          {categories.map((category: any, index: number) => {
            if (!category.menu_items || category.menu_items.length === 0) return null;
            
            const validItems = category.menu_items.filter((item: any) => 
              item && item.name && item.is_available && item.price !== null
            );
            
            if (validItems.length === 0) return null;
            
            return (
              <section key={category.id} className={`modern-category ${index % 2 === 0 ? 'category-left' : 'category-right'}`}>
                <div className="modern-category-header">
                  <h2 className="modern-category-name">{category.name}</h2>
                  {category.description && (
                    <p className="modern-category-desc">{category.description}</p>
                  )}
                </div>
                
                <div className="modern-items">
                  {validItems.map((item: any) => (
                    <div key={item.id} className={`modern-item ${item.is_featured ? 'featured' : ''}`}>
                      <div className="modern-item-content">
                        <h3 className="modern-item-name">{item.name}</h3>
                        {item.description && (
                          <p className="modern-item-desc">{item.description}</p>
                        )}
                        {item.dietary_info && item.dietary_info.length > 0 && (
                          <div className="modern-dietary-info">
                            {item.dietary_info.map((info: string, idx: number) => (
                              <span key={idx} className="modern-dietary-tag">{info}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="modern-item-price">
                        {formatPrice(item.price, restaurant.currency || 'EGP', isRTL)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Modern Footer */}
        <footer className="modern-footer">
          <div className="modern-footer-pattern"></div>
          <p className="modern-footer-text">
            {isRTL ? 'شكراً لزيارتكم' : 'Thank you for dining with us'}
          </p>
        </footer>
      </div>
    </TemplateBase>
  );
}

function formatPrice(price: number, currency: string, isRTL: boolean): string {
  const formattedPrice = new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  
  return isRTL ? formattedPrice.replace('EGP', 'ج.م').replace('USD', 'دولار').replace('EUR', 'يورو') : formattedPrice;
} 