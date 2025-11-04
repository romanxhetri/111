import React from 'react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const Star: React.FC<{ filled: boolean; onClick?: () => void; interactive: boolean }> = ({ filled, onClick, interactive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-full h-full ${filled ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

export default function StarRating({ rating, interactive = false, onRate, size = 'md' }: StarRatingProps): React.ReactElement {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, index) => {
        const starRating = index + 1;
        return (
          <div key={starRating} className={sizeClasses[size]}>
            <Star
              filled={starRating <= rating}
              onClick={interactive ? () => onRate?.(starRating) : undefined}
              interactive={interactive}
            />
          </div>
        );
      })}
    </div>
  );
}
