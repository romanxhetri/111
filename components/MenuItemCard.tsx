import React from 'react';
import { type MenuItem } from '../types';
import { useCart } from '../contexts/CartContext';
import DietaryIcon from './icons/DietaryIcon';
import SpicyIcon from './icons/SpicyIcon';
import StarRating from './StarRating';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  isAdmin?: boolean;
  onToggleAvailability?: (itemId: number) => void;
  style?: React.CSSProperties;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect, isAdmin, onToggleAvailability, style }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addToCart(item);
  };
  
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onToggleAvailability?.(item.id);
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:ring-2 hover:ring-orange-400 animate-fadeInUp"
      style={style}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
      aria-label={`View details for ${item.name}`}
    >
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-48 object-cover" loading="lazy" />
        {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-bold">Unavailable</span>
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{item.name}</h3>
        <div className="flex items-center mb-2">
            <StarRating rating={item.averageRating} size="sm" />
            <span className="text-xs text-gray-500 ml-2">({item.reviewCount} reviews)</span>
        </div>
        <p className="text-gray-600 text-sm flex-grow mb-4">{item.description}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {item.dietaryTags.map(tag => <DietaryIcon key={tag} tag={tag} />)}
          </div>
          <div className="flex">
            <SpicyIcon level={item.spicyLevel} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-bold text-green-800">${item.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 hover:bg-orange-600 group-hover:scale-105 disabled:bg-gray-400 z-10"
            disabled={!item.isAvailable}
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        </div>
         {isAdmin && (
            <div className="mt-4 pt-3 border-t">
                 <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-sm text-gray-700">Available</span>
                    <div className="relative">
                        <input type="checkbox" checked={item.isAvailable} onChange={handleToggle} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </div>
                </label>
            </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MenuItemCard);
