"use client"
import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const AnimatedLogo = () => {
  const [currentVersion, setCurrentVersion] = useState(0); // 0 for Arabic, 1 for English
  const [showMenu, setShowMenu] = useState(false);
  const [showP, setShowP] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [flameActive, setFlameActive] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const versions = [
    { menu: 'p-قائمه', suffix: '-P' }, // Arabic: Menu-P
    { menu: 'Menu-p', suffix: '-P' }   // English: Menu-P
  ];

  useEffect(() => {
    const runAnimation = () => {
      // Reset states for forward animation
      setShowMenu(false);
      setShowP(false);
      setShowPremium(false);
      setFlameActive(false);
      setIsReversing(false);
      setAnimationKey(prev => prev + 1);

      // Forward animation sequence
      const menuTimer = setTimeout(() => setShowMenu(true), 300);
      const pTimer = setTimeout(() => setShowP(true), 1200);
      const premiumTimer = setTimeout(() => setShowPremium(true), 1800);
      const flameTimer = setTimeout(() => setFlameActive(true), 2200);

      // Start reverse animation
      const reverseTimer = setTimeout(() => {
        setIsReversing(true);
        
        // Reverse sequence - same timing but in reverse order
        setTimeout(() => setFlameActive(false), 100);
        setTimeout(() => setShowPremium(false), 300);
        setTimeout(() => setShowP(false), 600);
        setTimeout(() => setShowMenu(false), 900);
        
        // Switch version and restart
        setTimeout(() => {
          setCurrentVersion(prev => (prev + 1) % 2);
        }, 1200);
        
      }, 4000);

      return () => {
        clearTimeout(menuTimer);
        clearTimeout(pTimer);
        clearTimeout(premiumTimer);
        clearTimeout(flameTimer);
        clearTimeout(reverseTimer);
      };
    };

    const cleanup = runAnimation();
    return cleanup;
  }, [currentVersion]);

  const currentLang = versions[currentVersion];

  return (
    <div className="mx-6" key={animationKey}>
      {/* Main logo text */}
      <div className="text-xl font-black bg-gradient-to-r from-gray-900 via-red-700 to-gray-900 bg-clip-text text-transparent leading-tight flex items-center">
        {/* Menu text with typewriter effect */}
        <span 
          className={`transition-all duration-1000 ease-out ${
            showMenu ? 'w-auto opacity-100' : 'w-0 opacity-0'
          }`}
          style={{
            whiteSpace: 'nowrap',
            direction: currentVersion === 0 ? 'rtl' : 'ltr',
          }}
        >
          {currentLang.menu}
        </span>
        
        {/* Suffix (-ع or -P) with slide in effect */}
        <span 
          className={`transition-all duration-500 ease-out ${
            currentVersion === 0 ? 'mr-0.5' : 'ml-0.5'
          } ${
            showP 
              ? 'transform translate-x-0 opacity-100 scale-100' 
              : `transform ${currentVersion === 0 ? '-translate-x-4' : 'translate-x-4'} opacity-0 scale-75`
          }`}
        >
          {currentLang.suffix}
        </span>
      </div>
      
      {/* Premium section */}
      <div 
        className={`text-xs text-red-600 font-medium tracking-wider flex items-center gap-1 mt-1 transition-all duration-600 ease-out ${
          showPremium 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform translate-y-2 opacity-0'
        }`}
      >
        <Flame 
          className={`h-2.5 w-2.5 transition-all duration-400 ${
            flameActive 
              ? 'text-orange-500 scale-110' 
              : 'text-red-600 scale-100'
          }`}
          style={{
            filter: flameActive ? 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.6))' : 'none',
          }}
        />
        <span className="text-xs">PREMIUM</span>
      </div>
    </div>
  );
};

export default AnimatedLogo;