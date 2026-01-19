import { createContext, useContext, useState, useEffect,type ReactNode } from 'react';
import { OpenAPI } from '../services/api/core/OpenAPI';

// 1. Define what a "User" looks like
export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  token?: string; // Optional JWT token
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.token) {
           OpenAPI.TOKEN = parsedUser.token;
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  // 3. Login Function (Saves to State & Storage)
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
    if (userData.token) {
        OpenAPI.TOKEN = userData.token;
    }
  };

  // 4. Logout Function (Clears State & Storage)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token'); 
    OpenAPI.TOKEN = undefined;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook to use this easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};