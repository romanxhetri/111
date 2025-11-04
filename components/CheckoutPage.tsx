import React, { useState, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { OrderType, User, PromoCode } from '../types';

interface CheckoutPageProps {
    onBackToMenu: () => void;
    onPlaceOrder: (details: { orderType: OrderType; deliveryAddress?: string; pickupTime?: string; scheduledFor?: Date; }, pointsToRedeem: number, discountAmount: number) => void;
    currentUser: User;
    promoCodes: PromoCode[];
}

const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 5.00; // $5 flat delivery fee

export default function CheckoutPage({ onBackToMenu, onPlaceOrder, currentUser, promoCodes }: CheckoutPageProps) {
    const { cartItems, totalPrice } = useCart();
    const [orderType, setOrderType] = useState<OrderType>(OrderType.Delivery);
    const [deliveryAddress, setDeliveryAddress] = useState({ street: '', city: '', zip: '' });
    const [pickupTime, setPickupTime] = useState('15-20 minutes');
    const [customerDetails, setCustomerDetails] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: '' });
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduledTime, setScheduledTime] = useState('12:00');

    const deliveryFee = useMemo(() => orderType === OrderType.Delivery ? DELIVERY_FEE : 0, [orderType]);
    const taxAmount = totalPrice * TAX_RATE;
    
    const maxRedeemablePoints = useMemo(() => {
        if (!currentUser || currentUser.email === '') return 0;
        return Math.min(currentUser.spudPoints, Math.floor(totalPrice * 100));
    }, [currentUser, totalPrice]);

    const pointsDiscount = pointsToRedeem / 100;
    const promoDiscount = appliedPromo ? totalPrice * (appliedPromo.discountPercentage / 100) : 0;
    const finalTotal = totalPrice + taxAmount + deliveryFee - pointsDiscount - promoDiscount;

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    const handleRedeem = () => setPointsToRedeem(maxRedeemablePoints);

    const handleApplyPromo = () => {
        const code = promoCodes.find(p => p.code.toLowerCase() === promoCodeInput.toLowerCase());
        if (code && code.isActive) {
            setAppliedPromo(code);
            setPromoError('');
        } else {
            setAppliedPromo(null);
            setPromoError('Invalid or inactive promo code.');
        }
    };
    
    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCodeInput('');
        setPromoError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const scheduledFor = isScheduling ? new Date(`${scheduledDate}T${scheduledTime}`) : undefined;
        const orderDetails = {
            orderType,
            deliveryAddress: orderType === OrderType.Delivery ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.zip}` : undefined,
            pickupTime: !isScheduling ? pickupTime : undefined,
            scheduledFor,
        };
        onPlaceOrder(orderDetails, pointsToRedeem, promoDiscount);
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                 <h1 className="text-4xl font-bold text-orange-600 mb-4">Your Cart is Empty</h1>
                 <p className="text-gray-600 mb-8">You can't checkout without some delicious food!</p>
                 <button 
                    onClick={onBackToMenu}
                    className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Back to Menu
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button onClick={onBackToMenu} className="text-orange-600 hover:underline font-semibold mb-6">
                &larr; Back to Menu
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-600 mb-8 border-b pb-4">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    {/* Order Time Selection */}
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-green-800">When?</h2>
                        <div className="flex rounded-lg border border-gray-300">
                            <button type="button" onClick={() => setIsScheduling(false)} className={`w-1/2 p-3 font-semibold rounded-l-md transition-colors ${!isScheduling ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Now</button>
                            <button type="button" onClick={() => setIsScheduling(true)} className={`w-1/2 p-3 font-semibold rounded-r-md transition-colors ${isScheduling ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Schedule for Later</button>
                        </div>
                        {isScheduling && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700">Date</label>
                                    <input id="date-picker" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="time-picker" className="block text-sm font-medium text-gray-700">Time</label>
                                    <input id="time-picker" type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-green-800">Order Type</h2>
                        <div className="flex rounded-lg border border-gray-300">
                            <button type="button" onClick={() => setOrderType(OrderType.Delivery)} className={`w-1/2 p-3 font-semibold rounded-l-md transition-colors ${orderType === OrderType.Delivery ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Delivery</button>
                            <button type="button" onClick={() => setOrderType(OrderType.Pickup)} className={`w-1/2 p-3 font-semibold rounded-r-md transition-colors ${orderType === OrderType.Pickup ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Pickup</button>
                        </div>
                        <div className="mt-4 space-y-4">
                            {orderType === OrderType.Delivery ? (
                                <>
                                    <h3 className="font-semibold text-gray-700">Delivery Address</h3>
                                    <input type="text" name="street" placeholder="Street Address" value={deliveryAddress.street} onChange={handleAddressChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                                    <input type="text" name="city" placeholder="City" value={deliveryAddress.city} onChange={handleAddressChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                                    <input type="text" name="zip" placeholder="ZIP Code" value={deliveryAddress.zip} onChange={handleAddressChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                                </>
                            ) : (
                                <>
                                    {!isScheduling && (<>
                                        <label htmlFor="pickup-time" className="block font-semibold text-gray-700">Pickup Time</label>
                                        <select id="pickup-time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border bg-white rounded-md">
                                            <option>15-20 minutes</option>
                                            <option>30-40 minutes</option>
                                            <option>1 hour</option>
                                        </select>
                                    </>)}
                                    <p className="text-sm text-gray-500">Our address: 123 Potato Lane, Foodie City</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-green-800">Your Details</h2>
                        <div className="space-y-4">
                            <input type="text" name="name" placeholder="Full Name" value={customerDetails.name} onChange={handleDetailsChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            <input type="email" name="email" placeholder="Email Address" value={customerDetails.email} onChange={handleDetailsChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            <input type="tel" name="phone" placeholder="Phone Number (Optional)" value={customerDetails.phone} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md self-start sticky top-24">
                    <h2 className="text-2xl font-bold mb-4 text-green-800">Order Summary</h2>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-semibold">{item.name} <span className="text-gray-500">(x{item.quantity})</span></p>
                                     {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                        <ul className="text-xs text-gray-500 pl-2 mt-1">
                                            {item.selectedCustomizations.map(cust => (<li key={cust.option.name}>+ {cust.option.name}</li>))}
                                        </ul>
                                    )}
                                </div>
                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                         <div className="flex justify-between"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                         <div className="flex justify-between text-gray-500"><span>Taxes ({(TAX_RATE * 100).toFixed(0)}%)</span><span>${taxAmount.toFixed(2)}</span></div>
                         {orderType === OrderType.Delivery && <div className="flex justify-between text-gray-500"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>}
                         {pointsDiscount > 0 && (<div className="flex justify-between text-green-600 font-semibold"><span>Points Redeemed</span><span>-${pointsDiscount.toFixed(2)}</span></div>)}
                         {promoDiscount > 0 && (<div className="flex justify-between text-green-600 font-semibold"><span>Promo Code '{appliedPromo?.code}'</span><span>-${promoDiscount.toFixed(2)}</span></div>)}
                         <div className="flex justify-between font-bold text-xl pt-2"><span>Total</span><span className="text-green-800">${finalTotal.toFixed(2)}</span></div>
                    </div>
                    
                    <div className="mt-4 border-t pt-4">
                        <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700">Promo Code</label>
                        {!appliedPromo ? (
                            <div className="flex items-center mt-1 gap-2">
                                <input id="promo-code" type="text" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                                <button type="button" onClick={handleApplyPromo} className="bg-gray-600 text-white font-semibold px-3 py-2 rounded-md text-sm hover:bg-gray-700">Apply</button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mt-1 p-2 bg-green-100 rounded-md">
                                <p className="text-sm font-semibold text-green-800">Applied: {appliedPromo.code}</p>
                                <button type="button" onClick={handleRemovePromo} className="text-sm font-bold text-red-600">&times;</button>
                            </div>
                        )}
                        {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                    </div>
                    
                    {currentUser.email && currentUser.spudPoints > 0 && (
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                            <p className="text-sm text-yellow-800">You have <span className="font-bold">{currentUser.spudPoints}</span> Spud Points!</p>
                            {maxRedeemablePoints > 0 && pointsToRedeem === 0 ? (
                                <button onClick={handleRedeem} type="button" className="text-sm font-semibold text-green-700 hover:underline mt-1">Redeem {maxRedeemablePoints} points for ${(maxRedeemablePoints / 100).toFixed(2)} off</button>
                            ) : pointsToRedeem > 0 && (
                                <button onClick={() => setPointsToRedeem(0)} type="button" className="text-sm font-semibold text-red-700 hover:underline mt-1">Remove discount</button>
                            )}
                        </div>
                    )}
                     <button type="submit" className="w-full mt-6 bg-green-800 text-white font-bold py-3 rounded-lg hover:bg-green-900 transition-colors text-lg">Place Order</button>
                </div>
            </form>
        </div>
    );
}