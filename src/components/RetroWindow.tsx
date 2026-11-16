import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  headerColor?: 'navy' | 'blue' | 'green' | 'red';
  rightSlot?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  onClose?: () => void;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  title,
  children,
  headerColor = 'navy',
  rightSlot,
  className = '',
  bodyClassName = 'p-5 md:p-6',
  onClose,
}) => {
  const bgMap = {
    navy: 'bg-[#182747] text-[#FFF8E7]',
    blue: 'bg-[#4169E1] text-[#FFF8E7]',
    green: 'bg-[#4E8B62] text-[#FFF8E7]',
    red: 'bg-[#C94C4C] text-[#FFF8E7]',
  };

  return (
    <section
      className={`bg-[#FFF8E7] border-2 border-[#303030] retro-shadow ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 border-b-2 border-[#303030] ${bgMap[headerColor]}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-block w-3 h-3 bg-[#F4C542] border border-[#303030] shrink-0" />
          <h2 className="font-pixel text-[10px] sm:text-xs tracking-wide truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
          <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
            <span className="w-5 h-5 bg-[#F4EBD0] text-[#303030] border border-[#303030] flex items-center justify-center">
              <Minus className="w-3 h-3 stroke-[2.5]" />
            </span>
            <span className="w-5 h-5 bg-[#F4EBD0] text-[#303030] border border-[#303030] flex items-center justify-center">
              <Square className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close window"
                className="w-5 h-5 bg-[#C94C4C] text-[#FFF8E7] border border-[#303030] flex items-center justify-center hover:brightness-110 cursor-pointer"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            ) : (
              <span className="w-5 h-5 bg-[#F4EBD0] text-[#303030] border border-[#303030] flex items-center justify-center">
                <X className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close window"
              className="sm:hidden w-6 h-6 bg-[#C94C4C] text-[#FFF8E7] border border-[#303030] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
};
