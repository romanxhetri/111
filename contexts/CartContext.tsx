import React, { createContext, useState, useContext, useMemo } from 'react';
import type { CartItem, MenuItem, SelectedCustomization } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: MenuItem, quantity?: number, customizations?: SelectedCustomization[]) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const generateCartItemId = (itemId: number, customizations: SelectedCustomization[] = []) => {
        if (!customizations || customizations.length === 0) {
            return `${itemId}`;
        }
        // Sort to ensure consistent ID regardless of selection order
        const sorted = [...customizations].sort((a, b) => a.title.localeCompare(b.title) || a.option.name.localeCompare(b.option.name));
        return `${itemId}-${JSON.stringify(sorted)}`;
    };

    const addToCart = (item: MenuItem, quantity = 1, customizations: SelectedCustomization[] = []) => {
        const cartItemId = generateCartItemId(item.id, customizations);
        
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.cartItemId === cartItemId);
            if (existingItem) {
                return prevItems.map(i => 
                    i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prevItems, { ...item, quantity, cartItemId, selectedCustomizations: customizations }];
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.cartItemId === cartItemId ? { ...item, quantity } : item
                )
            );
        }
    };
    
    const clearCart = () => {
        setCartItems([]);
    };

    const itemCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);
    
    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const customizationsPrice = item.selectedCustomizations?.reduce((subTotal, cust) => subTotal + cust.option.price, 0) || 0;
            return total + (item.price + customizationsPrice) * item.quantity;
        }, 0);
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};