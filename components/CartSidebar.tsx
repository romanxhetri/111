import React, { useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const CartSidebarItem: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    
    const itemSubtotal = useMemo(() => {
        const customizationsPrice = item.selectedCustomizations?.reduce((total, cust) => total + cust.option.price, 0) || 0;
        return (item.price + customizationsPrice) * item.quantity;
    }, [item]);

    return (
        <div className="flex items-start space-x-4 py-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <ul className="text-xs text-gray-500 pl-2 mt-1">
                        {item.selectedCustomizations.map(cust => (
                            <li key={cust.option.name}>+ {cust.option.name} (${cust.option.price.toFixed(2)})</li>
                        ))}
                    </ul>
                )}
                <div className="flex items-center mt-2">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-6 h-6 border rounded-full">-</button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-6 h-6 border rounded-full">+</button>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-800">${itemSubtotal.toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-500 hover:text-red-700 mt-2" aria-label={`Remove ${item.name} from cart`}>
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps): React.ReactElement {
    const { cartItems, totalPrice } = useCart();

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-2xl font-bold text-orange-600">Your Cart</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close cart">
                            <CloseIcon />
                        </button>
                    </header>

                    <div className="flex-grow overflow-y-auto px-4 divide-y">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-lg text-gray-500">Your cart is empty.</p>
                                <p className="text-sm text-gray-400 mt-2">Add some delicious food to get started!</p>
                            </div>
                        ) : (
                            cartItems.map(item => <CartSidebarItem key={item.cartItemId} item={item} />)
                        )}
                    </div>
                    
                    {cartItems.length > 0 && (
                        <footer className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4 font-bold text-lg">
                                <span>Total</span>
                                <span className="text-green-800">${totalPrice.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={onCheckout}
                                className="w-full bg-green-800 text-white font-bold py-3 rounded-lg hover:bg-green-900 transition-colors"
                            >
                                Checkout
                            </button>
                        </footer>
                    )}
                </div>
            </aside>
        </>
    );
}