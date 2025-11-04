import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { type MenuItem, type SelectedCustomization, type CustomizationCategory, type CustomizationOption, type Review, type User, NutritionalInfo } from '../types';
import { useCart } from '../contexts/CartContext';
import DietaryIcon from './icons/DietaryIcon';
import SpicyIcon from './icons/SpicyIcon';
import StarRating from './StarRating';

interface MenuItemModalProps {
    item: MenuItem | null;
    onClose: () => void;
    aiImage?: string;
    currentUser: User;
    onReviewSubmit: (itemId: number, review: Review) => void;
    onUpdateMenu: (item: MenuItem) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function MenuItemModal({ item, onClose, aiImage, currentUser, onReviewSubmit, onUpdateMenu }: MenuItemModalProps): React.ReactElement | null {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    
    // Review form state
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Nutritional info state
    const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo | null>(item?.nutritionalInfo || null);
    const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
    const [nutritionError, setNutritionError] = useState('');

    useEffect(() => {
        if (item) {
            setQuantity(1);
            setSelectedCustomizations([]);
            setActiveTab('info');
            setNewRating(0);
            setNewComment('');
            setNutritionalInfo(item.nutritionalInfo || null);
            setNutritionError('');
            
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [item]);


    const handleCustomizationChange = (category: CustomizationCategory, option: CustomizationOption, checked?: boolean) => {
        setSelectedCustomizations(prev => {
            const otherCustomizations = prev.filter(c => c.title !== category.title);
            if (category.type === 'single') {
                return [...otherCustomizations, { title: category.title, option }];
            } else { // multi-select
                const currentCategoryCustomizations = prev.filter(c => c.title === category.title);
                if (checked) {
                    return [...otherCustomizations, ...currentCategoryCustomizations, { title: category.title, option }];
                } else {
                    return [...otherCustomizations, ...currentCategoryCustomizations.filter(c => c.option.name !== option.name)];
                }
            }
        });
    };

    const customizationsPrice = useMemo(() => {
        return selectedCustomizations.reduce((total, cust) => total + cust.option.price, 0);
    }, [selectedCustomizations]);

    const totalItemPrice = useMemo(() => {
        if (!item) return 0;
        return (item.price + customizationsPrice) * quantity;
    }, [item, customizationsPrice, quantity]);

    if (!item) return null;

    const handleAddToCart = () => {
        addToCart(item, quantity, selectedCustomizations);
        onClose();
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRating === 0 || isSubmittingReview) return;
        setIsSubmittingReview(true);
        const review: Review = {
            author: currentUser.name,
            rating: newRating,
            comment: newComment,
            date: new Date().toISOString(),
        };
        onReviewSubmit(item.id, review);
        // Simulate API call delay
        setTimeout(() => {
            setNewRating(0);
            setNewComment('');
            setIsSubmittingReview(false);
        }, 1000);
    };

    const handleGenerateNutrition = async () => {
        setIsGeneratingNutrition(true);
        setNutritionError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on the item name "${item.name}" and description "${item.description}", provide an estimated nutritional breakdown.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.STRING, description: 'Estimated calories, e.g., "450-550 kcal"' },
                            protein: { type: Type.STRING, description: 'Estimated protein in grams, e.g., "15g"' },
                            carbs: { type: Type.STRING, description: 'Estimated carbohydrates in grams, e.g., "40g"' },
                            fat: { type: Type.STRING, description: 'Estimated fat in grams, e.g., "25g"' },
                        },
                        required: ["calories", "protein", "carbs", "fat"],
                    },
                },
            });

            const info = JSON.parse(response.text.trim());
            setNutritionalInfo(info);
            // Cache the result on the main menu item state
            onUpdateMenu({ ...item, nutritionalInfo: info });

        } catch (err) {
            console.error(err);
            setNutritionError('Could not generate nutritional info at this time.');
        } finally {
            setIsGeneratingNutrition(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-scaleUp"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-full md:w-1/2 h-64 md:h-auto">
                    <img src={aiImage || item.image} alt={item.name} className="w-full h-full object-cover"/>
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 id="modal-title" className="text-2xl md:text-3xl font-bold text-orange-600">{item.name}</h2>
                            <div className="flex items-center mt-2">
                                <StarRating rating={item.averageRating} />
                                <span className="text-sm text-gray-500 ml-2">{item.reviewCount} reviews</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800" aria-label="Close modal">
                            <CloseIcon />
                        </button>
                    </div>

                     {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('info')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Info & Customize
                            </button>
                            <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Reviews
                            </button>
                        </nav>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="flex-grow">
                        {activeTab === 'info' && (
                            <>
                                <p className="text-gray-600 mb-6">{item.description}</p>
                                {item.customizationOptions && item.customizationOptions.length > 0 && (
                                    <div className="space-y-4 mb-6 border-y py-4">
                                        {/* Customization options here */}
                                        {item.customizationOptions.map(category => (
                                            <div key={category.title}>
                                                <h4 className="font-bold text-gray-800 mb-2">{category.title}</h4>
                                                <div className="space-y-2">
                                                    {category.options.map(option => (
                                                        <label key={option.name} className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-100">
                                                            <div className="flex items-center">
                                                                <input type={category.type === 'single' ? 'radio' : 'checkbox'} name={category.title} onChange={(e) => handleCustomizationChange(category, option, e.target.checked)} className={`h-4 w-4 ${category.type === 'single' ? 'text-orange-600' : 'rounded text-orange-600'} border-gray-300 focus:ring-orange-500`} />
                                                                <span className="ml-3 text-gray-700">{option.name}</span>
                                                            </div>
                                                            {option.price > 0 && <span className="text-sm text-gray-500">+${option.price.toFixed(2)}</span>}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">Nutritional Information (AI Est.)</h4>
                                    {nutritionalInfo ? (
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p><strong>Calories:</strong> {nutritionalInfo.calories}</p>
                                            <p><strong>Protein:</strong> {nutritionalInfo.protein}</p>
                                            <p><strong>Carbs:</strong> {nutritionalInfo.carbs}</p>
                                            <p><strong>Fat:</strong> {nutritionalInfo.fat}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500 mb-3">Click to generate an estimated nutritional breakdown.</p>
                                            <button onClick={handleGenerateNutrition} disabled={isGeneratingNutrition} className="w-full text-sm bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-200 transition disabled:opacity-50">
                                                {isGeneratingNutrition ? 'Analyzing...' : 'Generate Info'}
                                            </button>
                                            {nutritionError && <p className="text-red-500 text-sm mt-2">{nutritionError}</p>}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                        {activeTab === 'reviews' && (
                           <div>
                                {currentUser.email && (
                                    <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
                                        <h4 className="font-bold text-gray-800 mb-2">Leave a Review</h4>
                                        <div className="mb-2">
                                            <StarRating rating={newRating} onRate={setNewRating} interactive size="lg" />
                                        </div>
                                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts..." className="w-full p-2 border rounded-md" rows={3}></textarea>
                                        <button type="submit" disabled={newRating === 0 || isSubmittingReview} className="mt-2 w-full bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400">
                                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                )}
                                <div className="space-y-4">
                                    {item.reviews.length > 0 ? item.reviews.map((review, i) => (
                                        <div key={i} className="border-b pb-3">
                                            <div className="flex items-center mb-1">
                                                <StarRating rating={review.rating} size="sm" />
                                                <strong className="ml-2 text-sm">{review.author}</strong>
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        </div>
                                    )) : <p className="text-gray-500 italic">No reviews yet. Be the first!</p>}
                                </div>
                           </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-2">
                                {item.dietaryTags.map(tag => <DietaryIcon key={tag} tag={tag} />)}
                            </div>
                            <SpicyIcon level={item.spicyLevel} />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-3xl font-bold text-green-800">${(item.price + customizationsPrice).toFixed(2)}</span>
                            <div className="flex items-center">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 border rounded-full text-lg font-bold hover:bg-gray-100">-</button>
                                <span className="px-4 text-xl font-semibold w-12 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 border rounded-full text-lg font-bold hover:bg-gray-100">+</button>
                            </div>
                        </div>
                        <button onClick={handleAddToCart} disabled={!item.isAvailable} className="w-full bg-green-800 text-white font-bold py-3 rounded-lg hover:bg-green-900 transition-colors text-lg disabled:bg-gray-400">
                            Add {quantity} to Cart &mdash; ${totalItemPrice.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scaleUp { animation: scaleUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}