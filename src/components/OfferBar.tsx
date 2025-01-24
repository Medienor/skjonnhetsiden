import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const OfferBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);

  useEffect(() => {
    // Don't show on /tilbud page
    if (window.location.pathname === '/tilbud') return;

    // Check if we should show the bar based on localStorage
    const lastClosed = localStorage.getItem('offerBarClosed');
    const shouldShow = !lastClosed || 
      (new Date().getTime() - new Date(lastClosed).getTime()) > (24 * 60 * 60 * 1000);

    // Check if we're on mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Handle scroll
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= 25) {
        setHasScrolledEnough(true);
      }
    };

    // Set initial states after delay
    const timer = setTimeout(() => {
      if (shouldShow) {
        checkMobile();
        handleScroll(); // Check initial scroll position
      }
    }, 2000); // 2 second delay

    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    // Set visibility when conditions are met
    if (shouldShow && hasScrolledEnough) {
      setIsVisible(true);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolledEnough]); // Added hasScrolledEnough as dependency

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('offerBarClosed', new Date().toISOString());
  };

  // Don't render if on /tilbud page or conditions aren't met
  if (!isVisible || !isMobile || window.location.pathname === '/tilbud') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <a href="/tilbud" className="relative block">
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 h-[110px] px-4 flex items-center justify-between shadow-lg">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-1">
              Få gratis pristilbud på behandling
            </h3>
            <p className="text-purple-100 text-sm">
              Sammenlign priser fra kvalifiserte klinikker i ditt område
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </a>
    </div>
  );
}; 