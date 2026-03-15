import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authApi, userApi, getAuthToken, setAuthToken } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map API role to frontend role
const mapApiRoleToFrontend = (role: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'ADMIN': 'admin',
    'MANAGER_PRODUCT': 'productManager',
  };
  return roleMap[role] || 'customer';
};

// Parse JWT token to get user info
const parseJwtToken = (token: string): { email: string; role: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const email = payload.sub || payload.email;
    const role = payload.role || payload.authorities?.[0]?.replace('ROLE_', '');
    // Only return valid token data if we have both email and role
    if (!email || !role) return null;
    return { email, role };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      let userSet = false;

      if (token) {
        // Try to fetch current user details using /me endpoint
        try {
          const user = await userApi.getCurrentUser();
          setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: mapApiRoleToFrontend(user.role),
            isBlocked: !user.active,
          });
          userSet = true;
        } catch {
          // Token might be invalid or expired, clear it
          setAuthToken(null);
        }
      }

      // No default demo user - if no user found, stay as null (guest)
      if (!userSet) {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      const token = await authApi.login(email, password);

      // Token is now stored, fetch user details using /me endpoint
      try {
        const user = await userApi.getCurrentUser();
        const mappedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: mapApiRoleToFrontend(user.role),
          isBlocked: !user.active,
        };
        setCurrentUser(mappedUser);
        toast.success('Đăng nhập thành công!');
        return mappedUser;
      } catch (meError) {
        // Fallback: Try to parse token for basic info
        const tokenData = parseJwtToken(token);
        if (tokenData?.email) {
          const fallbackUser: User = {
            id: 'token-user',
            name: tokenData.email.split('@')[0],
            email: tokenData.email,
            role: 'customer', // Default if we can't get from API
            isBlocked: false,
          };
          setCurrentUser(fallbackUser);
          toast.success('Đăng nhập thành công (Offline)!');
          return fallbackUser;
        }
        console.error('Failed to fetch user details:', meError);
        return null;
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    toast.success('Đã đăng xuất');
  };

  const switchRole = (role: User['role']) => {
    // Deprecated: Demo roles removed
    console.warn('Switch role is deprecated');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
