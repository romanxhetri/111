
import React from 'react';

interface SpicyIconProps {
  level: 0 | 1 | 2 | 3;
}

// FIX: Typed the local Chili component with React.FC to handle the 'key' prop correctly.
const Chili: React.FC<{ className: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A6.75 6.75 0 0115.75 12c0 1.854-.728 3.565-1.936 4.83.214.214.428.428.642.642a.75.75 0 001.06-1.06l-.213-.213A7.74 7.74 0 0017.25 12a7.75 7.75 0 00-4.287-7.014z" clipRule="evenodd" />
    <path d="M13.438 17.625c-4.91 0-7.84-2.93-7.84-7.84 0-2.81 1.253-5.32 3.235-6.917A.75.75 0 007.76 1.796 11.25 11.25 0 0112 9.75c1.42 0 2.76.26 3.999.734.214-.08.43-.153.65-.216a.75.75 0 00-.6-1.412A12.983 12.983 0 0012 8.25c-5.967 0-9.349 3.515-9.349 9.375 0 2.251.986 4.332 2.623 5.969a.75.75 0 101.1-1.02A6.878 6.878 0 016.162 18c.208-3.413 2.96-6 6.338-6 1.04 0 2.01.25 2.875.688a.75.75 0 10.624-1.25 8.358 8.358 0 00-3.562-.813z" />
  </svg>
);

export default function SpicyIcon({ level }: SpicyIconProps): React.ReactElement | null {
  if (level === 0) return null;

  return (
    <div className="flex items-center" title={`${level} out of 3 spicy`}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Chili key={index} className={index < level ? 'text-red-500' : 'text-gray-300'} />
      ))}
    </div>
  );
}