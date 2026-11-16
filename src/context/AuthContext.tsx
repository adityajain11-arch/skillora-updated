import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession } from '../types';
import {
  ADMIN_AUTH_STORAGE_KEY,
  AUTH_STORAGE_KEY,
  STUDENT_AUTH_STORAGE_KEY,
  clearAdminSessionEmail,
  clearStudentSessionId,
  loadAuthSession,
  saveAdminSessionEmail,
  saveStudentSessionId,
} from '../services/storageService';

interface AuthContextValue {
  session: AuthSession;
  isStudentAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loginAsStudent: (studentId: string) => void;
  loginAsAdmin: (email: string) => void;
  logoutStudent: () => void;
  logoutAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(() => loadAuthSession());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === STUDENT_AUTH_STORAGE_KEY ||
        e.key === ADMIN_AUTH_STORAGE_KEY ||
        e.key === AUTH_STORAGE_KEY
      ) {
        setSession(loadAuthSession());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loginAsStudent = useCallback((studentId: string) => {
    saveStudentSessionId(studentId);
    setSession((prev) => ({
      role: 'student',
      studentId,
      adminEmail: prev.adminEmail,
    }));
  }, []);

  const loginAsAdmin = useCallback((adminEmail: string) => {
    saveAdminSessionEmail(adminEmail);
    setSession((prev) => ({
      role: 'admin',
      adminEmail,
      studentId: prev.studentId,
    }));
  }, []);

  const logoutStudent = useCallback(() => {
    clearStudentSessionId();
    setSession((prev) => ({
      role: prev.adminEmail ? 'admin' : null,
      studentId: undefined,
      adminEmail: prev.adminEmail,
    }));
  }, []);

  const logoutAdmin = useCallback(() => {
    clearAdminSessionEmail();
    setSession((prev) => ({
      role: prev.studentId ? 'student' : null,
      studentId: prev.studentId,
      adminEmail: undefined,
    }));
  }, []);

  const logout = useCallback(() => {
    clearStudentSessionId();
    clearAdminSessionEmail();
    setSession({ role: null });
  }, []);

  const isStudentAuthenticated = Boolean(session.studentId);
  const isAdminAuthenticated = Boolean(session.adminEmail);

  return (
    <AuthContext.Provider
      value={{
        session,
        isStudentAuthenticated,
        isAdminAuthenticated,
        loginAsStudent,
        loginAsAdmin,
        logoutStudent,
        logoutAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
