import React from 'react';
import { User } from '../types';

interface PotatoAvatarProps {
  user: User;
  size?: number; // size in pixels
}

// Simple SVG components for avatar parts
const PotatoBase = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50,15 C 20,15 10,40 10,60 C 10,90 30,100 50,100 C 70,100 90,90 90,60 C 90,40 80,15 50,15 Z" fill="#D9A467" />
        <ellipse cx="38" cy="45" rx="4" ry="6" fill="#422B17" />
        <ellipse cx="62" cy="45" rx="4" ry="6" fill="#422B17" />
        <path d="M 40 65 Q 50 75 60 65" stroke="#422B17" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
);

const ChefHat = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 25 50 C 25 30, 75 30, 75 50 C 85 50, 85 30, 75 20 C 65 10, 35 10, 25 20 C 15 30, 15 50, 25 50 Z" fill="white" stroke="#ccc" strokeWidth="2"/>
        <rect x="20" y="50" width="60" height="10" fill="white" stroke="#ccc" strokeWidth="2" />
    </svg>
);

const Crown = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 40 L 25 20 L 40 30 L 50 15 L 60 30 L 75 20 L 80 40 L 20 40 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="25" cy="21" r="3" fill="red" />
        <circle cx="50" cy="16" r="3" fill="blue" />
        <circle cx="75" cy="21" r="3" fill="red" />
    </svg>
);

const Monocle = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="62" cy="45" r="10" fill="none" stroke="black" strokeWidth="1.5" />
        <circle cx="62" cy="45" r="8" fill="lightblue" opacity="0.3" />
        <path d="M 72 45 L 85 35" stroke="black" strokeWidth="1" />
    </svg>
);


const ACCESSORY_MAP: Record<string, React.FC> = {
    'chef-hat': ChefHat,
    'crown': Crown,
    'monocle': Monocle,
};


export default function PotatoAvatar({ user, size = 80 }: PotatoAvatarProps): React.ReactElement {
    const unlockedAccessories = user.avatar.accessories || [];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <div className="absolute inset-0">
                <PotatoBase />
            </div>
            {unlockedAccessories.map(accName => {
                const AccessoryComponent = ACCESSORY_MAP[accName];
                if (!AccessoryComponent) return null;
                return (
                    <div key={accName} className="absolute inset-0">
                        <AccessoryComponent />
                    </div>
                );
            })}
        </div>
    );
}