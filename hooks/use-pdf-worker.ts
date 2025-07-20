import { useState, useEffect } from 'react';

export function usePdfWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorker = async () => {
      try {
        // Try to load the PDF worker
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
        const workerInstance = new pdfjsWorker.default();
        setWorker(workerInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF worker:', err);
        setError('Failed to load PDF worker');
        setIsLoading(false);
      }
    };

    loadWorker();

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  return { worker, isLoading, error };
} 