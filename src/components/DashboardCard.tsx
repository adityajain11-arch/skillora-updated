import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'navy' | 'blue' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  accent = 'navy',
  icon,
}) => {
  const barColors = {
    navy: 'bg-[#182747] text-[#FFF8E7]',
    blue: 'bg-[#4169E1] text-[#FFF8E7]',
    green: 'bg-[#4E8B62] text-[#FFF8E7]',
    yellow: 'bg-[#F4C542] text-[#182747]',
    red: 'bg-[#C94C4C] text-[#FFF8E7]',
  };

  return (
    <div className="bg-[#FFF8E7] border-2 border-[#303030] retro-shadow-sm flex flex-col">
      <div
        className={`px-3 py-1.5 border-b-2 border-[#303030] flex items-center justify-between gap-2 ${barColors[accent]}`}
      >
        <span className="font-mono-data text-[11px] font-bold uppercase tracking-wider truncate">
          {title}
        </span>
        {icon && <span className="shrink-0 opacity-90">{icon}</span>}
      </div>
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div className="font-mono-data text-xl sm:text-2xl font-bold text-[#182747] break-words">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#303030]/80 mt-1.5 leading-snug">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
