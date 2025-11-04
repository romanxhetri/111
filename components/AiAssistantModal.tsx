import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type, FunctionResponsePart } from '@google/genai';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';

// --- Icons ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
)

// --- End Icons ---

interface AiAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
}

type TranscriptItem = {
    speaker: 'user' | 'chef';
    text: string;
};

// --- Function Declarations for Gemini ---
const addToCartFunction: FunctionDeclaration = {
    name: 'addToCart',
    description: 'Adds one or more items to the shopping cart.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            items: {
                type: Type.ARRAY,
                description: 'A list of items to add to the cart.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING, description: 'The exact name of a menu item. Must match the menu precisely.' },
                        quantity: { type: Type.INTEGER, description: 'The quantity of the item to add.' },
                    },
                    required: ['itemName', 'quantity'],
                },
            },
        },
        required: ['items'],
    },
};

const viewCartFunction: FunctionDeclaration = {
    name: 'viewCart',
    description: 'Shows the customer a summary of all items currently in their shopping cart.',
    parameters: { type: Type.OBJECT, properties: {} }
};

const getRecommendationsFunction: FunctionDeclaration = {
    name: 'getRecommendations',
    description: 'Provides menu recommendations based on customer preferences like dietary needs or taste.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            preferences: {
                type: Type.ARRAY,
                description: "A list of customer preferences, e.g., ['spicy', 'vegetarian', 'gluten-free'].",
                items: { type: Type.STRING }
            }
        }
    }
};
// --- End Function Declarations ---


export default function AiAssistantModal({ isOpen, onClose, menuItems }: AiAssistantModalProps): React.ReactElement | null {
    const { addToCart, cartItems, totalPrice } = useCart();
    const [chat, setChat] = useState<Chat | null>(null);
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFunctionCall = useCallback((name: string, args: any): { result: string } => {
        console.log(`Function call: ${name}`, args);
        if (name === 'addToCart') {
            const itemsToAdd: { itemName: string; quantity: number }[] = args.items || [];
            let itemsAddedCount = 0;
            for (const item of itemsToAdd) {
                const menuItem = menuItems.find(mi => mi.name.toLowerCase() === item.itemName.toLowerCase());
                if (menuItem && menuItem.isAvailable) {
                    addToCart(menuItem, item.quantity);
                    itemsAddedCount++;
                }
            }
            return { result: itemsAddedCount > 0 ? `Successfully added ${itemsAddedCount} item(s) to the cart.` : 'Could not add items. They might be unavailable or not on the menu.' };
        }
        if (name === 'viewCart') {
            if (cartItems.length === 0) return { result: 'Your cart is currently empty.' };
            const cartSummary = cartItems.map(item => `${item.quantity} ${item.name}`).join(', ');
            return { result: `Your cart has: ${cartSummary}. The total is $${totalPrice.toFixed(2)}.` };
        }
        if (name === 'getRecommendations') {
            const prefs: string[] = (args.preferences || []).map((p: string) => p.toLowerCase());
            if (prefs.length === 0) return { result: "I can give you recommendations if you tell me what you're in the mood for, like something spicy or vegetarian." };
            
            const recommendedItems = menuItems.filter(item => {
                if (!item.isAvailable) return false;
                const itemText = `${item.name.toLowerCase()} ${item.description.toLowerCase()} ${item.dietaryTags.join(' ').toLowerCase()}`;
                return prefs.every(pref => itemText.includes(pref) || (pref === 'spicy' && item.spicyLevel > 0));
            });

            if (recommendedItems.length === 0) return { result: "I couldn't find anything that matches those preferences. Maybe try something else?" };
            
            const recommendations = recommendedItems.map(item => item.name).join(' or ');
            return { result: `Based on your preferences, I recommend the ${recommendations}.` };
        }
        return { result: 'Unknown function' };
    }, [addToCart, cartItems, totalPrice, menuItems]);
    
    useEffect(() => {
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const menuAsText = menuItems
                .map(item => `- ${item.name} (${item.isAvailable ? 'Available' : 'Unavailable'})`)
                .join('\n');
            const systemInstruction = `You are "Sathi", a friendly and efficient AI assistant for "Potato & Friends". Your goal is to help customers.
- You have access to three functions: 'addToCart', 'viewCart', and 'getRecommendations'. Use them to help the user.
- After a tool is used, you MUST confirm the action or provide the result to the user in a friendly, conversational sentence.
- The menu is below. Only accept orders for items on this menu. If an item is unavailable, inform the customer.
- Answer menu questions based on descriptions.
- Keep responses concise, warm, and conversational.
- Start by greeting the customer and asking how you can help.
- Menu:
${menuAsText}`;
            
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: [addToCartFunction, viewCartFunction, getRecommendationsFunction] }],
                },
            });
            setChat(newChat);
            setTranscript([{ speaker: 'chef', text: "Welcome! I'm Sathi, your AI assistant. Ask for recommendations, add to your order, or check your cart." }]);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Cleanup on close
            setChat(null);
            setTranscript([]);
            setMessage('');
            setIsLoading(false);
        }
    }, [isOpen, menuItems]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !chat || isLoading) return;

        const userMessage = message;
        setMessage('');
        setTranscript(prev => [...prev, { speaker: 'user', text: userMessage }]);
        setIsLoading(true);
        
        try {
            let response = await chat.sendMessage({ message: userMessage });

            while (response.functionCalls && response.functionCalls.length > 0) {
                const functionResponses: FunctionResponsePart[] = response.functionCalls.map(fc => {
                     const apiResponse = handleFunctionCall(fc.name, fc.args);
                     return {
                        id: fc.id,
                        name: fc.name,
                        response: apiResponse,
                     }
                });
                
                response = await chat.sendMessage({ functionResponses });
            }

            const textResponse = response.text;
            if (textResponse) {
                setTranscript(prev => [...prev, { speaker: 'chef', text: textResponse }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setTranscript(prev => [...prev, { speaker: 'chef', text: "I'm having a little trouble in the kitchen. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [transcript, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-orange-600">Your AI Assistant: Sathi</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close">
                        <CloseIcon />
                    </button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex items-end gap-2 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.speaker === 'chef' && <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">S</div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${item.speaker === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{item.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">S</div>
                             <div className="max-w-[80%] p-3 rounded-2xl shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
                <footer className="p-4 bg-white border-t">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-orange-500 text-white rounded-full p-3 hover:bg-orange-600 transition-colors disabled:bg-gray-400" disabled={isLoading || !message.trim()}>
                            {isLoading ? <LoadingSpinner /> : <SendIcon />}
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}