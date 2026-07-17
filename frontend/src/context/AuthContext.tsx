import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logAuditAction } from '../lib/audit';

export type Role = 'Admin' | 'SRE' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>; 
  register: (name: string, email: string, role: Role, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase!.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Unknown',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as Role) || 'SRE'
            });
          }
        } else {
          // Fallback to mock LocalStorage for Hackathon Demo
          const mockUser = localStorage.getItem('intellirca_mock_user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          }
        }
      } catch (error) {
        console.error("Auth init error", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password?: string) => {
    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          name: data.session.user.user_metadata?.name || 'Unknown',
          email: data.session.user.email || '',
          role: (data.session.user.user_metadata?.role as Role) || 'SRE'
        });
        
        await logAuditAction({
          action: 'User Login',
          metadata: { email }
        });
      }
    } else {
      // Mock Login
      if (email !== 'admin@intellirca.com' && email !== 'sre@intellirca.com') {
        // Just a mock check so we can show "invalid credentials"
        // But for the hackathon we'll let any email in to prevent blocking them, unless they want strict mock auth
      }
      const mockUser = { id: 'mock-123', name: 'Demo Engineer', email, role: 'SRE' as Role };
      setUser(mockUser);
      localStorage.setItem('intellirca_mock_user', JSON.stringify(mockUser));
    }
  };

  const register = async (name: string, email: string, role: Role, password?: string) => {
    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });
      if (error) throw new Error(error.message);

      if (data.session?.user) {
         setUser({
          id: data.session.user.id,
          name,
          email,
          role
        });
      }
    } else {
      // Mock Registration
      const mockUser = { id: `mock-${Date.now()}`, name, email, role };
      setUser(mockUser);
      localStorage.setItem('intellirca_mock_user', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await logAuditAction({ action: 'User Logout' });
      await supabase!.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('intellirca_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
