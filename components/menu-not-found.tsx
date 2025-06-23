"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function MenuNotFound() {
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    // Check if the iframe loaded successfully or returned an error
    const checkIframeStatus = () => {
      const iframe = document.querySelector('iframe');
      if (!iframe) return;

      // Set up a message listener for the iframe
      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'pdf-error') {
          setIsError(true);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Also check for iframe load errors
      iframe.addEventListener('error', () => {
        setIsError(true);
      });

      // Check if iframe loaded correctly after a timeout
      setTimeout(() => {
        try {
          // If we can't access the iframe content, it might be due to CORS or it failed to load
          if (iframe.contentDocument === null) {
            // Try to fetch the API endpoint directly to check status
            fetch(iframe.src)
              .then(response => {
                if (!response.ok) {
                  setIsError(true);
                }
              })
              .catch(() => {
                setIsError(true);
              });
          }
        } catch (e) {
          // Any error means we should show the error UI
          setIsError(true);
        }
      }, 3000);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    };
    
    checkIframeStatus();
  }, []);

  return isError ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Menu Not Found</h1>
      <p className="text-slate-300 mb-6">The menu you are looking for does not exist or may have been removed.</p>
      <Button asChild>
        <Link href="/">Go to Homepage</Link>
      </Button>
    </div>
  ) : null;
} 