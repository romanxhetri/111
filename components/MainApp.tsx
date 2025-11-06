import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import MenuItemCard from './MenuItemCard';
import CategoryTabs from './CategoryTabs';
import DietaryFilters from './DietaryFilters';
import CartSidebar from './CartSidebar';
import ContactSection from './ContactSection';
import RestaurantStatus from './RestaurantStatus';
import DailySpecialCard from './DailySpecialCard';
import BadgeNotification from './BadgeNotification';
import { CATEGORIES } from '../constants';
import { type Dietary, type MenuItem, type ActiveOrder, type User, type Order, OrderType, Review, PromoCode, DailySpecial } from '../types';
import { useCart } from '../contexts/CartContext';

// Lazy-loaded components
const CheckoutPage = lazy(() => import('./CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./OrderTrackingPage'));
const UserProfilePage = lazy(() => import('./UserProfilePage'));
const LeaderboardPage = lazy(() => import('./LeaderboardPage'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const MenuItemModal = lazy(() => import('./MenuItemModal'));
const OrderConfirmationModal = lazy(() => import('./OrderConfirmationModal'));
const AskChefModal = lazy(() => import('./AskChefModal'));
const AiAssistantModal = lazy(() => import('./AiAssistantModal'));
const VoiceOrderingModal = lazy(() => import('./VoiceOrderingModal'));


const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 5.00; // $5 flat delivery fee

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const ChatBubbleIcon = ({ className = "h-8 w-8" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const MicIcon = ({ className = "h-8 w-8" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 6v4m0 0H9m4 0h2m-4-8a4 4 0 014-4h0a4 4 0 014 4v2m-8 0v2m8-2v2" />
    </svg>
);

const Hero = () => {
    const handleScrollToMenu = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const menuElement = document.getElementById('menu');
        menuElement?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="home" className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-white text-center px-4">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img src="https://picsum.photos/seed/herobg/1920/1080" alt="Delicious loaded fries" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative z-20 animate-fadeInUp">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>Taste the Spudtacular!</h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>Crispy, cheesy, and loaded with everything you love. Your new favorite meal is just a click away.</p>
                <a href="#menu" onClick={handleScrollToMenu} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:bg-orange-600 hover:scale-110 hover:shadow-glow transform">
                    View Our Menu
                </a>
            </div>
        </section>
    );
};


function MenuPage({ 
    onSelectItem, 
    onAskChef, 
    menuItems,
    dailySpecial,
    isAdmin,
    onToggleAvailability,
}: { 
    onSelectItem: (item: MenuItem) => void, 
    onAskChef: () => void,
    menuItems: MenuItem[],
    dailySpecial: DailySpecial,
    isAdmin?: boolean,
    onToggleAvailability: (itemId: number) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<Set<Dietary>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filter: Dietary) => {
    setActiveDietaryFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      const dietaryMatch = Array.from(activeDietaryFilters).every((filter: Dietary) => item.dietaryTags.includes(filter));
      const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && dietaryMatch && searchMatch;
    });
  }, [selectedCategory, activeDietaryFilters, searchTerm, menuItems]);
  
  return (
    <>
      <Hero />
      <main id="menu" className="container mx-auto px-4 pt-16 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">Our Menu</h1>
          <p className="text-lg text-gray-600">Freshly made, just for you.</p>
        </div>

        <div className="mb-12">
          <DailySpecialCard menuItems={menuItems} dailySpecial={dailySpecial} />
        </div>

        <div className="sticky top-[72px] bg-cream-100/80 backdrop-blur-sm z-10 py-4 mb-8">
            <CategoryTabs categories={CATEGORIES} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-lg shadow-md sticky top-[140px] space-y-6">
                <RestaurantStatus />
                <div>
                    <h3 className="text-xl font-bold text-green-800 border-b pb-2 mb-4">Filters</h3>
                    <button
                        onClick={onAskChef}
                        className="w-full mb-6 flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-glow transition-all transform hover:scale-105"
                        aria-label="Ask the chef for a recommendation"
                    >
                        <SparklesIcon />
                        Ask the Chef
                    </button>
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input 
                            type="text"
                            id="search"
                            placeholder="Find an item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <DietaryFilters activeFilters={activeDietaryFilters} onFilterChange={handleFilterChange} />
                </div>
            </div>
          </aside>

          <section className="w-full md:w-3/4 lg:w-4/5">
            {filteredMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredMenuItems.map((item, index) => (
                        <MenuItemCard 
                          key={item.id} 
                          item={item} 
                          onSelect={() => onSelectItem(item)}
                          isAdmin={isAdmin}
                          onToggleAvailability={onToggleAvailability}
                          style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">No items found!</h2>
                    <p className="text-gray-600">Try adjusting your filters or search term.</p>
                </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
    </div>
);


interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
    onUserUpdate: (user: User) => void;
    menuItems: MenuItem[];
    onUpdateMenu: (item: MenuItem) => void;
    onAddMenu: (item: Omit<MenuItem, 'id' | 'reviews' | 'averageRating' | 'reviewCount'>) => void;
    onDeleteMenu: (itemId: number) => void;
    promoCodes: PromoCode[];
    onUpdatePromoCodes: (codes: PromoCode[]) => void;
    dailySpecial: DailySpecial;
    onUpdateDailySpecial: (special: DailySpecial) => void;
}

export default function MainApp({ currentUser, onLogout, onUserUpdate, menuItems, onUpdateMenu, onAddMenu, onDeleteMenu, promoCodes, onUpdatePromoCodes, dailySpecial, onUpdateDailySpecial }: MainAppProps) {
  const [view, setView] = useState<'menu' | 'checkout' | 'tracking' | 'profile' | 'leaderboard' | 'admin'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isChefModalOpen, setIsChefModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const { cartItems, totalPrice, clearCart } = useCart();
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<string | null>(null);

  // Effect for handling browser back button for the modal
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
        if (selectedItem) {
            setSelectedItem(null);
        }
    };

    if (selectedItem) {
        window.history.pushState({ modal: true }, '');
        window.addEventListener('popstate', onPopState);
    }

    return () => {
        window.removeEventListener('popstate', onPopState);
    };
}, [selectedItem]);

  const handleReviewSubmit = (itemId: number, review: Review) => {
      const itemToUpdate = menuItems.find(item => item.id === itemId);
      if (itemToUpdate) {
          const newReviews = [review, ...itemToUpdate.reviews];
          const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAverageRating = totalRating / newReviews.length;

          const updatedItem: MenuItem = {
              ...itemToUpdate,
              reviews: newReviews,
              averageRating: newAverageRating,
              reviewCount: newReviews.length,
          };
          onUpdateMenu(updatedItem);
          setSelectedItem(updatedItem);
      }
  };

  const handlePlaceOrder = (details: { orderType: OrderType; deliveryAddress?: string; pickupTime?: string, scheduledFor?: Date }, pointsToRedeem: number, discountAmount: number) => {
    const minutesToAdd = details.orderType === OrderType.Delivery ? 30 : 20;
    const estimatedTime = details.scheduledFor ? details.scheduledFor : new Date(Date.now() + minutesToAdd * 60 * 1000);
    
    const newOrder: ActiveOrder = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        estimatedTime,
        orderType: details.orderType,
        scheduledFor: details.scheduledFor,
    };
    
    if (currentUser && currentUser.email) {
        const subtotal = totalPrice;
        const tax = subtotal * TAX_RATE;
        const deliveryFee = details.orderType === OrderType.Delivery ? DELIVERY_FEE : 0;
        const pointsDiscount = pointsToRedeem / 100;
        const finalTotal = subtotal + tax + deliveryFee - pointsDiscount - discountAmount;
        const pointsEarned = Math.floor(subtotal);

        const orderToSave: Order = {
            id: newOrder.id,
            items: JSON.parse(JSON.stringify(cartItems)),
            subtotal, tax, deliveryFee, 
            discount: pointsDiscount + discountAmount,
            totalPrice: finalTotal,
            date: new Date().toISOString(),
            orderType: details.orderType,
            deliveryAddress: details.deliveryAddress,
            pickupTime: details.pickupTime,
            scheduledFor: details.scheduledFor?.toISOString(),
            pointsEarned,
        };
        const historyKey = `orderHistory_${currentUser.email}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        existingHistory.unshift(orderToSave);
        localStorage.setItem(historyKey, JSON.stringify(existingHistory));
        
        const updatedUser = { ...currentUser };
        updatedUser.spudPoints = currentUser.spudPoints - pointsToRedeem + pointsEarned;
        
        const oldBadges = new Set(updatedUser.badges);
        const newBadges = new Set(updatedUser.badges);
        
        if (existingHistory.length === 1) newBadges.add('First Fry');
        
        const loadedFriesIds = new Set(menuItems.filter(i => i.category === 'loaded-fries').map(i => i.id));
        const purchasedLoadedFries = new Set(existingHistory.flatMap(o => o.items).filter(i => loadedFriesIds.has(i.id)).map(i => i.id));
        if (purchasedLoadedFries.size >= loadedFriesIds.size) newBadges.add('Loaded Legend');

        if (pointsToRedeem > 0 && !oldBadges.has('Spud Saver')) newBadges.add('Spud Saver');
        
        updatedUser.badges = Array.from(newBadges);

        const newlyEarned = Array.from(newBadges).find(badge => !oldBadges.has(badge));
        if (newlyEarned) {
            setNewlyEarnedBadge(newlyEarned);
        }

        onUserUpdate(updatedUser);
    }

    setActiveOrder(newOrder);
    clearCart();
    setIsConfirmationVisible(true);
  };
  
    const handleSelectItem = (item: MenuItem) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        if (window.history.state?.modal) {
            window.history.back();
        } else {
            setSelectedItem(null);
        }
    };

    const handleToggleAvailability = (itemId: number) => {
        const itemToUpdate = menuItems.find(item => item.id === itemId);
        if (itemToUpdate) {
            const updatedItem = { ...itemToUpdate, isAvailable: !itemToUpdate.isAvailable };
            onUpdateMenu(updatedItem);
        }
    };

  const handleGoToCheckout = () => { setIsCartOpen(false); setView('checkout'); window.scrollTo(0,0); }
  const handleTrackOrder = () => { setIsConfirmationVisible(false); setView('tracking'); window.scrollTo(0,0); }
  const handleBackToMenuFromConfirmation = () => { setIsConfirmationVisible(false); setView('menu'); }
  const handleNavigate = (newView: 'menu' | 'profile' | 'leaderboard' | 'admin') => { setView(newView); window.scrollTo(0, 0); };

  return (
    <div className="bg-cream-100 min-h-screen text-gray-800 flex flex-col">
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
        currentUser={currentUser} 
        onLogout={onLogout} 
        onShowProfile={() => handleNavigate('profile')}
        onShowLeaderboard={() => handleNavigate('leaderboard')}
        onShowAdmin={() => handleNavigate('admin')}
      />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleGoToCheckout} />
      
      <Suspense fallback={null}>
        {isConfirmationVisible && <OrderConfirmationModal isOpen={isConfirmationVisible} onClose={handleBackToMenuFromConfirmation} onTrackOrder={handleTrackOrder} />}
        {isChefModalOpen && <AskChefModal isOpen={isChefModalOpen} onClose={() => setIsChefModalOpen(false)} menuItems={menuItems} />}
        {isAssistantModalOpen && <AiAssistantModal isOpen={isAssistantModalOpen} onClose={() => setIsAssistantModalOpen(false)} menuItems={menuItems} />}
        {isVoiceModalOpen && <VoiceOrderingModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} menuItems={menuItems} />}
        {selectedItem && <MenuItemModal 
            item={selectedItem} 
            onClose={handleCloseModal} 
            currentUser={currentUser}
            onReviewSubmit={handleReviewSubmit}
            onUpdateMenu={onUpdateMenu}
        />}
      </Suspense>
      
      <BadgeNotification badgeName={newlyEarnedBadge} onDismiss={() => setNewlyEarnedBadge(null)} />

      <div className="flex-grow">
        {view === 'menu' && <MenuPage 
            onSelectItem={handleSelectItem} 
            onAskChef={() => setIsChefModalOpen(true)}
            menuItems={menuItems}
            dailySpecial={dailySpecial}
            isAdmin={currentUser.isAdmin}
            onToggleAvailability={handleToggleAvailability}
        />}
        <Suspense fallback={<LoadingSpinner />}>
            {view === 'checkout' && <CheckoutPage currentUser={currentUser} onBackToMenu={() => setView('menu')} onPlaceOrder={handlePlaceOrder} promoCodes={promoCodes} />}
            {view === 'tracking' && activeOrder && <OrderTrackingPage order={activeOrder} onNewOrder={() => setView('menu')} />}
            {view === 'profile' && currentUser && <UserProfilePage user={currentUser} onNavigateToMenu={() => handleNavigate('menu')} />}
            {view === 'leaderboard' && <LeaderboardPage currentUser={currentUser} onNavigateToMenu={() => handleNavigate('menu')} />}
            {view === 'admin' && (
                <AdminDashboard 
                    onNavigateToMenu={() => handleNavigate('menu')}
                    menuItems={menuItems}
                    onUpdateMenu={onUpdateMenu}
                    onAddMenu={onAddMenu}
                    onDeleteMenu={onDeleteMenu}
                    promoCodes={promoCodes}
                    onUpdatePromoCodes={onUpdatePromoCodes}
                    dailySpecial={dailySpecial}
                    onUpdateDailySpecial={onUpdateDailySpecial}
                />
            )}
        </Suspense>
      </div>
      
      {view === 'menu' && (
        <>
            <ContactSection />
            <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-20">
                 <button onClick={() => setIsVoiceModalOpen(true)} className="bg-gradient-to-br from-green-500 to-blue-500 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" aria-label="Open Voice Ordering">
                    <MicIcon className="h-7 w-7 md:h-8 md:h-8" />
                </button>
                <button onClick={() => setIsAssistantModalOpen(true)} className="bg-gradient-to-br from-orange-500 to-red-500 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" aria-label="Open AI Assistant">
                    <ChatBubbleIcon className="h-7 w-7 md:h-8 md:h-8" />
                </button>
            </div>
        </>
      )}
      <Footer />
    </div>
  )
}
