import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  labNumber: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean }> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, ipAddress: '0.0.0.0', userAgent: navigator.userAgent }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }
      
      const data = await response.json();

      if (data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth-token', data.token);
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('auth-token');
      await fetch(`${apiUrl}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch {
      // best-effort
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      isLoading,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
