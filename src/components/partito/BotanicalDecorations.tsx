import React from 'react';
import { cn } from '@/lib/utils';

interface BotanicalDecorationsProps {
  className?: string;
}

export const BotanicalDecorations: React.FC<BotanicalDecorationsProps> = ({ className }) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Top Left Leaves */}
      <svg
        className="absolute -top-4 -left-8 w-48 h-48 md:w-64 md:h-64 text-sage opacity-60"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-15, 100, 100)">
          {/* Leaf cluster */}
          <path
            d="M80 120 Q100 60 140 40 Q100 80 80 120"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M60 140 Q90 90 130 80 Q80 100 60 140"
            fill="currentColor"
            opacity="0.5"
          />
          <path
            d="M100 130 Q130 70 170 60 Q120 90 100 130"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M40 100 Q70 50 110 30 Q60 60 40 100"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M70 80 Q100 30 140 10 Q90 50 70 80"
            fill="currentColor"
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Top Right Leaves */}
      <svg
        className="absolute -top-4 -right-8 w-48 h-48 md:w-64 md:h-64 text-sage opacity-60"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(15, 100, 100) scale(-1, 1) translate(-200, 0)">
          <path
            d="M80 120 Q100 60 140 40 Q100 80 80 120"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M60 140 Q90 90 130 80 Q80 100 60 140"
            fill="currentColor"
            opacity="0.5"
          />
          <path
            d="M100 130 Q130 70 170 60 Q120 90 100 130"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M40 100 Q70 50 110 30 Q60 60 40 100"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M70 80 Q100 30 140 10 Q90 50 70 80"
            fill="currentColor"
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Terracotta Circles - Top */}
      <svg
        className="absolute top-8 left-20 w-6 h-6 md:w-8 md:h-8 text-terracotta opacity-70"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-16 left-8 w-4 h-4 md:w-5 md:h-5 text-terracotta opacity-50"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-4 right-24 w-8 h-8 md:w-10 md:h-10 text-terracotta opacity-60"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-20 right-12 w-3 h-3 md:w-4 md:h-4 text-terracotta opacity-40"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>

      {/* Small sage dots */}
      <svg
        className="absolute top-12 left-32 w-2 h-2 text-sage-dark opacity-40"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-24 left-16 w-2 h-2 text-sage-dark opacity-30"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-8 right-40 w-2 h-2 text-sage-dark opacity-40"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute top-28 right-28 w-2 h-2 text-sage-dark opacity-30"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>

      {/* Bottom Left Leaves */}
      <svg
        className="absolute -bottom-8 -left-12 w-40 h-40 md:w-56 md:h-56 text-sage opacity-50"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(160, 100, 100)">
          <path
            d="M80 120 Q100 60 140 40 Q100 80 80 120"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M100 130 Q130 70 170 60 Q120 90 100 130"
            fill="currentColor"
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Bottom Right Leaves */}
      <svg
        className="absolute -bottom-8 -right-12 w-40 h-40 md:w-56 md:h-56 text-sage opacity-50"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-160, 100, 100) scale(-1, 1) translate(-200, 0)">
          <path
            d="M80 120 Q100 60 140 40 Q100 80 80 120"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M100 130 Q130 70 170 60 Q120 90 100 130"
            fill="currentColor"
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Bottom Terracotta Circles */}
      <svg
        className="absolute bottom-16 left-6 w-4 h-4 text-terracotta opacity-50"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
      <svg
        className="absolute bottom-24 right-8 w-5 h-5 text-terracotta opacity-40"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="12" />
      </svg>
    </div>
  );
};
