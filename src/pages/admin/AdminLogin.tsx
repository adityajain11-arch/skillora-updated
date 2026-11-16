import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadRememberedAdminEmail,
  saveRememberedAdminEmail,
} from '../../services/storageService';
import { Logo } from '../../components/Logo';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { RetroFooter } from '../../components/RetroFooter';

export const AdminLogin: React.FC = () => {
  const { session, loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const initialRemembered = loadRememberedAdminEmail();
  const [email, setEmail] = useState(initialRemembered);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(initialRemembered));
  const [errorMessage, setErrorMessage] = useState('');

  if (session.adminEmail) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@skillora.in' && password === 'Admin123') {
      if (rememberMe) {
        saveRememberedAdminEmail('admin@skillora.in');
      } else {
        saveRememberedAdminEmail(null);
      }
      loginAsAdmin('admin@skillora.in');
      navigate('/admin/dashboard', { replace: true });
    } else {
      setErrorMessage(
        'Invalid administrator email or password. Please enter the authorized Skillora demo credentials.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col retro-admin-bg overflow-x-hidden">
      <header className="bg-[#182747] text-[#FFF8E7] border-b-2 border-[#303030] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link to="/student/register" aria-label="Skillora Home">
            <Logo size="md" theme="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono-data text-xs text-[#F4C542] font-bold">
              <Shield className="w-4 h-4" />
              <span>RESTRICTED OPERATIONS CONSOLE</span>
            </span>
            <Link
              to="/student/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E7] text-[#182747] border-2 border-[#303030] text-xs font-bold retro-shadow-sm hover:bg-[#F4EBD0] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          <RetroWindow title="SKILLORA_ADMIN_TERMINAL.EXE" headerColor="navy">
            <div className="flex flex-col items-center text-center pb-5 border-b-2 border-dotted border-[#303030]/40">
              <Logo size="lg" />
              <h1 className="mt-4 font-pixel text-xs sm:text-sm text-[#182747] tracking-wide">
                ADMIN CONTROL PANEL
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#4169E1]">
                Authorized Administrator Access Only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                >
                  Admin Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skillora.in"
                  className="w-full px-3 py-2.5 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1] retro-bevel-in"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                >
                  Admin Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-3 pr-11 py-2.5 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1] retro-bevel-in"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 p-1.5 text-[#182747] hover:text-[#4169E1] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#182747]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#182747] border-2 border-[#303030] cursor-pointer"
                  />
                  <span>Remember Me (demo)</span>
                </label>

                <Link
                  to="/student/register"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4169E1] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </Link>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-[#C94C4C]/15 border-2 border-[#C94C4C] text-xs font-bold text-[#8a2323] flex items-start gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#C94C4C]" />
                  <span>{errorMessage}</span>
                </div>
              )}



              <RetroButton type="submit" variant="primary" size="lg" className="w-full">
                <KeyRound className="w-4 h-4" />
                <span>LOGIN TO ADMIN PANEL</span>
              </RetroButton>
            </form>
          </RetroWindow>
        </div>
      </main>

      <RetroFooter portalLabel="Skillora Admin Control Panel" />
    </div>
  );
};
