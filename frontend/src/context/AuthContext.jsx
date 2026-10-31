import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smartjobs_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartjobs_token'));
  const [loading, setLoading] = useState(true);

  // Verify and refresh session on initial app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smartjobs_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('smartjobs_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('smartjobs_token');
          localStorage.removeItem('smartjobs_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('smartjobs_token', newToken);
    localStorage.setItem('smartjobs_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('smartjobs_token', newToken);
    localStorage.setItem('smartjobs_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('smartjobs_token');
    localStorage.removeItem('smartjobs_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('smartjobs_user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, [updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
