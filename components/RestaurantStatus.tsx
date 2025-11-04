import React, { useState, useEffect } from 'react';

const statuses = {
    dineIn: ['Not Busy', 'Getting Busy', 'Very Busy', 'Getting Busy'],
    pickup: ['5-10 min', '10-15 min', '15-20 min', '10-15 min'],
};

const statusColors: { [key: string]: string } = {
    'Not Busy': 'text-green-600',
    'Getting Busy': 'text-yellow-600',
    'Very Busy': 'text-red-600',
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

export default function RestaurantStatus() {
    const [dineInStatus, setDineInStatus] = useState(statuses.dineIn[0]);
    const [pickupStatus, setPickupStatus] = useState(statuses.pickup[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % statuses.dineIn.length;
            setDineInStatus(statuses.dineIn[index]);
            setPickupStatus(statuses.pickup[index]);
        }, 7000); // Update every 7 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-bold text-green-800 mb-4">Live Status</h3>
            <div className="space-y-3">
                <div className="flex items-center">
                    <UsersIcon />
                    <div>
                        <span className="text-sm font-semibold text-gray-700">Dine-In:</span>
                        <p className={`font-bold text-sm ${statusColors[dineInStatus]}`}>{dineInStatus}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <ClockIcon />
                    <div>
                        <span className="text-sm font-semibold text-gray-700">Pickup Wait:</span>
                        <p className="font-bold text-sm text-gray-800">{pickupStatus}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}