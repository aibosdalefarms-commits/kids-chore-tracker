import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Inactivity timeout in milliseconds (3 minutes as per PRD)
const INACTIVITY_TIMEOUT = 3 * 60 * 1000;

/**
 * Hook to automatically return to home screen after inactivity.
 * Only activates on child-facing screens, not on admin pages.
 */
export function useAutoReturn() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout if not on home page and not in admin section
    const isHomePage = location.pathname === '/';
    const isAdminPage = location.pathname.startsWith('/admin');
    const isSetupPage = location.pathname.startsWith('/setup');

    if (!isHomePage && !isAdminPage && !isSetupPage) {
      timeoutRef.current = setTimeout(() => {
        navigate('/');
      }, INACTIVITY_TIMEOUT);
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Events that reset the inactivity timer
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  // Reset timer when location changes
  useEffect(() => {
    resetTimer();
  }, [location, resetTimer]);
}
