import React, { useState, useEffect } from 'react';
import type { ActiveOrder } from '../types';
import { OrderType } from '../types';

// --- SVG ICONS ---
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);
const RestaurantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-700" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM4 10a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 10a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM4 16a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 16a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" />
    </svg>
);
const DriverIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.026 3.004C5.418 2.383 6.14 2 7 2h6a4 4 0 014 4v2a2 2 0 01-2 2h-1v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2H3a2 2 0 01-2-2V7a4 4 0 014-4h.026zM11 11H9v6h2v-6z" clipRule="evenodd" />
    </svg>
);
const StatusCheckIcon = ({ completed }: { completed: boolean }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
        {completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
    </div>
);
// --- END SVG ICONS ---

const DELIVERY_STATUSES = ['Order Confirmed', 'Preparing Food', 'Out for Delivery', 'Delivered'];
const PICKUP_STATUSES = ['Order Confirmed', 'Preparing Food', 'Ready for Pickup', 'Completed'];
const STATUS_UPDATE_INTERVAL = 10000; // 10 seconds per stage

interface OrderTrackingPageProps {
    order: ActiveOrder;
    onNewOrder: () => void;
}

export default function OrderTrackingPage({ order, onNewOrder }: OrderTrackingPageProps): React.ReactElement {
    const isScheduled = order.scheduledFor && order.scheduledFor > new Date();
    
    if (isScheduled) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl text-center animate-fadeIn">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <CalendarIcon />
                    <h1 className="text-3xl font-bold text-green-800 mt-4 mb-2">Your Order is Scheduled!</h1>
                    <p className="text-gray-600 mb-6">We'll start preparing it just in time.</p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-bold text-lg text-orange-700">
                            {order.orderType === OrderType.Delivery ? 'Delivery' : 'Pickup'} on {order.scheduledFor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="font-bold text-2xl text-orange-700">
                            at {order.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                     <button 
                        onClick={onNewOrder}
                        className="mt-8 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        )
    }

    const ORDER_STATUSES = order.orderType === OrderType.Delivery ? DELIVERY_STATUSES : PICKUP_STATUSES;
    const [statusIndex, setStatusIndex] = useState(0);
    const [driverLeftPosition, setDriverLeftPosition] = useState('10%');

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prevIndex => {
                if (prevIndex < ORDER_STATUSES.length - 1) return prevIndex + 1;
                clearInterval(interval);
                return prevIndex;
            });
        }, STATUS_UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, [ORDER_STATUSES.length]);

    useEffect(() => {
        if (order.orderType === OrderType.Delivery && statusIndex === 2) {
            setTimeout(() => setDriverLeftPosition('80%'), 100);
        }
    }, [statusIndex, order.orderType]);
    
    const isCompleted = statusIndex === ORDER_STATUSES.length - 1;
    const isDelivery = order.orderType === OrderType.Delivery;
    const mapGridStyle = { backgroundColor: '#eaf2f8', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`, backgroundSize: '2rem 2rem' };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{isDelivery ? "Your Order is on its Way!" : "Your Order is Being Prepared!"}</h1>
            <p className="text-gray-600 mb-8">Order ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{order.id}</span></p>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-6">Order Status</h2>
                <div className="relative flex justify-between items-start mb-6">
                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -mt-px"><div className="h-full bg-green-500 transition-all duration-1000 ease-linear" style={{ width: `${(statusIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}></div></div>
                    {ORDER_STATUSES.map((status, index) => (
                        <div key={status} className="z-10 flex flex-col items-center w-1/4">
                            <StatusCheckIcon completed={index <= statusIndex} />
                            <p className={`mt-2 text-center text-xs sm:text-sm font-semibold ${index <= statusIndex ? 'text-green-800' : 'text-gray-500'}`}>{status}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8 pt-4 border-t">
                    <p className="text-lg font-semibold">{ORDER_STATUSES[statusIndex]}</p>
                    <p className="text-gray-500">{isDelivery ? 'Estimated Delivery' : 'Estimated Pickup'}: {order.estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
            
            {isDelivery && (
                 <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">Live Map</h2>
                    <div style={mapGridStyle} className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border-2 border-gray-300 p-4">
                        <div className="absolute top-[20%] left-[40%] w-32 h-20 bg-green-300/50 rounded-lg transform -skew-x-12"></div>
                        <div className="absolute bottom-[10%] right-[25%] w-40 h-10 bg-blue-300/50 rounded-full"></div>
                        <div className="absolute left-[10%] bottom-[15%] transform -translate-x-1/2 text-center"><RestaurantIcon /><span className="text-xs font-bold">Restaurant</span></div>
                        <div className="absolute right-[10%] bottom-[15%] transform translate-x-1/2 text-center"><HomeIcon /><span className="text-xs font-bold">Your Location</span></div>
                        <div className="absolute h-1.5 bg-gray-400/50 bottom-[18%]" style={{ left: '10%', right: '10%'}}><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0"><path d="M0 3 Q 150 -10, 300 3 T 600 3" stroke="#fb923c" strokeWidth="4" fill="none" strokeDasharray="8 8" /></svg></div>
                        {statusIndex >= 2 && (<div className="absolute bottom-[18%] transform -translate-y-1/2" style={{ left: driverLeftPosition, transition: `left ${STATUS_UPDATE_INTERVAL}ms linear`}}><div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2"><DriverIcon /></div></div>)}
                    </div>
                </div>
            )}

            {isCompleted && (
                <div className="mt-8 text-center animate-scaleUp">
                    <h3 className="text-2xl font-bold text-green-700">{isDelivery ? "Your order has arrived! Enjoy your meal!" : "Your order is ready! Thank you!"}</h3>
                    <button onClick={onNewOrder} className="mt-4 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors">Start a New Order</button>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-scaleUp { animation: scaleUp 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}