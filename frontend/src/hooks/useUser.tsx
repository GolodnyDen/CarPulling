// src/hooks/useUser.tsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { User, ApiResult } from '../types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/me')
        .then((res) => {
          if (isMounted) {
            setUser(res.data);
          }
        })
        .catch(() => {
          if (isMounted) {
            localStorage.removeItem('token');
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string): Promise<ApiResult<{ user: User; token: string }>> => {
    setActionLoading('login');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true, data: res.data };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          error: error.response.data.error || 'Ошибка входа' 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    } finally {
      setActionLoading(null);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'driver' | 'passenger'): Promise<ApiResult<{ user: User; token: string }>> => {
    setActionLoading('register');
    try {
      const res = await api.post('/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true, data: res.data };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          error: error.response.data.error || 'Ошибка регистрации' 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    } finally {
      setActionLoading(null);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<ApiResult<User>> => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      return { success: true, data: res.data };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          error: error.response.data.error || 'Не удалось обновить данные' 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }, []);

  return { 
    user, 
    loading, 
    actionLoading, 
    login, 
    register, 
    logout,
    refreshUser 
  };
};

export default useUser;