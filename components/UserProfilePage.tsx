import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useCart } from '../contexts/CartContext';
import { User, Order, MenuItem, OrderType } from '../types';
import PotatoAvatar from './PotatoAvatar';
import { AVATAR_PARTS, BADGE_INFO } from '../constants';

interface UserProfilePageProps {
    user: User;
    onNavigateToMenu: () => void;
}

const OrderHistoryItem: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { addToCart } = useCart();

    const handleReorder = () => {
        order.items.forEach(item => {
            const { quantity, cartItemId, selectedCustomizations, ...menuItem } = item;
            addToCart(menuItem as MenuItem, quantity, selectedCustomizations);
        });
        alert('Items from your past order have been added to your cart!');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)} aria-expanded={isExpanded}>
                <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${order.orderType === OrderType.Delivery ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {order.orderType === OrderType.Delivery ? 'Delivery' : 'Pickup'}
                    </span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-800">${order.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</p>
                    {order.pointsEarned > 0 && <p className="text-xs text-orange-500 font-semibold">+{order.pointsEarned} points</p>}
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t animate-fadeIn">
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Order Details</h4>
                        {order.scheduledFor ? (
                             <p className="text-sm text-gray-600"><strong>Scheduled for:</strong> {new Date(order.scheduledFor).toLocaleString()}</p>
                        ) : order.orderType === OrderType.Delivery && order.deliveryAddress ? (
                            <p className="text-sm text-gray-600"><strong>Delivered to:</strong> {order.deliveryAddress}</p>
                        ) : order.orderType === OrderType.Pickup && order.pickupTime ? (
                            <p className="text-sm text-gray-600"><strong>Pickup Time:</strong> {order.pickupTime}</p>
                        ) : null}
                    </div>
                    <ul className="space-y-2 mb-4">
                        {order.items.map(item => (
                            <li key={item.cartItemId} className="flex justify-between text-sm">
                                <div>
                                    <p>{item.quantity} x {item.name}</p>
                                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                        <ul className="text-xs text-gray-500 pl-4">
                                            {item.selectedCustomizations.map(cust => <li key={cust.option.name}>+ {cust.option.name}</li>)}
                                        </ul>
                                    )}
                                </div>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleReorder} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                        Reorder
                    </button>
                </div>
            )}
        </div>
    );
};

export default function UserProfilePage({ user, onNavigateToMenu }: UserProfilePageProps) {
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [spuddyMessage, setSpuddyMessage] = useState('');
    const [isLoadingMessage, setIsLoadingMessage] = useState(true);

    useEffect(() => {
        if (user.email) {
            const historyKey = `orderHistory_${user.email}`;
            const storedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
            setOrderHistory(storedHistory);
        }

        const generateSpuddyMessage = async () => {
            setIsLoadingMessage(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const lastBadge = user.badges.length > 0 ? user.badges[user.badges.length - 1] : null;
                const prompt = `Generate a short, cheerful, one-sentence greeting from a friendly potato mascot named Spuddy to the user "${user.name}". Keep it under 15 words. Mention one of these facts if available: they have ${user.spudPoints} points, or they recently earned the "${lastBadge}" badge.`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });
                
                setSpuddyMessage(response.text);
            } catch (error) {
                console.error("Failed to generate Spuddy message:", error);
                setSpuddyMessage(`Welcome back, ${user.name}!`);
            } finally {
                setIsLoadingMessage(false);
            }
        };

        generateSpuddyMessage();

    }, [user]);

    const userBadges = useMemo(() => {
        return user.badges?.map(b => BADGE_INFO[b]).filter(Boolean) || [];
    }, [user.badges]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
             <button onClick={onNavigateToMenu} className="text-orange-600 hover:underline font-semibold mb-6">
                &larr; Back to Menu
            </button>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">My Profile</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-start sm:items-center gap-6">
                <div className="flex-shrink-0">
                    <PotatoAvatar user={user} size={120} />
                </div>
                <div className="flex-grow">
                     {isLoadingMessage ? (
                        <div className="h-6 bg-gray-200 rounded-full w-3/4 animate-pulse mb-4"></div>
                     ) : (
                        <div className="relative bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg rounded-bl-none mb-4 max-w-md">
                            <p className="text-sm italic">"{spuddyMessage}"</p>
                            <div className="absolute left-0 -bottom-2.5 w-0 h-0 border-t-[10px] border-t-orange-50 border-r-[10px] border-r-transparent"></div>
                        </div>
                     )}
                    <h2 className="text-2xl font-bold mb-4 text-green-800">Account Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                            <p className="text-3xl font-bold text-orange-600">{user.spudPoints}</p>
                            <p className="font-semibold text-orange-800">Spud Points</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-orange-600 mb-6">Badges</h2>
            {userBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userBadges.map(badge => (
                        <div key={badge.title} className="bg-white p-4 rounded-lg shadow-sm text-center border group" title={badge.description}>
                            <div className="text-4xl mb-2 transition-transform group-hover:scale-125">{badge.icon}</div>
                            <p className="font-bold text-sm text-gray-800">{badge.title}</p>
                            {badge.unlocks && <p className="text-xs text-green-600 mt-1">Unlocks {badge.unlocks.replace('-', ' ')}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 bg-white p-6 rounded-lg shadow-md">You haven't earned any badges yet. Keep ordering!</p>
            )}

            <h2 className="text-3xl font-bold text-orange-600 my-8">Order History</h2>
            {orderHistory.length > 0 ? (
                <div className="space-y-4">
                    {orderHistory.map(order => <OrderHistoryItem key={order.id} order={order} />)}
                </div>
            ) : (
                <p className="text-gray-600 bg-white p-6 rounded-lg shadow-md">You haven't placed any orders yet.</p>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}