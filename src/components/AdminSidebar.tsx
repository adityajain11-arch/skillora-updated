import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Terminal,
  Users,
  SlidersHorizontal,
  FileSpreadsheet,
  ClipboardList,
  FolderGit2,
  Award,
  History,
  Settings,
  RotateCcw,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

interface AdminSidebarProps {
  adminEmail: string;
  onLogout: () => void;
  onRequestReset: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Overview', icon: Terminal },
  { to: '/admin/students', label: 'Student Management', icon: Users },
  { to: '/admin/internships', label: 'Internship Management', icon: SlidersHorizontal },
  { to: '/admin/offer-letters', label: 'Offer Letter Management', icon: FileSpreadsheet },
  { to: '/admin/documents/offer-letter', label: 'Document Customization', icon: Award },
  { to: '/admin/issued-documents', label: 'Issued Documents', icon: Award },
  { to: '/admin/tasks', label: 'Task Management', icon: ClipboardList },
  { to: '/admin/submissions', label: 'Project Submissions', icon: FolderGit2 },
  { to: '/admin/certificates', label: 'Certificate Management', icon: Award },
  { to: '/admin/change-log', label: 'Internship Change Log', icon: History },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminEmail,
  onLogout,
  onRequestReset,
  mobileOpen,
  onCloseMobile,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#182747] text-[#FFF8E7] border-r-2 border-[#303030]">
      <div className="p-4 border-b-2 border-[#303030] bg-[#111c34] flex items-center justify-between gap-2">
        <Logo size="sm" theme="dark" />
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 bg-[#C94C4C] text-[#FFF8E7] border border-[#303030] cursor-pointer"
          aria-label="Close admin navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 border-b-2 border-[#303030] bg-[#22355e]">
        <p className="font-mono-data text-[10px] font-bold uppercase text-[#F4C542]">
          ADMIN CONTROL SESSION
        </p>
        <p className="font-mono-data text-xs text-[#FFF8E7] truncate mt-1">
          {adminEmail}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" aria-label="Admin Control Navigation">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 border-2 text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F4C542] text-[#182747] border-[#303030] retro-shadow-sm'
                    : 'bg-transparent text-[#FFF8E7] border-transparent hover:border-[#F4C542]/50 hover:bg-[#22355e]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t-2 border-[#303030] bg-[#111c34] space-y-2">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onRequestReset();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F4EBD0] text-[#182747] border-2 border-[#303030] text-xs font-bold hover:bg-[#eadcb5] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Reset Demo Data</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#C94C4C] text-[#FFF8E7] border-2 border-[#303030] text-sm font-bold hover:bg-[#b53e3e] cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="no-print hidden lg:block w-72 shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
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
