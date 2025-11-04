import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MenuItem } from '../types';

interface AskChefModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);


export default function AskChefModal({ isOpen, onClose, menuItems }: AskChefModalProps): React.ReactElement | null {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [mapLinks, setMapLinks] = useState<{ title: string, uri: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            navigator.geolocation.getCurrentPosition(
                (position) => { setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
                (err) => { console.warn(`Geolocation error: ${err.message}`); setUserLocation(null); }
            );

            const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAsk = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse('');
        setError('');
        setMapLinks([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const menuAsText = menuItems
                .filter(item => item.isAvailable)
                .map(item => `- ${item.name}: ${item.description} (Price: $${item.price}, Tags: ${item.dietaryTags.join(', ') || 'none'}, Rating: ${item.averageRating.toFixed(1)}/5 from ${item.reviewCount} reviews)`)
                .join('\n');
                
            const prompt = `You are 'Chef Potato', the friendly and knowledgeable head chef at "Potato & Friends" restaurant. A customer is asking for a recommendation. Your menu is provided below, including ratings. You can also answer questions about the restaurant's location. Based *only* on the menu items for food questions, provide a warm, helpful, and concise recommendation. Consider the customer's query and the item ratings. Address the customer directly. If the query is unrelated to food or your location, politely state that you can only help with food and location recommendations.

Here is the current menu:
${menuAsText}

Customer's question: "${query}"

Your recommendation:`;

            const config: any = { tools: [{ googleMaps: {} }] };

            if (userLocation) {
                config.toolConfig = { retrievalConfig: { latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude }}};
            }

            const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config });
            
            setResponse(result.text);

            const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const newMapLinks = chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
                setMapLinks(newMapLinks);
            }

        } catch (e) {
            console.error(e);
            setError('Sorry, I had a little trouble in the kitchen. Please try asking again!');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chef-modal-title"
        >
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 id="chef-modal-title" className="text-2xl font-bold text-orange-600 flex items-center">
                        <SparklesIcon /> <span className="ml-2">Ask the Chef</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 flex-grow flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <label htmlFor="chef-query" className="block text-sm font-medium text-gray-700 mb-2">What are you in the mood for?</label>
                        <textarea
                            id="chef-query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., 'Something spicy and highly-rated' or 'Where are you located?'"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            rows={3}
                        />
                    </div>
                    <button
                        onClick={handleAsk}
                        disabled={isLoading}
                        className="w-full bg-green-800 text-white font-bold py-3 rounded-lg hover:bg-green-900 transition-colors text-lg disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? 'Thinking...' : 'Get Recommendation'}
                    </button>
                    <div className="mt-2 p-4 bg-orange-50 rounded-lg min-h-[120px] border border-orange-100 flex-grow">
                        <h3 className="font-bold text-green-800 mb-2">Chef's Suggestion:</h3>
                        {isLoading && (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        )}
                        {error && <p className="text-red-600">{error}</p>}
                        {response && <p className="text-gray-700 whitespace-pre-wrap">{response}</p>}
                        {mapLinks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-orange-200">
                                {mapLinks.map(link => (
                                    <a key={link.uri} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-orange-600 hover:text-orange-800 font-semibold hover:underline mb-2">
                                        <MapPinIcon />
                                        <span>{link.title}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                        {!isLoading && !error && !response && <p className="text-gray-500 italic">Ask me anything about the menu or our location!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
