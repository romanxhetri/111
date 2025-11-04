import React from 'react';
import { useCart } from '../contexts/CartContext';
import { MenuItem, DailySpecial } from '../types';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

interface DailySpecialCardProps {
    menuItems: MenuItem[];
    dailySpecial: DailySpecial;
}

export default function DailySpecialCard({ menuItems, dailySpecial }: DailySpecialCardProps) {
    const { addToCart } = useCart();
    const specialMenuItem = menuItems.find(item => item.id === dailySpecial.itemId);

    if (!specialMenuItem) {
        return null; // Don't render if the special item isn't found
    }

    const handleAddToCart = () => {
        const itemWithSpecialPrice = {
            ...specialMenuItem,
            price: dailySpecial.specialPrice,
        };
        addToCart(itemWithSpecialPrice);
    };

    return (
        <div className="bg-gradient-to-br from-green-800 to-green-900 text-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 transform hover:scale-[1.02] transition-transform duration-300 animate-glow">
            <div className="flex-shrink-0">
                <img src={specialMenuItem.image} alt={specialMenuItem.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-yellow-400 shadow-lg" />
            </div>
            <div className="flex-grow text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-2">
                    <SparklesIcon />
                    <h2 className="text-xl font-bold text-yellow-300 ml-2">Daily Special!</h2>
                </div>
                <h3 className="text-3xl font-extrabold mb-2">{specialMenuItem.name}</h3>
                <p className="text-green-200 mb-4">{dailySpecial.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                    <span className="text-4xl font-bold text-yellow-400">${dailySpecial.specialPrice.toFixed(2)}</span>
                    <span className="text-xl line-through text-red-400">${specialMenuItem.price.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-yellow-400 text-green-900 font-bold py-3 px-6 rounded-full transition-all duration-300 hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}