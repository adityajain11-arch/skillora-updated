import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Logo } from './Logo';

interface RetroFooterProps {
  portalLabel?: string;
  showAdminLogin?: boolean;
}

export const RetroFooter: React.FC<RetroFooterProps> = ({
  portalLabel = 'Skillora Virtual Internship Portal',
  showAdminLogin = false,
}) => {
  return (
    <footer className="no-print border-t-2 border-[#303030] bg-[#FFF8E7] px-4 sm:px-6 py-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs text-[#303030]">
          <div>
            <span className="font-semibold text-[#182747]">{portalLabel}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} Skillora Technologies &amp; Career Academy</span>
          </div>
          {showAdminLogin && (
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#182747] text-[#F4C542] border-2 border-[#303030] font-mono-data font-bold text-[11px] uppercase tracking-wider retro-shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#F4C542] hover:text-[#182747]"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>ADMIN LOGIN</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};
