import { useState, useEffect } from 'react';
import ScreenSizeDialog from './ScreenSizeDialog';

interface ScreenSizeProviderProps {
  children: React.ReactNode;
}

const ScreenSizeProvider = ({ children }: ScreenSizeProviderProps) => {
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);

  const checkScreenSize = () => {
    const isSmall = window.innerWidth < 1024;
    setIsScreenTooSmall(isSmall);
  };

  useEffect(() => {
    // Check on mount
    checkScreenSize();

    // Debounced resize handler
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkScreenSize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Show dialog if screen is too small
  if (isScreenTooSmall) {
    return <ScreenSizeDialog />;
  }

  // Render children if screen size is acceptable
  return <>{children}</>;
};

export default ScreenSizeProvider; 