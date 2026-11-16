import React from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  PlaySquare,
  MinusSquare,
  Award,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let style = 'bg-[#F4EBD0] text-[#303030] border-[#303030]';
  let Icon = MinusSquare;

  if (
    normalized === 'APPROVED' ||
    normalized === 'COMPLETED' ||
    normalized === 'INTERNSHIP COMPLETED' ||
    normalized === 'ISSUED' ||
    normalized === 'GENERATED' ||
    normalized === 'OFFER LETTER ISSUED' ||
    normalized === 'VERIFIED' ||
    normalized === 'ELIGIBLE'
  ) {
    style = 'bg-[#4E8B62]/15 text-[#235736] border-[#4E8B62]';
    Icon = normalized === 'ISSUED' ? Award : CheckSquare;
  } else if (
    normalized === 'IN PROGRESS' ||
    normalized === 'ACTIVE' ||
    normalized === 'INTERNSHIP ACTIVE' ||
    normalized === 'REGISTERED' ||
    normalized === 'SUBMITTED' ||
    normalized === 'UNDER REVIEW' ||
    normalized === 'PENDING REVIEW'
  ) {
    style =
      normalized === 'SUBMITTED' ||
      normalized === 'UNDER REVIEW' ||
      normalized === 'PENDING REVIEW'
        ? 'bg-[#F4C542]/30 text-[#5c4300] border-[#b68911]'
        : 'bg-[#4169E1]/15 text-[#1e3c99] border-[#4169E1]';
    Icon =
      normalized === 'IN PROGRESS' ||
      normalized === 'ACTIVE' ||
      normalized === 'INTERNSHIP ACTIVE'
        ? PlaySquare
        : Clock;
  } else if (
    normalized === 'NEEDS REVISION' ||
    normalized === 'ON HOLD' ||
    normalized === 'NOT ELIGIBLE' ||
    normalized === 'INTERNSHIP CANCELLED'
  ) {
    style =
      normalized === 'ON HOLD'
        ? 'bg-[#F4C542]/35 text-[#5c4300] border-[#b68911]'
        : 'bg-[#C94C4C]/15 text-[#8a2323] border-[#C94C4C]';
    Icon = normalized === 'INTERNSHIP CANCELLED' ? XCircle : AlertTriangle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 font-mono-data text-[11px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 ${style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{normalized}</span>
    </span>
  );
};
