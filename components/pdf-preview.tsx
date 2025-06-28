import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { RenderParameters } from 'pdfjs-dist/types/src/display/api';
import { FileText } from 'lucide-react';
import { usePdfWorker } from '@/hooks/use-pdf-worker';

interface PDFPreviewProps {
  pdfUrl: string;
  className?: string;
  aspectRatio?: string; // e.g., "aspect-[4/3]", "aspect-[3/4]"
  loadingText?: string;
  errorIcon?: React.ReactNode;
  quality?: number; // JPEG quality (0.1 to 1.0)
  maxWidth?: number; // Maximum width for the preview
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  pdfUrl, 
  className = "",
  aspectRatio = "aspect-[4/3]",
  loadingText = "جاري التحميل...",
  errorIcon,
  quality = 0.8,
  maxWidth = 300
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<Map<string, string>>(new Map()); // Simple cache

  // Initialize PDF.js worker
  usePdfWorker();

  useEffect(() => {
    if (!pdfUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    // Check cache first
    if (cacheRef.current.has(pdfUrl)) {
      setPreviewUrl(cacheRef.current.get(pdfUrl) || null);
      setLoading(false);
      return;
    }

    generatePreview();
  }, [pdfUrl, maxWidth, quality]);

  const generatePreview = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(false);

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // First page only

      // Create canvas for rendering
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Calculate optimal scale for preview
      const viewport = page.getViewport({ scale: 1 });
      const scale = maxWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      // Set canvas dimensions
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Render page to canvas
      const renderContext: RenderParameters = {
        canvasContext: context,
        viewport: scaledViewport,
        intent: 'print' as const,
      };

      await page.render(renderContext).promise;

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Cache the result
      cacheRef.current.set(pdfUrl, dataUrl);
      
      setPreviewUrl(dataUrl);
      setLoading(false);

      // Cleanup
      pdf.destroy();
    } catch (err) {
      console.error('Error generating PDF preview:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${aspectRatio} bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
          <span className="text-xs text-gray-500">{loadingText}</span>
        </div>
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div className={`${aspectRatio} bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          {errorIcon || (
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          )}
          <span className="text-xs text-gray-500">PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${aspectRatio} bg-gray-100 overflow-hidden ${className}`}>
      <img 
        src={previewUrl}
        alt="PDF Preview"
        className="w-full h-full object-contain"
        loading="lazy"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PDFPreview; 