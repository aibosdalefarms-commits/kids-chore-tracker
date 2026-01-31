import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { verifyPin } from '../utils/pin';
import { useFamily } from './FamilyContext';

interface AdminContextType {
  isAuthenticated: boolean;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function AdminProvider({ children }: { children: ReactNode }) {
  const { family } = useFamily();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const authenticate = useCallback(async (pin: string): Promise<boolean> => {
    if (!family?.adminPin) return false;

    const isValid = await verifyPin(pin, family.adminPin);
    if (isValid) {
      setIsAuthenticated(true);

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new session timeout
      const newTimeoutId = setTimeout(() => {
        setIsAuthenticated(false);
      }, SESSION_TIMEOUT);
      setTimeoutId(newTimeoutId);

      return true;
    }
    return false;
  }, [family?.adminPin, timeoutId]);

  return (
    <AdminContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
