import { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

export const usePdfWorker = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Configure PDF.js worker if not already configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/worker/pdf.worker.min.js';
    }
  }, []);
}; 