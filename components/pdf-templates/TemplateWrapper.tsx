'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const TemplateWrapper = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const isPlaywright = searchParams.get('playwright');

    if (isPlaywright) {
      const signalReady = () => {
        (window as any).pageReady = true;
        console.log('✅ Page is ready for PDF generation.');
      };

      if (document.readyState === 'complete') {
        signalReady();
      } else {
        window.addEventListener('load', signalReady);
        return () => window.removeEventListener('load', signalReady);
      }
    }
  }, [searchParams]);

  return <>{children}</>;
};

export default TemplateWrapper; 