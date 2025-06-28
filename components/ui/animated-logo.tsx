"use client"
import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const AnimatedLogo = () => {
  const [currentVersion, setCurrentVersion] = useState(0); // 0 for Arabic, 1 for English
  const [menuVisible, setMenuVisible] = useState(false);
  const [suffixVisible, setSuffixVisible] = useState(false);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const [flameActive, setFlameActive] = useState(false);

  const versions = [
    { menu: 'قائمه', suffix: '-P', menuWidth: '3.5rem' }, // Arabic: Menu-P
    { menu: 'Menu', suffix: '-P', menuWidth: '3rem' }    // English: Menu-P
  ];

  useEffect(() => {
    // Reset all states
    setMenuVisible(false);
    setSuffixVisible(false);
    setPremiumVisible(false);
    setFlameActive(false);

    const sequence = async () => {
      // Staggered entrance animations
      setTimeout(() => setMenuVisible(true), 200);
      setTimeout(() => setSuffixVisible(true), 800);
      setTimeout(() => setPremiumVisible(true), 1400);
      setTimeout(() => setFlameActive(true), 1800);
      
      // Hold the complete state
      setTimeout(() => {
        // Staggered exit animations
        setFlameActive(false);
        setTimeout(() => setPremiumVisible(false), 150);
        setTimeout(() => setSuffixVisible(false), 300);
        setTimeout(() => setMenuVisible(false), 450);
        
        // Switch version after exit completes
        setTimeout(() => {
          setCurrentVersion(prev => (prev + 1) % 2);
        }, 800);
      }, 3000);
    };

    sequence();
  }, [currentVersion]);

  const currentLang = versions[currentVersion];

  return (
    <div className="mx-6 select-none">
      {/* Main logo text with fixed container */}
      <div className="flex items-center h-8">
        {/* Menu text container with fixed width */}
        <div 
          className="overflow-hidden flex-shrink-0"
          style={{ width: currentLang.menuWidth }}
        >
          <span 
            className={`
              inline-block text-xl font-black bg-gradient-to-r from-gray-900 via-red-700 to-gray-900 
              bg-clip-text text-transparent leading-tight whitespace-nowrap
              transition-all duration-700 ease-out transform
              ${menuVisible 
                ? 'translate-x-0 opacity-100' 
                : currentVersion === 0 
                  ? 'translate-x-8 opacity-0' 
                  : '-translate-x-8 opacity-0'
              }
            `}
          >
            {currentLang.menu}
          </span>
        </div>
        
        {/* Suffix container with fixed width */}
        <div className="w-12 flex-shrink-0">
          <span 
            className={`
              inline-block text-xl font-black bg-gradient-to-r from-gray-900 via-red-700 to-gray-900 
              bg-clip-text text-transparent leading-tight
              transition-all duration-500 ease-out transform
              ${suffixVisible 
                ? 'translate-y-0 opacity-100 scale-100' 
                : 'translate-y-4 opacity-0 scale-75'
              }
            `}
          >
            {currentLang.suffix}
          </span>
        </div>
      </div>
      
      {/* Premium section with fixed height container */}
      <div className="h-6 mt-1">
        <div 
          className={`
            text-xs text-red-600 font-medium tracking-wider flex items-center gap-1.5
            transition-all duration-600 ease-out transform
            ${premiumVisible 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-3 opacity-0 scale-95'
            }
          `}
        >
          <Flame 
            className={`
              h-3 w-3 transition-all duration-400 ease-out transform
              ${flameActive 
                ? 'text-orange-500 scale-125 rotate-12' 
                : 'text-red-600 scale-100 rotate-0'
              }
            `}
            style={{
              filter: flameActive 
                ? 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.8)) drop-shadow(0 0 12px rgba(251, 146, 60, 0.4))' 
                : 'none',
            }}
          />
          <span 
            className={`
              transition-all duration-300 ease-out
              ${flameActive ? 'text-orange-600' : 'text-red-600'}
            `}
          >
            PREMIUM
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogo;