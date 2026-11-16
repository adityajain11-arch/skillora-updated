import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'navy';
  size?: 'sm' | 'md' | 'lg';
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...rest
}) => {
  const variantStyles: Record<NonNullable<RetroButtonProps['variant']>, string> = {
    primary: 'bg-[#4169E1] text-[#FFF8E7] hover:bg-[#3458c7]',
    success: 'bg-[#4E8B62] text-[#FFF8E7] hover:bg-[#3f7551]',
    warning: 'bg-[#F4C542] text-[#182747] hover:bg-[#e5b532]',
    danger: 'bg-[#C94C4C] text-[#FFF8E7] hover:bg-[#b53e3e]',
    neutral: 'bg-[#F4EBD0] text-[#182747] hover:bg-[#eadcb5]',
    navy: 'bg-[#182747] text-[#FFF8E7] hover:bg-[#233763]',
  };

  const sizeStyles: Record<NonNullable<RetroButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-sm min-h-[46px]',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold border-2 border-[#303030] retro-shadow-sm transition-transform duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4169E1] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
