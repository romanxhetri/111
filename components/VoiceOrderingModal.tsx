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
                await inputAudioContextRef.current.close().catch(console.error);
                inputAudioContextRef.current = null;
            }
            if (outputAudioContextRef.current) {
                await outputAudioContextRef.current.close().catch(console.error);
                outputAudioContextRef.current = null;
            }
            sourcesRef.current.forEach(source => source.stop());
            sourcesRef.current.clear();
        };

        const start = async () => {
            setStatus('Getting microphone...');
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const menuAsText = menuItems.map(item => `- ${item.name} (${item.isAvailable ? 'Available' : 'Unavailable'})`).join('\n');
                
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                
                let currentInputTranscription = '';
                let currentOutputTranscription = '';

                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: async () => {
                            if (isCancelled) return;
                            setStatus('Listening...');
                            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
                            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            source.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                             if (message.serverContent?.inputTranscription) {
                                currentInputTranscription += message.serverContent.inputTranscription.text;
                            }
                             if (message.serverContent?.outputTranscription) {
                                currentOutputTranscription += message.serverContent.outputTranscription.text;
                            }
                             if (message.serverContent?.turnComplete) {
                                if (currentInputTranscription.trim()) {
                                    setTranscript(prev => [...prev, { speaker: 'user', text: currentInputTranscription.trim() }]);
                                }
                                if (currentOutputTranscription.trim()) {
                                    setTranscript(prev => [...prev, { speaker: 'chef', text: currentOutputTranscription.trim() }]);
                                }
                                currentInputTranscription = '';
                                currentOutputTranscription = '';
                            }

                            if (message.toolCall) {
                                for (const fc of message.toolCall.functionCalls) {
                                    const apiResponse = handleFunctionCall(fc.name, fc.args);
                                    sessionPromiseRef.current?.then((session) => {
                                        session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: apiResponse } });
                                    });
                                }
                            }

                            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                            if (base64Audio) {
                                const audioCtx = outputAudioContextRef.current!;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                                const source = audioCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(audioCtx.destination);
                                source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Session error:', e);
                            setStatus(`Error: ${e.message}`);
                            cleanup();
                        },
                        onclose: () => {
                            console.log('Session closed.');
                            if (!isCancelled) setStatus('Connection closed.');
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        systemInstruction: `You are a helpful voice assistant for "Potato & Friends". Guide the user in ordering food. The menu is below. Use the 'addToCart' function when the user confirms their order. Be conversational and friendly. Menu:\n${menuAsText}`,
                        tools: [{ functionDeclarations: [addToCartFunction] }],
                    },
                });

                await sessionPromiseRef.current;

            } catch (err: any) {
                if (!isCancelled) {
                    console.error("Failed to start voice session:", err);
                    setStatus(`Error: ${err.message}`);
                    cleanup();
                }
            }
        };

        start();

        return () => {
            isCancelled = true;
            cleanup();
        };
    }, [isOpen, menuItems, addToCart, handleFunctionCall]);

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
                        <p><strong>Try saying:</strong></p>
                        <ul className="list-disc pl-5 mt-1">
                            <li>"I'd like to order the Spicy Volcano Fries."</li>
                            <li>"Add two Classic Cheesy Fries to my cart."</li>
                        </ul>
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
                         <MicIcon isListening={status === 'Listening...'} />
                    </div>
                    <p className="font-semibold text-gray-700 h-6">{status}</p>
                </footer>
            </div>
        </div>
    );
}
