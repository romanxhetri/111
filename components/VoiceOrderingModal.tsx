import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob } from '@google/genai';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';

// --- Helper Functions for Audio Encoding/Decoding ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Helper Functions ---

// --- Icons ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const MicIcon = ({ isListening }: { isListening: boolean }) => (
    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${isListening ? 'bg-red-500' : 'bg-green-500'}`}>
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

// Define the function for the AI to call
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
                        itemName: {
                            type: Type.STRING,
                            description: 'The exact name of a menu item. Must match the menu precisely.',
                        },
                        quantity: {
                            type: Type.INTEGER,
                            description: 'The quantity of the item to add.',
                        },
                    },
                    required: ['itemName', 'quantity'],
                },
            },
        },
        required: ['items'],
    },
};

export default function VoiceOrderingModal({ isOpen, onClose, menuItems }: VoiceOrderingModalProps): React.ReactElement | null {
    const { addToCart } = useCart();
    const [status, setStatus] = useState('Connecting...');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

    // Audio processing refs
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const handleFunctionCall = useCallback((name: string, args: any) => {
        if (name === 'addToCart') {
            const itemsToAdd: { itemName: string; quantity: number }[] = args.items || [];
            let itemsAdded = 0;
            for (const item of itemsToAdd) {
                const menuItem = menuItems.find(mi => mi.name.toLowerCase() === item.itemName.toLowerCase());
                if (menuItem && menuItem.isAvailable) {
                    addToCart(menuItem, item.quantity);
                    itemsAdded++;
                }
            }
            return { result: itemsAdded > 0 ? `Successfully added ${itemsAdded} item(s) to the cart.` : 'Could not add items. They might be unavailable or not on the menu.' };
        }
        return { result: 'Unknown function' };
    }, [addToCart, menuItems]);
    
    // Effect to manage the Gemini Live session
    useEffect(() => {
        if (!isOpen) return;

        let isCancelled = false;
        
        const cleanup = async () => {
            if (sessionPromiseRef.current) {
                try {
                    const session = await sessionPromiseRef.current;
                    session.close();
                } catch (e) { console.error("Error closing session:", e); }
                sessionPromiseRef.current = null;
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            if (scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
                scriptProcessorRef.current = null;
            }
            if (inputAudioContextRef.current) {
                await inputAudioContextRef.current.close();
                inputAudioContextRef.current = null;
            }
            if (outputAudioContextRef.current) {
                await outputAudioContextRef.current.close();
                outputAudioContextRef.current = null;
            }
            sourcesRef.current.forEach(source => source.stop());
            sourcesRef.current.