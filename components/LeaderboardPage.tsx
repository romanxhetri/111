import React, { useState, useEffect } from 'react';
import { User } from '../types';
import PotatoAvatar from './PotatoAvatar';

interface LeaderboardPageProps {
    currentUser: User;
    onNavigateToMenu: () => void;
}

const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
    const colors: { [key: number]: string } = {
        1: 'text-yellow-400',
        2: 'text-gray-400',
        3: 'text-yellow-600',
    };
    if (rank > 3) return null;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${colors[rank]}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.918 8.166a1 1 0 00-1.836 0L9 10.583V12h2v-1.417l-.918-3.417z" />
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
            <path d="M7 2a1 1 0 100-2h6a1 1 0 100 2H7z" />
        </svg>
    );
};


export default function LeaderboardPage({ currentUser, onNavigateToMenu }: LeaderboardPageProps) {
    const [leaderboard, setLeaderboard] = useState<User[]>([]);

    useEffect(() => {
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const sortedUsers = allUsers
            .sort((a: User, b: User) => b.spudPoints - a.spudPoints)
            .slice(0, 10);
        setLeaderboard(sortedUsers);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl animate-fadeIn">
            <button onClick={onNavigateToMenu} className="text-orange-600 hover:underline font-semibold mb-6">
                &larr; Back to Menu
            </button>
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">Top Taters</h1>
                <p className="text-lg text-gray-600">See who's leading the pack in Spud Points!</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="space-y-4">
                    {leaderboard.map((user, index) => (
                        <div key={user.email} className={`flex items-center p-4 rounded-lg transition-all ${currentUser.email === user.email ? 'bg-orange-100 ring-2 ring-orange-400 scale-105' : 'bg-gray-50'}`}>
                            <div className="flex items-center font-bold text-lg w-16">
                                <span className="mr-2">{index + 1}</span>
                                <TrophyIcon rank={index + 1} />
                            </div>
                            <div className="flex items-center flex-grow">
                                <PotatoAvatar user={user} size={50} />
                                <span className="ml-4 font-semibold text-gray-800">{user.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-green-800">{user.spudPoints}</p>
                                <p className="text-sm text-gray-500">Points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}