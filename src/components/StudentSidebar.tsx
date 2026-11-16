import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Gamepad2,
  UploadCloud,
  Award,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { Student } from '../types';

interface StudentSidebarProps {
  student: Student;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/student/offer-letter', label: 'My Offer Letter', icon: FileText },
  { to: '/student/tasks', label: 'Internship Tasks', icon: Gamepad2 },
  { to: '/student/submission', label: 'Project Submission', icon: UploadCloud },
  { to: '/student/certificate', label: 'My Certificate', icon: Award },
  { to: '/student/profile', label: 'My Profile', icon: UserCheck },
];

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  student,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFF8E7] border-r-2 border-[#303030]">
      <div className="p-4 border-b-2 border-[#303030] bg-[#182747] flex items-center justify-between gap-2">
        <Logo size="sm" theme="dark" />
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 bg-[#C94C4C] text-[#FFF8E7] border border-[#303030] cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Student Identity Box */}
      <div className="p-3.5 border-b-2 border-[#303030] bg-[#F4EBD0]">
        <p className="font-mono-data text-[10px] font-bold uppercase text-[#4169E1]">
          ACTIVE INTERN SESSION
        </p>
        <p className="text-sm font-bold text-[#182747] truncate mt-0.5">
          {student.fullName}
        </p>
        <p className="font-mono-data text-xs text-[#303030] mt-0.5">
          {student.id}
        </p>
        <p className="text-[11px] font-semibold text-[#4E8B62] truncate mt-1">
          {student.domain}
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" aria-label="Student Portal Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 border-2 text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#4169E1] text-[#FFF8E7] border-[#303030] retro-shadow-sm'
                    : 'bg-[#FFF8E7] text-[#182747] border-transparent hover:border-[#303030] hover:bg-[#F4EBD0]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t-2 border-[#303030] bg-[#F4EBD0]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#C94C4C] text-[#FFF8E7] border-2 border-[#303030] retro-shadow-sm text-sm font-bold hover:bg-[#b53e3e] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-64 shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#182747]/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
