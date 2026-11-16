import React from 'react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'INITIALIZING SKILLORA INTERNSHIP SYSTEM...',
  progress = 85,
}) => {
  return (
    <div className="fixed inset-0 z-50 retro-desktop-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFF8E7] border-2 border-[#303030] retro-shadow">
        <div className="bg-[#182747] text-[#FFF8E7] px-4 py-2.5 border-b-2 border-[#303030] flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F4C542] border border-[#303030]" />
          <span className="font-pixel text-[10px]">SKILLORA_BOOT.EXE</span>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="font-vt text-xl text-[#182747] mt-5 tracking-wide">
            {message}
          </p>
          <div className="w-full h-6 bg-[#F4EBD0] border-2 border-[#303030] mt-4 p-0.5">
            <div
              className="h-full bg-[#4169E1] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
            />
          </div>
          <p className="font-mono-data text-xs text-[#303030] mt-2">
            Loading modules &amp; workspace state...
          </p>
        </div>
      </div>
    </div>
  );
};
