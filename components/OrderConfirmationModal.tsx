import React, { useEffect, useRef } from 'react';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrackOrder: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function OrderConfirmationModal({ isOpen, onClose, onTrackOrder }: OrderConfirmationModalProps): React.ReactElement | null {
    const trackButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (isOpen) {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Focus the track button when the modal opens
            setTimeout(() => trackButtonRef.current?.focus(), 100);

            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md text-center p-8 transform transition-all"
                style={{ animation: 'scaleUp 0.3s ease-out forwards' }}
            >
                <div className="mx-auto mb-4">
                    <CheckIcon />
                </div>
                <h2 id="confirmation-title" className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-6">Thank you for your order. We're getting it ready for you now.</p>
                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button 
                        ref={trackButtonRef}
                        onClick={onTrackOrder}
                        className="w-full bg-green-800 text-white font-bold py-3 rounded-lg hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Track Your Order
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
