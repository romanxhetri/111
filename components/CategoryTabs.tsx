
import React from 'react';
import { type Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps): React.ReactElement {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="flex justify-center flex-wrap gap-2 md:gap-4">
      {allCategories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
            ${selectedCategory === category.id 
              ? 'bg-orange-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600'
            }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}