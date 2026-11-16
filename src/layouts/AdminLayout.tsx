import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { Logo } from '../components/Logo';
import { RetroFooter } from '../components/RetroFooter';
import { NotificationDialog } from '../components/NotificationDialog';

export const AdminLayout: React.FC = () => {
  const { session, logoutAdmin } = useAuth();
  const { resetDemoData } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetDoneOpen, setResetDoneOpen] = useState(false);

  if (!session.adminEmail) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    setResetDoneOpen(true);
  };

  return (
    <div className="min-h-screen flex retro-admin-bg overflow-x-hidden">
      <AdminSidebar
        adminEmail={session.adminEmail}
        onLogout={handleLogout}
        onRequestReset={() => setConfirmResetOpen(true)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Admin Control Room Header */}
        <header className="no-print bg-[#182747] text-[#FFF8E7] border-b-2 border-[#303030] px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 bg-[#F4C542] border-2 border-[#303030] text-[#182747] cursor-pointer"
                aria-label="Open admin navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" theme="dark" />
              </div>
              <div className="min-w-0">
                <div className="font-pixel text-[10px] sm:text-xs text-[#F4C542] truncate">
                  ADMIN_CONTROL_ROOM.EXE
                </div>
                <p className="text-xs text-[#F4EBD0] mt-1 truncate">
                  Skillora Operations &amp; Certification Command Console
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <span className="font-mono-data text-xs px-2.5 py-1 bg-[#22355e] border border-[#F4C542]/50 text-[#F4EBD0]">
                OPERATOR: {session.adminEmail}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <RetroFooter portalLabel="Skillora Admin Control Room" />
      </div>

      <NotificationDialog
        open={confirmResetOpen}
        title="CONFIRM_DEMO_RESET.EXE"
        message="Are you sure you want to reset all portal records (students, tasks, submissions, certificates, and LORs) back to the initial Skillora demo dataset?"
        type="info"
        confirmLabel="Reset Demo Data"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <NotificationDialog
        open={resetDoneOpen}
        title="DEMO_RESET_COMPLETE.EXE"
        message="All Skillora portal data has been restored to the initial demonstration snapshot."
        type="success"
        confirmLabel="OK"
        onConfirm={() => setResetDoneOpen(false)}
      />
    </div>
  );
};
