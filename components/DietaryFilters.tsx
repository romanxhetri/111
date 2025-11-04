
import React from 'react';
import { Dietary } from '../types';

interface DietaryFiltersProps {
  activeFilters: Set<Dietary>;
  onFilterChange: (filter: Dietary) => void;
}

const dietaryOptions = [
  { id: Dietary.Vegetarian, label: 'Vegetarian' },
  { id: Dietary.Vegan, label: 'Vegan' },
  { id: Dietary.GlutenFree, label: 'Gluten-Free' },
];

export default function DietaryFilters({ activeFilters, onFilterChange }: DietaryFiltersProps): React.ReactElement {
  return (
    <div>
      <h4 className="font-bold mb-3 text-gray-700">Dietary Needs</h4>
      <div className="space-y-2">
        {dietaryOptions.map(option => (
          <label key={option.id} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activeFilters.has(option.id)}
              onChange={() => onFilterChange(option.id)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-gray-600">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
