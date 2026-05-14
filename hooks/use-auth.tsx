'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {

          
          // Fallback user data from session
          const fallbackUser: User = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'STAFF', // Default role
          };

          const { data: userDataFromDb, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (dbError) {
            console.warn('Could not fetch user profile from public.users, using session fallback:', dbError.message);
            setUser(fallbackUser);
          } else if (userDataFromDb) {
            const userData: User = {
              id: userDataFromDb.id,
              name: userDataFromDb.name || fallbackUser.name,
              email: userDataFromDb.email || fallbackUser.email,
              role: (userDataFromDb.role as Role) || 'STAFF',
              company_id: userDataFromDb.company_id
            };
            setUser(userData);

          } else {
            setUser(fallbackUser);
          }
          
          sessionStorage.setItem('supabase-token', session.access_token);
        }
      } catch (e) {
        console.error('Auth initialization failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (session) {
        const { data: userDataFromDb } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const baseUser: User = {
          id: session.user.id,
          name: userDataFromDb?.name || session.user.email?.split('@')[0] || 'User',
          email: userDataFromDb?.email || session.user.email || '',
          role: (userDataFromDb?.role as Role) || 'STAFF',
          company_id: userDataFromDb?.company_id
        };
        
        setUser(baseUser);
        sessionStorage.setItem('supabase-token', session.access_token);
      } else {
        setUser(null);
        sessionStorage.removeItem('supabase-token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password || '',
      });
      

      if (error) {
        console.error('Login error details:', error);
        throw error;
      }
      

      router.push('/');
    } catch (error: any) {
      console.error('Login failed catch block:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 1. Clear local session data immediately
      sessionStorage.clear();
      setUser(null);
      
      // 2. Attempt to sign out from Supabase (best effort)
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 3. Force a hard redirect to the login page to clear all React state
      window.location.href = '/';
    }
  };

  const hasRole = (roles: Role[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
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

