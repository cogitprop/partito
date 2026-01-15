import React from 'react';

export const SkipLink: React.FC = () => {
  const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    const target = e.target;
    target.style.left = '16px';
    target.style.top = '16px';
    target.style.width = 'auto';
    target.style.height = 'auto';
    target.style.padding = '12px 24px';
  };

  const handleBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    const target = e.target;
    target.style.left = '-9999px';
    target.style.width = '1px';
    target.style.height = '1px';
  };

  return (
    <a
      href="#main-content"
      className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden z-[9999] bg-coral text-white rounded-lg no-underline font-medium focus:left-4 focus:top-4 focus:w-auto focus:h-auto focus:px-6 focus:py-3"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Skip to main content
    </a>
  );
};
