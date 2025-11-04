import React, { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import { User, MenuItem, PromoCode, DailySpecial } from './types';
import { MENU_ITEMS } from './constants';

const DEFAULT_DAILY_SPECIAL: DailySpecial = {
  itemId: 2,
  specialPrice: 9.99,
  description: "Today's heatwave special! Get the fan-favorite Spicy Volcano Fries at a scorching hot price."
};

export default function App(): React.ReactElement {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [dailySpecial, setDailySpecial] = useState<DailySpecial>(DEFAULT_DAILY_SPECIAL);

  useEffect(() => {
    // Load menu items
    const storedMenu = localStorage.getItem('menuItems');
    setMenuItems(storedMenu ? JSON.parse(storedMenu) : MENU_ITEMS);

    // Load user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    // Load promo codes
    const storedPromos = localStorage.getItem('promoCodes');
    setPromoCodes(storedPromos ? JSON.parse(storedPromos) : []);
    
    // Load daily special
    const storedSpecial = localStorage.getItem('dailySpecial');
    setDailySpecial(storedSpecial ? JSON.parse(storedSpecial) : DEFAULT_DAILY_SPECIAL);

  }, []);

  const handleUpdateMenu = (updatedMenuItem: MenuItem) => {
    const newMenuItems = menuItems.map(item => 
      item.id === updatedMenuItem.id ? updatedMenuItem : item
    );
    setMenuItems(newMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(newMenuItems));
  };
  
  const handleAddMenu = (newItemData: Omit<MenuItem, 'id' | 'reviews' | 'averageRating' | 'reviewCount'>) => {
    const newMenuItem: MenuItem = {
      ...newItemData,
      id: Date.now(),
      reviews: [],
      averageRating: 0,
      reviewCount: 0,
    };
    const newMenuItems = [...menuItems, newMenuItem];
    setMenuItems(newMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(newMenuItems));
  };

  const handleDeleteMenu = (itemId: number) => {
    const newMenuItems = menuItems.filter(item => item.id !== itemId);
    setMenuItems(newMenuItems);
    localStorage.setItem('menuItems', JSON.stringify(newMenuItems));
  };

  const handleUpdatePromoCodes = (updatedPromoCodes: PromoCode[]) => {
      setPromoCodes(updatedPromoCodes);
      localStorage.setItem('promoCodes', JSON.stringify(updatedPromoCodes));
  };
  
  const handleUpdateDailySpecial = (updatedSpecial: DailySpecial) => {
      setDailySpecial(updatedSpecial);
      localStorage.setItem('dailySpecial', JSON.stringify(updatedSpecial));
  };


  const handleLoginSuccess = (user: Pick<User, 'name' | 'email'>) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = storedUsers.find((u: any) => u.email === user.email);
    
    const fullUser: User = {
        name: user.name,
        email: user.email,
        spudPoints: existingUser?.spudPoints || 0,
        badges: existingUser?.badges || [],
        avatar: existingUser?.avatar || { base: 'potato-base', accessories: [] },
        isAdmin: user.email === 'admin@potato.com', // Check for admin user
    };
    
    localStorage.setItem('currentUser', JSON.stringify(fullUser));
    setCurrentUser(fullUser);
  };
  
  const handleGuestLogin = () => {
    setCurrentUser({ 
        name: 'Guest', 
        email: '', 
        spudPoints: 0, 
        badges: [], 
        avatar: { base: 'potato-base', accessories: [] }
    }); 
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    if (updatedUser.email === '') return;
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.email === updatedUser.email);
    if (userIndex !== -1) {
      const fullStoredUser = storedUsers[userIndex];
      storedUsers[userIndex] = { ...fullStoredUser, ...updatedUser };
      localStorage.setItem('users', JSON.stringify(storedUsers));
    }
  };

  return (
    <CartProvider>
      {!currentUser ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} onGuestLogin={handleGuestLogin} />
      ) : (
        <MainApp 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onUserUpdate={handleUserUpdate}
            menuItems={menuItems}
            onUpdateMenu={handleUpdateMenu}
            onAddMenu={handleAddMenu}
            onDeleteMenu={handleDeleteMenu}
            promoCodes={promoCodes}
            onUpdatePromoCodes={handleUpdatePromoCodes}
            dailySpecial={dailySpecial}
            onUpdateDailySpecial={handleUpdateDailySpecial}
        />
      )}
    </CartProvider>
  );
}