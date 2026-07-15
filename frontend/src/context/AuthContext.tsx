import { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'Admin' | 'SRE' | null;

interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void; // Mock: assumes auth validates password elsewhere
  register: (name: string, email: string, role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    // In a real app, this verifies email & password against a DB.
    // For mock purposes, if no user exists in state, we create a dummy one.
    if (!user) {
      setUser({ name: 'Demo User', email, role: 'SRE' });
    }
  };

  const register = (name: string, email: string, role: Role) => {
    setUser({ name, email, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
