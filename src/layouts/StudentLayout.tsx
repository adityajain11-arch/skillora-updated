import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StudentSidebar } from '../components/StudentSidebar';
import { Logo } from '../components/Logo';
import { StatusBadge } from '../components/StatusBadge';
import { RetroFooter } from '../components/RetroFooter';
import { formatShortDate } from '../utils/idGenerators';

export const StudentLayout: React.FC = () => {
  const { session, logoutStudent } = useAuth();
  const { state } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session.studentId) {
    return <Navigate to="/student/register" replace />;
  }

  const student = state.students.find((s) => s.id === session.studentId);
  if (!student) {
    logoutStudent();
    return <Navigate to="/student/register" replace />;
  }

  const handleLogout = () => {
    logoutStudent();
    navigate('/student/register', { replace: true });
  };

  return (
    <div className="min-h-screen flex retro-desktop-bg overflow-x-hidden">
      <StudentSidebar
        student={student}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Student Portal Header */}
        <header className="no-print bg-[#FFF8E7] border-b-2 border-[#303030] px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 bg-[#F4EBD0] border-2 border-[#303030] text-[#182747] cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" />
              </div>
              <div className="min-w-0">
                <div className="font-pixel text-[10px] sm:text-xs text-[#182747] truncate">
                  SKILLORA_STUDENT_TERMINAL.EXE
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#303030] mt-1">
                  <span className="font-bold text-[#182747]">
                    Welcome, {student.fullName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-data">{student.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{student.domain}</span>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline font-mono-data">
                    Joined {formatShortDate(student.registrationDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={student.internshipStatus} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <RetroFooter portalLabel="Skillora Student Portal" />
      </div>
    </div>
  );
};
