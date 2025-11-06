import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';

// --- Icons ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const MicIcon = ({ isListening }: { isListening: boolean }) => (
    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${isListening ? 'bg-red-500' : 'bg-gray-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v4m0 0H9m4 0h2m-4-8a4 4 0 014-4h0a4 4 0 014 4v2m-8 0v2m8-2v2" /></svg>
        {isListening && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping"></div>}
    </div>
);
// --- End Icons ---


interface VoiceOrderingModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
}

type TranscriptItem = {
    speaker: 'user' | 'chef';
    text: string;
};

export default function VoiceOrderingModal({ isOpen, onClose, menuItems }: VoiceOrderingModalProps): React.ReactElement | null {
    const [status, setStatus] = useState('Connecting...');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    // Effect to manage the Gemini Live session
    useEffect(() => {
        if (isOpen) {
            setStatus('Voice ordering is currently unavailable.');
        }
        return () => {
            // Cleanup on close
        };
    }, [isOpen]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-orange-600">Voice Ordering</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close"><CloseIcon /></button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p>This feature is currently disabled.</p>
                    </div>
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex items-end gap-2 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.speaker === 'chef' && <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">C</div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${item.speaker === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{item.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
                <footer className="p-4 bg-white border-t text-center">
                    <div className="flex justify-center mb-2">
                         <MicIcon isListening={false} />
                    </div>
                    <p className="font-semibold text-gray-700 h-6">{status}</p>
                </footer>
            </div>
        </div>
    );
}
