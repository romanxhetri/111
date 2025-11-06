import React, { useState, useEffect, useRef, useCallback } from 'react';
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


export default function AiAssistantModal({ isOpen, onClose, menuItems }: AiAssistantModalProps): React.ReactElement | null {
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTranscript([{ speaker: 'chef', text: "Welcome! I'm Sathi, your AI assistant. Ask for recommendations, add to your order, or check your cart." }]);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Cleanup on close
            setTranscript([]);
            setMessage('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setMessage('');
        setTranscript(prev => [...prev, { speaker: 'user', text: userMessage }]);
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTranscript(prev => [...prev, { speaker: 'chef', text: "I'm currently unavailable to chat. Please browse the menu or contact support for help!" }]);
        setIsLoading(false);
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
