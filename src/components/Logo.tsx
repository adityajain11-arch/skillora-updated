import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SKILLORA_LOGO_URL =
  '/assets/aistudio/Gemini_Generated_Image_8f2yjg8f2yjg8f2y_9b6b4de4.png';

export const Logo: React.FC<LogoProps> = ({
  theme = 'light',
  size = 'md',
  className = '',
}) => {
  const heightMap = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
  };

  if (theme === 'dark') {
    return (
      <div
        className={`inline-flex items-center bg-white px-2.5 py-1 border-2 border-[#303030] shrink-0 ${className}`}
      >
        <img
          src={SKILLORA_LOGO_URL}
          alt="Skillora - Learn. Grow. Succeed."
          className={`${heightMap[size]} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  return (
    <img
      src={SKILLORA_LOGO_URL}
      alt="Skillora - Learn. Grow. Succeed."
      className={`${heightMap[size]} w-auto object-contain shrink-0 select-none ${className}`}
    />
  );
};
