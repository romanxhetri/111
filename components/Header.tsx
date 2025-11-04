import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { User } from '../types';

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

interface HeaderProps {
    onCartClick: () => void;
    currentUser: User | null;
    onLogout: () => void;
    onShowProfile: () => void;
    onShowLeaderboard: () => void;
    onShowAdmin: () => void;
}

export default function Header({ onCartClick, currentUser, onLogout, onShowProfile, onShowLeaderboard, onShowAdmin }: HeaderProps): React.ReactElement {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { itemCount } = useCart();
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { href: "#home", label: "Home" },
        { href: "#menu", label: "Menu" },
        { href: "#", label: "About" },
        { href: "#contact-section", label: "Contact" },
    ];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isGuest = currentUser?.name === 'Guest';

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-orange-600">
          Potato & Friends
        </a>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">{link.label}</a>
          ))}
          <button onClick={onShowAdmin} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Admin</button>
        </nav>
        <div className="flex items-center space-x-4">
          <button onClick={onCartClick} aria-label={`Open cart with ${itemCount} items`} className="relative text-gray-600 hover:text-orange-500 transition-colors">
            <CartIcon />
            {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                </span>
            )}
          </button>
          
          {currentUser && !isGuest && (
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 bg-green-800 text-white rounded-full flex items-center justify-center font-bold text-lg" aria-haspopup="true" aria-expanded={isProfileMenuOpen} aria-label="Open user menu">
                {currentUser.name.charAt(0).toUpperCase()}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p>Signed in as</p>
                    <strong className="truncate block">{currentUser.name}</strong>
                    <div className="text-xs text-orange-600 font-bold mt-1">{currentUser.spudPoints} Spud Points</div>
                  </div>
                  <button onClick={() => { onShowProfile(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    My Profile
                  </button>
                  <button onClick={() => { onShowLeaderboard(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    Leaderboard
                  </button>
                  <button onClick={() => { onLogout(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600 hover:text-orange-500" aria-label="Open menu">
              <MenuIcon />
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
              <nav className="flex flex-col items-center space-y-4 py-4">
                  {navLinks.map(link => (
                      <a key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">{link.label}</a>
                  ))}
                  <button onClick={() => { onShowAdmin(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Admin</button>
              </nav>
          </div>
      )}
    </header>
  );
}