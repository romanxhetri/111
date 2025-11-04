
import React from 'react';
import { Dietary } from '../../types';

interface DietaryIconProps {
  tag: Dietary;
}

const tagStyles: Record<Dietary, { bg: string, text: string, title: string }> = {
  [Dietary.Vegetarian]: { bg: 'bg-green-100', text: 'text-green-800', title: 'Vegetarian' },
  [Dietary.Vegan]: { bg: 'bg-blue-100', text: 'text-blue-800', title: 'Vegan' },
  [Dietary.GlutenFree]: { bg: 'bg-yellow-100', text: 'text-yellow-800', title: 'Gluten-Free' },
};

// FIX: Changed component to a const with type React.FC to correctly handle the special 'key' prop.
const DietaryIcon: React.FC<DietaryIconProps> = ({ tag }) => {
  const style = tagStyles[tag];
  return (
    <div
      title={style.title}
      className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${style.bg} ${style.text}`}
    >
      {tag}
    </div>
  );
};

export default DietaryIcon;
